const express = require("express");
const router  = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .post(createOrder)
  .get(authorize("admin"), getAllOrders);

router.get("/my", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/pay",    updateOrderToPaid);
router.put("/:id/status", authorize("admin"), updateOrderStatus);

module.exports = router;
