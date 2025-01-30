const express = require('express');
const multer = require('multer');
const {
  createProduct,
  uploadImages,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
} = require('../controllers/productController');

const router = express.Router();

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Product Routes
router.post('/add', upload.single('image'), createProduct);
router.post('/products/:id/images', upload.array('images', 10), uploadImages);
router.get('/:id', getProductById);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);
router.get('/products/search', searchProducts);

module.exports = router;
