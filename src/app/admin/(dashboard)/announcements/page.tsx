import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AnnouncementsManager } from "./announcements-manager";

export const metadata: Metadata = { title: "شريط الأخبار العاجلة", robots: { index: false } };

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">شريط الأخبار العاجلة</h1>
        <p className="text-xs text-muted">
          الشريط الإخباري المتحرك أعلى الموقع — يُستخدم للتنبيهات العاجلة اللحظية: امتلاء نقطة تجميع، تحويل مسار قوافل، أو إغلاق مسالك جبلية.
        </p>
      </div>
      <AnnouncementsManager items={data ?? []} />
    </div>
  );
}
