"use client";

import { Phone, Clock, MapPinned, Home, DoorClosed, DoorOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PointStatusBadge } from "@/components/shared/status-badge";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { relativeTimeAr, pointStatusLabels, verificationLabels } from "@/lib/constants";
import { AdminListFilter, type AdminBulkAction } from "@/components/admin/list-filter";
import { HubActions } from "./hub-actions";
import { updateReliefHubStatus } from "@/actions/points";
import type { Database } from "@/types/database";

type Hub = Database["public"]["Tables"]["relief_hubs"]["Row"];

const STATUS_OPTIONS = Object.entries(pointStatusLabels).map(([value, label]) => ({ value, label }));
const VERIFICATION_OPTIONS = Object.entries(verificationLabels).map(([value, label]) => ({ value, label }));

const BULK_ACTIONS: AdminBulkAction<Hub>[] = [
  { label: "فتح", icon: DoorOpen, run: (h) => updateReliefHubStatus(h.id, "open") },
  { label: "إغلاق", icon: DoorClosed, variant: "outline", run: (h) => updateReliefHubStatus(h.id, "closed") },
];

export function ReliefHubsList({ hubs }: { hubs: Hub[] }) {
  return (
    <AdminListFilter
      rows={hubs}
      searchPlaceholder="ابحث بالاسم، البلدية، أو الولاية..."
      searchMatch={(h, q) =>
        h.name.toLowerCase().includes(q) || h.commune.toLowerCase().includes(q) || h.wilaya.toLowerCase().includes(q)
      }
      filters={[
        { label: "الحالة", options: STATUS_OPTIONS, match: (h, v) => h.status === v },
        { label: "التحقق", options: VERIFICATION_OPTIONS, match: (h, v) => h.verification_level === v },
      ]}
      getRowId={(h) => h.id}
      bulkActions={BULK_ACTIONS}
      emptyTitle="لا توجد مراكز استقبال مسجَّلة بعد"
      listClassName="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      renderRow={(h) => (
        <Card key={h.id}>
          <CardContent className="space-y-2 px-5">
            <p className="flex items-center gap-1.5 font-bold">
              {h.is_shelter && <Home className="size-3.5 text-[#7c3aed]" />}
              {h.name}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPinned className="size-3.5 shrink-0" />
              {h.commune}، ولاية {h.wilaya}
            </p>
            {h.opening_hours && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-3.5 shrink-0" /> {h.opening_hours}
              </p>
            )}
            {h.phone && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground" dir="ltr">
                <Phone className="size-3.5 shrink-0" /> {h.phone}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <VerificationBadge level={h.verification_level} />
              <PointStatusBadge status={h.status} />
            </div>
            <HubActions id={h.id} status={h.status} verificationLevel={h.verification_level} />
            <p className="text-xs text-muted-foreground">آخر تحديث: {relativeTimeAr(h.updated_at)}</p>
          </CardContent>
        </Card>
      )}
    />
  );
}
