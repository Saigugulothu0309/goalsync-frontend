// frontend/src/pages/CompletionDashboard.jsx
// Feature: Completion Dashboard — real-time view of check-in completion rates

import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const token = () => localStorage.getItem("token");

export default function CompletionDashboard() {
  const [cycles, setCycles] = useState([]);
  const [cycleId, setCycleId] = useState("");
  const [quarter, setQuarter] = useState("Q1");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/cycles`, { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setCycles(list);
        const active = list.find((c) => c.is_active);
        if (active) setCycleId(active.id);
      });
  }, []);

  useEffect(() => {
    if (cycleId) fetchData();
  }, [cycleId, quarter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/reports/completion?cycle_id=${cycleId}&quarter=${quarter}`,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      setData(await res.json());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const employees = data?.employees || [];
  const managerCheckins = data?.manager_checkins || [];

  const totalEmp = employees.length;
  const submitted = employees.filter((e) => ["submitted", "approved"].includes(e.sheet_status)).length;
  const approved = employees.filter((e) => e.sheet_status === "approved").length;
  const goalsComplete = employees.filter((e) => e.achievements_logged === e.total_goals && e.total_goals > 0).length;

  const pct = (n, d) => (d === 0 ? 0 : Math.round((n / d) * 100));

  return (
    <div style={{ padding: "24px", maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#1a237e" }}>📊 Completion Dashboard</h2>
      <p style={{ color: "#555", marginBottom: 24 }}>Real-time view of goal submission and quarterly check-in completion.</p>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <select style={selStyle} value={cycleId} onChange={(e) => setCycleId(e.target.value)}>
          {cycles.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select style={selStyle} value={quarter} onChange={(e) => setQuarter(e.target.value)}>
          {["Q1", "Q2", "Q3", "Q4"].map((q) => <option key={q} value={q}>{q} Check-in</option>)}
        </select>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading…</div>}

      {data && !loading && (
        <>
          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Total Employees", val: totalEmp, icon: "👥", color: "#1a237e" },
              { label: "Goals Submitted", val: `${submitted}/${totalEmp}`, pct: pct(submitted, totalEmp), icon: "📤", color: "#2e7d32" },
              { label: "Goals Approved", val: `${approved}/${totalEmp}`, pct: pct(approved, totalEmp), icon: "✅", color: "#1565c0" },
              { label: `${quarter} Updates Done`, val: `${goalsComplete}/${totalEmp}`, pct: pct(goalsComplete, totalEmp), icon: "📈", color: "#6a1b9a" },
            ].map((c, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderTop: `4px solid ${c.color}` }}>
                <div style={{ fontSize: 22 }}>{c.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: c.color, marginTop: 4 }}>{c.val}</div>
                {c.pct !== undefined && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ height: 6, background: "#eee", borderRadius: 3 }}>
                      <div style={{ width: `${c.pct}%`, height: "100%", background: c.color, borderRadius: 3, transition: "width 0.5s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{c.pct}%</div>
                  </div>
                )}
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* Manager Check-in Table */}
          {managerCheckins.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: "#333" }}>Manager Check-in Progress — {quarter}</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    {["Manager", "Team Size", "Check-ins Done", "Completion"].map((h) => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: "#555" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {managerCheckins.map((m, i) => {
                    const p = pct(m.checkins_done, m.total_reports);
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600 }}>{m.manager_name}</td>
                        <td style={{ padding: "10px 12px", color: "#666" }}>{m.total_reports}</td>
                        <td style={{ padding: "10px 12px", color: "#666" }}>{m.checkins_done}/{m.total_reports}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 8, background: "#eee", borderRadius: 4 }}>
                              <div style={{ width: `${p}%`, height: "100%", background: p === 100 ? "#2e7d32" : p > 50 ? "#1565c0" : "#f57f17", borderRadius: 4 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: p === 100 ? "#2e7d32" : "#555", width: 35 }}>{p}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Employee Table */}
          <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: "#333" }}>Employee Status</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    {["Employee", "Department", "Manager", "Sheet Status", `${quarter} Updates`].map((h) => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: "#555", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600 }}>{e.name}</td>
                      <td style={{ padding: "10px 12px", color: "#666" }}>{e.department || "—"}</td>
                      <td style={{ padding: "10px 12px", color: "#666" }}>{e.manager_name || "—"}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <StatusBadge status={e.sheet_status} />
                      </td>
                      <td style={{ padding: "10px 12px", color: "#666" }}>
                        {e.total_goals != null
                          ? `${e.achievements_logged || 0}/${e.total_goals} goals`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    approved: { label: "Approved", bg: "#e8f5e9", color: "#2e7d32" },
    submitted: { label: "Submitted", bg: "#e3f2fd", color: "#1565c0" },
    returned: { label: "Returned", bg: "#fff3e0", color: "#e65100" },
    draft: { label: "Draft", bg: "#f5f5f5", color: "#757575" },
  };
  const s = map[status] || { label: "No Sheet", bg: "#ffebee", color: "#c62828" };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 12, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

const selStyle = { padding: "8px 12px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit" };
