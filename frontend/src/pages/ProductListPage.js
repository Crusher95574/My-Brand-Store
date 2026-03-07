import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { productAPI } from "../services/api";
import ProductCard from "../components/common/ProductCard";

const CATEGORIES = ["All", "Clothing", "Accessories", "Jewelry", "Bags", "Beauty", "Footwear"];
const SORT_OPTIONS = [
  { label: "Latest",         value: "-createdAt" },
  { label: "Price: Low→High",value: "price" },
  { label: "Price: High→Low",value: "-price" },
  { label: "Top Rated",      value: "-rating" },
  { label: "Most Reviews",   value: "-numReviews" },
];

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [meta,     setMeta]     = useState({ total: 0, page: 1, pages: 1 });

  // ── Read current filters from URL ─────────────────────────────────────────
  const currentSearch   = searchParams.get("search")   || "";
  const currentCategory = searchParams.get("category") || "All";
  const currentSort     = searchParams.get("sort")     || "-createdAt";
  const currentPage     = parseInt(searchParams.get("page") || "1");
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  // ── Fetch products whenever URL params change ─────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {
          sort: currentSort,
          page: currentPage,
          limit: 12,
          ...(currentSearch   && { search: currentSearch }),
          ...(currentCategory !== "All" && { category: currentCategory }),
          ...(currentMinPrice && { minPrice: currentMinPrice }),
          ...(currentMaxPrice && { maxPrice: currentMaxPrice }),
        };
        const { data } = await productAPI.getAll(params);
        setProducts(data.data);
        setMeta({ total: data.total, page: data.page, pages: data.pages });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [currentSearch, currentCategory, currentSort, currentPage, currentMinPrice, currentMaxPrice]);

  // ── Update URL param helper ───────────────────────────────────────────────
  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete("page"); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  return (
    <div className="product-list-page">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="page-header">
        <h1 className="page-title">
          {currentCategory !== "All" ? currentCategory : "All Products"}
          {currentSearch && <span className="search-label"> — "{currentSearch}"</span>}
        </h1>
        <p className="page-count">{meta.total} products found</p>
      </div>

      <div className="shop-layout">
        {/* ── Sidebar Filters ───────────────────────────────────────────── */}
        <aside className="filter-sidebar">
          <h3 className="filter-title">Filters</h3>

          {/* Category */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-option ${currentCategory === cat ? "active" : ""}`}
                onClick={() => updateParam("category", cat === "All" ? "" : cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <label className="filter-label">Price Range</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min $"
                className="price-input"
                value={currentMinPrice}
                onChange={(e) => updateParam("minPrice", e.target.value)}
              />
              <span>—</span>
              <input
                type="number"
                placeholder="Max $"
                className="price-input"
                value={currentMaxPrice}
                onChange={(e) => updateParam("maxPrice", e.target.value)}
              />
            </div>
          </div>

          {/* Clear filters */}
          {(currentCategory !== "All" || currentSearch || currentMinPrice || currentMaxPrice) && (
            <button className="btn-clear-filters" onClick={() => setSearchParams({})}>
              Clear All Filters
            </button>
          )}
        </aside>

        {/* ── Product Grid Area ─────────────────────────────────────────── */}
        <div className="products-area">
          {/* Sort bar */}
          <div className="sort-bar">
            <span className="sort-label">Sort by:</span>
            <select
              className="sort-select"
              value={currentSort}
              onChange={(e) => updateParam("sort", e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Products */}
          {loading ? (
            <div className="product-grid">
              {[...Array(12)].map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : error ? (
            <div className="error-state">
              <p>⚠️ {error}</p>
              <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {meta.pages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={currentPage <= 1}
                onClick={() => updateParam("page", currentPage - 1)}
              >
                ← Prev
              </button>
              {[...Array(meta.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => updateParam("page", i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="page-btn"
                disabled={currentPage >= meta.pages}
                onClick={() => updateParam("page", currentPage + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
