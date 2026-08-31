import type { Metadata } from "next";
import { FieldVolunteerForm } from "./field-volunteer-form";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { getPublicCollectionPoints, getPublicReliefHubs } from "@/lib/data/public";
import { HeartHandshake, ShieldAlert, Users, Sparkles, MapPin } from "lucide-react";
import Link from "next/link";
import { LinkButton } from "@/components/shared/link-button";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.fieldVolunteers.pageTitle,
    description: t.fieldVolunteers.pageSubtitle,
  };
}

export default async function VolunteersPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";

  const [collectionPoints, reliefHubs] = await Promise.all([
    getPublicCollectionPoints(),
    getPublicReliefHubs(),
  ]);

  const activePoints = [
    ...collectionPoints.map((p) => ({
      id: p.id,
      name: p.name,
      commune: p.commune,
      wilaya: p.wilaya,
      phone: p.phone,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
    })),
    ...reliefHubs.map((h) => ({
      id: h.id,
      name: h.name,
      commune: h.commune,
      wilaya: h.wilaya,
      phone: h.phone,
      address: h.address,
      lat: h.lat,
      lng: h.lng,
    })),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-algeria-green/30 bg-algeria-green/10 px-3.5 py-1 text-xs font-bold text-algeria-green shadow-xs">
          <Users className="size-3.5" />
          <span>{t.fieldVolunteers.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          {t.fieldVolunteers.pageTitle}
        </h1>
        <p className="mx-auto max-w-xl text-xs sm:text-base leading-relaxed text-muted-foreground">
          {t.fieldVolunteers.pageSubtitle}
        </p>
      </div>

      {/* Coordination Context Notice */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <ShieldAlert className="size-6" />
        </span>
        <div className="space-y-1.5 text-start">
          <h2 className="text-sm sm:text-base font-bold text-foreground">
            {t.fieldVolunteers.introTitle}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t.fieldVolunteers.introDesc}
          </p>
        </div>
      </div>

      {/* Main Registration Form */}
      <FieldVolunteerForm locale={locale} activePoints={activePoints} />

      {/* Additional Quick Actions */}
      <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-center gap-3">
        <LinkButton href="/map" variant="outline" size="sm" className="font-bold gap-1.5">
          <MapPin className="size-3.5 text-algeria-green" />
          <span>{t.fieldVolunteers.mapBtn}</span>
        </LinkButton>
        <LinkButton href="/donate" variant="outline" size="sm" className="font-bold">
          <span>{t.cta.haveAid}</span>
        </LinkButton>
      </div>
    </div>
  );
}
