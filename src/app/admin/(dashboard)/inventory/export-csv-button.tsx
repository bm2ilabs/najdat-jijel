"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { unitLabels } from "@/lib/constants";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Database } from "@/types/database";

type InventoryRow = Database["public"]["Tables"]["inventory_items"]["Row"] & {
  categories: { slug: string; name_ar: string } | null;
  relief_hubs: { name: string } | null;
};

const columns: CsvColumn<InventoryRow>[] = [
  { header: "المركز", value: (i) => i.relief_hubs?.name ?? "" },
  { header: "المادة", value: (i) => i.categories?.name_ar ?? "" },
  { header: "الكمية", value: (i) => `${i.quantity} ${unitLabels[i.unit]}` },
  { header: "الحد الأدنى", value: (i) => i.min_threshold },
  { header: "آخر تحديث", value: (i) => new Date(i.updated_at).toLocaleString("ar-DZ") },
];

export function ExportInventoryCsvButton({ rows }: { rows: InventoryRow[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, columns), "inventory")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}
