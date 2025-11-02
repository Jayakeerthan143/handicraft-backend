const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getAllUsers,
  deleteUser,
  getAllProducts,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} = require("../controllers/adminController");

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }
};

// Dashboard stats
router.get("/stats", protect, isAdmin, getDashboardStats);

// User management
router.get("/users", protect, isAdmin, getAllUsers);
router.delete("/users/:id", protect, isAdmin, deleteUser);

// Product management
router.get("/products", protect, isAdmin, getAllProducts);
router.delete("/products/:id", protect, isAdmin, deleteProduct);

// Order management
router.get("/orders", protect, isAdmin, getAllOrders);
router.put("/orders/:id/status", protect, isAdmin, updateOrderStatus);

module.exports = router;
