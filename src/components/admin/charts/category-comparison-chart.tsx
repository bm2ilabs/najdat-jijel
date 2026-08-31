"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLOR_RECEIVED = "var(--algeria-green)";
const COLOR_DISTRIBUTED = "var(--verify-field)";

export function CategoryComparisonChart({
  data,
}: {
  data: { name: string; received: number; distributed: number }[];
}) {
  const height = Math.max(220, data.length * 44);

  return (
    <div dir="ltr" className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          barCategoryGap={10}
        >
          <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={110}
            tick={{ fontSize: 12, fill: "var(--foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            contentStyle={{
              direction: "rtl",
              textAlign: "right",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 13,
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={28}
            formatter={(value) => (
              <span style={{ fontSize: 12, color: "var(--foreground)" }}>{value}</span>
            )}
          />
          <Bar dataKey="received" name="مُسجَّل" fill={COLOR_RECEIVED} radius={[4, 4, 4, 4]} maxBarSize={14} />
          <Bar
            dataKey="distributed"
            name="موزَّع فعليًا"
            fill={COLOR_DISTRIBUTED}
            radius={[4, 4, 4, 4]}
            maxBarSize={14}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
