import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { productAPI, aiAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/common/ProductCard";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [qty,      setQty]      = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [recommendations, setRecs] = useState([]);
  const [activeTab, setActiveTab] = useState("description");

  // ── Fetch product ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await productAPI.getById(id);
        setProduct(data.data);
        setQty(1);
        setSelectedColor(0);
        // Fetch AI recommendations in background
        fetchRecs(id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const fetchRecs = async (productId) => {
    try {
      const { data } = await aiAPI.getRecommendations(productId);
      setRecs(data.data || []);
    } catch {
      // Silent fail for recommendations
    }
  };

  const handleAddToCart = () => {
    const color = product.colors?.[selectedColor]?.name;
    addToCart(product, qty, color);
    toast.success(`${product.name} × ${qty} added to cart! 🛒`);
  };

  if (loading) {
    return (
      <div className="detail-skeleton">
        <div className="skeleton-img" />
        <div className="skeleton-info">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton-line" />)}
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-state">
        <p>⚠️ {error || "Product not found"}</p>
        <Link to="/products" className="btn-primary">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Shop</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`}>{product.category}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      {/* ── Main Detail Grid ──────────────────────────────────────────────── */}
      <div className="detail-grid">
        {/* Image */}
        <div className="detail-image-area">
          <div className="detail-main-image">
            {product.images?.[0] ? (
              <img src={product.images[0].url} alt={product.name} />
            ) : (
              <span className="detail-emoji">{product.emoji}</span>
            )}
          </div>
          {product.badge && <span className="detail-badge">{product.badge}</span>}
        </div>

        {/* Info */}
        <div className="detail-info">
          <p className="detail-category">{product.category}</p>
          <h1 className="detail-name">{product.name}</h1>
          <p className="detail-sku">SKU: {product.sku}</p>

          {/* Rating */}
          <div className="detail-rating">
            <span className="stars">
              {"★".repeat(Math.round(product.rating))}
              {"☆".repeat(5 - Math.round(product.rating))}
            </span>
            <span className="rating-val">{product.rating}</span>
            <span className="review-count">({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="detail-price-row">
            <span className="detail-price">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="detail-original">${product.originalPrice.toFixed(2)}</span>
                <span className="detail-saving">Save ${(product.originalPrice - product.price).toFixed(2)}</span>
              </>
            )}
          </div>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="detail-colors">
              <p className="option-label">Color: <strong>{product.colors[selectedColor]?.name}</strong></p>
              <div className="color-swatches">
                {product.colors.map((c, i) => (
                  <button
                    key={i}
                    className={`color-swatch ${selectedColor === i ? "active" : ""}`}
                    style={{ background: c.hex }}
                    onClick={() => setSelectedColor(i)}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="detail-qty">
            <p className="option-label">Quantity</p>
            <div className="qty-control">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.countInStock, q + 1))}>+</button>
            </div>
          </div>

          {/* Stock */}
          <p className={`stock-status ${product.countInStock <= 5 ? "low" : ""}`}>
            {product.countInStock === 0
              ? "❌ Out of Stock"
              : product.countInStock <= 5
              ? `⚠️ Only ${product.countInStock} left!`
              : `✓ In Stock (${product.countInStock} available)`}
          </p>

          {/* CTA buttons */}
          <div className="detail-cta">
            <button
              className="btn-add-to-cart-lg"
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
            >
              {product.countInStock === 0 ? "Out of Stock" : "Add to Cart 🛒"}
            </button>
            <Link to="/cart" className="btn-view-cart">View Cart</Link>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="product-tags">
              {product.tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs: Description / Reviews ───────────────────────────────────── */}
      <div className="detail-tabs">
        <div className="tab-nav">
          {["description", "reviews"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "reviews" && ` (${product.numReviews})`}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === "description" && (
            <div className="tab-description">
              <p>{product.description}</p>
              {product.weight && <p><strong>Weight:</strong> {product.weight}g</p>}
              {product.brand  && <p><strong>Brand:</strong> {product.brand}</p>}
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="tab-reviews">
              {product.reviews?.length === 0 ? (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
              ) : (
                product.reviews.map((r) => (
                  <div key={r._id} className="review-item">
                    <div className="review-header">
                      <strong>{r.name}</strong>
                      <span className="review-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                      <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p>{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── AI Recommendations ────────────────────────────────────────────── */}
      {recommendations.length > 0 && (
        <div className="section">
          <div className="section-header">
            <p className="section-eyebrow">✨ AI-Powered</p>
            <h2 className="section-title">You Might Also Like</h2>
          </div>
          <div className="product-grid">
            {recommendations.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
