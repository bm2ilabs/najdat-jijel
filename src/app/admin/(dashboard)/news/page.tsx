import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { NewsManager } from "./news-manager";

export const metadata: Metadata = { title: "الأخبار", robots: { index: false } };

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const [{ data: posts }, { data: officialUpdates }] = await Promise.all([
    supabase.from("posts").select("*").order("created_at", { ascending: false }),
    supabase.from("official_updates").select("*").order("published_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الأخبار والبيانات الرسمية</h1>
        <p className="text-sm text-muted-foreground">
          إدارة البيانات والمستجدات الميدانية الرسمية الموثقة، ومقالات وتقارير الميدان.
        </p>
      </div>
      <NewsManager posts={posts ?? []} officialUpdates={officialUpdates ?? []} />
    </div>
  );
}
