"use client";

import { forwardRef } from "react";
import {
  priorityWilayas,
  otherWilayas,
  getWilayaName,
  type WilayaItem,
} from "@/lib/algeria-cities";
import type { AvailableLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

export interface WilayaSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  locale?: AvailableLocale;
  includeAllOption?: boolean;
  allOptionLabel?: string;
  className?: string;
}

export const WilayaSelect = forwardRef<HTMLSelectElement, WilayaSelectProps>(
  (
    {
      locale = "ar",
      includeAllOption = false,
      allOptionLabel,
      className,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const isFr = locale === "fr";

    return (
      <select
        ref={ref}
        value={value}
        onChange={onChange}
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors focus:border-algeria-green focus:outline-none focus:ring-2 focus:ring-algeria-green/20 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {includeAllOption && (
          <option value="all">
            {allOptionLabel ?? (isFr ? "Toutes les wilayas" : "كل الولايات")}
          </option>
        )}

        {/* 🚨 Priority Affected Wilayas */}
        <optgroup
          label={isFr ? "🚨 ZONES SINISTRÉES (PRIORITAIRES)" : "🚨 الولايات المتضررة (أولوية الإغاثة)"}
          className="font-bold text-priority-critical bg-priority-critical/5"
        >
          {priorityWilayas.map((w: WilayaItem) => (
            <option
              key={w.code}
              value={w.name_ar}
              className="font-bold text-priority-critical py-1"
            >
              {isFr
                ? `⚡ ${w.codeStr} - ${w.name_fr} (Zone sinistrée)`
                : `⚡ ${w.codeStr} - ${w.name_ar} (ولاية متضررة)`}
            </option>
          ))}
        </optgroup>

        {/* Other 65 Wilayas */}
        <optgroup
          label={isFr ? "AUTRES WILAYAS" : "باقي ولايات الوطن"}
          className="text-muted-foreground font-semibold"
        >
          {otherWilayas.map((w: WilayaItem) => (
            <option key={w.code} value={w.name_ar} className="text-foreground py-1">
              {`${w.codeStr} - ${getWilayaName(w, locale)}`}
            </option>
          ))}
        </optgroup>
      </select>
    );
  },
);

WilayaSelect.displayName = "WilayaSelect";
