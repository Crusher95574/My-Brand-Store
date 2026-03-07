import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords do not match"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    try {
      setLoading(true);
      await register(form.name, form.email, form.password);
      toast.success("Account created! Welcome to My Brand Store 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub">Join My Brand Store today</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {[
            { label: "Full Name",        k: "name",     type: "text" },
            { label: "Email",            k: "email",    type: "email" },
            { label: "Password",         k: "password", type: "password" },
            { label: "Confirm Password", k: "confirm",  type: "password" },
          ].map(({ label, k, type }) => (
            <div key={k} className="form-field">
              <label className="field-label">{label}</label>
              <input className="field-input" type={type} value={form[k]} onChange={set(k)} required />
            </div>
          ))}
          <button className="btn-auth" type="submit" disabled={loading}>
            {loading ? "Creating Account…" : "Create Account"}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;
