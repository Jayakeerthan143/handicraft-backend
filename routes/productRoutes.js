const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload"); // Cloudinary upload
const Product = require("../models/Product");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderProductImages,
} = require("../controllers/productController");

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);

// Create product with Cloudinary
// POST - Create product with MULTIPLE images
router.post("/", protect, upload.array("images", 5), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    // Get Cloudinary URLs for ALL uploaded images
    const imageUrls = req.files ? req.files.map((file) => file.path) : [];

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      images: imageUrls, // Array of Cloudinary URLs
      artisan: req.user.id,
    });

    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT - Update product with MULTIPLE images
router.put("/:id", protect, upload.array("images", 5), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    const updateData = { name, description, price, category, stock };

    // If new images uploaded, use Cloudinary URLs
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => file.path);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
