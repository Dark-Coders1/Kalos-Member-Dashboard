'use client';
import {
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";

const metricConfig = [
  { key: "bodyFatPercent", label: "Body fat %", color: "#dc2626", unit: "%" },
  { key: "leanMass", label: "Lean mass", color: "#059669", unit: "lbs" },
  { key: "weight", label: "Weight", color: "#2563eb", unit: "lbs" },
  { key: "fatMass", label: "Fat mass", color: "#7c3aed", unit: "lbs" },
  { key: "visceralFat", label: "Visceral fat", color: "#ea580c", unit: "" },
];

const toChartRows = (scans) => {
  if (scans.length < 2) return { rows: [], lines: [] };
  const lines = metricConfig
    .map((metric) => {
      const values = scans.map((scan) => Number(scan[metric.key]));
      if (values.some((value) => !Number.isFinite(value))) return null;
      const pctSeries = values.map((value, index) => {
        if (index === 0) return null;
        const prev = values[index - 1];
        if (!Number.isFinite(prev) || prev === 0) return null;
        return ((value - prev) / prev) * 100;
      });
      return { ...metric, pctSeries };
    })
    .filter(Boolean);

  const rows = scans.map((scan, index) => {
    const row = {
      dateLabel: new Date(scan.scanDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }),
    };
    for (const line of lines) {
      row[line.key] = Number(scan[line.key]);
      const pct = line.pctSeries[index];
      row[`${line.key}Pct`] = pct == null ? null : Number(pct.toFixed(2));
    }
    return row;
  });

  return { rows, lines };
};

function TrendChart({ scans }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const { rows, lines } = toChartRows(scans);
  if (scans.length < 2 || !lines.length) return null;

  return (
    <section className="card">
      <h2 className="sectionTitle">Trend overview</h2>
      <p className="subtle">Multi-metric trends across all scans (change vs previous scan).</p>
      <div className="chartWrap">
        <div className="chart">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={rows} margin={{ top: 12, right: 16, left: 0, bottom: 14 }} onMouseLeave={() => setHoveredPoint(null)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f3" />
              <XAxis dataKey="dateLabel" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Legend />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
              {lines.map((metric) => (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={`${metric.key}Pct`}
                  name={metric.label}
                  stroke={metric.color}
                  strokeWidth={2.3}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const pct = payload?.[`${metric.key}Pct`];
                    if (pct == null || cx == null || cy == null) return null;
                    return (
                      <g>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={9}
                          fill="transparent"
                          className="nodeHitArea"
                          onMouseMove={() =>
                            setHoveredPoint({
                              x: cx,
                              y: cy,
                              dateLabel: payload?.dateLabel,
                              metricLabel: metric.label,
                              rawValue: payload?.[metric.key],
                              unit: metric.unit,
                              pctChange: pct,
                              color: metric.color,
                            })
                          }
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        <circle cx={cx} cy={cy} r={4} fill={metric.color} stroke="#fff" strokeWidth={1} />
                      </g>
                    );
                  }}
                  activeDot={{ r: 6 }}
                >
                  <LabelList
                    dataKey={metric.key}
                    content={(props) => {
                      const { x, y, width, value, payload } = props;
                      if (payload?.[`${metric.key}Pct`] == null) return null;
                      if (x == null || y == null || width == null) return null;
                      return (
                        <text x={x + width / 2} y={y - 7} textAnchor="middle" className="pointValueLabel">
                          {value}
                          {metric.unit ? ` ${metric.unit}` : ""}
                        </text>
                      );
                    }}
                  />
                </Line>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {hoveredPoint && (
          <div
            className="customTooltip floatingTooltip"
            style={{
              left: `${Math.min(Math.max((Number(hoveredPoint.x) || 0) + 16, 10), 520)}px`,
              top: `${Math.max((Number(hoveredPoint.y) || 0) - 22, 10)}px`,
            }}
          >
            <p className="tooltipDate">{hoveredPoint.dateLabel}</p>
            <p className="tooltipMetric" style={{ color: hoveredPoint.color }}>
              {hoveredPoint.metricLabel}: {hoveredPoint.rawValue}
              {hoveredPoint.unit ? ` ${hoveredPoint.unit}` : ""}
            </p>
            <p className="tooltipDelta">
              Change vs previous: {Number(hoveredPoint.pctChange) >= 0 ? "+" : ""}
              {Number(hoveredPoint.pctChange).toFixed(2)}%
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default TrendChart;
