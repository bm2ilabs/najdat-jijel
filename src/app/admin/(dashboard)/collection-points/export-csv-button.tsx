"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pointStatusLabels, verificationLabels } from "@/lib/constants";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Database } from "@/types/database";

type Point = Database["public"]["Tables"]["collection_points"]["Row"];

const columns: CsvColumn<Point>[] = [
  { header: "الاسم", value: (p) => p.name },
  { header: "الحالة", value: (p) => pointStatusLabels[p.status] },
  { header: "التحقق", value: (p) => verificationLabels[p.verification_level] },
  { header: "الولاية", value: (p) => p.wilaya },
  { header: "البلدية", value: (p) => p.commune },
  { header: "الهاتف", value: (p) => p.phone ?? "" },
];

export function ExportCollectionPointsCsvButton({ rows }: { rows: Point[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, columns), "collection-points")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}
