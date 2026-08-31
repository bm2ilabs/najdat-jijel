import type { Metadata } from "next";
import { MaintenanceScreen } from "@/components/shared/maintenance-screen";
import { getLocale } from "@/i18n/server";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `أعمال صيانة وتحديث | ${siteConfig.name}`,
  description: "الموقع متوقف مؤقتًا لأعمال الصيانة والتحسينات التقنية.",
};

export default async function MaintenancePage() {
  const locale = await getLocale();
  return <MaintenanceScreen locale={locale} />;
}
