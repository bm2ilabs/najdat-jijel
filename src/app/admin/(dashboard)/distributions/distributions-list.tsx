"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatQuantity, unitLabels } from "@/lib/constants";
import { CategoryIcon } from "@/components/shared/category-icon";
import { AdminListFilter } from "@/components/admin/list-filter";
import type { Database } from "@/types/database";

type Distribution = Database["public"]["Tables"]["distributions"]["Row"] & {
  categories: { slug: string; name_ar: string } | null;
  relief_hubs: { name: string } | null;
};

export function DistributionsList({
  rows,
  hubs,
}: {
  rows: Distribution[];
  hubs: { id: string; name: string }[];
}) {
  const HUB_OPTIONS = hubs.map((h) => ({ value: h.id, label: h.name }));

  return (
    <AdminListFilter
      rows={rows}
      searchPlaceholder="ابحث بالمادة، المركز، أو المسؤول..."
      searchMatch={(d, q) =>
        (d.categories?.name_ar ?? "").toLowerCase().includes(q) ||
        (d.relief_hubs?.name ?? "").toLowerCase().includes(q) ||
        d.responsible_name.toLowerCase().includes(q)
      }
      filters={[{ label: "المركز", options: HUB_OPTIONS, match: (d, v) => d.hub_id === v }]}
      emptyTitle="لا توجد عمليات توزيع مسجَّلة بعد"
      renderRow={(d) => (
        <Card key={d.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5">
            <div>
              <p className="font-bold">
                <CategoryIcon slug={d.categories?.slug} className="inline size-3.5" />{" "}
                {formatQuantity(Number(d.quantity))} {unitLabels[d.unit]} — {d.categories?.name_ar}
              </p>
              <p className="text-sm text-muted-foreground">
                {d.relief_hubs?.name} · {d.beneficiary_family_count} أسرة مستفيدة
              </p>
              <p className="text-xs text-muted-foreground">المسؤول: {d.responsible_name}</p>
            </div>
            <span className="text-xs text-muted-foreground">{d.distribution_date}</span>
          </CardContent>
        </Card>
      )}
    />
  );
}
