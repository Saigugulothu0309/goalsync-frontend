// frontend/src/pages/EscalationSimulation.jsx
// Feature: Escalation Simulation — configure rules and simulate who would be escalated

import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const token = () => localStorage.getItem("token");

const TRIGGERS = {
  no_submission: { label: "No Goal Submission", icon: "📝", color: "#1565c0" },
  no_approval: { label: "No Manager Approval", icon: "⏳", color: "#6a1b9a" },
  no_checkin: { label: "No Check-in Completed", icon: "📋", color: "#e65100" },
};

const LEVELS = { 1: "Employee notified", 2: "Manager notified", 3: "HR/Skip-level notified" };

export default function EscalationSimulation() {
  const [cycles, setCycles] = useState([]);
  const [cycleId, setCycleId] = useState("");
  const [rules, setRules] = useState([]);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ trigger_event: "no_submission", days_threshold: 7, escalation_level: 1, cycle_id: "" });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch(`${API}/cycles`, { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setCycles(list);
        const active = list.find((c) => c.is_active);
        if (active) { setCycleId(active.id); setForm((f) => ({ ...f, cycle_id: active.id })); }
      });
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/escalations/rules`, { headers: { Authorization: `Bearer ${token()}` } });
      const d = await res.json();
      setRules(Array.isArray(d) ? d : []);
    } catch { setRules([]); } finally { setLoading(false); }
  };

  const createRule = async () => {
    setFormError("");
    if (!form.days_threshold || form.days_threshold < 1) return setFormError("Days threshold must be >= 1.");
    try {
      const res = await fetch(`${API}/escalations/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ...form, days_threshold: Number(form.days_threshold), escalation_level: Number(form.escalation_level) }),
      });
      if (res.ok) { setShowForm(false); fetchRules(); }
      else { const d = await res.json(); setFormError(d.error); }
    } catch { setFormError("Network error."); }
  };

  const deleteRule = async (id) => {
    if (!confirm("Delete this rule?")) return;
    await fetch(`${API}/escalations/rules/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
    fetchRules();
  };

  const runSimulation = async () => {
    if (!cycleId) return;
    setSimLoading(true);
    try {
      const res = await fetch(`${API}/escalations/simulate?cycle_id=${cycleId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setSimResult(await res.json());
    } catch { setSimResult(null); } finally { setSimLoading(false); }
  };

  return (
    <div style={{ padding: "24px", maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#1a237e" }}>🚨 Escalation Simulation</h2>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Configure rule-based escalations and simulate who would be escalated under the current cycle state.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Rules Panel */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#333" }}>Escalation Rules</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{ background: "#1a237e", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
            >
              + New Rule
            </button>
          </div>

          {showForm && (
            <div style={{ background: "#f8f9ff", border: "1px solid #c5cae9", borderRadius: 10, padding: 16, marginBottom: 14 }}>
              {formError && <div style={{ color: "#c62828", fontSize: 12, marginBottom: 8 }}>{formError}</div>}

              <label style={labelStyle}>Trigger Event</label>
              <select style={inputStyle} value={form.trigger_event} onChange={(e) => setForm({ ...form, trigger_event: e.target.value })}>
                <option value="no_submission">No Goal Submission</option>
                <option value="no_approval">No Manager Approval</option>
                <option value="no_checkin">No Check-in Completed</option>
              </select>

              <label style={labelStyle}>Days Threshold (after window opens)</label>
              <input type="number" style={inputStyle} min={1} value={form.days_threshold} onChange={(e) => setForm({ ...form, days_threshold: e.target.value })} />

              <label style={labelStyle}>Escalation Level</label>
              <select style={inputStyle} value={form.escalation_level} onChange={(e) => setForm({ ...form, escalation_level: e.target.value })}>
                <option value={1}>Level 1 — Employee notified</option>
                <option value={2}>Level 2 — Manager notified</option>
                <option value={3}>Level 3 — HR/Skip-level notified</option>
              </select>

              <label style={labelStyle}>Apply to Cycle (optional)</label>
              <select style={inputStyle} value={form.cycle_id} onChange={(e) => setForm({ ...form, cycle_id: e.target.value })}>
                <option value="">All Cycles</option>
                {cycles.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={createRule} style={{ background: "#2e7d32", color: "#fff", border: "none", borderRadius: 6, padding: "7px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Save Rule</button>
                <button onClick={() => setShowForm(false)} style={{ background: "#f5f5f5", color: "#333", border: "1px solid #ddd", borderRadius: 6, padding: "7px 14px", cursor: "pointer", fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          )}

          {loading ? <div style={{ color: "#888", fontSize: 13 }}>Loading rules…</div> :
            rules.length === 0 ? <div style={{ color: "#aaa", textAlign: "center", padding: 24 }}>No rules configured yet.</div> :
            rules.map((r) => {
              const t = TRIGGERS[r.trigger_event] || { label: r.trigger_event, icon: "🔔", color: "#555" };
              return (
                <div key={r.id} style={{ background: "#fff", border: "1px solid #e0e0e0", borderLeft: `4px solid ${t.color}`, borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: t.color, fontSize: 13 }}>{t.icon} {t.label}</div>
                      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                        After <strong>{r.days_threshold} days</strong> → {LEVELS[r.escalation_level]}
                      </div>
                      {r.cycle_name && <div style={{ fontSize: 11, color: "#999" }}>Cycle: {r.cycle_name}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, background: r.is_active ? "#e8f5e9" : "#f5f5f5", color: r.is_active ? "#2e7d32" : "#999", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>
                        {r.is_active ? "ACTIVE" : "OFF"}
                      </span>
                      <button onClick={() => deleteRule(r.id)} style={{ background: "#ffebee", color: "#c62828", border: "none", borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 11 }}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>

        {/* Simulation Panel */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 14 }}>Run Simulation</h3>

          <div style={{ background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginBottom: 16 }}>
            <label style={labelStyle}>Select Cycle to Simulate</label>
            <select style={inputStyle} value={cycleId} onChange={(e) => setCycleId(e.target.value)}>
              {cycles.map((c) => <option key={c.id} value={c.id}>{c.name}{c.is_active ? " (Active)" : ""}</option>)}
            </select>

            <button
              onClick={runSimulation}
              disabled={simLoading || !cycleId}
              style={{ marginTop: 12, width: "100%", background: "#c62828", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: simLoading ? 0.7 : 1 }}
            >
              {simLoading ? "Simulating…" : "🚨 Run Escalation Simulation"}
            </button>
          </div>

          {simResult && (
            <div>
              <div style={{ background: "#fff", borderRadius: 10, padding: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Simulation Results</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Stat label="Rules Applied" val={simResult.rules_applied} color="#1a237e" />
                  <Stat label="Total Escalations" val={simResult.total_escalations} color="#c62828" />
                </div>
              </div>

              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                {simResult.escalations.length === 0
                  ? <div style={{ textAlign: "center", padding: 24, color: "#888" }}>No escalations triggered 🎉</div>
                  : simResult.escalations.map((e, i) => {
                      const t = TRIGGERS[e.trigger] || { icon: "🔔", color: "#555" };
                      return (
                        <div key={i} style={{ background: "#fff8f8", border: "1px solid #ffcdd2", borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
                          <div style={{ fontWeight: 700, color: "#c62828", fontSize: 12 }}>{t.icon} {e.escalation_label}</div>
                          <div style={{ fontWeight: 600, color: "#333", fontSize: 13, marginTop: 2 }}>{e.employee_name}</div>
                          <div style={{ fontSize: 11, color: "#666" }}>{e.department} | {e.detail}</div>
                          <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>Overdue by {e.days_overdue} days</div>
                        </div>
                      );
                    })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, val, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{val}</div>
      <div style={{ fontSize: 11, color: "#888" }}>{label}</div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4, marginTop: 10 };
const inputStyle = { width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" };
