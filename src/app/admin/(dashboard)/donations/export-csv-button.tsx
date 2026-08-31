"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { donationStatusLabels, unitLabels } from "@/lib/constants";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Database } from "@/types/database";

type Donation = Database["public"]["Tables"]["donations"]["Row"] & {
  donation_items: {
    quantity: number;
    unit: Database["public"]["Enums"]["unit_type"];
    categories: { slug: string; name_ar: string } | null;
  }[];
  collection_points: { name: string } | null;
};

const columns: CsvColumn<Donation>[] = [
  { header: "اسم المتبرع", value: (d) => d.donor_name ?? "" },
  { header: "الهاتف", value: (d) => d.donor_phone ?? "" },
  { header: "الحالة", value: (d) => donationStatusLabels[d.status] },
  { header: "الولاية", value: (d) => d.current_wilaya ?? "" },
  { header: "البلدية", value: (d) => d.current_commune ?? "" },
  {
    header: "المواد",
    value: (d) =>
      d.donation_items?.map((it) => `${it.categories?.name_ar ?? ""} ${it.quantity} ${unitLabels[it.unit]}`).join("؛ ") ?? "",
  },
  { header: "نقطة التسليم", value: (d) => d.collection_points?.name ?? "" },
  { header: "تاريخ التسجيل", value: (d) => new Date(d.created_at).toLocaleString("ar-DZ") },
];

export function ExportDonationsCsvButton({ rows }: { rows: Donation[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, columns), "donations")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}
