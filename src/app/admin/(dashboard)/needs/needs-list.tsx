"use client";

import { CheckCircle2, Ban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { formatQuantity, relativeTimeAr, unitLabels, priorityLabels, needStatusLabels } from "@/lib/constants";
import { CategoryIcon } from "@/components/shared/category-icon";
import { AdminListFilter, type AdminBulkAction } from "@/components/admin/list-filter";
import { NeedActions } from "./need-actions";
import { updateNeedStatus } from "@/actions/needs";
import type { Database } from "@/types/database";

type Need = Database["public"]["Tables"]["needs"]["Row"] & {
  categories: { slug: string; name_ar: string } | null;
};

const PRIORITY_OPTIONS = Object.entries(priorityLabels).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = Object.entries(needStatusLabels).map(([value, label]) => ({ value, label }));

const BULK_ACTIONS: AdminBulkAction<Need>[] = [
  { label: "تمت التلبية", icon: CheckCircle2, run: (n) => updateNeedStatus(n.id, "resolved") },
  { label: "تعليم كمنتهٍ", icon: Ban, variant: "outline", run: (n) => updateNeedStatus(n.id, "expired") },
];

export function NeedsList({ rows }: { rows: Need[] }) {
  return (
    <AdminListFilter
      rows={rows}
      searchPlaceholder="ابحث بالعنوان، النوع، أو البلدية..."
      searchMatch={(n, q) =>
        (n.title ?? "").toLowerCase().includes(q) ||
        (n.categories?.name_ar ?? "").toLowerCase().includes(q) ||
        n.commune.toLowerCase().includes(q) ||
        n.wilaya.toLowerCase().includes(q)
      }
      filters={[
        { label: "الأولوية", options: PRIORITY_OPTIONS, match: (n, v) => n.priority === v },
        { label: "الحالة", options: STATUS_OPTIONS, match: (n, v) => n.status === v },
      ]}
      getRowId={(n) => n.id}
      bulkActions={BULK_ACTIONS}
      emptyTitle="لا توجد احتياجات مسجَّلة بعد"
      renderRow={(n) => (
        <Card key={n.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CategoryIcon slug={n.categories?.slug} className="size-4" />
                <p className="font-bold">{n.title || n.categories?.name_ar}</p>
                {n.is_auto_generated && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    auto
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {n.commune}، ولاية {n.wilaya} — {formatQuantity(Number(n.quantity_available))}/
                {formatQuantity(Number(n.quantity_needed))} {unitLabels[n.unit]}
              </p>
              <p className="text-xs text-muted-foreground">آخر تحديث: {relativeTimeAr(n.updated_at)}</p>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={n.priority} />
              <NeedActions id={n.id} priority={n.priority} status={n.status} />
            </div>
          </CardContent>
        </Card>
      )}
    />
  );
}
