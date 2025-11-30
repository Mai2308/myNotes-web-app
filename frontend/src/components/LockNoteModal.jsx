import React, { useState } from "react";
import { Lock, X } from "lucide-react";

const LockNoteModal = ({ isOpen, onClose, onLock, noteName }) => {
  const [lockType, setLockType] = useState("password");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (lockType === "password") {
      if (!password || password.length < 4) {
        setError("Password must be at least 4 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    setLoading(true);
    try {
      await onLock(lockType, password);
      setPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to lock note");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content lock-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Lock size={24} />
            <h2 style={{ margin: 0 }}>Lock Note</h2>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: "20px", color: "var(--muted)" }}>
            {noteName ? `Lock "${noteName}"` : "Lock this note"} to protect sensitive information.
            You'll need to unlock it before viewing or editing.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Lock Type
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    value="password"
                    checked={lockType === "password"}
                    onChange={(e) => setLockType(e.target.value)}
                  />
                  <span>Password</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    value="biometric"
                    checked={lockType === "biometric"}
                    onChange={(e) => setLockType(e.target.value)}
                  />
                  <span>Biometric</span>
                </label>
              </div>
            </div>

            {lockType === "password" && (
              <>
                <div style={{ marginBottom: "16px" }}>
                  <label htmlFor="password" style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min 4 characters)"
                    className="form-input"
                    autoFocus
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label htmlFor="confirmPassword" style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="form-input"
                  />
                </div>
              </>
            )}

            {lockType === "biometric" && (
              <div style={{ 
                padding: "12px", 
                backgroundColor: "rgba(33, 150, 243, 0.1)", 
                borderRadius: "8px",
                marginBottom: "20px"
              }}>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--text)" }}>
                  Biometric authentication will be required when unlocking this note.
                  Make sure your device supports biometric authentication.
                </p>
              </div>
            )}

            {error && (
              <div style={{ 
                padding: "12px", 
                backgroundColor: "rgba(244, 67, 54, 0.1)", 
                color: "#f44336",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px"
              }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={handleClose}
                className="btn"
                style={{ background: "#888" }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn"
                style={{ background: "#ff9800" }}
                disabled={loading}
              >
                {loading ? "Locking..." : "Lock Note"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LockNoteModal;
