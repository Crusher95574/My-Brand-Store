import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const CartPage = () => {
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shippingPrice = cartTotal > 200 ? 0 : 15;
  const taxPrice      = parseFloat((cartTotal * 0.08).toFixed(2));
  const totalPrice    = parseFloat((cartTotal + shippingPrice + taxPrice).toFixed(2));

  if (cartItems.length === 0) {
    return (
      <div className="empty-state" style={{ minHeight: "60vh" }}>
        <span className="empty-icon">🛒</span>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", marginBottom: "0.5rem" }}>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary" style={{ marginTop: "1.5rem" }}>Start Shopping</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>
      <div className="page-header" style={{ padding: "0 0 1.5rem" }}>
        <h1 className="page-title">Shopping Cart ({cartCount} items)</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem" }}>
        {/* Cart items */}
        <div>
          {cartItems.map((item) => (
            <div key={item.key} style={{ display: "flex", gap: "1.25rem", padding: "1.25rem 0", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
              <div style={{ width: 80, height: 80, background: "var(--surface2)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", flexShrink: 0 }}>
                {item.product.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <Link to={`/products/${item.product._id}`} style={{ fontFamily: "var(--font-serif)", fontSize: "1rem" }}>{item.product.name}</Link>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>{item.product.category}{item.color && ` · ${item.color}`}</div>
                <div style={{ fontSize: "1rem", marginTop: "0.5rem" }}>${item.product.price.toFixed(2)}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>
                <div className="qty-control">
                  <button onClick={() => updateQuantity(item.key, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.key, item.quantity + 1)}>+</button>
                </div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem" }}>${(item.product.price * item.quantity).toFixed(2)}</div>
                <button onClick={() => removeFromCart(item.key)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "0.78rem", cursor: "pointer" }} onMouseOver={e => e.target.style.color = "var(--red)"} onMouseOut={e => e.target.style.color = "var(--muted)"}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        {/* Summary */}
        <div className="order-summary-card" style={{ height: "fit-content" }}>
          <h2 className="summary-title">Order Summary</h2>
          <div className="summary-totals">
            <div className="totals-row"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
            <div className="totals-row"><span>Shipping</span><span>{shippingPrice === 0 ? <span className="free-ship">Free</span> : `$${shippingPrice.toFixed(2)}`}</span></div>
            <div className="totals-row"><span>Tax (8%)</span><span>${taxPrice.toFixed(2)}</span></div>
            <div className="totals-row total"><span>Total</span><span>${totalPrice.toFixed(2)}</span></div>
          </div>
          {shippingPrice === 0 && <p className="free-ship-msg">✓ You qualify for free shipping!</p>}
          <button className="btn-place-order" onClick={() => user ? navigate("/checkout") : navigate("/login", { state: { from: { pathname: "/checkout" } } })}>
            {user ? "Proceed to Checkout →" : "Login to Checkout →"}
          </button>
          <Link to="/products" style={{ display: "block", textAlign: "center", marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--muted)" }}>← Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
