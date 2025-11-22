import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // load user from localStorage if present
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("auth_user"));
    if (stored) setUser(stored);
  }, []);

  const signup = async ({ name, email, password }) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data?.message || "Signup failed" };
      }

      // Optionally auto-login after signup:
      const loginRes = await login({ email, password });
      if (!loginRes.ok) return { ok: false, message: loginRes.message };

      return { ok: true };
    } catch (err) {
      return { ok: false, message: "Network/server error" };
    }
  };

  const login = async ({ email, password }) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data?.message || "Login failed" };
      }

      // store token and user
      if (data.token) localStorage.setItem("auth_token", data.token);
      const session = data.user || { email };
      localStorage.setItem("auth_user", JSON.stringify(session));
      setUser(session);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: "Network/server error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}