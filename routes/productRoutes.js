const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const Product = require("../models/Product");

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("artisan", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("artisan", "name email");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create product with multiple images
router.post("/", protect, upload.array("images", 5), async (req, res) => {
  try {
    console.log("📦 Request body:", req.body);
    console.log("📸 Files received:", req.files);

    const { name, description, price, category, stock, materials } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Get Cloudinary URLs for ALL uploaded images
    const imageUrls = req.files ? req.files.map((file) => file.path) : [];

    console.log("🖼️ Image URLs:", imageUrls);

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock) || 0,
      materials: materials || "",
      images: imageUrls,
      artisan: req.user.id,
    });

    await product.save();

    console.log("✅ Product saved:", product);

    // Populate before sending response
    await product.populate("category", "name");
    await product.populate("artisan", "name email");

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("❌ Error creating product:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
});

// Update product
router.put("/:id", protect, upload.array("images", 5), async (req, res) => {
  try {
    const { name, description, price, category, stock, materials } = req.body;

    const updateData = { name, description, price, category, stock, materials };

    // If new images uploaded, use Cloudinary URLs
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => file.path);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    })
      .populate("category", "name")
      .populate("artisan", "name email");

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
router.delete("/:id", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if user owns the product
    if (product.artisan.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Reorder images
router.put("/:id/reorder-images", protect, async (req, res) => {
  try {
    const { primaryImageIndex } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Reorder images array
    if (primaryImageIndex > 0 && primaryImageIndex < product.images.length) {
      const images = [...product.images];
      const primaryImage = images.splice(primaryImageIndex, 1)[0];
      product.images = [primaryImage, ...images];
      await product.save();
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error reordering images:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
