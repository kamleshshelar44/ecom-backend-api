const User = require('../models/User');

exports.listSellers = async (req, res) => {
    try {

        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const filter = { role: 'SELLER' };
        const total = await User.countDocuments(filter);

        const sellers = await User.find(filter)
            .select('-password')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({
            page,
            limit,
            total,
            sellers
        });

    } catch (err) {
        res.status(500).json({ message: 'Internal Server error' });
    }
};
