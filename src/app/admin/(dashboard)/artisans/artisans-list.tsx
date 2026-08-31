"use client";

import { Phone, HardHat, Truck, Wrench, Check, X as XIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { relativeTimeAr, artisanVerificationStatusLabels } from "@/lib/constants";
import { AdminListFilter, type AdminBulkAction } from "@/components/admin/list-filter";
import { ArtisanStatusSelect } from "./artisan-status-select";
import { updateArtisanVolunteerStatus } from "@/actions/artisans";
import type { Database } from "@/types/database";

type Artisan = Database["public"]["Tables"]["artisan_volunteers"]["Row"];

const STATUS_OPTIONS = Object.entries(artisanVerificationStatusLabels).map(([value, label]) => ({ value, label }));

const BULK_ACTIONS: AdminBulkAction<Artisan>[] = [
  { label: "توثيق", icon: Check, run: (r) => updateArtisanVolunteerStatus(r.id, "verified") },
  {
    label: "رفض",
    icon: XIcon,
    variant: "destructive",
    confirmMessage: "رفض الحرفيين المحدَّدين؟",
    run: (r) => updateArtisanVolunteerStatus(r.id, "rejected"),
  },
];

export function ArtisansList({ rows }: { rows: Artisan[] }) {
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
      emptyTitle="لا يوجد حرفيون مسجَّلون بعد"
      renderRow={(r) => (
        <Card key={r.id}>
          <CardContent className="space-y-2 px-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-bold">{r.full_name}</p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <HardHat className="size-3.5" />
                  {r.specialty}
                </p>
              </div>
              <ArtisanStatusSelect id={r.id} status={r.status} />
            </div>

            <p className="text-sm">
              {r.commune_id}، ولاية {r.wilaya_code}
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
              {r.can_travel && (
                <span className="flex items-center gap-1 text-algeria-green">
                  <Truck className="size-3.5" /> يمكنه التنقل
                </span>
              )}
              {r.has_own_tools && (
                <span className="flex items-center gap-1">
                  <Wrench className="size-3.5" /> يملك أدواته
                </span>
              )}
            </div>

            {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}

            <p className="text-xs text-muted-foreground">
              {artisanVerificationStatusLabels[r.status]} · {relativeTimeAr(r.created_at)}
            </p>
          </CardContent>
        </Card>
      )}
    />
  );
}
