"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { priorityLabels, type PriorityLevel } from "@/lib/constants";

/** ألوان الأولوية نفسها المستخدمة في PriorityBadge — لا تكرار لمنطق ألوان جديد. */
const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  critical: "var(--priority-critical)",
  high: "var(--priority-high)",
  medium: "var(--priority-medium)",
  low: "var(--priority-low)",
};

const ORDER: PriorityLevel[] = ["critical", "high", "medium", "low"];

export function PriorityBarChart({ counts }: { counts: Record<string, number> }) {
  const data = ORDER.map((p) => ({ priority: p, label: priorityLabels[p], value: counts[p] ?? 0 }));

  return (
    <div dir="ltr" className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <XAxis type="number" allowDecimals={false} hide />
          <YAxis
            dataKey="label"
            type="category"
            width={70}
            tick={{ fontSize: 13, fill: "var(--foreground)", fontWeight: 600 }}
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
          <Bar dataKey="value" radius={[6, 6, 6, 6]} maxBarSize={22}>
            {data.map((d) => (
              <Cell key={d.priority} fill={PRIORITY_COLORS[d.priority]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
