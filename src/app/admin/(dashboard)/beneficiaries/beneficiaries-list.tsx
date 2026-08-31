"use client";

import { House, Bandage, Pill, Copy, CheckCircle2, Archive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { needCategoryOptions } from "@/schemas/beneficiary-request";
import { relativeTimeAr, requestStatusLabels, priorityLabels } from "@/lib/constants";
import { AdminListFilter, type AdminBulkAction } from "@/components/admin/list-filter";
import { BeneficiaryActions } from "./beneficiary-actions";
import { updateBeneficiaryStatus } from "@/actions/beneficiaries";
import type { Database } from "@/types/database";

type Row = Pick<
  Database["public"]["Tables"]["beneficiary_requests"]["Row"],
  | "id"
  | "full_name"
  | "phone"
  | "wilaya"
  | "commune"
  | "family_members_count"
  | "children_count"
  | "is_housing_habitable"
  | "has_injuries"
  | "needs_medical"
  | "needed_categories"
  | "status"
  | "verification_level"
  | "priority"
  | "created_at"
>;

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

const STATUS_OPTIONS = Object.entries(requestStatusLabels).map(([value, label]) => ({ value, label }));
const PRIORITY_OPTIONS = Object.entries(priorityLabels).map(([value, label]) => ({ value, label }));

const BULK_ACTIONS: AdminBulkAction<Row>[] = [
  { label: "تمت المساعدة", icon: CheckCircle2, run: (r) => updateBeneficiaryStatus(r.id, "helped") },
  { label: "إغلاق", icon: Archive, variant: "outline", run: (r) => updateBeneficiaryStatus(r.id, "closed") },
];

export function BeneficiariesList({ rows }: { rows: Row[] }) {
  const categoryLabel = (slug: string) => needCategoryOptions.find((o) => o.value === slug)?.label ?? slug;

  const phoneCounts = new Map<string, number>();
  for (const r of rows) {
    const key = normalizePhone(r.phone);
    if (!key) continue;
    phoneCounts.set(key, (phoneCounts.get(key) ?? 0) + 1);
  }

  return (
    <AdminListFilter
      rows={rows}
      searchPlaceholder="ابحث بالاسم، الهاتف، أو البلدية..."
      searchMatch={(r, q) =>
        r.full_name.toLowerCase().includes(q) || r.phone.includes(q) || r.commune.toLowerCase().includes(q)
      }
      filters={[
        { label: "الحالة", options: STATUS_OPTIONS, match: (r, v) => r.status === v },
        { label: "الأولوية", options: PRIORITY_OPTIONS, match: (r, v) => r.priority === v },
      ]}
      getRowId={(r) => r.id}
      bulkActions={BULK_ACTIONS}
      emptyTitle="لا توجد طلبات مسجَّلة بعد"
      renderRow={(r) => {
        const dupCount = phoneCounts.get(normalizePhone(r.phone)) ?? 1;
        return (
          <Card key={r.id} className={dupCount > 1 ? "border-priority-medium/40" : undefined}>
            <CardContent className="space-y-2 px-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{r.full_name}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    {r.phone}
                  </p>
                  {dupCount > 1 && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-priority-medium">
                      <Copy className="size-3.5" /> نفس الرقم مسجَّل في {dupCount} طلبات
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={r.priority} />
                  <VerificationBadge level={r.verification_level} />
                </div>
              </div>

              <p className="text-sm">
                {r.commune}، ولاية {r.wilaya} — {r.family_members_count} أفراد ({r.children_count} أطفال)
              </p>

              <div className="flex flex-wrap gap-1.5">
                {r.needed_categories.map((c) => (
                  <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {categoryLabel(c)}
                  </span>
                ))}
              </div>

              {(r.has_injuries || r.needs_medical || r.is_housing_habitable === false) && (
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-priority-critical">
                  {r.is_housing_habitable === false && (
                    <span className="flex items-center gap-1">
                      <House className="size-3.5" /> السكن غير صالح
                    </span>
                  )}
                  {r.has_injuries && (
                    <span className="flex items-center gap-1">
                      <Bandage className="size-3.5" /> توجد إصابات
                    </span>
                  )}
                  {r.needs_medical && (
                    <span className="flex items-center gap-1">
                      <Pill className="size-3.5" /> حاجة طبية
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <BeneficiaryActions
                  id={r.id}
                  status={r.status}
                  priority={r.priority}
                  verificationLevel={r.verification_level}
                />
                <span className="text-xs text-muted-foreground">
                  {requestStatusLabels[r.status]} · {relativeTimeAr(r.created_at)}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      }}
    />
  );
}
