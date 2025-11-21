import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login({ email: email.trim(), password });
    if (!res.ok) {
      setError(res.message);
    } else {
      nav("/dashboard");
    }
  };

  return (
    <div className="card">
      <h2>Log In</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>Email
          <input value={email} onChange={(e)=>setEmail(e.target.value)} />
        </label>

        <label>Password
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </label>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="btn">Log In</button>
      </form>
    </div>
  );
}