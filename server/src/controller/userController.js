const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../model/User');

exports.signup = async (req, res) => {
    const { email, password } = req.body;
    const newUser = new User({ email, password });

    try {
        const user = await newUser.save();
        res.status(201).json({ userId: user._id });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
};
