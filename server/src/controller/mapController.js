const axios = require('axios');
const Image = require('../model/Image');
const MapData = require('../model/MapData');
const { getCache, setCache, deleteCache } = require('../utils/cache');

exports.saveMapData = async (req, res) => {
    try {
        const { northBound, southBound, eastBound, westBound, latitude, longitude } = req.body;
        const imageFile = req.file;

        if (!northBound || !southBound || !eastBound || !westBound || !imageFile || !latitude || !longitude) {
            return res.status(400).json({ error: 'All map data fields and image are required' });
        }

        const imageUrl = `/uploads/${imageFile.filename}`;
        const image = new Image({ imageUrl, userId: req.user.id });
        const savedImage = await image.save();

        const mapMetaData = await axios.get(`${process.env.GEO_CODING_API}?q=${latitude}+${longitude}&key=${process.env.GEO_CODING_KEY}&address_only=1`);
        const region = mapMetaData.data.results[0].components.suburb
            ?? mapMetaData.data.results[0].components.town
            ?? mapMetaData.data.results[0].components.city
            ?? mapMetaData.data.results[0].components.state;

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
        await deleteCache('topRegions');
        await deleteCache(`topRegions:${req.user.id}`);

        res.status(201).json({ message: 'Map data and image saved successfully', savedMapData });
    } catch (error) {
        console.error('Error saving map data and image:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
};

exports.getUserMaps = async (req, res) => {
    try {
        const maps = await MapData.find({ userId: req.user.id }).populate('imageId');
        res.status(200).json(maps);
    } catch (error) {
        console.error('Error retrieving maps:', error);
        res.status(500).json({ error: 'Failed to retrieve maps' });
    }
};

exports.getTopRegions = async (req, res) => {
    let userId = null;
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        }
    } catch { }

    const cacheKey = userId ? `topRegions:${userId}` : 'topRegions';
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
        return res.status(200).json(cachedData);
    }

    try {
        const matchStage = userId ? { userId } : {};
        const topRegions = await MapData.aggregate([
            { $match: matchStage },
            { $group: { _id: "$region", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);

        await setCache(cacheKey, topRegions);
        res.status(200).json(topRegions);
    } catch (error) {
        console.error('Error fetching top regions:', error);
        res.status(500).json({ error: 'Failed to fetch top regions' });
    }
};

exports.getMapById = async (req, res) => {
    try {
        const mapData = await MapData.findById(req.params.map_id).populate('imageId');
        if (!mapData) return res.status(404).json({ error: 'Map data not found' });
        res.status(200).json(mapData);
    } catch (error) {
        console.error('Error retrieving map data:', error);
        res.status(500).json({ error: 'Failed to retrieve map data' });
    }
};
