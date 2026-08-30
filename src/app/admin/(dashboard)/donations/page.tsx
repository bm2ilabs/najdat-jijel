import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DonationsTable } from "./donations-table";

export const metadata: Metadata = { title: "سجل المساعدات المسجَّلة", robots: { index: false } };

export default async function AdminDonationsPage() {
  let rows: any[] = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (supabaseUrl && !supabaseUrl.includes("your-project-ref")) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("donations")
        .select("*, donation_items(quantity, unit, categories(slug, name_ar)), collection_points(name)")
        .order("created_at", { ascending: false });
      rows = data ?? [];
    }
  } catch {
    // Keep demo data
  }

  if (rows.length === 0) {
    rows = [
      {
        id: "don-1",
        donor_name: "مؤسسة الأمل الخيرية",
        donor_phone: "0550123987",
        current_wilaya: "الجزائر",
        current_commune: "الدار البيضاء",
        needs_transport: true,
        status: "registered",
        created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        collection_points: { name: "نقطة تجميع ساحة أول ماي - الجزائر العاصمة" },
        donation_items: [
          { quantity: 200, unit: "basket", categories: { slug: "food_baskets", name_ar: "طرود غذائية" } },
          { quantity: 500, unit: "box", categories: { slug: "water", name_ar: "مياه شرب" } },
        ],
      },
      {
        id: "don-2",
        donor_name: "محسن من ولاية سطيف",
        donor_phone: "0771234567",
        current_wilaya: "سطيف",
        current_commune: "العلمة",
        needs_transport: false,
        status: "matched",
        created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        collection_points: { name: "نقطة تجميع سطيف - حي 1014 مسكن" },
        donation_items: [
          { quantity: 80, unit: "piece", categories: { slug: "blankets_mattresses", name_ar: "أفرشة وأغطية" } },
        ],
      },
      {
        id: "don-3",
        donor_name: "صيدلية البركة",
        donor_phone: "0660456789",
        current_wilaya: "قسنطينة",
        current_commune: "الخروب",
        needs_transport: false,
        status: "delivered",
        created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
        collection_points: { name: "نقطة تجميع قسنطينة المركزية" },
        donation_items: [
          { quantity: 150, unit: "piece", categories: { slug: "medicines_first_aid", name_ar: "أدوية ومستلزمات طبية" } },
        ],
      },
    ];
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">سجل المساعدات المسجَّلة</h1>
        <p className="text-xs text-muted">
          المساعدات العينية التي سجّلها المتبرعون من مختلف الولايات، مع تفاصيل المواد وحالة النقل والتسليم.
        </p>
      </div>

      <DonationsTable initialDonations={rows as any} />
    </div>
  );
}
