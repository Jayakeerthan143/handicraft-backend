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
router.post("/", protect, upload.array("images", 5), createProduct); // ✅ UPDATED
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);
// Add this line with other routes
router.put("/:id/reorder-images", protect, reorderProductImages);

module.exports = router;
