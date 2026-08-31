import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatQuantity } from "@/lib/constants";

/**
 * لوحة الألوان نفسها المستخدمة في بطاقات الإجراءات السريعة بالصفحة الرئيسية
 * العامة (src/app/(site)/page.tsx) — نفس القيم بالحرف، لا ألوان جديدة، حتى
 * تبقى لوحة الإدارة والموقع العام بهوية بصرية واحدة.
 */
export const iconColorClasses = {
  default: "bg-muted text-muted-foreground",
  green: "bg-algeria-green/15 text-algeria-green",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  critical: "bg-priority-critical/10 text-priority-critical",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  iconColor = "default",
  hint,
  trend,
}: {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  tone?: "default" | "critical" | "success";
  /** لون دائرة الأيقونة — يطابق ألوان بطاقات الإجراءات في الصفحة الرئيسية. */
  iconColor?: keyof typeof iconColorClasses;
  hint?: string;
  /** فرق مقارنة بالفترة السابقة — موجب = ارتفاع (أخضر)، سالب = انخفاض (أحمر). */
  trend?: { delta: number; label: string };
}) {
  const toneClasses = {
    default: "text-foreground",
    critical: "text-priority-critical",
    success: "text-algeria-green",
  } as const;

  return (
    <Card className="gap-2 py-5">
      <CardContent className="flex items-center justify-between gap-3 px-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn("text-2xl font-bold tabular-nums", toneClasses[tone])}>
            {typeof value === "number" ? formatQuantity(value) : value}
          </p>
          {trend ? (
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-xs font-semibold",
                trend.delta >= 0 ? "text-algeria-green" : "text-priority-critical",
              )}
            >
              {trend.delta >= 0 ? (
                <ArrowUp className="size-3" />
              ) : (
                <ArrowDown className="size-3" />
              )}
              {Math.abs(trend.delta)}% <span className="font-normal text-muted-foreground">{trend.label}</span>
            </p>
          ) : hint ? (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200",
              iconColorClasses[iconColor],
            )}
          >
            <Icon className="size-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
