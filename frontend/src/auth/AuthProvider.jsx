import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // لما الصفحة تفتح نحمل اليوزر من localStorage لو موجود
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("auth_user"));
    if (stored) setUser(stored);
  }, []);

  const signup = ({ username, password }) => {
    // نحفظ اليوزر في localStorage كمثال بسيط
    const users = JSON.parse(localStorage.getItem("users_db") || "[]");

    // شوف لو اليوزرنيم موجود
    if (users.some(u => u.username === username)) {
      return { ok: false, message: "Username already taken" };
    }

    // تخزين باسورد مشفر بطريقة بسيطة (ملحوظة: مش أمنة للإنتاج)
    const hashed = btoa(password); // فقط للاختبار (Base64) — غير آمن
    const newUser = { id: Date.now(), username, password: hashed };
    users.push(newUser);
    localStorage.setItem("users_db", JSON.stringify(users));
    localStorage.setItem("auth_user", JSON.stringify({ id: newUser.id, username }));
    setUser({ id: newUser.id, username });
    return { ok: true };
  };

  const login = ({ username, password }) => {
    const users = JSON.parse(localStorage.getItem("users_db") || "[]");
    const hashed = btoa(password);
    const found = users.find(u => u.username === username && u.password === hashed);
    if (!found) return { ok: false, message: "Invalid credentials" };

    const session = { id: found.id, username: found.username };
    localStorage.setItem("auth_user", JSON.stringify(session));
    setUser(session);
    return { ok: true };
  };

  const logout = () => {
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
