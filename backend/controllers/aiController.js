const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

// ─────────────────────────────────────────────────────────────────────────────
// @desc    AI style advisor chat
// @route   POST /api/v1/ai/chat
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const aiChat = asyncHandler(async (req, res) => {
  const { messages, cartItems = [] } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400);
    throw new Error("messages array is required");
  }

  // ── Fetch product catalog ─────────────────────────────────────────────
  const products = await Product.find({ isActive: true })
    .select("name category price description")
    .limit(50);

  const productList = products
    .map((p) => `- ${p.name} (${p.category}, $${p.price}): ${p.description}`)
    .join("\n");

  const cartSummary =
    cartItems.length > 0
      ? cartItems.map((i) => `${i.product?.name || i.name} x${i.quantity}`).join(", ")
      : "empty";

  // ── System prompt ─────────────────────────────────────────────────────
  const systemPrompt = `You are a warm, knowledgeable personal style advisor for "My Brand Store".
  
PRODUCT CATALOG:
${productList}

CUSTOMER CART: ${cartSummary}

ROLE:
- Help discovery, suggest combinations, and give fashion advice.
- Keep answers under 150 words.
- Reference exact product names.
- Provide a warm, boutique shopping experience.`;

  // ── Map history for Gemini's multi-turn format ────────────────────────
  // Gemini expects roles to be "user" or "model"
  const history = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // ── Call Google Gemini API ─────────────────────────────────────────────
  // Using gemini-2.0-flash (ensure your API key has access to this model)
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] }, // Inject context first
          ...history,
        ],
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini API Error Details:", JSON.stringify(errorData, null, 2));
    res.status(response.status || 500);
    throw new Error(errorData.error?.message || "AI service communication failed");
  }

  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble thinking of a style tip right now. Try again?";

  res.json({ success: true, reply });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get AI-generated product recommendations for a specific product
// @route   GET /api/v1/ai/recommendations/:productId
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getRecommendations = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Fetch similar products from same category
  const similar = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(20)
    .select("name category price description badge rating");

  const productContext = `Current Product: ${product.name} (${product.category}, $${product.price}) - ${product.description}`;
  const candidates = similar.map(p => `- ${p.name}: ${p.description}`).join("\n");

  // ── Call Google Gemini API ─────────────────────────────────────────────
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${productContext}\n\nCandidates:\n${candidates}\n\nTask: Pick the top 3 items that best complement the current product. 
            Respond ONLY with a valid JSON object: { "recommendations": [{ "name": "Exact Name", "reason": "Short explanation" }] }`
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json", // Forces Gemini to output pure JSON
          temperature: 0.4, // Lower temperature for more consistent matching
        }
      }),
    }
  );

  if (!response.ok) {
    console.error("Gemini Rec Error:", await response.text());
    return res.json({ success: false, data: [] });
  }

  const data = await response.json();
  let recommendations = [];

  try {
    const jsonString = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsed = JSON.parse(jsonString);
    recommendations = parsed.recommendations || [];
  } catch (e) {
    console.error("JSON Parse Error:", e);
    recommendations = [];
  }

  // Map back to actual product documents and merge the "reason"
  const enriched = recommendations.map((rec) => {
    const found = similar.find((p) => p.name.trim() === rec.name.trim());
    return found ? { ...found.toObject(), reason: rec.reason } : null;
  }).filter(Boolean);

  res.json({ success: true, data: enriched });
});
module.exports = { aiChat, getRecommendations };
