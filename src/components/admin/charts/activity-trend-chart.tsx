"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/**
 * لون واحد ثابت لكل مقياس عبر كل الرسوم البيانية في لوحة الإدارة:
 * الأخضر = مساعدات/إنجاز، الأزرق = احتياجات/طلب. لا ألوان جديدة تُخترع هنا،
 * القيم مأخوذة من نفس متغيرات OKLCH المعرَّفة في globals.css.
 */
const COLOR_NEEDS = "var(--verify-field)";
const COLOR_DONATIONS = "var(--algeria-green)";

export function ActivityTrendChart({
  data,
}: {
  data: { date: string; needs: number; donations: number }[];
}) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("ar-DZ", { day: "numeric", month: "short" }),
  }));

  return (
    <div dir="ltr" className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            width={28}
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              direction: "rtl",
              textAlign: "right",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 13,
            }}
            labelStyle={{ fontWeight: 700, marginBottom: 4 }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={28}
            formatter={(value) => (
              <span style={{ fontSize: 12, color: "var(--foreground)" }}>{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="needs"
            name="احتياجات مسجَّلة"
            stroke={COLOR_NEEDS}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="donations"
            name="مساعدات مسجَّلة"
            stroke={COLOR_DONATIONS}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
