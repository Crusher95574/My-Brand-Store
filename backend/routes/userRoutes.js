const express = require("express");
const router  = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  toggleWishlist,
  getAllUsers,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login",    loginUser);

// Private routes (require authentication)
router.get("/profile",  protect, getProfile);
router.put("/profile",  protect, updateProfile);
router.post("/wishlist/:productId", protect, toggleWishlist);

// Admin only
router.get("/", protect, authorize("admin"), getAllUsers);

module.exports = router;
