"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ListChecks,
  TriangleAlert,
  Gift,
  Boxes,
  MapPin,
  Warehouse,
  Truck,
  PackageCheck,
  UserCog,
  ShieldCheck,
  BarChart3,
  Settings,
  Megaphone,
  Newspaper,
  Stethoscope,
  Hammer,
  HardHat,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NavCounts = Record<string, number>;
type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };
type GroupColor = "green" | "purple" | "blue" | "emerald" | "amber";
type NavGroup = { title: string; color: GroupColor; items: NavItem[] };

/**
 * نفس لوحة الألوان المستخدمة في بطاقات الإجراءات بالصفحة الرئيسية العامة —
 * كل قسم في القائمة الجانبية يأخذ لونًا مميزًا منها ليسهل تمييز الأقسام
 * بصريًا بسرعة، مع إبقاء الأخضر (لون المنصة الأساسي) لحالة "العنصر النشط".
 */
const groupIconColor: Record<GroupColor, string> = {
  green: "text-algeria-green",
  purple: "text-purple-600 dark:text-purple-400",
  blue: "text-blue-600 dark:text-blue-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
};

const groups: NavGroup[] = [
  {
    title: "عام",
    color: "green",
    items: [{ href: "/admin", label: "نظرة عامة", icon: LayoutDashboard }],
  },
  {
    title: "الميدان",
    color: "purple",
    items: [
      { href: "/admin/beneficiaries", label: "الأسر المتضررة", icon: Users },
      { href: "/admin/needs", label: "الاحتياجات", icon: ListChecks },
      { href: "/admin/affected-areas", label: "المناطق المتضررة", icon: TriangleAlert },
    ],
  },
  {
    title: "الموارد واللوجستيك",
    color: "blue",
    items: [
      { href: "/admin/donations", label: "المساعدات", icon: Gift },
      { href: "/admin/inventory", label: "المخزون", icon: Boxes },
      { href: "/admin/collection-points", label: "نقاط التجميع", icon: MapPin },
      { href: "/admin/relief-hubs", label: "مراكز الاستقبال", icon: Warehouse },
      { href: "/admin/transport", label: "النقل", icon: Truck },
      { href: "/admin/distributions", label: "عمليات التوزيع", icon: PackageCheck },
    ],
  },
  {
    title: "المتطوعون والتحقق",
    color: "emerald",
    items: [
      { href: "/admin/volunteers", label: "المتطوعون الميدانيون", icon: Users },
      { href: "/admin/verification", label: "التحقق", icon: ShieldCheck },
      { href: "/admin/medical", label: "الأطقم الطبية", icon: Stethoscope },
      { href: "/admin/damage-assessments", label: "تقييمات الأضرار", icon: Hammer },
      { href: "/admin/artisans", label: "الحرفيون المتطوعون", icon: HardHat },
    ],
  },
  {
    title: "المحتوى",
    color: "amber",
    items: [
      { href: "/admin/announcements", label: "شريط الأخبار", icon: Megaphone },
      { href: "/admin/news", label: "مدونة الأخبار", icon: Newspaper },
    ],
  },
  {
    title: "النظام",
    color: "green",
    items: [
      { href: "/admin/users", label: "المستخدمون", icon: UserCog },
      { href: "/admin/reports", label: "التقارير", icon: BarChart3 },
      { href: "/admin/settings", label: "الإعدادات", icon: Settings },
    ],
  },
];

export function AdminSidebarNav({
  onNavigate,
  counts = {},
}: {
  onNavigate?: () => void;
  /** عدد العناصر "قيد الانتظار" لكل مسار — تُعرض كشارة حمراء بجانب الرابط. */
  counts?: NavCounts;
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-4">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-1 flex items-center gap-1.5 px-3 text-[11px] font-bold tracking-wide text-muted-foreground/70">
            <span className={cn("size-1.5 rounded-full", groupIconColor[group.color], "bg-current")} />
            {group.title}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active =
                item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
              const Icon = item.icon;
              const count = counts[item.href] ?? 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-algeria-green/10 text-algeria-green font-bold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", !active && groupIconColor[group.color])} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {count > 0 ? (
                    <span className="flex min-w-5 shrink-0 items-center justify-center rounded-full bg-priority-critical px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                      {count > 99 ? "99+" : count}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
