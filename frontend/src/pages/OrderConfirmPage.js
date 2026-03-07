import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { orderAPI } from "../services/api";

const OrderConfirmPage = () => {
  const { orderId } = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await orderAPI.getById(orderId);
        setOrder(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [orderId]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="confirm-page">
      <div className="confirm-card">
        <div className="confirm-icon">🎉</div>
        <h1 className="confirm-title">Order Confirmed!</h1>
        <p className="confirm-sub">
          Thank you for your purchase. Your order has been received and is being prepared.
        </p>

        <div className="confirm-order-id">
          <p className="order-id-label">Order ID</p>
          <p className="order-id-value">{order?.orderId}</p>
        </div>

        {order && (
          <div className="confirm-items">
            <h3>Items Ordered</h3>
            {order.orderItems.map((item, i) => (
              <div key={i} className="confirm-item">
                <span>{item.emoji} {item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="confirm-total">
              <span>Total Paid</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="confirm-shipping">
          <p>📦 Estimated delivery: <strong>3–5 business days</strong></p>
          <p>📧 Confirmation sent to: <strong>{order?.shippingAddress?.email}</strong></p>
        </div>

        <div className="confirm-actions">
          <Link to="/orders"   className="btn-primary">View My Orders</Link>
          <Link to="/products" className="btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmPage;


