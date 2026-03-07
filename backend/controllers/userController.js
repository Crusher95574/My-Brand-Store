const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// ── Helper: Send token response ───────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
      avatar: user.avatar,
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/v1/users/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User with this email already exists");
  }

  const user = await User.create({ name, email, password });
  sendTokenResponse(user, 201, res);
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login user
// @route   POST /api/v1/users/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  // Find user (explicitly select password since it's excluded by default)
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get logged-in user's profile
// @route   GET /api/v1/users/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist", "name price emoji rating");
  res.json({ success: true, data: user });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (req.body.name)  user.name  = req.body.name;
  if (req.body.phone) user.phone = req.body.phone;

  // Update password only if provided
  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();
  res.json({ success: true, data: updatedUser });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Add/remove product from wishlist
// @route   POST /api/v1/users/wishlist/:productId
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;

  const index = user.wishlist.indexOf(productId);
  if (index === -1) {
    user.wishlist.push(productId);    // Add to wishlist
  } else {
    user.wishlist.splice(index, 1);   // Remove from wishlist
  }

  await user.save();
  res.json({
    success: true,
    inWishlist: index === -1,
    message: index === -1 ? "Added to wishlist" : "Removed from wishlist",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all users (admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json({ success: true, count: users.length, data: users });
});

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  toggleWishlist,
  getAllUsers,
};
