// frontend/src/pages/RiskRadar.jsx
// Feature: Risk Radar — identifies at-risk employees and goals

import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const token = () => localStorage.getItem("token");

const RISK_COLORS = {
  critical: { bg: "#ffebee", color: "#b71c1c", label: "🔴 Critical", border: "#ef9a9a" },
  at_risk: { bg: "#fff3e0", color: "#e65100", label: "🟠 At Risk", border: "#ffcc80" },
  needs_attention: { bg: "#fff9c4", color: "#f57f17", label: "🟡 Needs Attention", border: "#fff176" },
  on_track: { bg: "#e8f5e9", color: "#2e7d32", label: "🟢 On Track", border: "#a5d6a7" },
};

export default function RiskRadar() {
  const [cycles, setCycles] = useState([]);
  const [cycleId, setCycleId] = useState("");
  const [quarter, setQuarter] = useState("Q1");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("goals");

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
    if (cycleId) fetchRisk();
  }, [cycleId, quarter]);

  const fetchRisk = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/risk/radar?cycle_id=${cycleId}&quarter=${quarter}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setData(await res.json());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const summary = data?.summary || {};

  return (
    <div style={{ padding: "24px", maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#1a237e" }}>🎯 Risk Radar</h2>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Identify employees and goals at risk of missing quarterly targets.
      </p>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <select style={selStyle} value={cycleId} onChange={(e) => setCycleId(e.target.value)}>
          {cycles.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select style={selStyle} value={quarter} onChange={(e) => setQuarter(e.target.value)}>
          {["Q1", "Q2", "Q3", "Q4"].map((q) => <option key={q} value={q}>{q}</option>)}
        </select>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Scanning for risks…</div>}

      {data && !loading && (
        <>
          {/* Risk Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Low Progress Goals", val: summary.low_progress_goals, icon: "📉", color: "#c62828", bg: "#ffebee" },
              { label: "Employees w/ No Activity", val: summary.employees_with_no_activity, icon: "😴", color: "#e65100", bg: "#fff3e0" },
              { label: "High-Weight Goals at Risk", val: summary.high_weight_at_risk, icon: "⚠️", color: "#f57f17", bg: "#fff9c4" },
            ].map((c, i) => (
              <div key={i} style={{ background: c.bg, borderRadius: 10, padding: 16, border: `2px solid ${c.color}22` }}>
                <div style={{ fontSize: 24 }}>{c.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.val || 0}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid #e0e0e0" }}>
            {[
              { id: "goals", label: "⚡ At-Risk Goals" },
              { id: "no_activity", label: "😴 No Activity" },
              { id: "high_weight", label: "🏋️ High-Weight Risk" },
              { id: "dept", label: "🏢 By Department" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "10px 18px", border: "none", background: "transparent",
                  borderBottom: activeTab === t.id ? "3px solid #1a237e" : "3px solid transparent",
                  color: activeTab === t.id ? "#1a237e" : "#666", fontWeight: activeTab === t.id ? 700 : 400,
                  cursor: "pointer", fontSize: 13,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* At-Risk Goals */}
          {activeTab === "goals" && (
            <div>
              {data.low_progress_goals.length === 0
                ? <EmptyState msg="No at-risk goals found for this quarter 🎉" />
                : data.low_progress_goals.map((g, i) => {
                    const r = RISK_COLORS[g.risk_level] || RISK_COLORS.at_risk;
                    return (
                      <div key={i} style={{ background: r.bg, border: `1px solid ${r.border}`, borderRadius: 10, padding: "14px 18px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: r.color }}>{r.label}</span>
                            <span style={{ fontSize: 12, color: "#888" }}>{g.thrust_area}</span>
                          </div>
                          <div style={{ fontWeight: 700, color: "#333" }}>{g.goal_title}</div>
                          <div style={{ fontSize: 12, color: "#666" }}>{g.employee_name} — {g.department} | Manager: {g.manager_name || "—"}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: r.color }}>
                            {g.progress_score != null ? `${Math.round(g.progress_score * 100)}%` : "N/A"}
                          </div>
                          <div style={{ fontSize: 11, color: "#888" }}>Progress • Wt: {g.weightage}%</div>
                        </div>
                      </div>
                    );
                  })}
            </div>
          )}

          {/* No Activity */}
          {activeTab === "no_activity" && (
            <div>
              {data.no_activity_employees.length === 0
                ? <EmptyState msg="All employees have logged activity this quarter 🎉" />
                : data.no_activity_employees.map((e, i) => (
                    <div key={i} style={{ background: "#fff3e0", border: "1px solid #ffcc80", borderRadius: 10, padding: "14px 18px", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#333" }}>{e.name}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{e.email} — {e.department}</div>
                        <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Manager: {e.manager_name || "Unassigned"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#e65100" }}>0/{e.total_goals}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>Goals Updated</div>
                      </div>
                    </div>
                  ))}
            </div>
          )}

          {/* High-weight at risk */}
          {activeTab === "high_weight" && (
            <div>
              {data.high_weightage_at_risk.length === 0
                ? <EmptyState msg="No high-weight goals are at risk 🎉" />
                : data.high_weightage_at_risk.map((g, i) => (
                    <div key={i} style={{ background: "#fff9c4", border: "1px solid #fff176", borderRadius: 10, padding: "14px 18px", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#333" }}>{g.title}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{g.employee_name} — {g.department}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>Thrust: {g.thrust_area || "—"} | UoM: {g.uom_type}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#f57f17" }}>{g.weightage}%</div>
                        <div style={{ fontSize: 12, color: "#888" }}>
                          {g.progress_score != null ? `${Math.round(g.progress_score * 100)}% progress` : "Not started"}
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          )}

          {/* Dept risk */}
          {activeTab === "dept" && (
            <div>
              {data.department_risk.map((d, i) => {
                const p = Number(d.avg_progress_pct) || 0;
                const riskColor = p < 25 ? "#c62828" : p < 50 ? "#e65100" : p < 75 ? "#f57f17" : "#2e7d32";
                return (
                  <div key={i} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 10, padding: "14px 18px", marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#333" }}>{d.department || "Unassigned"}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>{d.employees} employees • {d.total_goals} goals • {d.at_risk_goals} at risk</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 18, color: riskColor }}>{p}%</div>
                    </div>
                    <div style={{ height: 8, background: "#eee", borderRadius: 4 }}>
                      <div style={{ width: `${p}%`, height: "100%", background: riskColor, borderRadius: 4, transition: "width 0.4s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ msg }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 0", color: "#888", fontSize: 15 }}>{msg}</div>
  );
}

const selStyle = { padding: "8px 12px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit" };
