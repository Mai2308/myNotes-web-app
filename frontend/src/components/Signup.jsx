import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Enter name, email and password");
      return;
    }
    const res = await signup({ name: name.trim(), email: email.trim(), password });
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
        <label>Name
          <input value={name} onChange={(e)=>setName(e.target.value)} />
        </label>

        <label>Email
          <input value={email} onChange={(e)=>setEmail(e.target.value)} />
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