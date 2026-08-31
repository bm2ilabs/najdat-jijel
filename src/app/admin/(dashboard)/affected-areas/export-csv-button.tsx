"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { severityLabels } from "@/lib/constants";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Database } from "@/types/database";

type Area = Database["public"]["Tables"]["affected_areas"]["Row"];

const columns: CsvColumn<Area>[] = [
  { header: "البؤرة", value: (a) => a.spot ?? "" },
  { header: "شدة الضرر", value: (a) => severityLabels[a.severity] },
  { header: "الولاية", value: (a) => a.wilaya },
  { header: "الدائرة", value: (a) => a.daira },
  { header: "البلدية", value: (a) => a.commune },
  { header: "المصدر", value: (a) => a.source ?? "" },
];

export function ExportAffectedAreasCsvButton({ rows }: { rows: Area[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, columns), "affected-areas")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}
