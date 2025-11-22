import { Link } from "react-router-dom";
import "./../../styles/auth.css";

export default function AuthContainer({ title, children, showSignup }) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{title}</h2>
        {children}
        {showSignup && (
          <p className="switch-auth">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        )}
        {!showSignup && (
          <p className="switch-auth">
            Already have an account? <Link to="/">Log In</Link>
          </p>
        )}
      </div>
    </div>
  );
}

