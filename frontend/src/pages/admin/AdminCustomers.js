import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [roleFilter,setRoleFilter]= useState("all");

  useEffect(() => {
    api.get("/users")
      .then(({ data }) => setCustomers(data.data || []))
      .catch(() => toast.error("Failed to load customers"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c => {
    const matchRole = roleFilter === "all" || c.role === roleFilter;
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const admins    = customers.filter(c => c.role === "admin").length;
  const active    = customers.filter(c => c.isActive).length;

  return (
    <div className="adm-page">
      {/* Summary */}
      <div className="adm-kpi-grid" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Total Customers", value: customers.length, color: "#3b82f6" },
          { label: "Active",          value: active,            color: "#10b981" },
          { label: "Admins",          value: admins,            color: "#f59e0b" },
          { label: "Inactive",        value: customers.length - active, color: "#ef4444" },
        ].map(k => (
          <div key={k.label} className="adm-kpi">
            <div className="adm-kpi-label">{k.label}</div>
            <div className="adm-kpi-value" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="adm-toolbar">
        <div className="adm-toolbar-left">
          <input className="adm-search" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="adm-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        <span className="adm-muted">{filtered.length} users</span>
      </div>

      {loading ? (
        <div className="adm-loading"><div className="adm-spinner" /></div>
      ) : (
        <div className="adm-card adm-table-card">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Wishlist</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c._id}>
                  <td>
                    <div className="adm-customer-cell">
                      <div className="adm-mini-avatar" style={{ background: c.role === "admin" ? "#f59e0b" : "#3b82f6" }}>
                        {c.name[0].toUpperCase()}
                      </div>
                      <strong>{c.name}</strong>
                    </div>
                  </td>
                  <td className="adm-muted">{c.email}</td>
                  <td>
                    <span className={`adm-role-pill ${c.role}`}>{c.role}</span>
                  </td>
                  <td className="adm-muted">{c.phone || "—"}</td>
                  <td>{c.wishlist?.length || 0} items</td>
                  <td>
                    <span className={`adm-status-pill ${c.isActive ? "active" : "inactive"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="adm-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="adm-empty">No customers found.</div>}
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
