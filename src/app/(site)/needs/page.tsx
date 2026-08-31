import type { Metadata } from "next";
import { PawPrint } from "lucide-react";
import { NeedCard } from "@/components/shared/need-card";
import { EmptyState } from "@/components/shared/empty-state";
import { LinkButton } from "@/components/shared/link-button";
import { getAllActiveNeeds, getCategories } from "@/lib/data/public";
import { NeedsFilters } from "./needs-filters";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.nav.needs,
    description: t.needs.pageSubtitle,
  };
}

export default async function NeedsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; commune?: string; priority?: string }>;
}) {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const params = await searchParams;
  const [needs, categories] = await Promise.all([getAllActiveNeeds(), getCategories()]);

  const communes = [...new Set(needs.map((n) => n.commune))].sort();
  const usedCategorySlugs = new Set(needs.map((n) => n.categories?.slug).filter(Boolean));
  const relevantCategories = categories.filter((c) => usedCategorySlugs.has(c.slug));

  const filtered = needs.filter((n) => {
    if (params.category && n.categories?.slug !== params.category) return false;
    if (params.commune && n.commune !== params.commune) return false;
    if (params.priority && n.priority !== params.priority) return false;
    return true;
  });

  const veterinaryNeedsCount = needs.filter(
    (n) => n.categories?.slug === "veterinary" || n.category_id === "veterinary",
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 text-center sm:text-start">
        <h1 className="text-3xl font-extrabold">{t.needs.pageTitle}</h1>
        <p className="mt-2 text-muted-foreground">
          {t.needs.pageSubtitle}
        </p>
      </div>

      {/* ————————————————————————————————— قسم الأدوية والمستلزمات البيطرية */}
      <section className="mb-6 rounded-2xl border border-algeria-green/30 bg-algeria-green/5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-algeria-green/10 text-algeria-green">
              <PawPrint className="size-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold">{t.needs.animalMedications.title}</h2>
                <span className="rounded-full bg-algeria-green/15 px-2.5 py-0.5 text-xs font-semibold text-algeria-green">
                  {t.needs.animalMedications.badge}
                </span>
                {veterinaryNeedsCount > 0 && (
                  <span className="rounded-full bg-priority-critical/10 px-2 py-0.5 text-xs font-bold text-priority-critical">
                    {veterinaryNeedsCount} {t.needs.animalMedications.activeCount}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {t.needs.animalMedications.desc}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 sm:self-center">
            <LinkButton href="/donate?category=veterinary" size="sm">
              <PawPrint className="size-4" />
              {t.needs.animalMedications.provideBtn}
            </LinkButton>
            <LinkButton
              href={params.category === "veterinary" ? "/needs" : "/needs?category=veterinary"}
              variant="outline"
              size="sm"
            >
              {params.category === "veterinary"
                ? t.needs.animalMedications.allNeedsBtn
                : t.needs.animalMedications.filterBtn}
            </LinkButton>
          </div>
        </div>
      </section>

      <NeedsFilters
        categories={relevantCategories}
        communes={communes}
        locale={locale}
        labels={{
          priority: t.needs.filterPriority,
          commune: t.needs.filterCommune,
          category: t.needs.filterCategory,
          clearFilters: t.needs.clearFilters,
        }}
      />

      <p className="mt-6 text-sm text-muted-foreground">
        {t.needs.showingPrefix} <strong className="text-foreground">{filtered.length}</strong> {t.needs.outOf} {needs.length}{" "}
        {t.needs.activeNeedsCount}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          title={t.needs.emptyTitle}
          description={t.needs.emptyDesc}
          className="mt-4"
        />
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((need) => (
            <NeedCard key={need.id} need={need} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
