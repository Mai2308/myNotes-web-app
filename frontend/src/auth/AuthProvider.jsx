import React, { createContext, useContext, useEffect, useState } from "react";
import { register as apiRegister, login as apiLogin } from "../api/authApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load stored session (token + user) on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const stored = JSON.parse(localStorage.getItem("auth_user") || "null");
      if (token && stored) setUser(stored);
    } catch (err) {
      console.warn("Failed to load auth from storage", err);
    }
  }, []);

  // Signup -> register on backend, then login to obtain token
  const signup = async ({ name, email, password }) => {
    try {
      const payload = { name, email, password };
      const res = await apiRegister(payload);
      if (res?.message) {
        // After successful registration, login to get token
        const loginRes = await apiLogin({ email, password });
        if (loginRes?.token) {
          localStorage.setItem("token", loginRes.token);
          localStorage.setItem("auth_user", JSON.stringify(loginRes.user || res.user));
          setUser(loginRes.user || res.user);
          return { ok: true };
        }
        return { ok: false, message: loginRes?.message || "Registration succeeded but login failed" };
      }
      return { ok: false, message: res?.message || "Registration failed" };
    } catch (err) {
      console.error("Signup error", err);
      return { ok: false, message: err.message || "Signup error" };
    }
  };

  // Login -> call backend, persist token and user
  const login = async ({ email, password }) => {
    try {
      const payload = { email, password };
      const res = await apiLogin(payload);
      if (res?.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("auth_user", JSON.stringify(res.user));
        setUser(res.user);
        return { ok: true };
      }
      return { ok: false, message: res?.message || "Login failed" };
    } catch (err) {
      console.error("Login error", err);
      return { ok: false, message: err.message || "Login error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
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
