"use client";

import { forwardRef, useMemo } from "react";
import { getCommunesByWilaya, type CommuneItem } from "@/lib/algeria-cities";
import type { AvailableLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

export interface CommuneSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  wilaya?: string | number;
  locale?: AvailableLocale;
  includeAllOption?: boolean;
  allOptionLabel?: string;
  className?: string;
}

export const CommuneSelect = forwardRef<HTMLSelectElement, CommuneSelectProps>(
  (
    {
      wilaya,
      locale = "ar",
      includeAllOption = false,
      allOptionLabel,
      className,
      value,
      onChange,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isFr = locale === "fr";

    const communes = useMemo(() => {
      if (!wilaya || wilaya === "all") return [];
      return getCommunesByWilaya(wilaya).sort((a, b) =>
        isFr ? a.name_fr.localeCompare(b.name_fr) : a.name_ar.localeCompare(b.name_ar),
      );
    }, [wilaya, isFr]);

    const isDisabled = disabled || !wilaya || wilaya === "all" || communes.length === 0;

    return (
      <select
        ref={ref}
        value={value}
        onChange={onChange}
        disabled={isDisabled}
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors focus:border-algeria-green focus:outline-none focus:ring-2 focus:ring-algeria-green/20 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {includeAllOption && (
          <option value="all">
            {allOptionLabel ?? (isFr ? "Toutes les communes" : "كل البلديات")}
          </option>
        )}

        {!wilaya || wilaya === "all" ? (
          <option value="" disabled>
            {isFr ? "Veuillez d'abord choisir une wilaya..." : "يرجى اختيار الولاية أولاً..."}
          </option>
        ) : (
          communes.map((c: CommuneItem) => (
            <option key={c.id} value={c.name_ar}>
              {isFr ? `${c.name_fr} (${c.daira_fr})` : `${c.name_ar} (دائرة ${c.daira_ar})`}
            </option>
          ))
        )}
      </select>
    );
  },
);

CommuneSelect.displayName = "CommuneSelect";
