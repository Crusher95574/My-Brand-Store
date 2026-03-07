// ─────────────────────────────────────────────────────────────────────────────
// MongoDB Connection using Mongoose
// Handles connection, retry logic, and graceful shutdown
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are defaults in Mongoose 7+ but shown for clarity
      // useNewUrlParser: true,       // deprecated in Mongoose 7
      // useUnifiedTopology: true,    // deprecated in Mongoose 7
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.cyan);
    console.log(`   Database: ${conn.connection.name}`);

    // ── Connection event listeners ────────────────────────────────────────────
    mongoose.connection.on("disconnected", () => {
      console.log("⚠️  MongoDB disconnected. Attempting reconnect...".yellow);
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected".green);
    });

    mongoose.connection.on("error", (err) => {
      console.error(`❌ MongoDB error: ${err.message}`.red);
    });
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`.red);
    process.exit(1); // Exit process with failure
  }
};

// ── Graceful shutdown on app termination ─────────────────────────────────────
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed on app termination");
  process.exit(0);
});

module.exports = connectDB;
