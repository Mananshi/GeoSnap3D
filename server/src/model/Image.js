const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Image', ImageSchema);
