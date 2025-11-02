const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../config/multer"); // ✅ ADD THIS
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderProductImages, // ✅ Add this
} = require("../controllers/productController");

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, upload.array("images", 5), createProduct);
router.post("/", auth, upload.single("image"), async (req, res) => {
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
      image: imageUrl, // This is now the Cloudinary URL
      artisan: req.user.id,
    });

    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// ✅ UPDATED
router.put("/:id", protect, updateProduct);
router.put("/:id", auth, upload.single("image"), async (req, res) => {
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

router.delete("/:id", protect, deleteProduct);
// Add this line with other routes
router.put("/:id/reorder-images", protect, reorderProductImages);

module.exports = router;
