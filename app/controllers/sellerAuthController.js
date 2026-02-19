const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

exports.createSeller = async (req, res) => {
    try {
        const { name, email, mobile, country, state, skills, password } = req.body;

        if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' });

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const seller = new User({
            name, email, mobile, country, state,
            skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : [],
            password: hashed,
            role: 'SELLER'
        });

        await seller.save();

        res.status(201).json({ message: 'Seller created Sucessfully', seller: { id: seller._id, name: seller.name, email: seller.email } });

    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.sellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const seller = await User.findOne({ email, role: 'SELLER' });

        if (!seller) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, seller.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const payload = { id: seller._id, role: seller.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(200).json({ token, role: seller.role, user: { id: seller._id, name: seller.name, email: seller.email } });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
