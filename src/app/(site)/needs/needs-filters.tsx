"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryIcon, getCategoryLabel, getPriorityLabel, priorityIcon, type PriorityLevel } from "@/lib/constants";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";
import type { AvailableLocale } from "@/i18n/locales";

type Category = Database["public"]["Tables"]["categories"]["Row"];

const PRIORITY_KEYS: PriorityLevel[] = ["critical", "high", "medium", "low"];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-all",
        active
          ? "border-algeria-green bg-algeria-green text-algeria-green-foreground font-semibold"
          : "border-border bg-card hover:border-algeria-green/50 hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

export function NeedsFilters({
  categories,
  communes,
  locale = "ar",
  labels,
}: {
  categories: Category[];
  communes: string[];
  locale?: AvailableLocale;
  labels?: {
    priority: string;
    commune: string;
    category: string;
    clearFilters: string;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = {
    category: searchParams.get("category"),
    commune: searchParams.get("commune"),
    priority: searchParams.get("priority"),
  };
  const hasFilters = Boolean(current.category || current.commune || current.priority);

  function toggle(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) params.delete(key);
    else params.set(key, value);
    router.push(params.toString() ? `${pathname}?${params}` : pathname, { scroll: false });
  }

  const priorityHeading = labels?.priority ?? (locale === "fr" ? "Priorité" : "الأولوية");
  const communeHeading = labels?.commune ?? (locale === "fr" ? "Commune" : "البلدية");
  const categoryHeading = labels?.category ?? (locale === "fr" ? "Catégorie" : "نوع المادة");
  const clearFiltersText = labels?.clearFilters ?? (locale === "fr" ? "Effacer les filtres" : "مسح كل الفلاتر");

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold text-muted-foreground">{priorityHeading}</p>
        <div className="flex flex-wrap gap-2">
          {PRIORITY_KEYS.map((value) => {
            const Icon = priorityIcon[value];
            const label = getPriorityLabel(value, locale);
            return (
              <Chip
                key={value}
                active={current.priority === value}
                onClick={() => toggle("priority", value)}
              >
                <Icon className="size-3.5" fill="currentColor" aria-hidden /> {label}
              </Chip>
            );
          })}
        </div>
      </div>

      {communes.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">{communeHeading}</p>
          <div className="flex flex-wrap gap-2">
            {communes.map((c) => (
              <Chip key={c} active={current.commune === c} onClick={() => toggle("commune", c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold text-muted-foreground">{categoryHeading}</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const Icon = categoryIcon[c.slug] ?? Package;
            return (
              <Chip
                key={c.id}
                active={current.category === c.slug}
                onClick={() => toggle("category", c.slug)}
              >
                <Icon className="size-3.5" aria-hidden /> {getCategoryLabel(c.slug, c.name_ar, locale)}
              </Chip>
            );
          })}
        </div>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname, { scroll: false })}>
          <X className="size-4" /> {clearFiltersText}
        </Button>
      )}
    </div>
  );
}
