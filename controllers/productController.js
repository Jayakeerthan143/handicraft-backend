const Product = require("../models/Product");

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Artisan)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, materials } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, description, price, and category",
      });
    }

    const productData = {
      name,
      description,
      price: Number(price),
      category,
      stock: stock ? Number(stock) : 0,
      materials: materials || "",
      artisan: req.user._id,
      images: [],
    };

    // ✅ Handle uploaded images from multer
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file, index) => ({
        url: `/uploads/products/${file.filename}`, // Local file path
        isPrimary: index === 0, // First image is primary
      }));
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all products (with optional search)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("artisan", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("artisan", "name email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Artisan - own products only)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Make sure user is product owner
    if (
      product.artisan.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this product",
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Artisan - own products only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Make sure user is product owner
    if (
      product.artisan.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this product",
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Reorder product images (set primary image)
exports.reorderProductImages = async (req, res) => {
  try {
    const { primaryImageIndex } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user is the product owner
    if (product.artisan.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this product",
      });
    }

    // Reorder images array
    if (
      product.images &&
      product.images.length > 0 &&
      primaryImageIndex < product.images.length
    ) {
      const images = [...product.images];
      const primaryImage = images.splice(primaryImageIndex, 1)[0];
      product.images = [primaryImage, ...images];
      await product.save();
    }

    const updatedProduct = await Product.findById(product._id)
      .populate("category", "name")
      .populate("artisan", "name email");

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
