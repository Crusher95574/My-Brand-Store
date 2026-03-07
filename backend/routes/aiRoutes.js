const express = require("express");
const router  = express.Router();
const { aiChat, getRecommendations } = require("../controllers/aiController");

// POST /api/v1/ai/chat                       — AI style advisor chat
// GET  /api/v1/ai/recommendations/:productId — Product-specific recommendations
router.post("/chat", aiChat);
router.get("/recommendations/:productId", getRecommendations);

module.exports = router;
