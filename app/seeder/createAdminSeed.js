
require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

const run = async () => {

    try {
        await connectDB(process.env.MONGO_URI);

         const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });

        if (existingAdmin) {
            console.log('Admin already exists');
            return;
        }

        const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        const admin = new User({ name: process.env.ADMIN_NAME, email: process.env.ADMIN_EMAIL, password: hashed, role: 'ADMIN' });
        await admin.save();
         console.log('Admin created');
    } catch (error) {
        console.log('error', error);

    }
};

run();
