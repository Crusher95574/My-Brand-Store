import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

// ─────────────────────────────────────────────────────────
// Sparkline chart
// ─────────────────────────────────────────────────────────
const Sparkline = ({ data, color = "#c9a84c", height = 40 }) => {

  const ref = React.useRef();

  useEffect(() => {

    if (!ref.current || !data?.length) return;

    const canvas = ref.current;
    const ctx = canvas.getContext("2d");

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const pts = data.map((v, i) => [
      (i / (data.length - 1)) * w,
      h - ((v - min) / range) * (h - 4) - 2
    ]);

    ctx.beginPath();
    ctx.moveTo(...pts[0]);
    pts.slice(1).forEach(p => ctx.lineTo(...p));

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    ctx.fillStyle = color + "22";
    ctx.fill();

  }, [data, color]);

  return (
    <canvas
      ref={ref}
      width={120}
      height={height}
      style={{ display: "block" }}
    />
  );
};

// ─────────────────────────────────────────────────────────
// Status Colors
// ─────────────────────────────────────────────────────────
const STATUS_COLOR = {

  pending:    { bg: "#fff3cd", text: "#856404" },
  processing: { bg: "#cce5ff", text: "#004085" },
  shipped:    { bg: "#d4edda", text: "#155724" },
  delivered:  { bg: "#d1ecf1", text: "#0c5460" },
  cancelled:  { bg: "#f8d7da", text: "#721c24" }

};

const AdminDashboard = () => {

  const [stats, setStats]       = useState(null);
  const [orders, setOrders]     = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  // ───────────────────────────────────────────────────────
  // Load Dashboard Data
  // ───────────────────────────────────────────────────────
  useEffect(() => {

    const load = async () => {

      try {

        const [ordRes, prodRes] = await Promise.all([
          api.get("/orders"),
          api.get("/products?limit=50&sort=-rating"),
        ]);

        const allOrders   = ordRes.data.data  || [];
        const allProducts = prodRes.data.data || [];

        // Normalize orders
        const normalizedOrders = allOrders.map(o => {
          if (o.isPaid && o.status !== "delivered") {
            return { ...o, status: "delivered" };
          }
          return o;
        });

        // KPIs
        const revenue = normalizedOrders
          .filter(o => o.isPaid)
          .reduce((s, o) => s + o.totalPrice, 0);

        const pending = normalizedOrders
          .filter(o => o.status === "pending")
          .length;

        const delivered = normalizedOrders
          .filter(o => o.status === "delivered")
          .length;

        // Last 7 days revenue
        const days = [...Array(7)].map((_, i) => {

          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dayStr = d.toDateString();

          return normalizedOrders
            .filter(o =>
              o.isPaid &&
              o.paidAt &&
              new Date(o.paidAt).toDateString() === dayStr
            )
            .reduce((s, o) => s + o.totalPrice, 0);

        });

        setStats({
          revenue,
          pending,
          delivered,
          totalOrders: normalizedOrders.length,
          totalProducts: allProducts.length,
          sparkRevenue: days
        });

        setOrders(normalizedOrders.slice(0, 8));
        setProducts(allProducts.slice(0, 6));

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }

    };

    load();

  }, []);

  if (loading) {
    return (
      <div className="adm-loading">
        <div className="adm-spinner" />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  const KPI = ({ label, value, sub, spark, color }) => (

    <div className="adm-kpi">

      <div className="adm-kpi-body">
        <div className="adm-kpi-label">{label}</div>
        <div className="adm-kpi-value" style={{ color }}>
          {value}
        </div>
        {sub && <div className="adm-kpi-sub">{sub}</div>}
      </div>

      {spark && <Sparkline data={spark} color={color} />}

    </div>

  );

  return (

    <div className="adm-dashboard">

      {/* KPI Cards */}

      <div className="adm-kpi-grid">

        <KPI
          label="Total Revenue"
          value={`$${ stats.revenue.toFixed(2) } `}
          sub="From paid orders"
          spark={stats.sparkRevenue}
          color="#c9a84c"
        />

        <KPI
          label="Total Orders"
          value={stats.totalOrders}
          sub={`${ stats.pending } pending`}
          color="#3b82f6"
        />

        <KPI
          label="Delivered"
          value={stats.delivered}
          sub="Orders fulfilled"
          color="#10b981"
        />

        <KPI
          label="Products Listed"
          value={stats.totalProducts}
          sub="Active SKUs"
          color="#8b5cf6"
        />

      </div>

      {/* Recent Orders + Top Products */}

      <div className="adm-dash-grid">

        {/* Recent Orders */}

        <div className="adm-card">

          <div className="adm-card-header">
            <h3 className="adm-card-title">Recent Orders</h3>
            <Link to="/admin/orders" className="adm-card-link">
              View all →
            </Link>
          </div>

          <table className="adm-table">

            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>

              {orders.map(order => {

                const sc = STATUS_COLOR[order.status] || {};

                return (

                  <tr key={order._id}>

                    <td>
                      <Link to="/admin/orders" className="adm-link">
                        {order.orderId}
                      </Link>
                    </td>

                    <td>{order.user?.name || "—"}</td>

                    <td>
                      <strong>${order.totalPrice?.toFixed(2)}</strong>
                    </td>

                    <td>
                      <span
                        className="adm-status-pill"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="adm-muted">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

        {/* Top Products */}

        <div className="adm-card">

          <div className="adm-card-header">
            <h3 className="adm-card-title">Top Rated Products</h3>
            <Link to="/admin/products" className="adm-card-link">
              Manage →
            </Link>
          </div>

          <div className="adm-top-products">

            {products.map((p, i) => (

              <div key={p._id} className="adm-top-product-row">

                <span className="adm-rank">#{i + 1}</span>

                <span className="adm-prod-emoji">
                  {p.emoji}
                </span>

                <div className="adm-prod-info">
                  <div className="adm-prod-name">{p.name}</div>
                  <div className="adm-prod-cat">{p.category}</div>
                </div>

                <div className="adm-prod-right">
                  <div className="adm-prod-price">${p.price}</div>
                  <div className="adm-prod-rating">★ {p.rating}</div>
                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* Revenue Chart */}

      <div className="adm-card">

        <div className="adm-card-header">
          <h3 className="adm-card-title">7-Day Revenue</h3>
        </div>

        <div className="adm-bar-chart">

          {stats.sparkRevenue.map((val, i) => {

            const max = Math.max(...stats.sparkRevenue, 1);
            const pct = (val / max) * 100;

            const d = new Date();
            d.setDate(d.getDate() - (6 - i));

            return (

              <div key={i} className="adm-bar-col">

                <div className="adm-bar-wrap">

                  <div
                    className="adm-bar-fill"
                    style={{ height: `${ Math.max(pct, 4) }% ` }}
                  >

                    {val > 0 && (
                      <span className="adm-bar-tip">
                        ${val.toFixed(0)}
                      </span>
                    )}

                  </div>

                </div>

                <div className="adm-bar-label">
                  {d.toLocaleDateString("en", { weekday: "short" })}
                </div>

              </div>

            );

          })}

        </div>

      </div>

    </div>

  );

};

export default AdminDashboard;
