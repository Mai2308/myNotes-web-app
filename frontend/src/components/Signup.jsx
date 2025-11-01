import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const nav = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Enter username and password");
      return;
    }
    const res = signup({ username: username.trim(), password: password });
    if (!res.ok) {
      setError(res.message);
    } else {
      nav("/dashboard");
    }
  };

  return (
    <div className="card">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>Username
          <input value={username} onChange={(e)=>setUsername(e.target.value)} />
        </label>

        <label>Password
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </label>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="btn">Create account</button>
      </form>
    </div>
  );
}

