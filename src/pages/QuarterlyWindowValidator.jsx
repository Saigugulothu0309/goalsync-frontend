// frontend/src/pages/QuarterlyWindowValidator.jsx
// Feature: Quarterly Window Validator — shows which windows are open/closed

import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const token = () => localStorage.getItem("token");

const WINDOW_META = {
  goal_setting: { icon: "📝", color: "#1565c0", bg: "#e3f2fd" },
  Q1: { icon: "🔵", color: "#2e7d32", bg: "#e8f5e9" },
  Q2: { icon: "🟡", color: "#f57f17", bg: "#fff9c4" },
  Q3: { icon: "🟠", color: "#e65100", bg: "#fff3e0" },
  Q4: { icon: "🔴", color: "#b71c1c", bg: "#ffebee" },
};

export default function QuarterlyWindowValidator() {
  const [cycles, setCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [windowStatus, setWindowStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/cycles`, { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setCycles(list);
        const active = list.find((c) => c.is_active);
        if (active) fetchWindowStatus(active.id);
      });
  }, []);

  const fetchWindowStatus = async (cycleId) => {
    setLoading(true);
    setSelectedCycle(cycleId);
    try {
      const res = await fetch(`${API}/cycles/${cycleId}/window-status`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      setWindowStatus(data);
    } catch {
      setWindowStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "Not configured";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const daysUntil = (d) => {
    if (!d) return null;
    const diff = new Date(d) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#1a237e" }}>
        📅 Quarterly Window Validator
      </h2>
      <p style={{ color: "#555", marginBottom: 24 }}>
        See which goal setting or check-in windows are currently open or upcoming.
      </p>

      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Select Cycle</label>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          {cycles.map((c) => (
            <button
              key={c.id}
              onClick={() => fetchWindowStatus(c.id)}
              style={{
                padding: "8px 16px", borderRadius: 20, border: "2px solid",
                borderColor: selectedCycle === c.id ? "#1a237e" : "#ddd",
                background: selectedCycle === c.id ? "#1a237e" : "#fff",
                color: selectedCycle === c.id ? "#fff" : "#333",
                fontWeight: 600, cursor: "pointer", fontSize: 13,
              }}
            >
              {c.name} {c.is_active ? "⚡" : ""}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ textAlign: "center", color: "#888", padding: 40 }}>Loading window status…</div>}

      {windowStatus && !loading && (
        <>
          {/* Current Status Banner */}
          <div style={{
            background: windowStatus.current_window ? "#e8f5e9" : "#fff8e1",
            border: "2px solid",
            borderColor: windowStatus.current_window ? "#66bb6a" : "#ffd54f",
            borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{ fontSize: 32 }}>{windowStatus.current_window ? "🟢" : "⏸️"}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: windowStatus.current_window ? "#2e7d32" : "#f57f17" }}>
                {windowStatus.current_window
                  ? `Active: ${windowStatus.windows[windowStatus.current_window]?.label}`
                  : "No window currently open"}
              </div>
              <div style={{ color: "#666", fontSize: 13 }}>
                {windowStatus.cycle_name} — As of {new Date(windowStatus.current_date).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Window Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(windowStatus.windows).map(([key, w]) => {
              const meta = WINDOW_META[key] || { icon: "📌", color: "#333", bg: "#f5f5f5" };
              const isCurrent = windowStatus.current_window === key;
              const days = daysUntil(w.opens);

              return (
                <div key={key} style={{
                  background: isCurrent ? meta.bg : "#fff",
                  border: `2px solid ${isCurrent ? meta.color : "#e0e0e0"}`,
                  borderRadius: 10, padding: "14px 20px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 24 }}>{meta.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: isCurrent ? meta.color : "#333" }}>
                        {w.label}
                      </div>
                      <div style={{ fontSize: 12, color: "#888" }}>Opens: {formatDate(w.opens)}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    {w.is_open ? (
                      <span style={{ background: meta.color, color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
                        OPEN
                      </span>
                    ) : (
                      <span style={{ background: "#f5f5f5", color: "#888", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                        {!w.opens ? "Not set" : days > 0 ? `Opens in ${days}d` : "Passed"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 24, padding: 16, background: "#f5f5f5", borderRadius: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#555" }}>📋 Schedule Reference</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: "#666" }}>
              <div>🟢 <strong>Goal Setting</strong> — Opens 1st May</div>
              <div>🔵 <strong>Q1 Check-in</strong> — Opens July</div>
              <div>🟡 <strong>Q2 Check-in</strong> — Opens October</div>
              <div>🟠 <strong>Q3 Check-in</strong> — Opens January</div>
              <div>🔴 <strong>Q4 / Annual</strong> — Opens March/April</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
