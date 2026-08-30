import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAllCategories, getTopCriticalNeeds } from "@/lib/data/admin";
import { CreateNeedDialog } from "./create-need-dialog";
import { NeedsTable } from "./needs-table";

export const metadata: Metadata = { title: "بنك الاحتياجات الميدانية", robots: { index: false } };

export default async function AdminNeedsPage() {
  let rows: any[] = [];
  let categories: any[] = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (supabaseUrl && !supabaseUrl.includes("your-project-ref")) {
      const supabase = await createClient();
      const [{ data: needs }, cats] = await Promise.all([
        supabase
          .from("needs")
          .select("*, categories(slug, name_ar)")
          .order("created_at", { ascending: false }),
        getAllCategories(),
      ]);
      rows = needs ?? [];
      categories = cats;
    } else {
      categories = await getAllCategories();
      rows = await getTopCriticalNeeds(10);
    }
  } catch {
    categories = await getAllCategories();
    rows = await getTopCriticalNeeds(10);
  }

  if (rows.length === 0) {
    rows = await getTopCriticalNeeds(10);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">بنك الاحتياجات الميدانية</h1>
        <p className="text-xs text-muted">
          رصد وتتبع الاحتياجات الإغاثية لكل بلدية وقرية. الاحتياجات الموسومة بـ (auto) أُنشئت تلقائيًا عند انخفاض مخزون المستودعات.
        </p>
      </div>

      <NeedsTable
        initialNeeds={rows}
        categories={categories}
        actionButton={<CreateNeedDialog categories={categories} />}
      />
    </div>
  );
}
