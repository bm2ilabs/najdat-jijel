import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { NewsManager } from "./news-manager";

export const metadata: Metadata = { title: "مدونة المستجدات الميدانية", robots: { index: false } };

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">مدونة المستجدات الميدانية</h1>
        <p className="text-xs text-muted">
          بيانات وتقارير دورية ينشرها فريق التنسيق والإعلام للرأي العام والمتبرعين والمنظمات الشريكة.
        </p>
      </div>
      <NewsManager posts={data ?? []} />
    </div>
  );
}
