// frontend/src/pages/AuditTimeline.jsx
// Feature: Audit Timeline — shows all changes made after goal lock

import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const token = () => localStorage.getItem("token");

const ACTION_META = {
  updated_after_lock: { icon: "✏️", color: "#1565c0", label: "Goal Edited (Post-Lock)" },
  upserted: { icon: "📊", color: "#2e7d32", label: "Achievement Updated" },
  unlock: { icon: "🔓", color: "#e65100", label: "Goal Unlocked" },
  approve: { icon: "✅", color: "#2e7d32", label: "Goal Approved" },
  return: { icon: "↩️", color: "#f57f17", label: "Returned for Rework" },
};

export default function AuditTimeline() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ entity_type: "", from_date: "", to_date: "" });
  const [expanded, setExpanded] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.entity_type) params.set("entity_type", filters.entity_type);
    if (filters.from_date) params.set("from_date", filters.from_date);
    if (filters.to_date) params.set("to_date", filters.to_date);

    try {
      const res = await fetch(`${API}/reports/audit?${params}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const groupByDate = (logs) => {
    const groups = {};
    logs.forEach((log) => {
      const date = new Date(log.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    });
    return groups;
  };

  const grouped = groupByDate(logs);

  return (
    <div style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#1a237e" }}>📋 Audit Timeline</h2>
      <p style={{ color: "#555", marginBottom: 24 }}>
        All changes made to goals after the lock date — who changed what and when.
      </p>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginBottom: 24, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label style={labelStyle}>Entity Type</label>
          <select style={selStyle} value={filters.entity_type} onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}>
            <option value="">All Types</option>
            <option value="goal">Goal</option>
            <option value="goal_sheet">Goal Sheet</option>
            <option value="achievement">Achievement</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>From Date</label>
          <input type="date" style={selStyle} value={filters.from_date} onChange={(e) => setFilters({ ...filters, from_date: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>To Date</label>
          <input type="date" style={selStyle} value={filters.to_date} onChange={(e) => setFilters({ ...filters, to_date: e.target.value })} />
        </div>
        <button
          onClick={fetchLogs}
          style={{ background: "#1a237e", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
        >
          Apply
        </button>
        <button
          onClick={() => { setFilters({ entity_type: "", from_date: "", to_date: "" }); setTimeout(fetchLogs, 0); }}
          style={{ background: "#f5f5f5", color: "#333", border: "1px solid #ddd", borderRadius: 6, padding: "8px 16px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}
        >
          Reset
        </button>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading audit logs…</div>}

      {!loading && logs.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#aaa" }}>
          <div style={{ fontSize: 48 }}>📂</div>
          <div style={{ marginTop: 12 }}>No audit logs found.</div>
        </div>
      )}

      {!loading && Object.entries(grouped).map(([date, entries]) => (
        <div key={date} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
            {date}
            <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
          </div>

          {entries.map((log, i) => {
            const meta = ACTION_META[log.action] || { icon: "🔧", color: "#757575", label: log.action };
            const isOpen = expanded === log.id;

            return (
              <div
                key={i}
                style={{ background: "#fff", border: "1px solid #e0e0e0", borderLeft: `4px solid ${meta.color}`, borderRadius: 8, padding: "12px 16px", marginBottom: 8, cursor: "pointer" }}
                onClick={() => setExpanded(isOpen ? null : log.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 18 }}>{meta.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: meta.color, fontSize: 13 }}>{meta.label}</div>
                      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                        Changed by: <strong>{log.changed_by_name}</strong> ({log.changed_by_email})
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#999" }}>
                      {new Date(log.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div style={{ fontSize: 11, color: "#999" }}>{log.entity_type}</div>
                    <div style={{ fontSize: 11, color: "#bbb" }}>{isOpen ? "▲ hide" : "▼ details"}</div>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ marginTop: 12, borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
                    {log.notes && (
                      <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
                        <strong>Note:</strong> {log.notes}
                      </div>
                    )}
                    {log.old_value && (
                      <details style={{ marginBottom: 8 }}>
                        <summary style={{ fontSize: 12, color: "#c62828", cursor: "pointer", fontWeight: 600 }}>Before Change</summary>
                        <pre style={{ fontSize: 11, background: "#ffebee", padding: 8, borderRadius: 4, overflow: "auto", marginTop: 4 }}>
                          {JSON.stringify(log.old_value, null, 2)}
                        </pre>
                      </details>
                    )}
                    {log.new_value && (
                      <details>
                        <summary style={{ fontSize: 12, color: "#2e7d32", cursor: "pointer", fontWeight: 600 }}>After Change</summary>
                        <pre style={{ fontSize: 11, background: "#e8f5e9", padding: 8, borderRadius: 4, overflow: "auto", marginTop: 4 }}>
                          {JSON.stringify(log.new_value, null, 2)}
                        </pre>
                      </details>
                    )}
                    <div style={{ fontSize: 11, color: "#bbb", marginTop: 8 }}>Entity ID: {log.entity_id}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 4 };
const selStyle = { padding: "7px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13, fontFamily: "inherit" };
