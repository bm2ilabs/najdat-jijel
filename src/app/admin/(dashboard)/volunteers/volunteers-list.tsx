"use client";

import {
  Phone,
  Truck,
  HeartHandshake,
  Check,
  X as XIcon,
  MapPin,
  Clock,
  Car,
  PackageCheck,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  relativeTimeAr,
  fieldVolunteerStatusLabels,
  fieldVolunteerSkillLabels,
  fieldVolunteerMobilityLabels,
  fieldVolunteerAvailabilityLabels,
  fieldVolunteerEquipmentLabels,
} from "@/lib/constants";
import {
  AdminListFilter,
  type AdminBulkAction,
} from "@/components/admin/list-filter";
import { VolunteerStatusSelect } from "./volunteer-status-select";
import { updateFieldVolunteerStatus } from "@/actions/volunteers";
import type { Database } from "@/types/database";

type Volunteer = Database["public"]["Tables"]["field_volunteers"]["Row"];

const STATUS_OPTIONS = Object.entries(fieldVolunteerStatusLabels).map(
  ([value, label]) => ({ value, label })
);

const BULK_ACTIONS: AdminBulkAction<Volunteer>[] = [
  {
    label: "توثيق واعتماد",
    icon: Check,
    run: (r) => updateFieldVolunteerStatus(r.id, "verified"),
  },
  {
    label: "تعيين في الميدان",
    icon: Truck,
    run: (r) => updateFieldVolunteerStatus(r.id, "deployed"),
  },
  {
    label: "تعطيل / غير متاح",
    icon: XIcon,
    variant: "destructive",
    confirmMessage: "تعيين حالة المتطوعين المحدَّدين كغير متاحين؟",
    run: (r) => updateFieldVolunteerStatus(r.id, "inactive"),
  },
];

export function VolunteersList({ rows }: { rows: Volunteer[] }) {
  return (
    <AdminListFilter
      rows={rows}
      searchPlaceholder="ابحث بالاسم، المهارة، البلدية، أو رقم الهاتف..."
      searchMatch={(r, q) =>
        r.full_name.toLowerCase().includes(q) ||
        r.commune_id.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        (r.skills || []).some((s) =>
          (fieldVolunteerSkillLabels[s]?.ar || s).toLowerCase().includes(q)
        )
      }
      filters={[
        {
          label: "الحالة",
          options: STATUS_OPTIONS,
          match: (r, v) => r.status === v,
        },
      ]}
      getRowId={(r) => r.id}
      bulkActions={BULK_ACTIONS}
      emptyTitle="لا يوجد متطوعون ميدانيون مسجَّلون بعد"
      renderRow={(r) => (
        <Card key={r.id} className="overflow-hidden">
          <CardContent className="space-y-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-base font-bold text-foreground">{r.full_name}</p>
                <p className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mt-0.5">
                  <MapPin className="size-3.5" />
                  <span>
                    {r.commune_id} (ولاية {r.wilaya_code})
                  </span>
                </p>
              </div>
              <VolunteerStatusSelect id={r.id} status={r.status} />
            </div>

            {/* Skills chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {(r.skills ?? []).map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-lg bg-secondary/80 px-2 py-0.5 text-xs font-semibold text-foreground"
                >
                  <PackageCheck className="size-3 text-algeria-green" />
                  <span>{fieldVolunteerSkillLabels[s]?.ar || s}</span>
                </span>
              ))}
            </div>

            {/* Mobility and Availability info */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
              {r.phone && (
                <a
                  href={`tel:${r.phone.replace(/\s/g, "")}`}
                  dir="ltr"
                  className="flex items-center gap-1 font-bold text-algeria-green hover:underline"
                >
                  <Phone className="size-3.5" /> {r.phone}
                </a>
              )}

              {r.mobility && (
                <span className="flex items-center gap-1">
                  <Car className="size-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{fieldVolunteerMobilityLabels[r.mobility]?.ar || r.mobility}</span>
                </span>
              )}

              {r.availability && (
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
                  <span>
                    {fieldVolunteerAvailabilityLabels[r.availability]?.ar ||
                      r.availability}
                  </span>
                </span>
              )}

              {r.emergency_contact && (
                <span className="flex items-center gap-1">
                  <Shield className="size-3.5 text-red-500" />
                  <span>طوارئ: {r.emergency_contact}</span>
                </span>
              )}
            </div>

            {/* Equipment */}
            {(r.equipment ?? []).length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="font-semibold">العتاد:</span>
                {(r.equipment ?? []).map((eq) => (
                  <span
                    key={eq}
                    className="rounded-md border border-border px-1.5 py-0.5"
                  >
                    {fieldVolunteerEquipmentLabels[eq]?.ar || eq}
                  </span>
                ))}
              </div>
            )}

            {r.notes && (
              <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-lg">
                {r.notes}
              </p>
            )}

            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span>{fieldVolunteerStatusLabels[r.status] || r.status}</span>
              <span>{relativeTimeAr(r.created_at)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    />
  );
}
