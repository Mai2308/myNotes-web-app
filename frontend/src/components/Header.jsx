import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  return (
    <header className="header">
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <h1 className="logo">My Notes</h1>
          <nav>
            {!user ? (
              <>
                <Link to="/login" className="btn-link">Log In</Link>
                <Link to="/signup" className="btn-link">Sign Up</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="btn-link">Dashboard</Link>
              </>
            )}
          </nav>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <ThemeToggle />
          {user && <button onClick={handleLogout} className="btn">Logout</button>}
        </div>
      </div>
    </header>
  );
}

