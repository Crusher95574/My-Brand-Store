import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productAPI } from "../services/api";
import ProductCard from "../components/common/ProductCard";

const CATEGORIES = [
  { name: "Clothing",    emoji: "🧥", color: "#1a2a4a" },
  { name: "Accessories", emoji: "⌚", color: "#2c1810" },
  { name: "Jewelry",     emoji: "💍", color: "#1a1a2e" },
  { name: "Bags",        emoji: "👜", color: "#1c2b1a" },
  { name: "Beauty",      emoji: "🧴", color: "#2b1a2e" },
  { name: "Footwear",    emoji: "👢", color: "#2a1c10" },
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await productAPI.getFeatured();
        setFeatured(data.data);
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="home-page">
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">✦ New Collection 2026 ✦</p>
          <h1 className="hero-title">
            Curated for the<br />
            <em>Discerning Few</em>
          </h1>
          <p className="hero-subtitle">
            Discover our handpicked selection of luxury fashion & lifestyle pieces —
            each one chosen for exceptional craftsmanship and timeless appeal.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn-primary">Shop Collection</Link>
            <Link to="/products?badge=New" className="btn-ghost">New Arrivals</Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat"><span className="stat-number">500+</span><span className="stat-label">Products</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-number">50K+</span><span className="stat-label">Customers</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-number">4.8★</span><span className="stat-label">Avg Rating</span></div>
        </div>
      </section>

      {/* ── Category Grid ────────────────────────────────────────────────── */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              className="category-card"
              style={{ background: cat.color }}
            >
              <span className="category-emoji">{cat.emoji}</span>
              <span className="category-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      <section className="section section-dark">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">Hand-Picked Selections</p>
            <h2 className="section-title">Featured Products</h2>
          </div>
          <Link to="/products?featured=true" className="btn-outline">View All →</Link>
        </div>

        {loading ? (
          <div className="products-skeleton">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── AI Promo Banner ───────────────────────────────────────────────── */}
      <section className="ai-promo">
        <div className="ai-promo-content">
          <span className="ai-promo-icon">✨</span>
          <div>
            <h3>Meet Your AI Style Advisor</h3>
            <p>Get personalized recommendations, outfit pairings, and gift ideas powered by Claude AI.</p>
          </div>
          <button className="btn-gold" onClick={() => document.querySelector(".ai-fab")?.click()}>
            Start Chat
          </button>
        </div>
      </section>

      {/* ── Trust Signals ─────────────────────────────────────────────────── */}
      <section className="trust-section">
        {[
          { icon: "🚚", title: "Free Shipping",   desc: "On orders over $200" },
          { icon: "↩️", title: "Easy Returns",    desc: "30-day return policy" },
          { icon: "🔒", title: "Secure Payment",  desc: "256-bit SSL encryption" },
          { icon: "💬", title: "24/7 AI Support", desc: "Always here to help" },
        ].map((item) => (
          <div key={item.title} className="trust-item">
            <span className="trust-icon">{item.icon}</span>
            <strong>{item.title}</strong>
            <span>{item.desc}</span>
          </div>
        ))}
      </section>
    </div>
  );
};

export default HomePage;
