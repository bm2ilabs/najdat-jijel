"use client";

import { Phone, Paintbrush, Image as ImageIcon, Link2, CheckCircle2, X as XIcon } from "lucide-react";
import NextLink from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { relativeTimeAr, damageAssessmentStatusLabels } from "@/lib/constants";
import { AdminListFilter, type AdminBulkAction } from "@/components/admin/list-filter";
import { DamageAssessmentStatusSelect } from "./damage-assessment-status-select";
import { AssignArtisanSelect, type ArtisanCandidate } from "./assign-artisan-select";
import { PhotoLightbox } from "@/components/admin/photo-lightbox";
import { updateDamageAssessmentStatus } from "@/actions/damage-assessments";
import type { Database } from "@/types/database";

type Assessment = Database["public"]["Tables"]["damage_assessments"]["Row"] & {
  candidates: ArtisanCandidate[];
  photoUrls: string[];
};

const STATUS_OPTIONS = Object.entries(damageAssessmentStatusLabels).map(([value, label]) => ({
  value,
  label,
}));

const BULK_ACTIONS: AdminBulkAction<Assessment>[] = [
  { label: "تعليم كمنجَز", icon: CheckCircle2, run: (r) => updateDamageAssessmentStatus(r.id, "completed") },
  {
    label: "رفض",
    icon: XIcon,
    variant: "destructive",
    confirmMessage: "رفض التقييمات المحدَّدة؟",
    run: (r) => updateDamageAssessmentStatus(r.id, "rejected"),
  },
];

export function DamageAssessmentsList({ rows }: { rows: Assessment[] }) {
  return (
    <AdminListFilter
      rows={rows}
      searchPlaceholder="ابحث بالاسم، الهاتف، أو البلدية..."
      searchMatch={(r, q) =>
        r.full_name.toLowerCase().includes(q) || r.phone.includes(q) || r.commune.toLowerCase().includes(q)
      }
      filters={[{ label: "الحالة", options: STATUS_OPTIONS, match: (r, v) => r.status === v }]}
      getRowId={(r) => r.id}
      bulkActions={BULK_ACTIONS}
      emptyTitle="لا توجد تقييمات أضرار مسجَّلة بعد"
      renderRow={(r) => (
        <Card key={r.id}>
          <CardContent className="space-y-3 px-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-bold">{r.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {r.commune}، ولاية {r.wilaya}
                </p>
              </div>
              <DamageAssessmentStatusSelect id={r.id} status={r.status} />
            </div>

            {r.phone && (
              <a
                href={`tel:${r.phone.replace(/\s/g, "")}`}
                dir="ltr"
                className="inline-flex items-center gap-1 text-sm font-semibold text-algeria-green hover:underline"
              >
                <Phone className="size-3.5" /> {r.phone}
              </a>
            )}

            {(r.estimated_paint_liters || r.required_specialties.length > 0) && (
              <div className="rounded-lg bg-muted/60 p-3 text-sm">
                {r.estimated_paint_liters && (
                  <p className="flex items-center gap-1.5">
                    <Paintbrush className="size-3.5" />
                    تقدير الدهان: {r.estimated_paint_liters} لتر (~{r.estimated_paint_cans} بيدون)
                  </p>
                )}
                {r.required_specialties.length > 0 && (
                  <p className="mt-1 text-muted-foreground">
                    التخصصات المطلوبة: {r.required_specialties.join("، ")}
                  </p>
                )}
              </div>
            )}

            {r.linked_need_id && (
              <NextLink
                href="/admin/needs"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-algeria-green hover:underline"
              >
                <Link2 className="size-3.5" /> عرض الاحتياج المرتبط في صفحة الاحتياجات
              </NextLink>
            )}

            {r.photoUrls.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <ImageIcon className="size-3.5" /> صور الأضرار
                </p>
                <PhotoLightbox urls={r.photoUrls} />
              </div>
            )}

            {r.finishing_notes && <p className="text-xs text-muted-foreground">{r.finishing_notes}</p>}

            <div className="border-t border-border pt-3">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">إسناد حرفي متطوع</p>
              <AssignArtisanSelect
                assessmentId={r.id}
                currentArtisanId={r.assigned_artisan_id}
                candidates={r.candidates}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {damageAssessmentStatusLabels[r.status]} · {relativeTimeAr(r.created_at)}
            </p>
          </CardContent>
        </Card>
      )}
    />
  );
}
