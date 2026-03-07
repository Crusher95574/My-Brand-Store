import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="empty-state" style={{ minHeight: "70vh", justifyContent: "center", display: "flex", flexDirection: "column" }}>
    <span style={{ fontSize: "5rem", marginBottom: "1rem" }}>404</span>
    <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: "0.75rem" }}>Page Not Found</h2>
    <p style={{ color: "var(--muted)", maxWidth: 400, margin: "0 auto 2rem" }}>
      The page you're looking for doesn't exist or may have been moved.
    </p>
    <Link to="/" className="btn-primary">Go Home</Link>
  </div>
);

export default NotFoundPage;
