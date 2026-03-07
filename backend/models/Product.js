const mongoose = require("mongoose");

// ── Review Sub-Schema ─────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

// ── Product Schema ────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number, // Used to show crossed-out "before" price on sale items
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Clothing", "Accessories", "Jewelry", "Bags", "Beauty", "Footwear"],
    },
    brand: {
      type: String,
      default: "My Brand Store",
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    emoji: {
      type: String, // Fallback emoji icon when no image is provided
      default: "📦",
    },
    colors: [
      {
        name: { type: String },
        hex: { type: String },
      },
    ],
    sizes: [{ type: String }],            // e.g. ["XS", "S", "M", "L", "XL"]
    tags: [{ type: String }],             // e.g. ["luxury", "new", "bestseller"]
    badge: {
      type: String,
      enum: ["New", "Bestseller", "Sale", "Limited", "Top Rated", null],
      default: null,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      unique: true,
      uppercase: true,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    weight: { type: Number },             // grams
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
  },
  {
    timestamps: true,  // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes for fast querying ─────────────────────────────────────────────────
productSchema.index({ name: "text", description: "text", tags: "text" }); // Full-text search
productSchema.index({ category: 1, price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ isFeatured: 1 });

// ── Virtual: discount percentage ──────────────────────────────────────────────
productSchema.virtual("discountPercent").get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// ── Pre-save: Auto-generate SKU ───────────────────────────────────────────────
productSchema.pre("save", function (next) {
  if (!this.sku) {
    const prefix = this.category.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.sku = `${prefix}-${random}`;
  }
  next();
});

// ── Method: Recalculate rating average after review added ─────────────────────
productSchema.methods.recalcRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const total = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.rating = (total / this.reviews.length).toFixed(1);
    this.numReviews = this.reviews.length;
  }
};

module.exports = mongoose.model("Product", productSchema);
