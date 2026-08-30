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
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavCounts {
  pendingVerification?: number;
  criticalNeeds?: number;
  activeShipments?: number;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: keyof NavCounts;
  badgeTone?: "critical" | "warning" | "info";
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    group: "غرفة العمليات المركزية",
    items: [
      { href: "/admin", label: "نظرة عامة ورادار الأزمة", icon: LayoutDashboard },
      {
        href: "/admin/verification",
        label: "طابور التحقق والمراجعة",
        icon: ShieldCheck,
        badgeKey: "pendingVerification",
        badgeTone: "warning",
      },
    ],
  },
  {
    group: "الميدان والمتضررين",
    items: [
      { href: "/admin/beneficiaries", label: "الأسر والطلبات", icon: Users },
      {
        href: "/admin/needs",
        label: "بنك الاحتياجات",
        icon: ListChecks,
        badgeKey: "criticalNeeds",
        badgeTone: "critical",
      },
      { href: "/admin/distributions", label: "عمليات التوزيع", icon: PackageCheck },
      { href: "/admin/affected-areas", label: "المناطق المتضررة", icon: TriangleAlert },
    ],
  },
  {
    group: "اللوجستيات والمخزون",
    items: [
      { href: "/admin/inventory", label: "المخزون والمستودعات", icon: Boxes },
      { href: "/admin/collection-points", label: "نقاط التجميع", icon: MapPin },
      { href: "/admin/relief-hubs", label: "مراكز الاستقبال والإيواء", icon: Warehouse },
      {
        href: "/admin/transport",
        label: "أسطول النقل والشحن",
        icon: Truck,
        badgeKey: "activeShipments",
        badgeTone: "info",
      },
      { href: "/admin/donations", label: "المساعدات المسجَّلة", icon: Gift },
    ],
  },
  {
    group: "الإعلام والتوجيه",
    items: [
      { href: "/admin/announcements", label: "شريط العواجل", icon: Megaphone },
      { href: "/admin/news", label: "مدونة الأخبار", icon: Newspaper },
    ],
  },
  {
    group: "الرقابة والنظام",
    items: [
      { href: "/admin/reports", label: "التقارير والتصدير", icon: BarChart3 },
      { href: "/admin/users", label: "المشرفون وفريق العمل", icon: UserCog },
      { href: "/admin/settings", label: "إعدادات المنصة", icon: Settings },
    ],
  },
];

export function AdminSidebarNav({
  counts = {},
  onNavigate,
}: {
  counts?: NavCounts;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-4 pb-6" aria-label="تنقل لوحة الإدارة">
      {navigationGroups.map((group, gIdx) => (
        <div key={gIdx} className="space-y-1">
          <p className="px-3 text-[10.5px] font-bold uppercase tracking-wider text-ops-muted">
            {group.group}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname?.startsWith(`${item.href}/`);
              const Icon = item.icon;
              const badgeCount = item.badgeKey ? counts[item.badgeKey] : undefined;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150",
                    active
                      ? "bg-verified/15 text-verified-deep font-bold border-s-2 border-verified shadow-xs"
                      : "text-ops-fg/80 hover:bg-ops-surface-2 hover:text-ops-fg"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        active ? "text-verified-deep" : "text-ops-muted group-hover:text-ops-fg"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {typeof badgeCount === "number" && badgeCount > 0 && (
                    <span
                      className={cn(
                        "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10.5px] font-bold tabular-nums",
                        item.badgeTone === "critical"
                          ? "bg-danger text-white animate-pulse"
                          : item.badgeTone === "warning"
                          ? "bg-caution-deep text-white"
                          : "bg-action text-white"
                      )}
                    >
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
