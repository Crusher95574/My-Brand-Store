// Cart is managed client-side (localStorage/Context) for fast UX.
// This route is a placeholder for server-side cart sync (e.g., logged-in users).
const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");

// GET  /api/v1/cart  — sync cart from server (future feature)
router.get("/", protect, (req, res) => {
  res.json({ success: true, message: "Cart sync endpoint – coming soon", data: [] });
});

module.exports = router;
