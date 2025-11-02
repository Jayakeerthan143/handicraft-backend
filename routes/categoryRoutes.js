const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
} = require("../controllers/categoryController");
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(getCategories)
  .post(protect, authorize("admin"), createCategory);

module.exports = router;
