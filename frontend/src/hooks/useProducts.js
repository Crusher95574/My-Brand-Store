import { useState, useEffect, useCallback } from "react";
import { productAPI } from "../services/api";

// ── useProducts: Fetch paginated/filtered product list ────────────────────────
export const useProducts = (initialParams = {}) => {
  const [products, setProducts]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState(null);
  const [meta,     setMeta]       = useState({ total: 0, page: 1, pages: 1 });
  const [params,   setParams]     = useState(initialParams);

  const fetchProducts = useCallback(async (queryParams) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await productAPI.getAll(queryParams || params);
      setProducts(data.data);
      setMeta({ total: data.total, page: data.page, pages: data.pages });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParams = (newParams) => {
    setParams((prev) => ({ ...prev, ...newParams, page: 1 }));
  };

  return { products, loading, error, meta, params, updateParams, refetch: fetchProducts };
};

// ── useProduct: Fetch a single product by ID ──────────────────────────────────
export const useProduct = (id) => {
  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await productAPI.getById(id);
        setProduct(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { product, loading, error };
};
