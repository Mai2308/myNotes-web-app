import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { FiUser, FiMail, FiEye, FiEyeOff } from "react-icons/fi";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const nav = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Enter name, email and password");
      return;
    }
    (async () => {
      const res = await signup({ name: name.trim(), email: email.trim(), password });
      if (!res.ok) setError(res.message);
      else nav("/dashboard");
    })();
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-sub">Join us and start taking notes</p>

        <form onSubmit={handleSubmit} className="auth-form">

          <label className="auth-label">
            Name
            <input
              className="auth-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <FiUser className="auth-icon" />
          </label>

          <label className="auth-label">
            Email
            <input
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <FiMail className="auth-icon" />
          </label>

          <label className="auth-label">
            Password
            <input
              type={showPass ? "text" : "password"}
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password"
            />
            {showPass ? (
              <FiEye className="auth-icon" onClick={() => setShowPass(false)} />
            ) : (
              <FiEyeOff className="auth-icon" onClick={() => setShowPass(true)} />
            )}
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-button">Create Account</button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link className="auth-link" to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
}

