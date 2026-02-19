const express = require('express');
const router = express.Router();
const sellerAuth = require('../controllers/sellerAuthController');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/multer');


router.post('/create',authMiddleware,roleMiddleware(['ADMIN']), sellerAuth.createSeller);

router.post('/login', sellerAuth.sellerLogin);

router.post('/products', authMiddleware, roleMiddleware(['SELLER']), upload.array('images', 10), productController.addProduct);

router.get('/products', authMiddleware, roleMiddleware(['SELLER']), productController.listSellerProducts);

router.delete('/products/:productId', authMiddleware, roleMiddleware(['SELLER']), productController.deleteProduct);

router.get(
  '/products/:productId/pdf',
  authMiddleware,
  roleMiddleware(['SELLER']),
  productController.generateProductPDF
);

module.exports = router;
