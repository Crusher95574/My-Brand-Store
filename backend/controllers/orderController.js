const asyncHandler = require("express-async-handler");
const Order   = require("../models/Order");
const Product = require("../models/Product");

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Place a new order
// @route   POST /api/v1/orders
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items provided");
  }

  // ── Verify stock and fetch current prices from DB (never trust client) ────
  const verifiedItems = [];
  let itemsPrice = 0;

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.countInStock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for: ${product.name}`);
    }

    verifiedItems.push({
      product: product._id,
      name:    product.name,
      emoji:   product.emoji,
      price:   product.price,   // Use server-side price
      quantity:item.quantity,
      color:   item.color,
      size:    item.size,
    });

    itemsPrice += product.price * item.quantity;

    // Deduct stock
    product.countInStock -= item.quantity;
    await product.save();
  }

  // ── Calculate pricing ─────────────────────────────────────────────────────
  const shippingPrice = itemsPrice > 200 ? 0 : 15;
  const taxPrice      = parseFloat((itemsPrice * 0.08).toFixed(2));
  const totalPrice    = parseFloat((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  // ── Create order ──────────────────────────────────────────────────────────
  const order = await Order.create({
    user:            req.user._id,
    orderItems:      verifiedItems,
    shippingAddress,
    paymentMethod:   paymentMethod || "cod",
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  res.status(201).json({ success: true, data: order });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get logged-in user's orders
// @route   GET /api/v1/orders/my
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort("-createdAt")
    .populate("orderItems.product", "name emoji");

  res.json({ success: true, count: orders.length, data: orders });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("orderItems.product", "name emoji");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Users can only view their own orders (admins can view all)
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.json({ success: true, data: order });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mark order as paid (called after payment confirmation)
// @route   PUT /api/v1/orders/:id/pay
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isPaid   = true;
  order.paidAt   = Date.now();
  order.status   = "processing";
  order.paymentResult = {
    id:          req.body.id,
    status:      req.body.status,
    updateTime:  req.body.update_time,
    emailAddress:req.body.payer?.email_address,
  };

  const updatedOrder = await order.save();
  res.json({ success: true, data: updatedOrder });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all orders (admin)
// @route   GET /api/v1/orders
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .sort("-createdAt");

  const totalRevenue = orders.reduce((acc, o) => acc + (o.isPaid ? o.totalPrice : 0), 0);

  res.json({ success: true, count: orders.length, totalRevenue, data: orders });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update order status (admin)
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  if (status === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }
  const updated = await order.save();
  res.json({ success: true, data: updated });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getAllOrders,
};
