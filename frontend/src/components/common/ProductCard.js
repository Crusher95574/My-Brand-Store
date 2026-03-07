import React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();   // Prevent Link navigation
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart! 🛒`);
  };

  const badgeClass = product.badge
    ? `product-badge badge-${product.badge.toLowerCase().replace(" ", "-")}`
    : "";

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      {/* ── Product Image / Emoji ──────────────────────────────────────── */}
      <div className="product-card-img">
        {product.images?.[0] ? (
          <img src={product.images[0].url} alt={product.name} loading="lazy" />
        ) : (
          <span className="product-emoji">{product.emoji || "📦"}</span>
        )}
        {product.badge && (
          <span className={badgeClass}>{product.badge}</span>
        )}
        {product.discountPercent > 0 && (
          <span className="product-badge badge-sale">-{product.discountPercent}%</span>
        )}
      </div>

      {/* ── Product Info ───────────────────────────────────────────────── */}
      <div className="product-card-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>

        {/* Star rating */}
        <div className="product-rating">
          {"★".repeat(Math.round(product.rating || 0))}
          {"☆".repeat(5 - Math.round(product.rating || 0))}
          <span className="rating-count">({product.numReviews || 0})</span>
        </div>

        {/* Price row */}
        <div className="product-price-row">
          <span className="product-price">${product.price?.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="product-original-price">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        {product.countInStock === 0 ? (
          <span className="out-of-stock">Out of Stock</span>
        ) : product.countInStock <= 5 ? (
          <span className="low-stock">Only {product.countInStock} left!</span>
        ) : null}

        {/* Add to cart */}
        <button
          className="btn-add-to-cart"
          onClick={handleAddToCart}
          disabled={product.countInStock === 0}
        >
          {product.countInStock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
