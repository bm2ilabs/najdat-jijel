import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AffectedAreasTable } from "./affected-areas-table";

export const metadata: Metadata = { title: "المناطق المتضررة", robots: { index: false } };

export default async function AdminAffectedAreasPage() {
  let rows: any[] = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (supabaseUrl && !supabaseUrl.includes("your-project-ref")) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("affected_areas")
        .select("*")
        .order("wilaya")
        .order("daira")
        .order("commune");
      rows = data ?? [];
    }
  } catch {
    // Keep demo data
  }

  if (rows.length === 0) {
    rows = [
      {
        id: "area-1",
        spot: "قرية تافرت العليا",
        wilaya: "جيجل",
        daira: "العوانة",
        commune: "سلمى بن زيادة",
        severity: "ravaged",
        status_raw: "انزلاقات ترابية وتضرر 12 مسكناً وانقطاع المسلك الرئيسي",
      },
      {
        id: "area-2",
        spot: "مشتة أولاد عيسى",
        wilaya: "جيجل",
        daira: "طاهير",
        commune: "الشقفة",
        severity: "evacuated",
        status_raw: "تم إجلاء 24 عائلة إلى القاعة الرياضية بعد فيضان الوادي",
      },
      {
        id: "area-3",
        spot: "حي الساحل الغربي",
        wilaya: "جيجل",
        daira: "زيامة منصورية",
        commune: "زيامة المنصورية",
        severity: "threatened",
        status_raw: "منازل مهددة بتدفق الأوحال وانهيار جزئي للجدار الساند",
      },
      {
        id: "area-4",
        spot: "دوار بني خطاب",
        wilaya: "جيجل",
        daira: "العنصر",
        commune: "العنصر",
        severity: "unconfirmed",
        status_raw: "بلاغ من مواطنين عن تسرب مياه للبيوت (قيد المعاينة الميدانية)",
      },
    ];
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">المناطق والقرى المتضررة</h1>
        <p className="text-xs text-muted">
          رصد مستمر لمستوى الضرر في القرى والمناطق. البلاغات غير المؤكدة تُعرض للعامة بوسم تحذيري واضح لحين التوثيق الميداني من فرق الرصد.
        </p>
      </div>

      <AffectedAreasTable initialAreas={rows as any} />
    </div>
  );
}
