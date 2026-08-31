import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAllCategories } from "@/lib/data/admin";
import { CreateNeedDialog } from "./create-need-dialog";
import { ExportNeedsCsvButton } from "./export-csv-button";
import { NeedsList } from "./needs-list";

export const metadata: Metadata = { title: "الاحتياجات", robots: { index: false } };

export default async function AdminNeedsPage() {
  const supabase = await createClient();
  const [{ data: needs }, categories] = await Promise.all([
    supabase
      .from("needs")
      .select("*, categories(slug, name_ar)")
      .order("created_at", { ascending: false }),
    getAllCategories(),
  ]);

  const rows = needs ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">الاحتياجات</h1>
          <p className="text-sm text-muted-foreground">
            الاحتياجات المُعلَّمة (auto) أُنشئت تلقائيًا من انخفاض المخزون تحت الحد الأدنى.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportNeedsCsvButton rows={rows} />
          <CreateNeedDialog categories={categories} />
        </div>
      </div>

      <NeedsList rows={rows} />
    </div>
  );
}
