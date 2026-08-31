"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { needCategoryOptions } from "@/schemas/beneficiary-request";
import { priorityLabels, requestStatusLabels, verificationLabels } from "@/lib/constants";
import { buildCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import type { Database } from "@/types/database";

// هذا مكوّن عميل: كل حقل هنا يُرسَل فعليًا إلى المتصفح. لذلك نقصر النوع على الأعمدة
// التي يصدّرها الملف فقط، فيمنع المدقّق أي إضافة لعمود حسّاس دون قصد.
type BeneficiaryRow = Pick<
  Database["public"]["Tables"]["beneficiary_requests"]["Row"],
  | "full_name"
  | "phone"
  | "wilaya"
  | "commune"
  | "family_members_count"
  | "children_count"
  | "needed_categories"
  | "priority"
  | "verification_level"
  | "status"
  | "is_housing_habitable"
  | "has_injuries"
  | "needs_medical"
  | "created_at"
>;

const columns: CsvColumn<BeneficiaryRow>[] = [
  { header: "الاسم الكامل", value: (r) => r.full_name },
  { header: "الهاتف", value: (r) => r.phone },
  { header: "الولاية", value: (r) => r.wilaya },
  { header: "البلدية", value: (r) => r.commune },
  { header: "عدد أفراد الأسرة", value: (r) => r.family_members_count },
  { header: "عدد الأطفال", value: (r) => r.children_count },
  {
    header: "الاحتياجات",
    value: (r) =>
      (r.needed_categories ?? [])
        .map((c) => needCategoryOptions.find((o) => o.value === c)?.label ?? c)
        .join(" / "),
  },
  { header: "الأولوية", value: (r) => priorityLabels[r.priority] ?? r.priority },
  { header: "حالة التحقق", value: (r) => verificationLabels[r.verification_level] ?? r.verification_level },
  { header: "حالة الطلب", value: (r) => requestStatusLabels[r.status] ?? r.status },
  {
    header: "السكن صالح؟",
    value: (r) => (r.is_housing_habitable === null || r.is_housing_habitable === undefined ? "غير معروف" : r.is_housing_habitable ? "نعم" : "لا"),
  },
  { header: "توجد إصابات", value: (r) => (r.has_injuries ? "نعم" : "لا") },
  { header: "حاجة طبية", value: (r) => (r.needs_medical ? "نعم" : "لا") },
  { header: "تاريخ التسجيل", value: (r) => r.created_at ? new Date(r.created_at).toLocaleString("ar-DZ") : "" },
];

export function ExportBeneficiariesCsvButton({ rows }: { rows: BeneficiaryRow[] }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadCsv(buildCsv(rows, columns), "beneficiaries")}
      disabled={rows.length === 0}
    >
      <Download className="size-4" /> تصدير CSV
    </Button>
  );
}

