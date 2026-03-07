import React, { useState, useEffect } from "react";
import api from "../../services/api";

const COLORS = ["#c9a84c","#3b82f6","#10b981","#8b5cf6","#ef4444","#f59e0b"];

const DonutChart = ({ data, size = 160 }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const cx = size / 2; const cy = size / 2; const r = size * 0.38; const gap = 4;

  const segments = data.map((d, i) => {
    const pct   = d.value / total;
    const start = cumulative; cumulative += pct;
    const startAngle = start * 2 * Math.PI - Math.PI / 2;
    const endAngle   = (start + pct) * 2 * Math.PI - Math.PI / 2 - (gap / (2 * Math.PI * r));
    const x1 = cx + r * Math.cos(startAngle); const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);   const y2 = cy + r * Math.sin(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;
    return { path: pct > 0.01 ? `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z` : null, color: COLORS[i % COLORS.length], ...d };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((s, i) => s.path && <path key={i} d={s.path} fill={s.color} opacity={0.9} />)}
      <circle cx={cx} cy={cy} r={r * 0.6} fill="white" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="#555">Total</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="16" fontWeight="700" fill="#0d0d0d">{total}</text>
    </svg>
  );
};

const AdminAnalytics = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordRes, prodRes] = await Promise.all([
          api.get("/orders"),
          api.get("/products?limit=50"),
        ]);
        const orders   = ordRes.data.data  || [];
        const products = prodRes.data.data || [];

        // Revenue by month (last 6 months)
        const monthlyRevenue = {};
        orders.filter(o => o.isPaid).forEach(o => {
          const d = new Date(o.paidAt);
          const key = d.toLocaleDateString("en", { month: "short", year: "2-digit" });
          monthlyRevenue[key] = (monthlyRevenue[key] || 0) + o.totalPrice;
        });

        // Orders by status
        const statusCounts = {};
        orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

        // Products by category
        const catCounts = {};
        products.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });

        // Top revenue products (from order items)
        const prodRevenue = {};
        orders.filter(o => o.isPaid).forEach(o =>
          o.orderItems?.forEach(item => {
            prodRevenue[item.name] = (prodRevenue[item.name] || 0) + item.price * item.quantity;
          })
        );
        const topProducts = Object.entries(prodRevenue)
          .sort((a, b) => b[1] - a[1]).slice(0, 5)
          .map(([name, revenue]) => ({ name, revenue }));

        // Avg order value
        const paidOrders = orders.filter(o => o.isPaid);
        const avgOrderValue = paidOrders.length
          ? paidOrders.reduce((s, o) => s + o.totalPrice, 0) / paidOrders.length
          : 0;

        setData({
          totalRevenue:   paidOrders.reduce((s, o) => s + o.totalPrice, 0),
          avgOrderValue,
          conversionRate: orders.length ? ((paidOrders.length / orders.length) * 100).toFixed(1) : 0,
          monthlyRevenue: Object.entries(monthlyRevenue).slice(-6),
          statusCounts:   Object.entries(statusCounts).map(([label, value]) => ({ label, value })),
          catCounts:      Object.entries(catCounts).map(([label, value]) => ({ label, value })),
          topProducts,
          totalOrders:    orders.length,
          paidOrders:     paidOrders.length,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="adm-loading"><div className="adm-spinner" /></div>;
  if (!data)   return <div className="adm-empty">No analytics data available.</div>;

  const maxMonthRev = Math.max(...data.monthlyRevenue.map(([, v]) => v), 1);

  return (
    <div className="adm-page">
      {/* ── KPI Summary ──────────────────────────────────────────────────── */}
      <div className="adm-kpi-grid">
        {[
          { label: "Total Revenue",     value: `$${data.totalRevenue.toFixed(2)}`,   color: "#c9a84c" },
          { label: "Avg Order Value",   value: `$${data.avgOrderValue.toFixed(2)}`,  color: "#3b82f6" },
          { label: "Conversion Rate",   value: `${data.conversionRate}%`,            color: "#10b981" },
          { label: "Paid Orders",       value: `${data.paidOrders}/${data.totalOrders}`, color: "#8b5cf6" },
        ].map(k => (
          <div key={k.label} className="adm-kpi">
            <div className="adm-kpi-label">{k.label}</div>
            <div className="adm-kpi-value" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ───────────────────────────────────────────────────── */}
      <div className="adm-analytics-grid">
        {/* Monthly Revenue Bar Chart */}
        <div className="adm-card" style={{ gridColumn: "span 2" }}>
          <div className="adm-card-header">
            <h3 className="adm-card-title">Monthly Revenue</h3>
          </div>
          {data.monthlyRevenue.length === 0 ? (
            <p className="adm-empty">No paid orders yet — revenue chart will appear here.</p>
          ) : (
            <div className="adm-bar-chart adm-bar-chart-tall">
              {data.monthlyRevenue.map(([month, rev]) => (
                <div key={month} className="adm-bar-col">
                  <div className="adm-bar-wrap">
                    <div className="adm-bar-fill" style={{ height: `${Math.max((rev / maxMonthRev) * 100, 4)}%`, background: "#c9a84c" }}>
                      <span className="adm-bar-tip">${rev.toFixed(0)}</span>
                    </div>
                  </div>
                  <div className="adm-bar-label">{month}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status Donut */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">Orders by Status</h3>
          </div>
          <div className="adm-donut-wrap">
            <DonutChart data={data.statusCounts.map(d => ({ ...d, value: d.value }))} />
            <div className="adm-legend">
              {data.statusCounts.map((s, i) => (
                <div key={s.label} className="adm-legend-item">
                  <span className="adm-legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="adm-legend-label">{s.label}</span>
                  <span className="adm-legend-val">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Distribution Donut */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">Products by Category</h3>
          </div>
          <div className="adm-donut-wrap">
            <DonutChart data={data.catCounts} />
            <div className="adm-legend">
              {data.catCounts.map((c, i) => (
                <div key={c.label} className="adm-legend-item">
                  <span className="adm-legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="adm-legend-label">{c.label}</span>
                  <span className="adm-legend-val">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products by Revenue */}
        <div className="adm-card" style={{ gridColumn: "span 2" }}>
          <div className="adm-card-header">
            <h3 className="adm-card-title">Top Products by Revenue</h3>
          </div>
          {data.topProducts.length === 0 ? (
            <p className="adm-empty">No revenue data yet.</p>
          ) : (
            <div className="adm-top-rev-list">
              {data.topProducts.map((p, i) => {
                const maxRev = data.topProducts[0].revenue;
                return (
                  <div key={p.name} className="adm-top-rev-row">
                    <span className="adm-rank">#{i + 1}</span>
                    <span className="adm-top-rev-name">{p.name}</span>
                    <div className="adm-top-rev-bar-wrap">
                      <div className="adm-top-rev-bar" style={{ width: `${(p.revenue / maxRev) * 100}%`, background: COLORS[i] }} />
                    </div>
                    <span className="adm-top-rev-val">${p.revenue.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
