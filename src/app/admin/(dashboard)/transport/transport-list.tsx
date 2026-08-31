"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { relativeTimeAr, vehicleLabels, transportStatusLabels } from "@/lib/constants";
import { AdminListFilter, type AdminBulkAction } from "@/components/admin/list-filter";
import { TransportStatusSelect } from "./transport-status-select";
import { updateTransportOfferStatus } from "@/actions/transport-admin";
import type { Database } from "@/types/database";

type TransportOffer = Database["public"]["Tables"]["transport_offers"]["Row"];

const STATUS_OPTIONS = Object.entries(transportStatusLabels).map(([value, label]) => ({ value, label }));

const BULK_ACTIONS: AdminBulkAction<TransportOffer>[] = [
  { label: "تأكيد", icon: CheckCircle2, run: (t) => updateTransportOfferStatus(t.id, "confirmed") },
  {
    label: "إلغاء",
    icon: XCircle,
    variant: "destructive",
    confirmMessage: "إلغاء عروض النقل المحدَّدة؟",
    run: (t) => updateTransportOfferStatus(t.id, "cancelled"),
  },
];

export function TransportList({ rows }: { rows: TransportOffer[] }) {
  return (
    <AdminListFilter
      rows={rows}
      searchPlaceholder="ابحث بالسائق، الهاتف، أو الولاية..."
      searchMatch={(t, q) =>
        t.driver_name.toLowerCase().includes(q) ||
        t.phone.includes(q) ||
        t.origin_wilaya.toLowerCase().includes(q) ||
        t.destination_wilaya.toLowerCase().includes(q)
      }
      filters={[{ label: "الحالة", options: STATUS_OPTIONS, match: (t, v) => t.status === v }]}
      getRowId={(t) => t.id}
      bulkActions={BULK_ACTIONS}
      emptyTitle="لا توجد عروض نقل مسجَّلة بعد"
      renderRow={(t) => (
        <Card key={t.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5">
            <div>
              <p className="font-bold">
                {t.driver_name} — {vehicleLabels[t.vehicle_type]}
              </p>
              <p className="text-sm text-muted-foreground" dir="ltr">
                {t.phone}
              </p>
              <p className="text-sm text-muted-foreground">
                {t.origin_wilaya} ← {t.destination_wilaya}
                {t.travel_date ? ` · ${t.travel_date}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">{relativeTimeAr(t.created_at)}</p>
            </div>
            <TransportStatusSelect id={t.id} status={t.status} />
          </CardContent>
        </Card>
      )}
    />
  );
}
