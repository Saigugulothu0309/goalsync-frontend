// frontend/src/pages/Analytics.jsx
// Feature: Analytics — QoQ trends, heatmaps, goal distribution, manager effectiveness

import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const token = () => localStorage.getItem("token");

const UOM_LABELS = {
  numeric_min: "Higher is Better",
  numeric_max: "Lower is Better",
  timeline: "Timeline",
  zero: "Zero-based",
};

function Bar({ pct, color, label, subLabel }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#333", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, color, fontWeight: 700 }}>{subLabel}</span>
      </div>
      <div style={{ height: 10, background: "#f0f0f0", borderRadius: 5 }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: color, borderRadius: 5, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function HeatCell({ value, max }) {
  const intensity = max > 0 ? value / max : 0;
  const r = Math.round(255 - intensity * 100);
  const g = Math.round(255 - intensity * 20);
  const b = Math.round(255 - intensity * 200);
  return (
    <div style={{ background: `rgb(${r},${g},${b})`, borderRadius: 4, padding: "6px 8px", textAlign: "center", fontSize: 12, fontWeight: 700, color: intensity > 0.6 ? "#fff" : "#333" }}>
      {value != null ? `${Math.round(value)}%` : "—"}
    </div>
  );
}

export default function Analytics() {
  const [cycles, setCycles] = useState([]);
  const [cycleId, setCycleId] = useState("");
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
    if (cycleId) fetchAnalytics();
  }, [cycleId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/reports/analytics?cycle_id=${cycleId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setData(await res.json());
    } catch { setData(null); } finally { setLoading(false); }
  };

  const depts = data?.by_department || [];
  const thrusts = data?.by_thrust_area || [];
  const uoms = data?.by_uom_type || [];
  const managers = data?.manager_effectiveness || [];

  const maxDeptScore = Math.max(...depts.map((d) => Number(d.avg_score) * 100 || 0), 1);
  const maxThrustCount = Math.max(...thrusts.map((t) => Number(t.goal_count) || 0), 1);

  return (
    <div style={{ padding: "24px", maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#1a237e" }}>📈 Analytics Dashboard</h2>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Goal achievement trends, distribution analysis, and manager effectiveness.
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <select style={selStyle} value={cycleId} onChange={(e) => setCycleId(e.target.value)}>
          {cycles.map((c) => <option key={c.id} value={c.id}>{c.name}{c.is_active ? " ⚡" : ""}</option>)}
        </select>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading analytics…</div>}

      {data && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Department Performance */}
          <div style={cardStyle}>
            <h3 style={cardTitle}>🏢 Performance by Department</h3>
            {depts.length === 0
              ? <Empty />
              : depts.map((d, i) => {
                  const p = Number(d.avg_score) * 100 || 0;
                  const color = p < 50 ? "#c62828" : p < 75 ? "#f57f17" : "#2e7d32";
                  return (
                    <Bar key={i} pct={p} color={color}
                      label={`${d.department || "Unassigned"} (${d.employees} emp)`}
                      subLabel={`${p.toFixed(1)}% avg`}
                    />
                  );
                })}
          </div>

          {/* Thrust Area Distribution */}
          <div style={cardStyle}>
            <h3 style={cardTitle}>🎯 Goals by Thrust Area</h3>
            {thrusts.length === 0
              ? <Empty />
              : thrusts.map((t, i) => {
                  const p = (Number(t.goal_count) / maxThrustCount) * 100;
                  const score = Number(t.avg_score) * 100 || 0;
                  return (
                    <Bar key={i} pct={p} color={`hsl(${(i * 47) % 360}, 60%, 45%)`}
                      label={t.thrust_area || "Uncategorized"}
                      subLabel={`${t.goal_count} goals • ${score.toFixed(0)}% avg`}
                    />
                  );
                })}
          </div>

          {/* UoM Distribution */}
          <div style={cardStyle}>
            <h3 style={cardTitle}>📊 Goal Distribution by UoM Type</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {uoms.map((u, i) => {
                const p = Number(u.avg_score) * 100 || 0;
                const COLORS = ["#1565c0", "#2e7d32", "#6a1b9a", "#e65100"];
                return (
                  <div key={i} style={{ background: COLORS[i % 4] + "11", border: `2px solid ${COLORS[i % 4]}33`, borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: COLORS[i % 4] }}>{u.goal_count}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#333", marginTop: 2 }}>{UOM_LABELS[u.uom_type] || u.uom_type}</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Avg score: {p.toFixed(1)}%</div>
                    <div style={{ height: 6, background: "#e0e0e0", borderRadius: 3, marginTop: 8 }}>
                      <div style={{ width: `${p}%`, height: "100%", background: COLORS[i % 4], borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manager Effectiveness */}
          <div style={cardStyle}>
            <h3 style={cardTitle}>👨‍💼 Manager Check-in Effectiveness</h3>
            {managers.length === 0
              ? <Empty />
              : managers.map((m, i) => {
                  const p = Number(m.completion_pct) || 0;
                  const color = p < 50 ? "#c62828" : p < 80 ? "#f57f17" : "#2e7d32";
                  return (
                    <Bar key={i} pct={p} color={color}
                      label={`${m.manager} (${m.total_reports} reports)`}
                      subLabel={`${p}%`}
                    />
                  );
                })}
          </div>

          {/* Department Heatmap */}
          {depts.length > 0 && (
            <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
              <h3 style={cardTitle}>🌡️ Department Achievement Heatmap</h3>
              <div style={{ display: "grid", gridTemplateColumns: `200px repeat(${depts.length}, 1fr)`, gap: 6, overflowX: "auto" }}>
                <div />
                {depts.map((d, i) => (
                  <div key={i} style={{ fontSize: 11, fontWeight: 700, color: "#555", textAlign: "center", padding: "4px 2px" }}>
                    {(d.department || "N/A").slice(0, 12)}
                  </div>
                ))}
                {["Employees", "Avg Score"].map((row) => (
                  <>
                    <div key={row} style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "flex", alignItems: "center" }}>{row}</div>
                    {depts.map((d, i) => {
                      const val = row === "Employees" ? Number(d.employees) : Number(d.avg_score) * 100;
                      const max = row === "Employees" ? Math.max(...depts.map((x) => Number(x.employees))) : 100;
                      return <HeatCell key={i} value={val} max={max} />;
                    })}
                  </>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Empty() {
  return <div style={{ color: "#aaa", textAlign: "center", padding: "20px 0", fontSize: 13 }}>No data yet for this cycle.</div>;
}

const cardStyle = { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" };
const cardTitle = { fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 16, marginTop: 0 };
const selStyle = { padding: "8px 12px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit" };
