// frontend/src/pages/SharedGoals.jsx
// Feature: Shared Goals — Admin/Manager pushes a KPI goal to multiple employees

import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const token = () => localStorage.getItem("token");

export default function SharedGoals() {
  const [employees, setEmployees] = useState([]);
  const [thrustAreas, setThrustAreas] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    thrust_area_id: "",
    uom_type: "numeric_min",
    target_value: "",
    target_date: "",
    cycle_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token()}` };
    Promise.all([
      fetch(`${API}/users`, { headers }).then((r) => r.json()),
      fetch(`${API}/thrust-areas`, { headers }).then((r) => r.json()),
      fetch(`${API}/cycles`, { headers }).then((r) => r.json()),
    ]).then(([u, t, c]) => {
      setEmployees(Array.isArray(u) ? u.filter((x) => x.role === "employee") : []);
      setThrustAreas(Array.isArray(t) ? t : []);
      setCycles(Array.isArray(c) ? c : []);
      if (c && c.length > 0) {
        const active = c.find((x) => x.is_active);
        if (active) setForm((f) => ({ ...f, cycle_id: active.id }));
      }
    });
  }, []);

  const toggleRecipient = (id) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedRecipients(employees.map((e) => e.id));
  const deselectAll = () => setSelectedRecipients([]);

  const handleSubmit = async () => {
    setError("");
    setResult(null);
    if (!form.title.trim()) return setError("Goal title is required.");
    if (!form.cycle_id) return setError("Please select a cycle.");
    if (selectedRecipients.length === 0) return setError("Select at least one recipient.");

    setLoading(true);
    try {
      const res = await fetch(`${API}/goals/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          ...form,
          target_value: form.target_value ? Number(form.target_value) : undefined,
          target_date: form.target_date || undefined,
          recipient_ids: selectedRecipients,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to share goal.");
      else setResult(data);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  // Group employees by department
  const byDept = employees.reduce((acc, e) => {
    const d = e.department || "Other";
    if (!acc[d]) acc[d] = [];
    acc[d].push(e);
    return acc;
  }, {});

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#1a237e" }}>
        📤 Share / Push Departmental Goal
      </h2>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Push a KPI goal to multiple employees. Recipients can adjust weightage only — title and target are read-only.
      </p>

      {error && (
        <div style={{ background: "#ffebee", border: "1px solid #ef9a9a", borderRadius: 8, padding: "10px 16px", marginBottom: 16, color: "#c62828" }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
          <strong style={{ color: "#2e7d32" }}>✅ Goal shared!</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
            {result.shared.map((r, i) => (
              <li key={i} style={{ color: r.success ? "#2e7d32" : "#c62828" }}>
                {r.success ? `✓ Recipient ${r.recipient_id} — goal created` : `✗ Recipient ${r.recipient_id}: ${r.error}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Goal Form */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#333" }}>Goal Details</h3>

          <label style={labelStyle}>Cycle</label>
          <select style={inputStyle} value={form.cycle_id} onChange={(e) => setForm({ ...form, cycle_id: e.target.value })}>
            <option value="">Select cycle…</option>
            {cycles.map((c) => <option key={c.id} value={c.id}>{c.name}{c.is_active ? " (Active)" : ""}</option>)}
          </select>

          <label style={labelStyle}>Goal Title *</label>
          <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Achieve 95% Customer Satisfaction" />

          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, height: 70, resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional details…" />

          <label style={labelStyle}>Thrust Area</label>
          <select style={inputStyle} value={form.thrust_area_id} onChange={(e) => setForm({ ...form, thrust_area_id: e.target.value })}>
            <option value="">None</option>
            {thrustAreas.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <label style={labelStyle}>Unit of Measurement</label>
          <select style={inputStyle} value={form.uom_type} onChange={(e) => setForm({ ...form, uom_type: e.target.value })}>
            <option value="numeric_min">Numeric – Higher is Better (Min)</option>
            <option value="numeric_max">Numeric – Lower is Better (Max)</option>
            <option value="timeline">Timeline (Date-based)</option>
            <option value="zero">Zero-based (0 = Success)</option>
          </select>

          {(form.uom_type === "numeric_min" || form.uom_type === "numeric_max") && (
            <>
              <label style={labelStyle}>Target Value</label>
              <input type="number" style={inputStyle} value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} placeholder="e.g. 100" />
            </>
          )}
          {form.uom_type === "timeline" && (
            <>
              <label style={labelStyle}>Target Date</label>
              <input type="date" style={inputStyle} value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} />
            </>
          )}
        </div>

        {/* Recipient Selection */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#333" }}>
              Select Recipients ({selectedRecipients.length} selected)
            </h3>
            <div>
              <button onClick={selectAll} style={smallBtnStyle("#1a237e")}>All</button>
              <button onClick={deselectAll} style={{ ...smallBtnStyle("#757575"), marginLeft: 6 }}>None</button>
            </div>
          </div>

          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {Object.entries(byDept).map(([dept, emps]) => (
              <div key={dept} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>{dept}</div>
                {emps.map((e) => (
                  <label key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", borderRadius: 6, cursor: "pointer", background: selectedRecipients.includes(e.id) ? "#e8eaf6" : "transparent" }}>
                    <input type="checkbox" checked={selectedRecipients.includes(e.id)} onChange={() => toggleRecipient(e.id)} style={{ width: 16, height: 16 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{e.name}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{e.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            ))}
            {employees.length === 0 && <p style={{ color: "#aaa", textAlign: "center" }}>No employees found.</p>}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, textAlign: "right" }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ background: "#1a237e", color: "#fff", border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Sharing…" : "📤 Push Goal to Selected Employees"}
        </button>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4, marginTop: 12 };
const inputStyle = { width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" };
const smallBtnStyle = (bg) => ({ background: bg, color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", fontSize: 11, cursor: "pointer" });
