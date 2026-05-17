// frontend/src/components/WeightageProgressBar.jsx
// Feature: Weightage Progress Bar — shows real-time weightage sum while adding goals
// Usage: <WeightageProgressBar goals={goals} />

export default function WeightageProgressBar({ goals = [], maxGoals = 8 }) {
  const total = goals.reduce((sum, g) => sum + Number(g.weightage || 0), 0);
  const isValid = Math.abs(total - 100) < 0.01;
  const isOver = total > 100;
  const pct = Math.min(total, 100);

  const color = isValid ? "#2e7d32" : isOver ? "#c62828" : total >= 80 ? "#f57f17" : "#1565c0";
  const bgColor = isValid ? "#e8f5e9" : isOver ? "#ffebee" : "#e3f2fd";

  return (
    <div style={{ background: bgColor, borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: `2px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color }}>
          {isValid ? "✅ Weightage Complete — 100%" : isOver ? `⚠️ Over Limit — ${total.toFixed(1)}% (must equal 100%)` : `⚡ Remaining — ${(100 - total).toFixed(1)}% left`}
        </div>
        <div style={{ fontSize: 13, color: "#666" }}>
          {goals.length}/{maxGoals} goals
        </div>
      </div>

      {/* Main Progress Bar */}
      <div style={{ height: 14, background: "#e0e0e0", borderRadius: 7, overflow: "hidden", marginBottom: 10 }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: isOver
              ? "repeating-linear-gradient(45deg, #c62828, #c62828 10px, #ef9a9a 10px, #ef9a9a 20px)"
              : color,
            borderRadius: 7,
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* Per-goal bars */}
      {goals.length > 0 && (
        <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
          {goals.map((g, i) => {
            const w = Number(g.weightage || 0);
            const goalColor = COLORS[i % COLORS.length];
            return (
              <div key={i} style={{ flex: w, minWidth: 4, position: "relative" }}>
                <div
                  title={`${g.title || `Goal ${i + 1}`}: ${w}%`}
                  style={{ height: 8, background: goalColor, borderRadius: 4, cursor: "default" }}
                />
              </div>
            );
          })}
          {total < 100 && (
            <div style={{ flex: 100 - total, background: "#e0e0e0", borderRadius: 4, height: 8 }} />
          )}
        </div>
      )}

      {/* Goal breakdown */}
      {goals.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {goals.map((g, i) => (
            <span
              key={i}
              style={{
                background: COLORS[i % COLORS.length] + "22",
                border: `1px solid ${COLORS[i % COLORS.length]}`,
                color: COLORS[i % COLORS.length],
                borderRadius: 12, padding: "2px 10px", fontSize: 12, fontWeight: 600,
              }}
            >
              {g.title ? (g.title.length > 20 ? g.title.slice(0, 18) + "…" : g.title) : `Goal ${i + 1}`}: {g.weightage}%
            </span>
          ))}
        </div>
      )}

      {/* Validation messages */}
      <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
        {goals.some((g) => Number(g.weightage) < 10) && (
          <div style={{ color: "#c62828" }}>⚠️ Each goal must have at least 10% weightage.</div>
        )}
        {goals.length === maxGoals && (
          <div style={{ color: "#f57f17" }}>ℹ️ Maximum {maxGoals} goals reached.</div>
        )}
        {!isValid && !isOver && (
          <div>💡 Tip: Distribute remaining {(100 - total).toFixed(1)}% across your goals.</div>
        )}
      </div>
    </div>
  );
}

const COLORS = ["#1565c0", "#2e7d32", "#6a1b9a", "#e65100", "#00838f", "#ad1457", "#4e342e", "#37474f"];
