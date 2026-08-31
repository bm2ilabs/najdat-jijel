"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { unitLabels } from "@/lib/constants";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Database } from "@/types/database";

type Distribution = Database["public"]["Tables"]["distributions"]["Row"] & {
  categories: { slug: string; name_ar: string } | null;
  relief_hubs: { name: string } | null;
};

const columns: CsvColumn<Distribution>[] = [
  { header: "المادة", value: (d) => d.categories?.name_ar ?? "" },
  { header: "الكمية", value: (d) => `${d.quantity} ${unitLabels[d.unit]}` },
  { header: "المركز", value: (d) => d.relief_hubs?.name ?? "" },
  { header: "عدد الأسر المستفيدة", value: (d) => d.beneficiary_family_count },
  { header: "المسؤول", value: (d) => d.responsible_name },
  { header: "تاريخ التوزيع", value: (d) => d.distribution_date },
];

export function ExportDistributionsCsvButton({ rows }: { rows: Distribution[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, columns), "distributions")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}
