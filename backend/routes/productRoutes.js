const express = require("express");
const router  = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  getCategories,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/authMiddleware");

// GET  /api/v1/products/categories  — must be before /:id to avoid conflict
router.get("/categories", getCategories);

// GET  /api/v1/products
// POST /api/v1/products  (admin only)
router.route("/")
  .get(getProducts)
  .post(protect, authorize("admin"), createProduct);

// GET    /api/v1/products/:id
// PUT    /api/v1/products/:id  (admin only)
// DELETE /api/v1/products/:id  (admin only)
router.route("/:id")
  .get(getProductById)
  .put(protect, authorize("admin"), updateProduct)
  .delete(protect, authorize("admin"), deleteProduct);

// POST /api/v1/products/:id/reviews  (authenticated users)
router.post("/:id/reviews", protect, addProductReview);

module.exports = router;
