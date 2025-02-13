const Product = require('../models/product');

// Create a new product
exports.createProduct = async (req, res) => {
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
};

// Upload multiple images for a product
exports.uploadImages = async (req, res) => {
  const productId = req.params.id;
  const files = req.files;

  try {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      if (!files || files.length === 0) return res.status(409).json({ message: 'No files uploaded' });

      const imagePaths = files.map(file => `/uploads/${file.filename}`);

    // Assuming 'ProductImage' is a model for storing images
    for (const imagePath of imagePaths) {
      await ProductImage.create({ productId, imageUrl: imagePath });
  }

  res.status(201).json({ message: 'Images uploaded successfully', images: imagePaths });
} catch (err) {
  res.status(500).json({ message: 'Server error', error: err.message });
}
};
// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      res.status(200).json(product);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};
// Update a product
exports.updateProduct = async (req, res) => {
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
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  const { query, category, minPrice, maxPrice } = req.query;

  try {
    const filters = {};

    if (query) filters.name = { $regex: query, $options: 'i' };
    if (category) filters.category = category;
    if (minPrice) filters.price = { ...filters.price, $gte: parseFloat(minPrice) };
    if (maxPrice) filters.price = { ...filters.price, $lte: parseFloat(maxPrice) };

    const products = await Product.find(filters);
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
