// frontend/src/components/GoalLockUnlock.jsx
// Feature: Goal Lock/Unlock — Admin can unlock locked goals after approval
// Usage: <GoalLockUnlock sheetId={sheetId} onUnlocked={() => refetch()} />

import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const token = () => localStorage.getItem("token");

export default function GoalLockUnlock({ sheetId, sheetStatus, goals = [], onUnlocked }) {
  const [unlocking, setUnlocking] = useState(false);
  const [reason, setReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const lockedGoals = goals.filter((g) => g.is_locked);
  const isApproved = sheetStatus === "approved";

  const handleUnlock = async () => {
    setError("");
    if (!reason.trim()) return setError("Please provide a reason for unlocking.");
    setUnlocking(true);
    try {
      const res = await fetch(`${API}/goal-sheets/${sheetId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to unlock.");
      else {
        setSuccess("Goals unlocked successfully. Employee can now edit their goals.");
        setShowModal(false);
        setReason("");
        if (onUnlocked) onUnlocked();
      }
    } catch {
      setError("Network error.");
    } finally {
      setUnlocking(false);
    }
  };

  if (!isApproved) return null;

  return (
    <div style={{ marginTop: 16 }}>
      {success && (
        <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 8, padding: "10px 14px", marginBottom: 12, color: "#2e7d32", fontSize: 13 }}>
          ✅ {success}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#fff3e0", border: "1px solid #ffcc80", borderRadius: 10 }}>
        <div style={{ fontSize: 24 }}>🔒</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#e65100", fontSize: 14 }}>Goal Sheet Locked</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {lockedGoals.length} goal(s) are locked after approval. Admin can unlock for emergency edits.
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: "#e65100", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
        >
          🔓 Unlock Goals
        </button>
      </div>

      {/* Lock status per goal */}
      {goals.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {goals.map((g, i) => (
            <span key={i} style={{
              background: g.is_locked ? "#fff3e0" : "#e8f5e9",
              border: `1px solid ${g.is_locked ? "#ffcc80" : "#a5d6a7"}`,
              color: g.is_locked ? "#e65100" : "#2e7d32",
              borderRadius: 12, padding: "3px 10px", fontSize: 12, fontWeight: 600,
            }}>
              {g.is_locked ? "🔒" : "🔓"} {g.title?.length > 20 ? g.title.slice(0, 18) + "…" : g.title}
            </span>
          ))}
        </div>
      )}

      {/* Unlock Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: 420, maxWidth: "90vw", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#c62828" }}>⚠️ Unlock Goal Sheet</h3>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
              Unlocking will allow the employee to edit their goals. This action will be recorded in the audit log.
            </p>

            {error && <div style={{ background: "#ffebee", color: "#c62828", borderRadius: 6, padding: "8px 12px", marginBottom: 12, fontSize: 13 }}>{error}</div>}

            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 6 }}>
              Reason for Unlocking *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Business restructuring required goal revision..."
              style={{ width: "100%", height: 80, padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                onClick={handleUnlock}
                disabled={unlocking}
                style={{ flex: 1, background: "#c62828", color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
              >
                {unlocking ? "Unlocking…" : "🔓 Confirm Unlock"}
              </button>
              <button
                onClick={() => { setShowModal(false); setError(""); setReason(""); }}
                style={{ flex: 1, background: "#f5f5f5", color: "#333", border: "1px solid #ddd", borderRadius: 8, padding: "11px", cursor: "pointer", fontSize: 14 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
