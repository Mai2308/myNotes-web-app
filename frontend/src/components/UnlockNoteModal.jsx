import React, { useState } from "react";
import { Unlock, X, Fingerprint } from "lucide-react";

const UnlockNoteModal = ({ isOpen, onClose, onUnlock, noteName, lockType }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (lockType === "password" && !password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      if (lockType === "password") {
        await onUnlock(password, false);
      } else if (lockType === "biometric") {
        // In a real implementation, this would trigger the Web Authentication API
        // For now, we'll just send the biometricVerified flag
        await onUnlock(null, true);
      }
      setPassword("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to unlock note");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  const handleBiometricUnlock = async () => {
    setError("");
    setLoading(true);
    try {
      // In a real implementation, this would use:
      // const credential = await navigator.credentials.get({ publicKey: {...} });
      // For now, we simulate biometric verification
      await onUnlock(null, true);
      onClose();
    } catch (err) {
      setError(err.message || "Biometric authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content unlock-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Unlock size={24} />
            <h2 style={{ margin: 0 }}>Unlock Note</h2>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: "20px", color: "var(--muted)" }}>
            {noteName ? `"${noteName}"` : "This note"} is locked. Enter your credentials to view or edit.
          </p>

          {lockType === "password" ? (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="unlock-password" style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                  Password
                </label>
                <input
                  id="unlock-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input"
                  autoFocus
                />
              </div>

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
                  style={{ background: "#4CAF50" }}
                  disabled={loading}
                >
                  {loading ? "Unlocking..." : "Unlock"}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                padding: "30px 20px",
                gap: "20px"
              }}>
                <div style={{ 
                  width: "80px", 
                  height: "80px", 
                  borderRadius: "50%", 
                  background: "rgba(33, 150, 243, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Fingerprint size={48} color="#2196F3" />
                </div>
                <p style={{ textAlign: "center", color: "var(--muted)" }}>
                  Use your device's biometric authentication to unlock this note
                </p>
              </div>

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
                  onClick={handleBiometricUnlock}
                  className="btn"
                  style={{ background: "#4CAF50", display: "flex", alignItems: "center", gap: "8px" }}
                  disabled={loading}
                >
                  <Fingerprint size={18} />
                  {loading ? "Authenticating..." : "Authenticate"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnlockNoteModal;
