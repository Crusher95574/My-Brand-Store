import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderAPI } from "../services/api";

const STATUS_COLORS = { pending: "#f39c12", processing: "#3498db", shipped: "#9b59b6", delivered: "#27ae60", cancelled: "#e74c3e" };

const OrderHistoryPage = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getMyOrders()
      .then(({ data }) => setOrders(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
      <div className="page-header" style={{ padding: "0 0 1.5rem", marginBottom: "1.5rem" }}>
        <h1 className="page-title">My Orders</h1>
        <p className="page-count">{orders.length} orders total</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📦</span>
          <h3>No orders yet</h3>
          <p>When you place an order, it will appear here.</p>
          <Link to="/products" className="btn-primary" style={{ marginTop: "1.5rem" }}>Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders.map((order) => (
            <div key={order._id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem" }}>{order.orderId}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>
                    Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </div>
                <div style={{ display: "flex", align: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <span style={{ background: STATUS_COLORS[order.status] + "20", color: STATUS_COLORS[order.status], padding: "0.2rem 0.75rem", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 600, textTransform: "capitalize" }}>
                    {order.status}
                  </span>
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem" }}>${order.totalPrice.toFixed(2)}</span>
                  <Link to={`/order-confirmation/${order._id}`} style={{ fontSize: "0.8rem", color: "var(--gold)", border: "1px solid var(--gold)", padding: "0.25rem 0.6rem", borderRadius: "var(--radius)" }}>View Details</Link>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {order.orderItems.map((item, i) => (
                  <span key={i} style={{ background: "var(--surface2)", border: "1px solid var(--border)", padding: "0.25rem 0.6rem", borderRadius: "var(--radius)", fontSize: "0.8rem" }}>
                    {item.emoji} {item.name} × {item.quantity}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
