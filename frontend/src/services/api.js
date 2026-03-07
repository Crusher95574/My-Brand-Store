// ─────────────────────────────────────────────────────────────────────────────
// Central Axios instance with interceptors for auth tokens and error handling
// All API calls go through this single configured instance
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";

// ── Create Axios instance with base URL ───────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10 seconds
});

// ── Request Interceptor: Attach JWT token ─────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle common errors ────────────────────────────────
api.interceptors.response.use(
  (response) => response,           // Pass through successful responses
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    // If 401 (unauthorized / token expired), clear auth and redirect
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // Attach clean message to error for easier consumption
    error.message = message;
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Product API calls
// ─────────────────────────────────────────────────────────────────────────────
export const productAPI = {
  // GET /products?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=
  getAll:     (params) => api.get("/products", { params }),
  getById:    (id)     => api.get(`/products/${id}`),
  getFeatured:()       => api.get("/products?featured=true&limit=6"),
  getCategories: ()    => api.get("/products/categories"),
  create:     (data)   => api.post("/products", data),
  update:     (id, data) => api.put(`/products/${id}`, data),
  delete:     (id)     => api.delete(`/products/${id}`),
  addReview:  (id, data) => api.post(`/products/${id}/reviews`, data),
};

// ─────────────────────────────────────────────────────────────────────────────
// Auth & User API calls
// ─────────────────────────────────────────────────────────────────────────────
export const userAPI = {
  register:       (data) => api.post("/users/register", data),
  login:          (data) => api.post("/users/login", data),
  getProfile:     ()     => api.get("/users/profile"),
  updateProfile:  (data) => api.put("/users/profile", data),
  toggleWishlist: (id)   => api.post(`/users/wishlist/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Order API calls
// ─────────────────────────────────────────────────────────────────────────────
export const orderAPI = {
  create:    (data) => api.post("/orders", data),
  getMyOrders: ()   => api.get("/orders/my"),
  getById:   (id)   => api.get(`/orders/${id}`),
  markPaid:  (id, paymentResult) => api.put(`/orders/${id}/pay`, paymentResult),
};

// ─────────────────────────────────────────────────────────────────────────────
// AI API calls
// ─────────────────────────────────────────────────────────────────────────────
export const aiAPI = {
  chat:            (messages, cartItems) => api.post("/ai/chat", { messages, cartItems }),
  getRecommendations: (productId)        => api.get(`/ai/recommendations/${productId}`),
};

export default api;
