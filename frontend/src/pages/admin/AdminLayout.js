import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { path: "/admin",           icon: "▦",  label: "Dashboard"  },
  { path: "/admin/products",  icon: "📦", label: "Products"   },
  { path: "/admin/orders",    icon: "🧾", label: "Orders"     },
  { path: "/admin/customers", icon: "👥", label: "Customers"  },
  { path: "/admin/analytics", icon: "📊", label: "Analytics"  },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Guard – redirect non-admins
  if (!user || user.role !== "admin") {
    return (
      <div className="adm-denied">
        <div className="adm-denied-box">
          <span>🔒</span>
          <h2>Access Denied</h2>
          <p>You must be an administrator to view this page.</p>
          <button className="adm-btn-primary" onClick={() => navigate("/")}>Go Home</button>
        </div>
      </div>
    );
  }

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className={`adm-shell ${collapsed ? "adm-collapsed" : ""}`}>
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="adm-sidebar">
        <div className="adm-brand">
          {!collapsed && (
            <div className="adm-brand-text">
              <span className="adm-brand-name">MyBrand</span>
              <span className="adm-brand-tag">Admin</span>
            </div>
          )}
          <button className="adm-collapse-btn" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <nav className="adm-nav">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path ||
              (item.path !== "/admin" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`adm-nav-item ${active ? "active" : ""}`}
                title={collapsed ? item.label : ""}
              >
                <span className="adm-nav-icon">{item.icon}</span>
                {!collapsed && <span className="adm-nav-label">{item.label}</span>}
                {active && !collapsed && <span className="adm-nav-pip" />}
              </Link>
            );
          })}
        </nav>

        <div className="adm-sidebar-footer">
          <div className="adm-user-info">
            <div className="adm-avatar">{user.name[0]}</div>
            {!collapsed && (
              <div>
                <div className="adm-user-name">{user.name}</div>
                <div className="adm-user-role">Administrator</div>
              </div>
            )}
          </div>
          <button className="adm-logout-btn" onClick={handleLogout} title="Logout">
            {collapsed ? "⏻" : "Logout"}
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="adm-main">
        {/* Topbar */}
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <h1 className="adm-page-title">
              {NAV_ITEMS.find(n =>
                location.pathname === n.path ||
                (n.path !== "/admin" && location.pathname.startsWith(n.path))
              )?.label || "Admin"}
            </h1>
          </div>
          <div className="adm-topbar-right">
            <Link to="/" target="_blank" className="adm-view-store-btn">
              ↗ View Store
            </Link>
            <div className="adm-topbar-user">
              <div className="adm-avatar sm">{user.name[0]}</div>
              <span>{user.name}</span>
            </div>
          </div>
        </header>

        {/* Page content rendered by child routes */}
        <div className="adm-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
