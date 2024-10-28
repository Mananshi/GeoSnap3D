// src/models.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

const ImageSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    captureDate: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

const MapDataSchema = new mongoose.Schema({
    northBound: { type: Number, required: true },
    southBound: { type: Number, required: true },
    eastBound: { type: Number, required: true },
    westBound: { type: Number, required: true },
    imageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

const User = mongoose.model('User', UserSchema);
const Image = mongoose.model('Image', ImageSchema);
const MapData = mongoose.model('MapData', MapDataSchema);

module.exports = { User, Image, MapData };
