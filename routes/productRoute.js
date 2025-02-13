const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController'); // Correct path
const multer = require('multer');
const path = require('path');
// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Product Routes
router.post('/add', upload.single('image'), createProduct);
router.post('/:id/upload-images', upload.array('images', 10), ProductController.uploadImages);
router.get('/:id', ProductController.getProductById);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);
router.get('/products/search', searchProducts);

module.exports = router;
