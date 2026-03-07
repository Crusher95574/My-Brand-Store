import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // const [menuOpen,   setMenuOpen]   = useState(false);
  const { cartCount }  = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <Link to="/" className="nav-logo">
          My Brand <em>Store</em>
        </Link>

        {/* ── Search Bar ────────────────────────────────────────────────── */}
        <form className="nav-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="nav-search-input"
          />
          <button type="submit" className="nav-search-btn">🔍</button>
        </form>

        {/* ── Nav Links ─────────────────────────────────────────────────── */}
        <div className="nav-links">
          <Link to="/products" className="nav-link">Shop</Link>

          {user ? (
            <>
              <Link to="/orders" className="nav-link">Orders</Link>
              <span className="nav-link nav-user">Hi, {user.name.split(" ")[0]}</span>
              <button className="nav-btn-text" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="nav-link">Login</Link>
              <Link to="/register" className="nav-btn-primary">Join</Link>
            </>
          )}

          {/* ── Cart Icon with badge ─────────────────────────────────────── */}
          <Link to="/cart" className="cart-icon-btn">
            🛒
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
