// backend/middleware/authMiddleware.js
// ─────────────────────────────────────────────────────────────────────────────
// JWT Authentication & Role-based Authorization Middleware
// ─────────────────────────────────────────────────────────────────────────────

const jwt  = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// ── protect: Verify JWT and attach user to request ───────────────────────────
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header (Bearer token)
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized – no token provided");
  }

  try {
    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user || !req.user.isActive) {
      res.status(401);
      throw new Error("User not found or deactivated");
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized – token failed");
  }
});

// ── authorize: Restrict to specific roles ────────────────────────────────────
// Usage: router.delete("/products/:id", protect, authorize("admin"), handler)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role "${req.user.role}" is not authorized to access this resource`);
    }
    next();
  };
};

module.exports = { protect, authorize };
