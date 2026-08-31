"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Database } from "@/types/database";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type OfficialUpdate = Database["public"]["Tables"]["official_updates"]["Row"];

const postColumns: CsvColumn<Post>[] = [
  { header: "العنوان", value: (p) => p.title },
  { header: "الحالة", value: (p) => (p.is_published ? "منشور" : "مسودة") },
  { header: "الكاتب", value: (p) => p.author_name ?? "" },
  { header: "تاريخ النشر", value: (p) => (p.published_at ? new Date(p.published_at).toLocaleString("ar-DZ") : "") },
];

const officialUpdateColumns: CsvColumn<OfficialUpdate>[] = [
  { header: "العنوان", value: (u) => u.title },
  { header: "المصدر", value: (u) => u.source },
  { header: "النوع", value: (u) => u.update_type },
  { header: "الرابط", value: (u) => u.url ?? "" },
  { header: "تاريخ النشر", value: (u) => new Date(u.published_at).toLocaleString("ar-DZ") },
];

export function ExportPostsCsvButton({ rows }: { rows: Post[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, postColumns), "news-posts")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}

export function ExportOfficialUpdatesCsvButton({ rows }: { rows: OfficialUpdate[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, officialUpdateColumns), "official-updates")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}
