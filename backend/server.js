// backend/server.js
// ─────────────────────────────────────────────────────────────────────────────
// My Brand Store – Express Server Entry Point
// Bootstraps middleware, routes, DB connection and starts the server
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const colors = require("colors"); // optional: npm i colors

// ── Load env variables ────────────────────────────────────────────────────────
dotenv.config();

// ── Database Connection ───────────────────────────────────────────────────────
const connectDB = require("./config/db");
connectDB();

// ── Import Routes ─────────────────────────────────────────────────────────────
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const aiRoutes = require("./routes/aiRoutes");

// ── Import Middleware ─────────────────────────────────────────────────────────
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// ── Initialize App ────────────────────────────────────────────────────────────
const app = express();

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());                          // Set security HTTP headers
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:2000",
  credentials: true,                        // Allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// The limiter is intentionally aggressive for demo/production workloads. During
// local development it's common to hit the threshold when multiple tabs or
// accounts use the same IP.  We skip or relax the limiter in development so you
// can iterate without seeing 429s.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // requests per IP
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// apply only in non-development environments, or when explicitly enabled
if (process.env.NODE_ENV !== "development" && process.env.RATE_LIMIT_ENABLED !== "false") {
  app.use("/api/", limiter);
} else {
  console.log("⚠️  Rate limiting disabled or relaxed in development");
}

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── HTTP Request Logging ──────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── API Health Check ──────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "My Brand Store API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── Mount Routes ──────────────────────────────────────────────────────────────
//    All API routes are prefixed with /api/v1
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/ai", aiRoutes);

// ── Error Handling Middleware (must be last) ──────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.bold);
  console.log(`   API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health\n`);
});

// ── Handle Unhandled Promise Rejections ──────────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`.red);
  server.close(() => process.exit(1));
});

module.exports = server;
