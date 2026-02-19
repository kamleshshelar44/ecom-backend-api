const express = require('express');
const router = express.Router();
const adminAuth = require('../controllers/adminAuthController');
const sellerController = require('../controllers/sellerController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/login', adminAuth.adminLogin);


router.get('/sellers', authMiddleware, roleMiddleware(['ADMIN']), sellerController.listSellers);


module.exports = router;
