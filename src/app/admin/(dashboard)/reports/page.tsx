import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  formatQuantity,
  requestStatusLabels,
  unitLabels,
} from "@/lib/constants";
import { CategoryIcon } from "@/components/shared/category-icon";
import { getStatDistributionsByCategory, getStatDonationsByCategory } from "@/lib/data/public";
import { getNeedsByPriority } from "@/lib/data/admin";
import { CategoryComparisonChart } from "@/components/admin/charts/category-comparison-chart";
import { PriorityBarChart } from "@/components/admin/charts/priority-bar-chart";

export const metadata: Metadata = { title: "التقارير", robots: { index: false } };

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const [donationsByCategory, distributionsByCategory, { data: requests }, priorityCounts] =
    await Promise.all([
      getStatDonationsByCategory(),
      getStatDistributionsByCategory(),
      supabase.from("beneficiary_requests").select("status, commune"),
      getNeedsByPriority(),
    ]);

  const byStatus = new Map<string, number>();
  const byCommune = new Map<string, number>();
  for (const r of requests ?? []) {
    byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + 1);
    byCommune.set(r.commune, (byCommune.get(r.commune) ?? 0) + 1);
  }

  // دمج الدخل (المساعدات المسجَّلة) والصادر (الموزَّع فعليًا) في صف واحد لكل
  // فئة — مجموع الكميات عبر الوحدات المختلفة لغرض المقارنة البصرية فقط، مع
  // الاحتفاظ بالتفصيل الدقيق لكل وحدة في القائمتين أسفله.
  const comparisonMap = new Map<string, { name: string; received: number; distributed: number }>();
  for (const row of donationsByCategory) {
    const entry = comparisonMap.get(row.slug) ?? { name: row.name_ar, received: 0, distributed: 0 };
    entry.received += Number(row.total_quantity);
    comparisonMap.set(row.slug, entry);
  }
  for (const row of distributionsByCategory) {
    const entry = comparisonMap.get(row.slug) ?? { name: row.name_ar, received: 0, distributed: 0 };
    entry.distributed += Number(row.total_quantity);
    comparisonMap.set(row.slug, entry);
  }
  const comparisonData = [...comparisonMap.values()].sort((a, b) => b.received - a.received);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">التقارير</h1>
        <p className="text-sm text-muted-foreground">تفصيل أدق من صفحة الشفافية العامة، لفريق التنسيق فقط.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="px-5">
            <h2 className="mb-3 font-bold">المسجَّل مقابل الموزَّع فعليًا (حسب النوع)</h2>
            {comparisonData.length === 0 ? (
              <EmptyState title="لا توجد بيانات بعد" />
            ) : (
              <CategoryComparisonChart data={comparisonData} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-5">
            <h2 className="mb-3 font-bold">الاحتياجات النشطة حسب الأولوية</h2>
            <PriorityBarChart counts={priorityCounts} />
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 font-bold">طلبات المساعدة حسب الحالة</h2>
        {byStatus.size === 0 ? (
          <EmptyState title="لا توجد بيانات بعد" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {[...byStatus.entries()].map(([status, count]) => (
              <Card key={status}>
                <CardContent className="flex items-center justify-between px-5">
                  <span className="text-sm">{requestStatusLabels[status as keyof typeof requestStatusLabels]}</span>
                  <span className="font-bold tabular-nums">{formatQuantity(count)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-bold">طلبات المساعدة حسب البلدية</h2>
        {byCommune.size === 0 ? (
          <EmptyState title="لا توجد بيانات بعد" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {[...byCommune.entries()].map(([commune, count]) => (
              <Card key={commune}>
                <CardContent className="flex items-center justify-between px-5">
                  <span className="text-sm">{commune}</span>
                  <span className="font-bold tabular-nums">{formatQuantity(count)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-bold">المساعدات المسجَّلة حسب النوع</h2>
        {donationsByCategory.length === 0 ? (
          <EmptyState title="لا توجد بيانات بعد" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {donationsByCategory.map((row) => (
              <Card key={`${row.slug}-${row.unit}`}>
                <CardContent className="flex items-center justify-between px-5">
                  <span className="flex items-center gap-1 text-sm">
                    <CategoryIcon slug={row.slug} className="size-3.5" /> {row.name_ar}
                  </span>
                  <span className="font-bold tabular-nums">
                    {formatQuantity(Number(row.total_quantity))} {unitLabels[row.unit!]}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-bold">التوزيع الفعلي حسب النوع</h2>
        {distributionsByCategory.length === 0 ? (
          <EmptyState title="لا توجد بيانات بعد" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {distributionsByCategory.map((row) => (
              <Card key={`${row.slug}-${row.unit}`}>
                <CardContent className="flex items-center justify-between px-5">
                  <span className="flex items-center gap-1 text-sm">
                    <CategoryIcon slug={row.slug} className="size-3.5" /> {row.name_ar}
                  </span>
                  <span className="font-bold tabular-nums">
                    {formatQuantity(Number(row.total_quantity))} {unitLabels[row.unit!]}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
