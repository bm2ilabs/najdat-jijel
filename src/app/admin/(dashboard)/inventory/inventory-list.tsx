"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatQuantity, unitLabels } from "@/lib/constants";
import { CategoryIcon } from "@/components/shared/category-icon";
import { AdminListFilter } from "@/components/admin/list-filter";
import { ThresholdInput } from "./threshold-input";
import type { Database } from "@/types/database";

type InventoryRow = Database["public"]["Tables"]["inventory_items"]["Row"] & {
  categories: { slug: string; name_ar: string } | null;
  relief_hubs: { name: string } | null;
};

export function InventoryList({ rows, hubs }: { rows: InventoryRow[]; hubs: { id: string; name: string }[] }) {
  const HUB_OPTIONS = hubs.map((h) => ({ value: h.id, label: h.name }));

  return (
    <AdminListFilter
      rows={rows}
      searchPlaceholder="ابحث بالمادة أو المركز..."
      searchMatch={(item, q) =>
        (item.categories?.name_ar ?? "").toLowerCase().includes(q) ||
        (item.relief_hubs?.name ?? "").toLowerCase().includes(q)
      }
      filters={[{ label: "المركز", options: HUB_OPTIONS, match: (item, v) => item.hub_id === v }]}
      emptyTitle="لا يوجد مخزون مسجَّل بعد"
      renderRow={(item) => {
        const low = item.min_threshold > 0 && Number(item.quantity) < item.min_threshold;
        return (
          <Card key={item.id} className="py-0">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <CategoryIcon slug={item.categories?.slug} className="size-4" />
                  {item.categories?.name_ar}
                </span>
                <p className="text-xs text-muted-foreground">{item.relief_hubs?.name}</p>
              </div>
              <span className={low ? "text-sm font-bold text-priority-critical" : "text-sm font-bold"}>
                {formatQuantity(Number(item.quantity))} {unitLabels[item.unit]}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                الحد الأدنى:
                <ThresholdInput hubId={item.hub_id} categoryId={item.category_id} defaultValue={item.min_threshold} />
              </div>
            </CardContent>
          </Card>
        );
      }}
    />
  );
}
