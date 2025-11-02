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
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    // Get Cloudinary URL instead of local path
    const imageUrl = req.file ? req.file.path : null;

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      image: imageUrl,
      artisan: req.user.id,
    });

    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update product with Cloudinary
router.put("/:id", protect, upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    const updateData = { name, description, price, category, stock };

    // If new image uploaded, use Cloudinary URL
    if (req.file) {
      updateData.image = req.file.path;
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

// Delete product
router.delete("/:id", protect, deleteProduct);

// Reorder images
router.put("/:id/reorder-images", protect, reorderProductImages);

module.exports = router;
