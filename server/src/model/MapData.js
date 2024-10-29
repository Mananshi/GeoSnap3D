const mongoose = require('mongoose');

const MapDataSchema = new mongoose.Schema({
    northBound: { type: Number, required: true },
    southBound: { type: Number, required: true },
    eastBound: { type: Number, required: true },
    westBound: { type: Number, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    region: { type: String, required: true },
    imageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('MapData', MapDataSchema);
