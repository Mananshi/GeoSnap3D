const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { User, Image, MapData } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve static files from the uploads directory

// Configure multer to save files to 'uploads' directory with the specified name
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Directory where the file will be saved
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the specified filename
    }
});

const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware for JWT Authentication
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
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

// Combined Upload Image and Save Map Data
app.post('/save', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { northBound, southBound, eastBound, westBound } = req.body;
        const imageFile = req.file;

        // Check for required fields
        if (!northBound || !southBound || !eastBound || !westBound || !imageFile) {
            return res.status(400).json({ error: 'All map data fields and image are required' });
        }

        // Construct image URL
        const imageUrl = `/uploads/${imageFile.filename}`;

        // Save the image in the database
        const image = new Image({
            imageUrl: imageUrl,
            userId: req.user.id,
        });
        await image.save();

        // Save map data with reference to the image ID
        const mapData = new MapData({
            northBound,
            southBound,
            eastBound,
            westBound,
            userId: req.user.id,
            image: image._id, // Reference the image ID
        });
        await mapData.save();

        res.status(201).json({ message: 'Map data and image saved successfully', mapData });
    } catch (error) {
        console.error('Error saving map data and image:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Retrieve Maps for User
app.get('/maps', authenticateToken, async (req, res) => {
    try {
        const maps = await MapData.find({ userId: req.user.id });

        console.log('Maps before populating:', maps); // Log the maps before populating

        const populatedMaps = await MapData.populate(maps, { path: 'image' }); // Populate images

        console.log('Populated Maps:', populatedMaps); // Log the populated maps

        res.status(200).json(populatedMaps);
    } catch (error) {
        console.error('Error retrieving maps:', error);
        res.status(500).json({ error: 'Failed to retrieve maps' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
