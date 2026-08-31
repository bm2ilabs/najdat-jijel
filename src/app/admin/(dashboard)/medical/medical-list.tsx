"use client";

import { Phone, Stethoscope, PawPrint, Radio, HandHelping, Briefcase, Check, X as XIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { relativeTimeAr, medicalVerificationStatusLabels } from "@/lib/constants";
import { AdminListFilter, type AdminBulkAction } from "@/components/admin/list-filter";
import { MedicalStatusSelect } from "./medical-status-select";
import { updateMedicalVolunteerStatus } from "@/actions/medical";
import type { Database } from "@/types/database";

type Volunteer = Database["public"]["Tables"]["medical_volunteers"]["Row"];

const STATUS_OPTIONS = Object.entries(medicalVerificationStatusLabels).map(([value, label]) => ({ value, label }));

const BULK_ACTIONS: AdminBulkAction<Volunteer>[] = [
  { label: "توثيق", icon: Check, run: (r) => updateMedicalVolunteerStatus(r.id, "verified") },
  {
    label: "رفض",
    icon: XIcon,
    variant: "destructive",
    confirmMessage: "رفض المتطوعين المحدَّدين؟",
    run: (r) => updateMedicalVolunteerStatus(r.id, "rejected"),
  },
];

export function MedicalList({ rows }: { rows: Volunteer[] }) {
  return (
    <AdminListFilter
      rows={rows}
      searchPlaceholder="ابحث بالاسم، التخصص، أو البلدية..."
      searchMatch={(r, q) =>
        r.full_name.toLowerCase().includes(q) ||
        r.specialty.toLowerCase().includes(q) ||
        r.commune_id.toLowerCase().includes(q)
      }
      filters={[{ label: "الحالة", options: STATUS_OPTIONS, match: (r, v) => r.status === v }]}
      getRowId={(r) => r.id}
      bulkActions={BULK_ACTIONS}
      emptyTitle="لا يوجد متطوعون مسجَّلون بعد"
      renderRow={(r) => {
        const isVet = r.specialty.includes("بيطر") || r.specialty.toLowerCase().includes("vet");
        return (
          <Card key={r.id}>
            <CardContent className="space-y-2 px-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{r.full_name}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    {isVet ? <PawPrint className="size-3.5" /> : <Stethoscope className="size-3.5" />}
                    {r.specialty}
                  </p>
                </div>
                <MedicalStatusSelect id={r.id} status={r.status} />
              </div>

              <p className="text-sm">
                {r.commune_id}، ولاية {r.wilaya_code}
                {r.current_workplace && ` — ${r.current_workplace}`}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {r.phone && (
                  <a
                    href={`tel:${r.phone.replace(/\s/g, "")}`}
                    dir="ltr"
                    className="flex items-center gap-1 font-semibold text-algeria-green hover:underline"
                  >
                    <Phone className="size-3.5" /> {r.phone}
                  </a>
                )}
                {r.license_number && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="size-3.5" /> رقم الرخصة: {r.license_number}
                  </span>
                )}
                {r.can_teleconsult && (
                  <span className="flex items-center gap-1 text-algeria-green">
                    <Radio className="size-3.5" /> استشارات هاتفية
                  </span>
                )}
                {r.can_field_intervene && (
                  <span className="flex items-center gap-1">
                    <HandHelping className="size-3.5" /> تدخل ميداني
                  </span>
                )}
              </div>

              {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}

              <p className="text-xs text-muted-foreground">
                {medicalVerificationStatusLabels[r.status]} · {relativeTimeAr(r.created_at)}
              </p>
            </CardContent>
          </Card>
        );
      }}
    />
  );
}
