const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all products (with filtering, search, sorting, pagination)
// @route   GET /api/v1/products
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    rating,
    badge,
    sort = "-createdAt",
    page = 1,
    limit = 12,
    featured,
  } = req.query;

  // ── Build query object ────────────────────────────────────────────────────
  const query = { isActive: true };

  // Text search (uses MongoDB text index on name, description, tags)
  if (search) {
    query.$text = { $search: search };
  }

  // Category filter
  if (category && category !== "All") {
    query.category = category;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Minimum rating filter
  if (rating) {
    query.rating = { $gte: Number(rating) };
  }

  // Badge filter (Bestseller, New, Sale, etc.)
  if (badge) {
    query.badge = badge;
  }

  // Featured products only
  if (featured === "true") {
    query.isFeatured = true;
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));  // Cap at 50
  const skip     = (pageNum - 1) * limitNum;

  // ── Execute query ─────────────────────────────────────────────────────────
  const total    = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .select("-reviews");   // Exclude reviews array for list view (performance)

  res.json({
    success: true,
    count:   products.length,
    total,
    page:    pageNum,
    pages:   Math.ceil(total / limitNum),
    data:    products,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single product by ID (includes reviews)
// @route   GET /api/v1/products/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("reviews.user", "name avatar"); // Populate reviewer name

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, data: product });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update a product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, data: product });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Soft-delete a product (sets isActive = false)
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Soft delete – preserve data for order history
  product.isActive = false;
  await product.save();

  res.json({ success: true, message: "Product removed" });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Add a review to a product
// @route   POST /api/v1/products/:id/reviews
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Prevent duplicate reviews from same user
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  product.reviews.push(review);
  product.recalcRating();  // Recalculate average from model method
  await product.save();

  res.status(201).json({ success: true, message: "Review added" });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get distinct categories and their counts
// @route   GET /api/v1/products/categories
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  res.json({ success: true, data: categories });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  getCategories,
};
