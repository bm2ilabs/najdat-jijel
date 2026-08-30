import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Gift,
  Truck,
  Warehouse,
  TriangleAlert,
  UserX,
  ShieldAlert,
  Plus,
  ArrowUpLeft,
  ListChecks,
  Boxes,
  PackageCheck,
  Megaphone,
  Clock,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  categoryEmoji,
  formatQuantity,
  relativeTimeAr,
  unitLabels,
} from "@/lib/constants";
import {
  getAdminDashboardStats,
  getRecentActivity,
  getTopCriticalNeeds,
  getPendingVerificationCounts,
} from "@/lib/data/admin";

export const metadata: Metadata = { title: "غرفة العمليات المركزية", robots: { index: false } };

export default async function AdminOverviewPage() {
  const [stats, activity, criticalNeedsList, pendingCounts] = await Promise.all([
    getAdminDashboardStats(),
    getRecentActivity(8),
    getTopCriticalNeeds(5),
    getPendingVerificationCounts(),
  ]);

  const hasUrgentAttention = pendingCounts.total > 0 || stats.criticalNeeds > 0;

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">غرفة العمليات المركزية</h1>
          <p className="text-xs text-muted">
            بيانات الرصد والتنسيق الميداني المباشر، محدَّثة لحظيًا لحملة إغاثة ولاية جيجل.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            render={
              <Link href="/admin/needs">
                <Plus className="size-4" />
                <span>إضافة احتياج</span>
              </Link>
            }
          />
        </div>
      </div>

      {/* Urgent Attention Alert Banner */}
      {hasUrgentAttention && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger-bg p-4 text-danger-deep shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-danger text-white">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold">تنبيه العمليات: عناصر بانتظار التدخل السريع</p>
              <p className="text-xs text-danger-deep/80">
                {pendingCounts.total > 0 && `يوجد ${pendingCounts.total} عنصر بانتظار التحقق الميداني. `}
                {stats.criticalNeeds > 0 && `يوجد ${stats.criticalNeeds} احتياج ذو أولوية حرجة غير ملبى.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingCounts.total > 0 && (
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs font-bold"
                render={
                  <Link href="/admin/verification">
                    معالجة طابور التحقق ({pendingCounts.total})
                  </Link>
                }
              />
            )}
            {stats.criticalNeeds > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-danger/40 text-danger-deep hover:bg-danger/10 text-xs font-bold"
                render={
                  <Link href="/admin/needs">
                    الاحتياجات الحرجة ({stats.criticalNeeds})
                  </Link>
                }
              />
            )}
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="الأسر المتضررة"
          value={stats.totalFamilies}
          icon={Users}
          hint="إجمالي الطلبات المسجلة"
        />
        <StatCard
          label="أسر بانتظار المساعدة"
          value={stats.familiesAwaiting}
          icon={UserX}
          tone="critical"
          hint="لم تصلهم مساعدات بعد"
        />
        <StatCard
          label="الاحتياجات الحرجة"
          value={stats.criticalNeeds}
          icon={TriangleAlert}
          tone={stats.criticalNeeds > 0 ? "critical" : "default"}
          hint="مواد عاجلة مطلوبة"
        />
        <StatCard
          label="الشحنات النشطة"
          value={stats.activeShipments}
          icon={Truck}
          hint="في الطريق أو مؤكدة"
        />
        <StatCard
          label="المراكز ونقاط التجميع"
          value={stats.activePoints}
          icon={Warehouse}
          tone="success"
          hint="مفتوحة لاستقبال التبرعات"
        />
        <StatCard
          label="المساعدات المسجَّلة"
          value={stats.donationsCount}
          icon={Gift}
          hint="تبرعات عينية مقدمة"
        />
      </div>

      {/* Fast Action Launchpad */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/needs"
          className="group flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-all hover:border-action hover:shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-action-bg text-action-deep group-hover:bg-action group-hover:text-white transition-colors">
              <ListChecks className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">بنك الاحتياجات</p>
              <p className="text-[11px] text-muted">تسجيل أو تعديل حاجة بلدية</p>
            </div>
          </div>
          <ArrowUpLeft className="size-4 text-muted group-hover:text-action transition-colors" />
        </Link>

        <Link
          href="/admin/inventory"
          className="group flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-all hover:border-action hover:shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-action-bg text-action-deep group-hover:bg-action group-hover:text-white transition-colors">
              <Boxes className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">حركات المخزون</p>
              <p className="text-[11px] text-muted">استلام، صرف، أو نقل</p>
            </div>
          </div>
          <ArrowUpLeft className="size-4 text-muted group-hover:text-action transition-colors" />
        </Link>

        <Link
          href="/admin/distributions"
          className="group flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-all hover:border-verified hover:shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-verified-bg text-verified-deep group-hover:bg-verified group-hover:text-white transition-colors">
              <PackageCheck className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">تسجيل توزيع</p>
              <p className="text-[11px] text-muted">توثيق تسليم المساعدات</p>
            </div>
          </div>
          <ArrowUpLeft className="size-4 text-muted group-hover:text-verified-deep transition-colors" />
        </Link>

        <Link
          href="/admin/announcements"
          className="group flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-all hover:border-danger hover:shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-danger-bg text-danger-deep group-hover:bg-danger group-hover:text-white transition-colors">
              <Megaphone className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">شريط العواجل</p>
              <p className="text-[11px] text-muted">تنبيهات وتوجيه القوافل</p>
            </div>
          </div>
          <ArrowUpLeft className="size-4 text-muted group-hover:text-danger transition-colors" />
        </Link>
      </div>

      {/* Two-Column Cockpit Breakdown */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Critical Needs Radar */}
        <div className="space-y-3 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">أبرز الاحتياجات الحرجة والمستعجلة</h2>
              <p className="text-xs text-muted">المواد والبلديات الأكثر طلبًا للتدخل الميداني</p>
            </div>
            <Link
              href="/admin/needs"
              className="text-xs font-bold text-action-deep hover:underline flex items-center gap-1"
            >
              <span>عرض الكل</span>
              <ArrowUpLeft className="size-3.5" />
            </Link>
          </div>

          {criticalNeedsList.length === 0 ? (
            <Card className="py-8 text-center">
              <CardContent>
                <p className="text-sm font-semibold text-verified-deep">✓ لا توجد احتياجات حرجة نشطة حاليًا</p>
                <p className="text-xs text-muted mt-1">جميع الاحتياجات الحرجة تمت تلبيتها أو قيد المتابعة.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {criticalNeedsList.map((n) => {
                const needed = Number(n.quantity_needed);
                const avail = Number(n.quantity_available);
                const pct = needed > 0 ? Math.min(100, Math.round((avail / needed) * 100)) : 0;

                return (
                  <Card key={n.id} className="p-3.5 hover:border-action/60 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base" aria-hidden>
                            {categoryEmoji[n.categories?.slug ?? ""] ?? "📦"}
                          </span>
                          <p className="text-xs font-bold text-foreground truncate">
                            {n.title || n.categories?.name_ar}
                          </p>
                          {n.is_auto_generated && (
                            <span className="rounded bg-surface-2 px-1.5 py-0.2 text-[10px] font-bold text-muted">
                              تلقائي
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-muted mt-0.5">
                          {n.commune}، ولاية {n.wilaya}
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                            <div
                              className="h-full rounded-full bg-verified transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10.5px] font-bold tabular-nums text-fg-2">
                            {formatQuantity(avail)} / {formatQuantity(needed)} {unitLabels[n.unit as keyof typeof unitLabels] ?? n.unit} ({pct}%)
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <PriorityBadge priority={n.priority} />
                        <span className="text-[10px] text-muted">{relativeTimeAr(n.updated_at)}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Real-time Activity Log */}
        <div className="space-y-3 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">سجل النشاطات الميدانية</h2>
              <p className="text-xs text-muted">آخر الإجراءات وحركات النظام</p>
            </div>
          </div>

          {activity.length === 0 ? (
            <Card className="py-8 text-center">
              <CardContent>
                <EmptyState title="لا يوجد نشاط مسجَّل بعد" />
              </CardContent>
            </Card>
          ) : (
            <Card className="p-0 overflow-hidden">
              <div className="divide-y divide-border/60">
                {activity.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-xs transition-colors hover:bg-surface-2/40"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[10px] font-bold text-fg-2">
                        {a.profiles?.full_name ? a.profiles.full_name[0] : "م"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {a.profiles?.full_name ?? "مستخدم"}
                        </p>
                        <p className="text-[11px] text-muted truncate">{a.action}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 shrink-0 text-[10px] text-muted">
                      <Clock className="size-3" />
                      {relativeTimeAr(a.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
