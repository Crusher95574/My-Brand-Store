import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./admin.css";

import { AuthProvider }  from "./context/AuthContext";
import { CartProvider }  from "./context/CartContext";

import Navbar    from "./components/layout/Navbar";
import Footer    from "./components/layout/Footer";
import AiAdvisor from "./components/common/AiAdvisor";
import PrivateRoute from "./components/common/PrivateRoute";

import HomePage          from "./pages/HomePage";
import ProductListPage   from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage          from "./pages/CartPage";
import CheckoutPage      from "./pages/CheckoutPage";
import OrderConfirmPage  from "./pages/OrderConfirmPage";
import OrderHistoryPage  from "./pages/OrderHistoryPage";
import LoginPage         from "./pages/LoginPage";
import RegisterPage      from "./pages/RegisterPage";
import NotFoundPage      from "./pages/NotFoundPage";

import AdminLayout    from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts  from "./pages/admin/AdminProducts";
import AdminOrders    from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

const StoreLayout = ({ children }) => (
  <div className="app-wrapper">
    <Navbar />
    <main className="main-content">{children}</main>
    <Footer />
    <AiAdvisor />
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/"            element={<StoreLayout><HomePage /></StoreLayout>} />
            <Route path="/products"    element={<StoreLayout><ProductListPage /></StoreLayout>} />
            <Route path="/products/:id" element={<StoreLayout><ProductDetailPage /></StoreLayout>} />
            <Route path="/cart"        element={<StoreLayout><CartPage /></StoreLayout>} />
            <Route path="/login"       element={<StoreLayout><LoginPage /></StoreLayout>} />
            <Route path="/register"    element={<StoreLayout><RegisterPage /></StoreLayout>} />
            <Route path="/checkout"    element={<StoreLayout><PrivateRoute><CheckoutPage /></PrivateRoute></StoreLayout>} />
            <Route path="/orders"      element={<StoreLayout><PrivateRoute><OrderHistoryPage /></PrivateRoute></StoreLayout>} />
            <Route path="/order-confirmation/:orderId" element={<StoreLayout><PrivateRoute><OrderConfirmPage /></PrivateRoute></StoreLayout>} />

            {/* Admin Panel - completely separate layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index             element={<AdminDashboard />} />
              <Route path="products"   element={<AdminProducts />} />
              <Route path="orders"     element={<AdminOrders />} />
              <Route path="customers"  element={<AdminCustomers />} />
              <Route path="analytics"  element={<AdminAnalytics />} />
            </Route>

            <Route path="*" element={<StoreLayout><NotFoundPage /></StoreLayout>} />
          </Routes>

          <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
