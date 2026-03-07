// Database Seeder – populates MongoDB with sample products and admin user

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");

// ------------------ PRODUCTS ------------------

const PRODUCTS = [
  { name: "Noir Obsidian Watch", category: "Accessories", price: 299, badge: "Bestseller", emoji: "⌚", isFeatured: true, countInStock: 12, rating: 4.8, numReviews: 124, description: "Swiss-inspired minimalist timepiece with sapphire crystal glass and genuine leather strap. Water-resistant to 50m.", colors: [{ name: "Black", hex: "#1a1a1a" }, { name: "Brown", hex: "#8b7355" }], tags: ["luxury", "watch", "accessories"] },
  { name: "Velvet Noir Blazer", category: "Clothing", price: 189, badge: "New", emoji: "🧥", isFeatured: true, countInStock: 8, rating: 4.6, numReviews: 89, description: "Premium velvet single-breasted blazer with satin lapels. Perfect for evening occasions or power meetings.", colors: [{ name: "Black", hex: "#1a1a1a" }, { name: "Navy", hex: "#1a2a4a" }], tags: ["blazer", "formal", "velvet"] },
  { name: "Crystal Pendant", category: "Jewelry", price: 129, badge: "Top Rated", emoji: "💎", isFeatured: true, countInStock: 25, rating: 4.9, numReviews: 203, description: "Hand-cut Austrian crystal pendant on 18k gold-plated chain. Each piece uniquely faceted for maximum brilliance.", tags: ["jewelry", "crystal", "pendant"] },
  { name: "Merino Cashmere Scarf", category: "Accessories", price: 89, badge: null, emoji: "🧣", isFeatured: false, countInStock: 30, rating: 4.7, numReviews: 156, description: "Ultra-soft merino-cashmere blend in generous proportions. Naturally temperature-regulating for all seasons.", tags: ["scarf", "cashmere", "winter"] },
  { name: "Leather Folio Bag", category: "Bags", price: 349, badge: "Limited", emoji: "👜", isFeatured: true, countInStock: 5, rating: 4.8, numReviews: 78, description: "Full-grain vegetable-tanned leather portfolio bag with brass hardware. Ages beautifully with use.", tags: ["bag", "leather", "luxury"] },
  { name: "Silk Kimono Robe", category: "Clothing", price: 159, badge: "New", emoji: "👘", isFeatured: false, countInStock: 15, rating: 4.5, numReviews: 112, description: "Pure mulberry silk kimono with hand-embroidered details. Luxuriously lightweight with graceful drape.", tags: ["kimono", "silk", "robe"] },
  { name: "Titanium Sunglasses", category: "Accessories", price: 219, badge: null, emoji: "🕶️", isFeatured: false, countInStock: 20, rating: 4.7, numReviews: 94, description: "Aerospace-grade titanium frames with polarized lenses. UV400 protection.", tags: ["sunglasses", "titanium", "eyewear"] },
  { name: "Marble Fragrance Set", category: "Beauty", price: 169, badge: "Bestseller", emoji: "🧴", isFeatured: true, countInStock: 18, rating: 4.9, numReviews: 267, description: "Curated trio of niche perfumes in hand-carved marble bottles. Notes of oud, bergamot, and white musk.", tags: ["fragrance", "perfume", "beauty"] },
  { name: "Gold Signet Ring", category: "Jewelry", price: 249, badge: null, emoji: "💍", isFeatured: false, countInStock: 10, rating: 4.8, numReviews: 145, description: "Solid 14k yellow gold signet ring with personalized engraving option.", tags: ["ring", "gold", "jewelry"] },
  { name: "Suede Chelsea Boots", category: "Footwear", price: 279, badge: "Sale", emoji: "👢", isFeatured: false, countInStock: 22, rating: 4.6, numReviews: 183, originalPrice: 349, description: "Hand-stitched Spanish suede Chelsea boots with memory foam insole.", tags: ["boots", "suede", "footwear"] },
  { name: "Belgian Linen Shirt", category: "Clothing", price: 99, badge: null, emoji: "👔", isFeatured: false, countInStock: 35, rating: 4.4, numReviews: 201, description: "Stone-washed Belgian linen shirt with mother-of-pearl buttons. Relaxed fit.", tags: ["shirt", "linen", "casual"] },
  { name: "Ceramic Diffuser", category: "Beauty", price: 119, badge: "New", emoji: "🕯️", isFeatured: false, countInStock: 14, rating: 4.7, numReviews: 98, description: "Hand-thrown ceramic ultrasonic diffuser with auto-shutoff and ambient LED glow.", tags: ["diffuser", "aroma", "home"] },
];

const ADMIN_USER = {
  name: "Admin User",
  email: "admin@mybrandstore.com",
  password: "admin123456",
  role: "admin",
};

// ------------------ IMPORT DATA ------------------

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Product.deleteMany();
    await User.deleteMany();
    await Order.deleteMany();
    console.log("🗑️  Cleared existing data");

    // Create admin user
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, salt);
    await User.create({ ...ADMIN_USER, password: hashedPassword });

    console.log("👤 Admin user created");
    console.log(`   Email: ${ADMIN_USER.email}`);
    console.log(`   Password: ${ADMIN_USER.password}`);

    // Generate unique SKU for each product
    const productsWithSKU = PRODUCTS.map((product, index) => ({
      ...product,
      sku: `MB-${(index + 1).toString().padStart(4, "0")}`
    }));

    await Product.insertMany(productsWithSKU);

    console.log(`📦 ${productsWithSKU.length} products seeded`);
    console.log("\n✅ Data import complete!");
    process.exit(0);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// ------------------ DESTROY DATA ------------------

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Product.deleteMany();
    await User.deleteMany();
    await Order.deleteMany();

    console.log("🗑️  All data destroyed");
    process.exit(0);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// ------------------ RUN ------------------

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}