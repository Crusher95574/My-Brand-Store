import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import api, { orderAPI } from "../../services/api";

const STATUSES = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_STYLES = {
  pending: { bg: "#fff3cd", color: "#856404", dot: "#f59e0b" },
  processing: { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  shipped: { bg: "#ede9fe", color: "#5b21b6", dot: "#8b5cf6" },
  delivered: { bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  cancelled: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
};

const AdminOrders = () => {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  // ─────────────────────────────────────────────────────────
  // Fetch Orders
  // ─────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders");
      setOrders(data.data || []);
    } catch (e) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ─────────────────────────────────────────────────────────
  // Update Order Status
  // ─────────────────────────────────────────────────────────
  const updateStatus = async (orderId, newStatus) => {

    setUpdating(orderId);

    try {

      // 1️⃣ update order status
      await api.put(`/orders/${orderId}/status`, { status: newStatus });

      // find order
      const order = orders.find(o => o._id === orderId);

      // 2️⃣ if delivered → mark paid
      if (newStatus === "delivered" && !order?.isPaid) {

        await orderAPI.markPaid(orderId, {
          status: "COMPLETED",
          update_time: new Date().toISOString(),
          email_address: "admin@system.local"
        });

      }

      toast.success(`Order status → ${newStatus}`);

      // 3️⃣ update frontend state
      setOrders(prev =>
        prev.map(o =>
          o._id === orderId
            ? {
              ...o,
              status: newStatus,
              isPaid: newStatus === "delivered" ? true : o.isPaid
            }
            : o
        )
      );

    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    } finally {
      setUpdating(null);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Filters
  // ─────────────────────────────────────────────────────────
  const filteredOrders = orders.filter(o => {

    const matchStatus =
      statusFilter === "all" || o.status === statusFilter;

    const matchSearch =
      !search ||
      o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress?.email?.toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchSearch;

  });

  // ─────────────────────────────────────────────────────────
  // Revenue
  // ─────────────────────────────────────────────────────────
  const totalRevenue = orders
    .filter(o => o.isPaid)
    .reduce((s, o) => s + o.totalPrice, 0);

  // ─────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────
  return (

    <div className="adm-page">

      {/* Summary Pills */}

      <div className="adm-order-summary-pills">

        {STATUSES.filter(s => s !== "all").map(s => {

          const count = orders.filter(o => o.status === s).length;
          const st = STATUS_STYLES[s];

          return (

            <div
              key={s}
              className="adm-summary-pill"
              style={{ background: st.bg, color: st.color }}
              onClick={() => setStatusFilter(s === statusFilter ? "all" : s)}
            >

              <span
                style={{
                  background: st.dot,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: 6
                }}
              />

              <strong>{count}</strong> {s}

            </div>

          );

        })}

        <div
          className="adm-summary-pill"
          style={{
            background: "#f0fdf4",
            color: "#166534",
            marginLeft: "auto"
          }}
        >

          💰 <strong>${totalRevenue.toFixed(2)}</strong> revenue

        </div>

      </div>

      {/* Toolbar */}

      <div className="adm-toolbar">

        <div className="adm-toolbar-left">

          <input
            className="adm-search"
            placeholder="Search by order ID, name, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select
            className="adm-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >

            {STATUSES.map(s => (
              <option key={s} value={s}>
                {s === "all"
                  ? "All Statuses"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}

          </select>

        </div>

        <span className="adm-muted">
          {filteredOrders.length} orders
        </span>

      </div>

      {/* Orders Table */}

      {loading ? (

        <div className="adm-loading">
          <div className="adm-spinner" />
        </div>

      ) : (

        <div className="adm-card adm-table-card">

          <table className="adm-table">

            <thead>

              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {filteredOrders.map(order => {

                const st = STATUS_STYLES[order.status] || {};
                const isExpanded = expanded === order._id;

                return (

                  <React.Fragment key={order._id}>

                    <tr className={isExpanded ? "adm-row-expanded" : ""}>

                      <td>

                        <button
                          className="adm-link"
                          onClick={() =>
                            setExpanded(isExpanded ? null : order._id)
                          }
                        >

                          {isExpanded ? "▼" : "▶"} {order.orderId}

                        </button>

                      </td>

                      <td>

                        <div className="adm-customer-cell">

                          <div className="adm-mini-avatar">
                            {order.user?.name?.[0] || "?"}
                          </div>

                          <div>

                            <div>{order.user?.name || "Guest"}</div>

                            <div
                              className="adm-muted"
                              style={{ fontSize: "0.72rem" }}
                            >
                              {order.shippingAddress?.email}
                            </div>

                          </div>

                        </div>

                      </td>

                      <td>
                        {order.orderItems?.length} item
                        {order.orderItems?.length !== 1 ? "s" : ""}
                      </td>

                      <td>
                        <strong>
                          ${order.totalPrice?.toFixed(2)}
                        </strong>
                      </td>

                      <td>

                        <span
                          className={`adm-paid-badge ${order.isPaid ? "paid" : "unpaid"
                            }`}
                        >
                          {order.isPaid ? "✓ Paid" : "Unpaid"}
                        </span>

                      </td>

                      <td>

                        <span
                          className="adm-status-pill"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {order.status}
                        </span>

                      </td>

                      <td className="adm-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      <td>

                        <select
                          className="adm-status-select"
                          value={order.status}
                          onChange={e =>
                            updateStatus(order._id, e.target.value)
                          }
                          disabled={updating === order._id}
                        >

                          {["pending", "processing", "shipped", "delivered", "cancelled"].map(s => (

                            <option key={s} value={s}>
                              {s}
                            </option>

                          ))}

                        </select>

                      </td>

                    </tr>

                  </React.Fragment>

                );

              })}

            </tbody>

          </table>

          {filteredOrders.length === 0 && (

            <div className="adm-empty">
              No orders found matching your filters.
            </div>

          )}

        </div>

      )}

    </div>

  );

};

export default AdminOrders;