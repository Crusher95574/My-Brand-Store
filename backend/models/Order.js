const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name:     { type: String, required: true },
  image:    { type: String },
  emoji:    { type: String },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  color:    { type: String },
  size:     { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [orderItemSchema],

    // ── Shipping Address ────────────────────────────────────────────────────
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName:  { type: String },
      email:     { type: String, required: true },
      phone:     { type: String },
      street:    { type: String, required: true },
      city:      { type: String, required: true },
      state:     { type: String },
      zip:       { type: String, required: true },
      country:   { type: String, required: true, default: "India" },
    },

    // ── Payment ─────────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ["stripe", "cod", "upi"],
      default: "stripe",
    },
    paymentResult: {
      id:          String,  
      status:      String,
      updateTime:  String,
      emailAddress:String,
    },
    isPaid:   { type: Boolean, default: false },
    paidAt:   { type: Date },

    // ── Pricing ─────────────────────────────────────────────────────────────
    itemsPrice:    { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice:      { type: Number, required: true, default: 0 },
    totalPrice:    { type: Number, required: true, default: 0 },

    // ── Fulfillment ─────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    isDelivered:  { type: Boolean, default: false },
    deliveredAt:  { type: Date },
    trackingNumber: { type: String },
    notes:        { type: String },
  },
  { timestamps: true }
);

// ── Pre-save: Generate human-readable order ID ────────────────────────────────
orderSchema.pre("save", function (next) {
  if (!this.orderId) {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderId = `MBS-${random}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
