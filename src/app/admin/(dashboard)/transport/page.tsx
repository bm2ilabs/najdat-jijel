import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { TransportTable } from "./transport-table";

export const metadata: Metadata = { title: "أسطول النقل والشحن", robots: { index: false } };

export default async function AdminTransportPage() {
  let rows: any[] = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (supabaseUrl && !supabaseUrl.includes("your-project-ref")) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("transport_offers")
        .select("*")
        .order("created_at", { ascending: false });
      rows = data ?? [];
    }
  } catch {
    // Keep demo data
  }

  if (rows.length === 0) {
    rows = [
      {
        id: "tr-1",
        driver_name: "عمر خليل (شاحنة تبريد)",
        phone: "0555667788",
        vehicle_type: "truck",
        origin_wilaya: "الجزائر",
        destination_wilaya: "جيجل",
        travel_date: new Date().toISOString().slice(0, 10),
        status: "in_transit",
        notes: "محملة بـ 400 طرد غذائي في اتجاه بلدية جيجل",
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
      {
        id: "tr-2",
        driver_name: "توفيق بن عيسى (فورغون)",
        phone: "0666778899",
        vehicle_type: "van",
        origin_wilaya: "سطيف",
        destination_wilaya: "جيجل",
        travel_date: new Date().toISOString().slice(0, 10),
        status: "confirmed",
        notes: "نقل مستلزمات طبية وأفرشة إلى مستودع الطاهير",
        created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      },
      {
        id: "tr-3",
        driver_name: "فاروق دراجي (شاحنة كبيرة 10 طن)",
        phone: "0777889900",
        vehicle_type: "large_truck",
        origin_wilaya: "قسنطينة",
        destination_wilaya: "جيجل",
        travel_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        status: "requested",
        notes: "مستعد لتحميل مياه شرب ومواد تنظيف",
        created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      },
    ];
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">أسطول النقل والشحن</h1>
        <p className="text-xs text-muted">
          السائقون المتطوعون والمركبات المتاحة لنقل وتوصيل المساعدات الإغاثية من نقاط التجميع إلى ولايات ومراكز الحملة.
        </p>
      </div>

      <TransportTable initialOffers={rows as any} />
    </div>
  );
}
