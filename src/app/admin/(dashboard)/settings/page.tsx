import type { Metadata } from "next";
import { Sliders, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { activeCampaignSlug, siteConfig } from "@/config/site";
import { CampaignForm } from "./campaign-form";

export const metadata: Metadata = { title: "إعدادات المنصة والحملة", robots: { index: false } };

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("slug", activeCampaignSlug)
    .maybeSingle();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">إعدادات المنصة والحملة</h1>
        <p className="text-xs text-muted">
          إدارة معايير الحملة الإغاثية النشطة، الهوية البصرية، وأرقام الطوارئ وغرفة العمليات.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="size-4 text-action" />
              <span>الحملة الإغاثية النشطة</span>
            </CardTitle>
            <CardDescription>
              تعديل تفاصيل الحملة الحالية، الولايات المعنية، وأهداف الإغاثة
            </CardDescription>
          </CardHeader>
          <CardContent>
            {campaign ? (
              <CampaignForm campaign={campaign} />
            ) : (
              <p className="text-xs text-muted">لا توجد حملة نشطة مضبوطة حاليًا.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-verified" />
              <span>هوية ومعلومات المنصة</span>
            </CardTitle>
            <CardDescription>
              إعدادات الاسم الرسمي، الروابط، وأرقام الطوارئ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="rounded-lg border border-border bg-surface-2/40 p-3 space-y-1.5">
              <p className="text-muted">الاسم الكامل للمنصة:</p>
              <p className="font-bold text-foreground text-sm">{siteConfig.name}</p>
            </div>

            <div className="rounded-lg border border-border bg-surface-2/40 p-3 space-y-1.5">
              <p className="text-muted">الاسم المختصر:</p>
              <p className="font-bold text-foreground text-sm">{siteConfig.shortName}</p>
            </div>

            <div className="rounded-lg border border-border bg-surface-2/40 p-3 space-y-1.5">
              <p className="text-muted">الرابط العام:</p>
              <p className="font-mono text-foreground font-semibold" dir="ltr">{siteConfig.url}</p>
            </div>

            <p className="text-[11px] text-muted leading-relaxed">
              يمكن ضبط متغيرات الهوية وشعار المنصة ورابط النشر من خلال ملف الإعداد{" "}
              <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-foreground">
                src/config/site.ts
              </code>{" "}
              أو عبر متغير البيئة{" "}
              <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-foreground">
                NEXT_PUBLIC_SITE_NAME
              </code>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
