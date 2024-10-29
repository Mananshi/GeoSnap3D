const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { User, Image, MapData } = require('./models');
const cors = require("cors");
const axios = require('axios');
const redis = require('redis');


dotenv.config();

const client = redis.createClient({
    url: process.env.REDIS_URL,
});
client.connect();

client.on('error', (err) => console.error('Redis Client Error', err));

const app = express();
const PORT = process.env.PORT || 4000;
const CACHE_DURATION = 600; //10 mins

// Middleware
app.use(cors())
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configure multer to save files to 'uploads' directory with the specified name
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uniqueDir = `uploads/`;
        cb(null, uniqueDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueSuffix);
    }
});

const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware for JWT Authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Invalid Token' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'User not Authorized' });
        }
        req.user = user;
        next();
    });
};


// User Signup
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const newUser = new User({ email, password });

    try {
        const user = await newUser.save();
        res.status(201).json({ userId: user._id });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(400).json({ error: error.message });
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
});

// Upload Image and Save Map Data
app.post('/save', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { northBound, southBound, eastBound, westBound, latitude, longitude } = req.body;
        const imageFile = req.file;

        // Check for required fields
        if (!northBound || !southBound || !eastBound || !westBound || !imageFile || !latitude || !longitude) {
            return res.status(400).json({ error: 'All map data fields and image are required' });
        }

        // Construct image URL
        const imageUrl = `/uploads/${path.basename(imageFile.path)}`;

        // Save the image in the database
        const image = new Image({
            imageUrl: imageUrl,
            userId: req.user.id,
        });
        const savedImage = await image.save();

        // Get the region name from an external geocoding API
        const mapMetaData = await axios.get(`${process.env.GEO_CODING_API}?q=${latitude}+${longitude}&key=${process.env.GEO_CODING_KEY}&address_only=1`);


        const region = mapMetaData.data['results'][0]['components']['suburb'] ?? mapMetaData.data['results'][0]['components']['town'] ?? mapMetaData.data['results'][0]['components']['city'] ?? mapMetaData.data['results'][0]['components']['state'];

        // Save map data with reference to the image ID
        const mapData = new MapData({
            northBound,
            southBound,
            eastBound,
            westBound,
            latitude,
            longitude,
            region,
            imageId: savedImage._id,
            userId: req.user.id,
        });

        const savedMapData = await mapData.save();

        // Invalidate system-level and user-level caches
        await client.del('topRegions'); // Invalidate system-wide top regions
        await client.del(`topRegions:${req.user.id}`); // Invalidate user-specific top regions

        res.status(201).json({ message: 'Map data and image saved successfully', savedMapData });
    } catch (error) {
        console.error('Error saving map data and image:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});


// Retrieve Maps for User
app.get('/maps', authenticateToken, async (req, res) => {
    try {
        mongoose.set('strictPopulate', false);

        const maps = await MapData.find({ userId: req.user.id }).populate('imageId');

        res.status(200).json(maps);
    } catch (error) {
        console.error('Error retrieving maps:', error);
        res.status(500).json({ error: 'Failed to retrieve maps' });
    }
});


// Retrieve most accessed regions
app.get('/maps/top-regions', async (req, res) => {
    // Check if token is present and valid
    let userId = null;
    try {
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        }
    } catch (error) {
        console.log("No valid auth token provided; fetching top regions across all users.");
    }

    // Set cache key based on presence of userId
    const cacheKey = userId ? `topRegions:${userId}` : 'topRegions';

    try {
        // Check if data is cached
        const cachedData = await client.get(cacheKey);
        if (cachedData) {
            console.log('Serving from cache');
            return res.status(200).json(JSON.parse(cachedData));
        }

        const matchStage = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};
        const topRegions = await MapData.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$region",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 3 },
        ]);

        // Cache the result
        await client.setEx(cacheKey, CACHE_DURATION, JSON.stringify(topRegions));
        console.log('Cache updated');

        res.status(200).json(topRegions);
    } catch (error) {
        console.error('Error fetching top regions:', error);
        res.status(500).json({ error: 'Failed to fetch top regions' });
    }
});

// Retrieve Individual Map Data by ID
app.get('/maps/:map_id', authenticateToken, async (req, res) => {
    try {
        mongoose.set('strictPopulate', false);

        // Fetch the map data by ID and populate the imageId field
        const mapData = await MapData.findById(req.params.map_id).populate('imageId');


        // Check if map data exists
        if (!mapData) {
            return res.status(404).json({ error: 'Map data not found' });
        }

        res.status(200).json(mapData);
    } catch (error) {
        console.error('Error retrieving map data:', error);
        res.status(500).json({ error: 'Failed to retrieve map data' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
