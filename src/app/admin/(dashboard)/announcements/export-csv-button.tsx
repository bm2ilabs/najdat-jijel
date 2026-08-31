"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Database } from "@/types/database";

type Announcement = Database["public"]["Tables"]["announcements"]["Row"];

const columns: CsvColumn<Announcement>[] = [
  { header: "الرسالة", value: (a) => a.message },
  { header: "الحالة", value: (a) => (a.is_active ? "مفعّلة" : "متوقفة") },
  { header: "تاريخ الإنشاء", value: (a) => new Date(a.created_at).toLocaleString("ar-DZ") },
];

export function ExportAnnouncementsCsvButton({ rows }: { rows: Announcement[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, columns), "announcements")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}
