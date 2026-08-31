"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pointStatusLabels, verificationLabels } from "@/lib/constants";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Database } from "@/types/database";

type Hub = Database["public"]["Tables"]["relief_hubs"]["Row"];

const columns: CsvColumn<Hub>[] = [
  { header: "الاسم", value: (h) => h.name },
  { header: "الحالة", value: (h) => pointStatusLabels[h.status] },
  { header: "التحقق", value: (h) => verificationLabels[h.verification_level] },
  { header: "الولاية", value: (h) => h.wilaya },
  { header: "البلدية", value: (h) => h.commune },
  { header: "الهاتف", value: (h) => h.phone ?? "" },
  { header: "مأوى؟", value: (h) => (h.is_shelter ? "نعم" : "لا") },
];

export function ExportReliefHubsCsvButton({ rows }: { rows: Hub[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, columns), "relief-hubs")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}
