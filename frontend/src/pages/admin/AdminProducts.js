import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

const CATEGORIES = ["Clothing", "Accessories", "Jewelry", "Bags", "Beauty", "Footwear"];
const BADGES     = ["", "New", "Bestseller", "Sale", "Limited", "Top Rated"];

const EMPTY_FORM = {
  name: "", description: "", price: "", originalPrice: "",
  category: "Clothing", badge: "", emoji: "📦",
  countInStock: "", isFeatured: false, isActive: true,
  tags: "", colors: "",
};

const AdminProducts = () => {
  const [products, setProducts]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState("");
  const [catFilter,setCatFilter]  = useState("All");
  const [showModal,setShowModal]  = useState(false);
  const [editMode, setEditMode]   = useState(false);
  const [editId,   setEditId]     = useState(null);
  const [form,     setForm]       = useState(EMPTY_FORM);
  const [saving,   setSaving]     = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [page,     setPage]       = useState(1);
  const [meta,     setMeta]       = useState({ total: 0, pages: 1 });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12, sort: "-createdAt" };
      if (search)              params.search   = search;
      if (catFilter !== "All") params.category = catFilter;
      const { data } = await api.get("/products", { params });
      setProducts(data.data);
      setMeta({ total: data.total, pages: data.pages });
    } catch (e) { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  }, [search, catFilter, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const openCreate = () => {
    setForm(EMPTY_FORM); setEditMode(false); setEditId(null); setShowModal(true);
  };

  const openEdit = (p) => {
    setForm({
      name:         p.name,
      description:  p.description,
      price:        p.price,
      originalPrice:p.originalPrice || "",
      category:     p.category,
      badge:        p.badge || "",
      emoji:        p.emoji || "📦",
      countInStock: p.countInStock,
      isFeatured:   p.isFeatured,
      isActive:     p.isActive,
      tags:         p.tags?.join(", ") || "",
      colors:       p.colors?.map(c => `${c.name}:${c.hex}`).join(", ") || "",
    });
    setEditMode(true); setEditId(p._id); setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.description) {
      toast.error("Name, price and description are required"); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price:        Number(form.price),
        originalPrice:form.originalPrice ? Number(form.originalPrice) : undefined,
        countInStock: Number(form.countInStock),
        badge:        form.badge || null,
        tags:         form.tags.split(",").map(t => t.trim()).filter(Boolean),
        colors:       form.colors.split(",").map(s => {
          const [name, hex] = s.trim().split(":");
          return name ? { name: name.trim(), hex: (hex || "#000").trim() } : null;
        }).filter(Boolean),
      };
      if (editMode) {
        await api.put(`/products/${editId}`, payload);
        toast.success("Product updated ✓");
      } else {
        await api.post("/products", payload);
        toast.success("Product created ✓");
      }
      setShowModal(false);
      fetchProducts();
    } catch (e) { toast.error(e.response?.data?.message || e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This is a soft-delete (product hidden from store).`)) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product removed");
      fetchProducts();
    } catch (e) { toast.error("Delete failed"); }
    finally { setDeleting(null); }
  };

  const Field = ({ label, k, type = "text", as, children, ...rest }) => (
    <div className="adm-field">
      <label className="adm-field-label">{label}</label>
      {as === "select" ? (
        <select className="adm-field-input" value={form[k]} onChange={set(k)} {...rest}>{children}</select>
      ) : as === "textarea" ? (
        <textarea className="adm-field-input" value={form[k]} onChange={set(k)} rows={3} {...rest} />
      ) : type === "checkbox" ? (
        <label className="adm-checkbox-label">
          <input type="checkbox" checked={form[k]} onChange={set(k)} {...rest} />
          <span className="adm-checkbox-custom" />
          <span>{label}</span>
        </label>
      ) : (
        <input className="adm-field-input" type={type} value={form[k]} onChange={set(k)} {...rest} />
      )}
    </div>
  );

  return (
    <div className="adm-page">
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="adm-toolbar">
        <div className="adm-toolbar-left">
          <input
            className="adm-search"
            placeholder="Search products…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select className="adm-select" value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
            <option>All</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="adm-btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      <div className="adm-meta-row">
        <span className="adm-muted">{meta.total} products total</span>
      </div>

      {/* ── Products Table ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="adm-loading"><div className="adm-spinner" /></div>
      ) : (
        <div className="adm-card adm-table-card">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Badge</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="adm-prod-cell">
                      <span className="adm-prod-emoji-sm">{p.emoji}</span>
                      <div>
                        <div className="adm-prod-cell-name">{p.name}</div>
                        <div className="adm-muted" style={{ fontSize: "0.72rem" }}>SKU: {p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="adm-cat-pill">{p.category}</span></td>
                  <td>
                    <strong>${p.price}</strong>
                    {p.originalPrice && <span className="adm-muted adm-strikethrough"> ${p.originalPrice}</span>}
                  </td>
                  <td>
                    <span className={`adm-stock ${p.countInStock === 0 ? "out" : p.countInStock <= 5 ? "low" : "ok"}`}>
                      {p.countInStock}
                    </span>
                  </td>
                  <td>★ {p.rating} <span className="adm-muted">({p.numReviews})</span></td>
                  <td>{p.badge ? <span className="adm-badge-pill">{p.badge}</span> : <span className="adm-muted">—</span>}</td>
                  <td>
                    <span className={`adm-status-pill ${p.isActive ? "active" : "inactive"}`}>
                      {p.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-action-btn edit"  onClick={() => openEdit(p)}>Edit</button>
                      <button className="adm-action-btn delete" onClick={() => handleDelete(p._id, p.name)} disabled={deleting === p._id}>
                        {deleting === p._id ? "…" : "Del"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {meta.pages > 1 && (
            <div className="adm-pagination">
              {[...Array(meta.pages)].map((_, i) => (
                <button key={i} className={`adm-page-btn ${page === i + 1 ? "active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      {showModal && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{editMode ? "Edit Product" : "Add New Product"}</h2>
              <button className="adm-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="adm-modal-body" onSubmit={handleSave}>
              <div className="adm-form-grid">
                <Field label="Product Name *"   k="name"        />
                <Field label="Emoji Icon"        k="emoji"       />
                <Field label="Price ($) *"       k="price"       type="number" />
                <Field label="Original Price ($)"k="originalPrice" type="number" />
                <Field label="Stock Qty *"       k="countInStock" type="number" />
                <Field label="Category *" k="category" as="select">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </Field>
                <Field label="Badge" k="badge" as="select">
                  {BADGES.map(b => <option key={b} value={b}>{b || "None"}</option>)}
                </Field>
              </div>
              <Field label="Description *" k="description" as="textarea" />
              <Field label='Colors (name:hex, name:hex e.g. "Black:#1a1a1a, Gold:#c9a84c")' k="colors" />
              <Field label='Tags (comma-separated e.g. "luxury, watch, accessories")' k="tags" />
              <div className="adm-form-checks">
                <label className="adm-check">
                  <input type="checkbox" checked={form.isFeatured} onChange={set("isFeatured")} />
                  <span>Featured (show on homepage)</span>
                </label>
                <label className="adm-check">
                  <input type="checkbox" checked={form.isActive} onChange={set("isActive")} />
                  <span>Active (visible in store)</span>
                </label>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editMode ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
