import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Gift,
  Truck,
  Warehouse,
  TriangleAlert,
  UserX,
  Activity,
  ListChecks,
  MapPin,
  PackageCheck,
} from "lucide-react";
import { StatCard, iconColorClasses } from "@/components/shared/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { relativeTimeAr } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  getAdminDashboardStats,
  getRecentActivity,
  getActivityTrend,
  getNeedsByPriority,
  getWeekOverWeekDelta,
} from "@/lib/data/admin";
import { ActivityTrendChart } from "@/components/admin/charts/activity-trend-chart";
import { PriorityBarChart } from "@/components/admin/charts/priority-bar-chart";

export const metadata: Metadata = { title: "نظرة عامة", robots: { index: false } };

export default async function AdminOverviewPage() {
  const [stats, activity, trend, priorityCounts, weekDelta] = await Promise.all([
    getAdminDashboardStats(),
    getRecentActivity(8),
    getActivityTrend(14),
    getNeedsByPriority(),
    getWeekOverWeekDelta(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">نظرة عامة</h1>
        <p className="text-sm text-muted-foreground">أرقام حقيقية من قاعدة البيانات، محدَّثة لحظيًا.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="الأسر المتضررة" value={stats.totalFamilies} icon={Users} iconColor="purple" />
        <StatCard
          label="أسر لم تصلها مساعدات بعد"
          value={stats.familiesAwaiting}
          icon={UserX}
          tone="critical"
          iconColor="critical"
        />
        <StatCard
          label="المساعدات المسجَّلة"
          value={stats.donationsCount}
          icon={Gift}
          iconColor="green"
          trend={{ delta: weekDelta.donationsDeltaPct, label: "هذا الأسبوع" }}
        />
        <StatCard label="الشحنات النشطة" value={stats.activeShipments} icon={Truck} iconColor="blue" />
        <StatCard
          label="نقاط الاستقبال المفتوحة"
          value={stats.activePoints}
          icon={Warehouse}
          iconColor="emerald"
        />
        <StatCard
          label="الاحتياجات الحرجة"
          value={stats.criticalNeeds}
          icon={TriangleAlert}
          tone="critical"
          iconColor="critical"
          trend={{ delta: weekDelta.needsDeltaPct, label: "احتياجات جديدة هذا الأسبوع" }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="px-5">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="size-4 text-muted-foreground" />
              <h2 className="font-bold">وتيرة النشاط — آخر 14 يومًا</h2>
            </div>
            <ActivityTrendChart data={trend} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-5">
            <h2 className="mb-3 font-bold">الاحتياجات النشطة حسب الأولوية</h2>
            <PriorityBarChart counts={priorityCounts} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/admin/needs", label: "إضافة احتياج", icon: ListChecks, color: "green" },
          { href: "/admin/collection-points", label: "إضافة نقطة تجميع", icon: MapPin, color: "purple" },
          { href: "/admin/relief-hubs", label: "إضافة مركز استقبال", icon: Warehouse, color: "emerald" },
          { href: "/admin/distributions", label: "تسجيل توزيع", icon: PackageCheck, color: "blue" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3 rounded-xl border border-dashed border-border bg-card p-3.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-solid hover:border-algeria-green hover:shadow-sm"
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110",
                iconColorClasses[a.color as keyof typeof iconColorClasses],
              )}
            >
              <a.icon className="size-4" />
            </span>
            {a.label}
          </Link>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold">آخر النشاطات</h2>
        {activity.length === 0 ? (
          <EmptyState title="لا يوجد نشاط مسجَّل بعد" />
        ) : (
          <Card>
            <CardContent className="divide-y divide-border px-0">
              {activity.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <span className="font-medium">{a.profiles?.full_name ?? "مستخدم"}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {relativeTimeAr(a.created_at)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
