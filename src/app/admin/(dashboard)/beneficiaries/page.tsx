import type { Metadata } from "next";
import { Copy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ExportBeneficiariesCsvButton } from "./export-csv-button";
import { BeneficiariesList } from "./beneficiaries-list";

export const metadata: Metadata = { title: "الأسر المتضررة", robots: { index: false } };

/** رقم الهاتف بدون مسافات أو رموز، للمقارنة فقط — لا يُستخدم للعرض. */
function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export default async function AdminBeneficiariesPage() {
  const supabase = await createClient();
  // بيانات حساسة: نطلب فقط الأعمدة التي تعرضها البطاقات أو يصدّرها ملف CSV.
  // الأعمدة النصية الحرة (address_note, injuries_note, medical_note, other_needs_note,
  // internal_notes) لا تُعرض هنا إطلاقًا، ومع `select("*")` كانت تُرسَل رغم ذلك إلى
  // المتصفح عبر خصائص مكوّن التصدير، وهو مكوّن عميل.
  const { data } = await supabase
    .from("beneficiary_requests")
    .select(
      "id, full_name, phone, wilaya, commune, family_members_count, children_count, is_housing_habitable, has_injuries, needs_medical, needed_categories, status, verification_level, priority, created_at",
    )
    .order("created_at", { ascending: false });

  const rows = data ?? [];

  const phoneCounts = new Map<string, number>();
  for (const r of rows) {
    const key = normalizePhone(r.phone);
    if (!key) continue;
    phoneCounts.set(key, (phoneCounts.get(key) ?? 0) + 1);
  }
  const duplicatePhonesCount = [...phoneCounts.values()].filter((c) => c > 1).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">الأسر المتضررة</h1>
          <p className="text-sm text-muted-foreground">
            بيانات حساسة — لا تُعرض للعامة إطلاقًا. تظهر هنا فقط للطاقم المصرَّح له.
          </p>
        </div>
        <ExportBeneficiariesCsvButton rows={rows} />
      </div>

      {duplicatePhonesCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-priority-medium/30 bg-priority-medium/5 px-4 py-3 text-sm">
          <Copy className="size-4 shrink-0 text-priority-medium" />
          <span>
            <strong className="text-foreground">{duplicatePhonesCount}</strong> رقم هاتف مسجَّل في أكثر
            من طلب — تحقّق من كونها نفس الأسرة قبل مضاعفة المساعدة.
          </span>
        </div>
      )}

      <BeneficiariesList rows={rows} />
    </div>
  );
}
