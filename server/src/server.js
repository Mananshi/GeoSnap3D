const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require("cors");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

const userRoutes = require('./routes/userRoutes');
const mapRoutes = require('./routes/mapRoutes');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log('MongoDB connected');
        mongoose.set('strictPopulate', false);
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/maps', mapRoutes);
app.use('/', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
