"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vehicleLabels, transportStatusLabels } from "@/lib/constants";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Database } from "@/types/database";

type TransportOffer = Database["public"]["Tables"]["transport_offers"]["Row"];

const columns: CsvColumn<TransportOffer>[] = [
  { header: "السائق", value: (t) => t.driver_name },
  { header: "الهاتف", value: (t) => t.phone },
  { header: "المركبة", value: (t) => vehicleLabels[t.vehicle_type] },
  { header: "الحالة", value: (t) => transportStatusLabels[t.status] },
  { header: "من", value: (t) => t.origin_wilaya },
  { header: "إلى", value: (t) => t.destination_wilaya },
  { header: "تاريخ الرحلة", value: (t) => t.travel_date ?? "" },
];

export function ExportTransportCsvButton({ rows }: { rows: TransportOffer[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, columns), "transport-offers")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}
