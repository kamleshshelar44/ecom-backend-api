const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

exports.adminLogin = async (req, res) => {
  try {

    const { email, password } = req.body;
    
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const admin = await User.findOne({ email, role: 'ADMIN' });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: admin._id, role: admin.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(200).json({ token, role: admin.role, user: { id: admin._id, name: admin.name, email: admin.email } });

  } catch (err) {
   
    res.status(500).json({ message: 'Internal server error' });
  }
};
