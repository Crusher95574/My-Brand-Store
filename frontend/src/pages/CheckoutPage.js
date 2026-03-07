import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { orderAPI } from "../services/api";
import { useCart } from "../context/CartContext";

// ✅ FIXED: Field is defined OUTSIDE CheckoutPage so it's never recreated on re-render
const Field = ({ label, k, type = "text", placeholder, required, half, value, onChange }) => (
  <div className={`form-field ${half ? "half" : ""}`}>
    <label className="field-label">{label}{required && " *"}</label>
    <input
      className="field-input"
      type={type}
      name={k}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
);

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    street: "", city: "", state: "", zip: "", country: "India",
    paymentMethod: "cod",
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }, []);

  const shippingPrice = cartTotal > 200 ? 0 : 15;
  const taxPrice = parseFloat((cartTotal * 0.08).toFixed(2));
  const totalPrice = parseFloat((cartTotal + shippingPrice + taxPrice).toFixed(2));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.street || !form.city || !form.zip) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setSubmitting(true);
      const orderData = {
        orderItems: cartItems.map((i) => ({
          product: i.product._id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          color: i.color,
          size: i.size,
        })),
        shippingAddress: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
        },
        paymentMethod: form.paymentMethod,
      };

      const { data } = await orderAPI.create(orderData);
      clearCart();
      navigate(`/order-confirmation/${data.data._id}`);
    } catch (err) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="page-header">
        <h1 className="page-title">Checkout</h1>
      </div>

      <form className="checkout-grid" onSubmit={handleSubmit}>
        {/* ── Left: Form ─────────────────────────────────────────────────── */}
        <div className="checkout-form-area">
          <div className="form-section">
            <h2 className="form-section-title">Shipping Information</h2>
            <div className="form-row">
              <Field label="First Name" k="firstName" required half value={form.firstName} onChange={handleChange} />
              <Field label="Last Name" k="lastName" half value={form.lastName} onChange={handleChange} />
            </div>
            <Field label="Email" k="email" type="email" required value={form.email} onChange={handleChange} />
            <Field label="Phone" k="phone" type="tel" value={form.phone} onChange={handleChange} />
            <Field label="Street Address" k="street" required value={form.street} onChange={handleChange} />
            <div className="form-row">
              <Field label="City" k="city" required half value={form.city} onChange={handleChange} />
              <Field label="State" k="state" half value={form.state} onChange={handleChange} />
            </div>
            <div className="form-row">
              <Field label="ZIP Code" k="zip" required half value={form.zip} onChange={handleChange} />
              <Field label="Country" k="country" half value={form.country} onChange={handleChange} />
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Payment Method</h2>
            {[
              { value: "cod", label: "Cash on Delivery", icon: "💵" },
              { value: "stripe", label: "Credit / Debit Card", icon: "💳" },
              { value: "upi", label: "UPI Payment", icon: "📱" },
            ].map((method) => (
              <label key={method.value} className={`payment-option ${form.paymentMethod === method.value ? "active" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={form.paymentMethod === method.value}
                  onChange={handleChange}
                />
                <span className="payment-icon">{method.icon}</span>
                <span>{method.label}</span>
              </label>
            ))}
            {form.paymentMethod === "stripe" && (
              <div className="stripe-note">
                🔒 Card details would be collected securely via Stripe.js in production.
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Order Summary ──────────────────────────────────────── */}
        <div className="order-summary-card">
          <h2 className="summary-title">Order Summary</h2>
          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.key} className="summary-item">
                <span className="summary-item-emoji">{item.product.emoji}</span>
                <div className="summary-item-info">
                  <p className="summary-item-name">{item.product.name}</p>
                  <p className="summary-item-meta">× {item.quantity}{item.color && ` · ${item.color}`}</p>
                </div>
                <span className="summary-item-price">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-totals">
            <div className="totals-row"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
            <div className="totals-row"><span>Shipping</span><span>{shippingPrice === 0 ? <span className="free-ship">Free</span> : `$${shippingPrice.toFixed(2)}`}</span></div>
            <div className="totals-row"><span>Tax (8%)</span><span>${taxPrice.toFixed(2)}</span></div>
            <div className="totals-row total"><span>Total</span><span>${totalPrice.toFixed(2)}</span></div>
          </div>
          {shippingPrice === 0 && (
            <p className="free-ship-msg">✓ You qualify for free shipping!</p>
          )}
          <button type="submit" className="btn-place-order" disabled={submitting}>
            {submitting ? "Placing Order…" : `Place Order — $${totalPrice.toFixed(2)}`}
          </button>
          <p className="secure-badge">🔒 Secured by 256-bit SSL encryption</p>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;