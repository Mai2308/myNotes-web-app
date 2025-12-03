import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { FiMail, FiEye, FiEyeOff } from "react-icons/fi"; // react-icons

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    (async () => {
      const res = await login({ email: email.trim(), password });
      if (!res.ok) setError(res.message);
      else nav("/dashboard");
    })();
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-sub">Log in to continue</p>

        <form onSubmit={handleSubmit} className="auth-form">

          <label className="auth-label">
            Email
            <input
              type="email"
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
              placeholder="Enter your password"
            />
            {showPass ? (
              <FiEye className="auth-icon" onClick={() => setShowPass(false)} />
            ) : (
              <FiEyeOff className="auth-icon" onClick={() => setShowPass(true)} />
            )}
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-button">Log In</button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account?</span>
          <Link className="auth-link" to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}


