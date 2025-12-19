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
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <Link to="/dashboard" style={{display:'flex',alignItems:'center',textDecoration:'none',padding:'6px 10px',borderRadius:'8px',background:'linear-gradient(135deg, rgba(255,105,180,0.15) 0%, rgba(168,216,255,0.15) 100%)',transition:'all 0.3s',cursor:'pointer'}}>
            <img src="/logo.svg" alt="My Notes" style={{height:'45px',width:'auto'}} />
          </Link>
          <nav>
            {!user ? (
              <>
                <Link to="/login" className="btn-link">Log In</Link>
                <Link to="/signup" className="btn-link">Sign Up</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="btn-link">Dashboard</Link>
                <Link to="/flashcards" className="btn-link">📚 Flashcards</Link>
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

