const express = require('express');
const multer = require('multer');
const Product = require('../models/product');

const router = express.Router();

// File upload configuration using multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // Folder to store images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); 
  },
});
const upload = multer({ storage: storage });

// Create a new product
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      image: req.file ? req.file.path : null,
      category: req.body.category,
    });
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Upload multiple images for a product
router.post('/products/:id/images', upload.array('images', 10), async (req, res) => {
  const productId = parseInt(req.params.id); // Product ID from the route
  const files = req.files; // Uploaded files from Multer

  try {
      // Validate product existence
      const product = await Product.findById(productId); // Replace with your ORM/DB query
      if (!product) {
          return res.status(404).send({ message: 'Product not found' });
      }

      // Check if files are uploaded
      if (!files || files.length === 0) {
          return res.status(400).send({ message: 'No files uploaded' });
      }

      // Save file paths to the database
      const imagePaths = [];
      for (const file of files) {
          const imagePath = `/uploads/${file.filename}`;
          imagePaths.push(imagePath);

          // Save image to the database (ProductImage table)
          await ProductImage.create({
              productId: productId,
              imageUrl: imagePath,
          });
      }

      // Respond with uploaded image URLs
      res.status(201).send({
          message: 'Images uploaded successfully',
          images: imagePaths,
      });
  } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Server error', error: err.message });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const updatedData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      image: req.file ? req.file.path : req.body.image,
      category: req.body.category,
    };
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products/search', async (req, res) => {
  const { query, category, minPrice, maxPrice } = req.query;

  try {
      // Build search filters
      const filters = {};

      if (query) {
          filters.name = { $regex: query, $options: 'i' }; // Case-insensitive search
      }

      if (category) {
          filters.category = category; // Exact match for category
      }

      if (minPrice) {
          filters.price = { ...filters.price, $gte: parseFloat(minPrice) }; // Greater than or equal to
      }

      if (maxPrice) {
          filters.price = { ...filters.price, $lte: parseFloat(maxPrice) }; // Less than or equal to
      }

      // Fetch products from database with filters
      const products = await Product.find(filters);

      res.status(200).json(products);
  } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Server error', error: err.message });
  }
});


module.exports = router;
