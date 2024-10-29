const express = require('express');
const { saveMapData, getUserMaps, getTopRegions, getMapById } = require('../controller/mapController');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');

// Configure multer to save files to 'uploads' directory
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

const router = express.Router();

router.post('/save', authenticateToken, upload.single('image'), saveMapData);
router.get('/', authenticateToken, getUserMaps);
router.get('/top-regions', getTopRegions);
router.get('/:map_id', authenticateToken, getMapById);

module.exports = router;
