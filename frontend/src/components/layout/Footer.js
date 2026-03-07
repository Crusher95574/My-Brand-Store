import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer>
    <strong>My Brand Store</strong> — Curated Luxury &nbsp;·&nbsp;
    <Link to="/products">Shop</Link> &nbsp;·&nbsp;
    <Link to="/orders">My Orders</Link> &nbsp;·&nbsp;
    © {new Date().getFullYear()} All rights reserved.
  </footer>
);

export default Footer;
