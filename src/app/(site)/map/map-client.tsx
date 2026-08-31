"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Search,
  X,
  Home,
  Package,
  HeartHandshake,
  Layers,
  LayoutGrid,
  Map as MapIcon,
  RotateCcw,
  SlidersHorizontal,
  Phone,
  Navigation,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PointCard, type PointCardData } from "@/components/shared/point-card";
import { EmptyState } from "@/components/shared/empty-state";
import { campaignWilayas } from "@/config/site";
import { WilayaSelect } from "@/components/ui/wilaya-select";
import { CommuneSelect } from "@/components/ui/commune-select";
import { PointStatusBadge } from "@/components/shared/status-badge";
import { VerificationBadge } from "@/components/shared/verification-badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { priorityWilayas, getCommunesByWilaya } from "@/lib/algeria-cities";
import type { AvailableLocale } from "@/i18n/locales";
import { cn } from "@/lib/utils";

const ReliefMap = dynamic(
  () => import("@/components/map/relief-map").then((m) => m.ReliefMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-muted/40 border border-border min-h-[420px]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-algeria-green border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">جاري تحميل الخريطة التفاعلية...</p>
        </div>
      </div>
    ),
  },
);

type KindFilter = "all" | "shelter" | "relief_hub" | "collection_point";

export function MapClient({
  points,
  locale = "ar",
}: {
  points: PointCardData[];
  locale?: AvailableLocale;
}) {
  const isFr = locale === "fr";

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedKind, setSelectedKind] = useState<KindFilter>("all");
  const [selectedWilaya, setSelectedWilaya] = useState<string>("all");
  const [selectedCommune, setSelectedCommune] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // View States
  const [viewMode, setViewMode] = useState<"split" | "map" | "grid">("split");
  const [mobileTab, setMobileTab] = useState<"map" | "list">("map");

  const availableCommunes = useMemo(() => {
    if (selectedWilaya === "all") return [];
    return getCommunesByWilaya(selectedWilaya);
  }, [selectedWilaya]);

  const handleWilayaChange = (wilaya: string) => {
    setSelectedWilaya(wilaya);
    setSelectedCommune("all");
  };

  // Filter Logic
  const filteredPoints = useMemo(() => {
    const q = search.trim().toLowerCase();

    return points.filter((p) => {
      // Kind Filter
      if (selectedKind !== "all" && p.kind !== selectedKind) return false;

      // Wilaya Filter
      if (selectedWilaya !== "all" && p.wilaya !== selectedWilaya) return false;

      // Commune Filter
      if (selectedCommune !== "all") {
        const normCommune = (p.commune || "").trim().toLowerCase();
        const normSelected = selectedCommune.trim().toLowerCase();
        if (
          normCommune !== normSelected &&
          !normCommune.includes(normSelected) &&
          !normSelected.includes(normCommune)
        ) {
          return false;
        }
      }

      // Status Filter
      if (selectedStatus !== "all" && p.status !== selectedStatus) return false;

      // Search Query Filter
      if (q) {
        const inName = p.name.toLowerCase().includes(q);
        const inCommune = p.commune.toLowerCase().includes(q);
        const inWilaya = p.wilaya.toLowerCase().includes(q);
        const inAddress = p.address ? p.address.toLowerCase().includes(q) : false;
        const inCats = p.acceptedCategories ? p.acceptedCategories.some((c) => c.toLowerCase().includes(q)) : false;
        if (!inName && !inCommune && !inWilaya && !inAddress && !inCats) {
          return false;
        }
      }

      return true;
    });
  }, [points, search, selectedKind, selectedWilaya, selectedCommune, selectedStatus]);

  // Dynamic Counts
  const counts = useMemo(() => {
    return {
      all: points.length,
      shelters: points.filter((p) => p.kind === "shelter").length,
      reliefHubs: points.filter((p) => p.kind === "relief_hub").length,
      collectionPoints: points.filter((p) => p.kind === "collection_point").length,
    };
  }, [points]);

  const selectedPoint = useMemo(() => {
    if (!selectedPointId) return null;
    return points.find((p) => p.id === selectedPointId) ?? null;
  }, [points, selectedPointId]);

  const activeFilterCount =
    (selectedKind !== "all" ? 1 : 0) +
    (selectedWilaya !== "all" ? 1 : 0) +
    (selectedCommune !== "all" ? 1 : 0) +
    (selectedStatus !== "all" ? 1 : 0) +
    (search.trim() !== "" ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setSelectedKind("all");
    setSelectedWilaya("all");
    setSelectedCommune("all");
    setSelectedStatus("all");
    setSelectedPointId(null);
  }, []);

  const handleSelectPointFromList = useCallback((point: PointCardData) => {
    setSelectedPointId(point.id);
    setMobileTab("map");
    // Scroll map into view on mobile
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      window.scrollTo({ top: 180, behavior: "smooth" });
    }
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Category Metric Cards (Horizontal snap on mobile, Grid on desktop) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible no-scrollbar">
        {/* All Points */}
        <button
          type="button"
          onClick={() => setSelectedKind("all")}
          className={cn(
            "flex shrink-0 items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 sm:flex-col sm:p-4 text-start sm:text-center transition-all cursor-pointer min-h-[44px]",
            selectedKind === "all"
              ? "border-foreground bg-foreground/10 shadow-sm ring-2 ring-foreground/20 font-bold"
              : "border-border bg-card hover:border-foreground/40",
          )}
        >
          <div className="flex size-7 sm:size-9 items-center justify-center rounded-xl bg-foreground/10 text-foreground">
            <Layers className="size-4 sm:size-4.5" />
          </div>
          <div className="flex sm:flex-col items-baseline sm:items-center gap-1.5 sm:gap-0">
            <span className="text-sm sm:text-2xl font-black tabular-nums">{counts.all}</span>
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              {isFr ? "Tous les points" : "كل النقاط"}
            </span>
          </div>
        </button>

        {/* Shelters */}
        <button
          type="button"
          onClick={() => setSelectedKind(selectedKind === "shelter" ? "all" : "shelter")}
          className={cn(
            "flex shrink-0 items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 sm:flex-col sm:p-4 text-start sm:text-center transition-all cursor-pointer min-h-[44px]",
            selectedKind === "shelter"
              ? "border-[#7c3aed] bg-[#7c3aed]/10 shadow-sm ring-2 ring-[#7c3aed]/30 font-bold"
              : "border-border bg-card hover:border-[#7c3aed]/50",
          )}
        >
          <div className="flex size-7 sm:size-9 items-center justify-center rounded-xl bg-[#7c3aed]/15 text-[#7c3aed]">
            <Home className="size-4 sm:size-4.5" />
          </div>
          <div className="flex sm:flex-col items-baseline sm:items-center gap-1.5 sm:gap-0">
            <span className="text-sm sm:text-2xl font-black tabular-nums text-[#7c3aed]">{counts.shelters}</span>
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              {isFr ? "Centres d'hébergement" : "مراكز الإيواء"}
            </span>
          </div>
        </button>

        {/* Relief Hubs */}
        <button
          type="button"
          onClick={() => setSelectedKind(selectedKind === "relief_hub" ? "all" : "relief_hub")}
          className={cn(
            "flex shrink-0 items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 sm:flex-col sm:p-4 text-start sm:text-center transition-all cursor-pointer min-h-[44px]",
            selectedKind === "relief_hub"
              ? "border-[#1d4ed8] bg-[#1d4ed8]/10 shadow-sm ring-2 ring-[#1d4ed8]/30 font-bold"
              : "border-border bg-card hover:border-[#1d4ed8]/50",
          )}
        >
          <div className="flex size-7 sm:size-9 items-center justify-center rounded-xl bg-[#1d4ed8]/15 text-[#1d4ed8]">
            <HeartHandshake className="size-4 sm:size-4.5" />
          </div>
          <div className="flex sm:flex-col items-baseline sm:items-center gap-1.5 sm:gap-0">
            <span className="text-sm sm:text-2xl font-black tabular-nums text-[#1d4ed8]">{counts.reliefHubs}</span>
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              {isFr ? "Centres d'accueil" : "مراكز الاستقبال"}
            </span>
          </div>
        </button>

        {/* Collection Points */}
        <button
          type="button"
          onClick={() => setSelectedKind(selectedKind === "collection_point" ? "all" : "collection_point")}
          className={cn(
            "flex shrink-0 items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 sm:flex-col sm:p-4 text-start sm:text-center transition-all cursor-pointer min-h-[44px]",
            selectedKind === "collection_point"
              ? "border-[#00843D] bg-[#00843D]/10 shadow-sm ring-2 ring-[#00843D]/30 font-bold"
              : "border-border bg-card hover:border-[#00843D]/50",
          )}
        >
          <div className="flex size-7 sm:size-9 items-center justify-center rounded-xl bg-[#00843D]/15 text-[#00843D]">
            <Package className="size-4 sm:size-4.5" />
          </div>
          <div className="flex sm:flex-col items-baseline sm:items-center gap-1.5 sm:gap-0">
            <span className="text-sm sm:text-2xl font-black tabular-nums text-[#00843D]">{counts.collectionPoints}</span>
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              {isFr ? "Points de collecte" : "نقاط التجميع"}
            </span>
          </div>
        </button>
      </div>

      {/* 2. Unified Search, Filter & View Mode Bar */}
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isFr
                  ? "Rechercher par nom, commune, wilaya ou matériel..."
                  : "ابحث بالاسم، البلدية، الحي، أو نوع المساعدات..."
              }
              className="h-11 rounded-xl bg-background/80 px-10 text-sm shadow-inner"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground rtl:left-3.5 rtl:right-auto ltr:right-3.5 ltr:left-auto cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Desktop Filter Dropdowns */}
          <div className="hidden sm:flex flex-wrap items-center gap-2">
            <WilayaSelect
              locale={locale}
              includeAllOption={true}
              value={selectedWilaya}
              onChange={(e) => handleWilayaChange(e.target.value)}
              className="w-auto min-w-[160px] cursor-pointer"
            />

            {selectedWilaya !== "all" && (
              <CommuneSelect
                wilaya={selectedWilaya}
                locale={locale}
                includeAllOption={true}
                value={selectedCommune}
                onChange={(e) => setSelectedCommune(e.target.value)}
                className="w-auto min-w-[160px] cursor-pointer animate-in fade-in"
              />
            )}

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-algeria-green cursor-pointer"
            >
              <option value="all">{isFr ? "Tous les statuts" : "كل الحالات"}</option>
              <option value="open">{isFr ? "Ouvert / Reçoit" : "مفتوح / يستقبل"}</option>
              <option value="full">{isFr ? "Complet" : "ممتلئ"}</option>
              <option value="paused">{isFr ? "En pause" : "متوقف مؤقتاً"}</option>
            </select>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-11 rounded-xl text-xs font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive gap-1.5 cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>{isFr ? "Réinitialiser" : "مسح"}</span>
              </Button>
            )}
          </div>

          {/* Mobile Filter Button (Opens Bottom Sheet) */}
          <div className="flex sm:hidden items-center gap-2">
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    className="flex-1 h-11 rounded-xl font-bold justify-between px-4 text-xs"
                  />
                }
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-algeria-green" />
                  <span>{isFr ? "Filtres avancés" : "تصفية متقدمة (ولاية، بلدية، حالة)"}</span>
                </div>
                {activeFilterCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-algeria-green text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </SheetTrigger>

              <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] p-6 space-y-4">
                <SheetHeader className="pb-2 border-b border-border text-start">
                  <SheetTitle className="text-lg font-bold">
                    {isFr ? "Filtrer les centres et points" : "تصفية المراكز ونقاط الإغاثة"}
                  </SheetTitle>
                </SheetHeader>

                <div className="space-y-3.5 overflow-y-auto max-h-[55vh] py-2">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground mb-1.5 block">
                      {isFr ? "Wilaya" : "الولاية"}
                    </label>
                    <WilayaSelect
                      locale={locale}
                      includeAllOption={true}
                      value={selectedWilaya}
                      onChange={(e) => handleWilayaChange(e.target.value)}
                      className="w-full h-12 text-sm rounded-xl"
                    />
                  </div>

                  {selectedWilaya !== "all" && (
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1.5 block">
                        {isFr ? "Commune" : "البلدية"}
                      </label>
                      <CommuneSelect
                        wilaya={selectedWilaya}
                        locale={locale}
                        includeAllOption={true}
                        value={selectedCommune}
                        onChange={(e) => setSelectedCommune(e.target.value)}
                        className="w-full h-12 text-sm rounded-xl"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-muted-foreground mb-1.5 block">
                      {isFr ? "Statut du centre" : "حالة الاستقبال"}
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full h-12 rounded-xl border border-border bg-background px-3 text-sm font-medium"
                    >
                      <option value="all">{isFr ? "Tous les statuts" : "كل الحالات"}</option>
                      <option value="open">{isFr ? "مفتوح / يستقبل" : "مفتوح / يستقبل"}</option>
                      <option value="full">{isFr ? "ممتلئ" : "ممتلئ"}</option>
                      <option value="paused">{isFr ? "متوقف مؤقتاً" : "متوقف مؤقتاً"}</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={handleResetFilters}
                      className="h-12 rounded-xl text-xs font-bold flex-1"
                    >
                      {isFr ? "Effacer" : "مسح الفلاتر"}
                    </Button>
                  )}
                  <SheetClose
                    render={
                      <Button className="h-12 rounded-xl text-xs font-bold flex-1 bg-algeria-green text-white" />
                    }
                  >
                    {isFr ? "Appliquer" : "عرض النتائج"}
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleResetFilters}
                className="size-11 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <RotateCcw className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Priority Affected Wilayas Quick Chips Bar (Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
          <span className="text-xs font-bold text-priority-critical flex items-center gap-1 shrink-0">
            <span className="inline-block size-2 rounded-full bg-priority-critical animate-pulse" />
            {isFr ? "Zones prioritaires :" : "أولوية الإغاثة:"}
          </span>
          {priorityWilayas.map((pw) => {
            const active = selectedWilaya === pw.name_ar;
            return (
              <button
                key={pw.code}
                type="button"
                onClick={() => handleWilayaChange(active ? "all" : pw.name_ar)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer border min-h-[34px]",
                  active
                    ? "bg-priority-critical text-white border-priority-critical shadow-xs scale-105"
                    : "bg-priority-critical/10 text-priority-critical border-priority-critical/30 hover:bg-priority-critical/20",
                )}
              >
                <span>⚡</span>
                <span>{isFr ? `${pw.codeStr} - ${pw.name_fr}` : `${pw.codeStr} - ${pw.name_ar}`}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Commune Chips Bar when a specific Wilaya is active */}
        {selectedWilaya !== "all" && availableCommunes.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 animate-in fade-in">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 shrink-0">
              <span>📍</span>
              <span>{isFr ? "Communes :" : "البلديات:"}</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedCommune("all")}
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer border min-h-[34px]",
                selectedCommune === "all"
                  ? "bg-algeria-green text-white border-algeria-green shadow-xs"
                  : "bg-muted/70 text-foreground border-border hover:bg-muted"
              )}
            >
              {isFr ? "Toutes" : "كل البلديات"}
            </button>
            {availableCommunes.slice(0, 18).map((c) => {
              const active = selectedCommune === c.name_ar;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCommune(active ? "all" : c.name_ar)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer border min-h-[34px]",
                    active
                      ? "bg-algeria-green text-white border-algeria-green shadow-xs scale-105"
                      : "bg-background text-foreground border-border hover:border-algeria-green/50 hover:bg-algeria-green/5"
                  )}
                >
                  <span>{isFr ? c.name_fr : c.name_ar}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 3. Sticky View Switcher & Result Count */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-bold text-foreground tabular-nums text-sm">
              {filteredPoints.length}
            </span>
            <span>{isFr ? "points trouvés" : "نقطة ومركز متاح"}</span>
          </div>

          {/* Mobile Big Segmented Control */}
          <div className="flex lg:hidden rounded-xl bg-muted p-1 border border-border/80">
            <button
              type="button"
              onClick={() => setMobileTab("map")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all min-h-[36px] cursor-pointer",
                mobileTab === "map"
                  ? "bg-background text-foreground shadow-xs scale-102"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <MapIcon className="size-3.5 text-algeria-green" />
              <span>{isFr ? "Carte" : "الخريطة"}</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all min-h-[36px] cursor-pointer",
                mobileTab === "list"
                  ? "bg-background text-foreground shadow-xs scale-102"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="size-3.5 text-algeria-green" />
              <span>{isFr ? "Liste" : "القائمة"}</span>
              <span className="rounded-full bg-algeria-green/15 text-algeria-green px-1.5 py-0.2 text-[10px] font-black">
                {filteredPoints.length}
              </span>
            </button>
          </div>

          {/* Desktop View Switcher */}
          <div className="hidden lg:flex items-center gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-all cursor-pointer",
                viewMode === "split"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={isFr ? "Vue combinée (Carte & Liste)" : "عرض مدمج (خريطة + قائمة)"}
            >
              <SlidersHorizontal className="size-3.5" />
              <span>{isFr ? "Split" : "عرض مدمج"}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-all cursor-pointer",
                viewMode === "map"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={isFr ? "Carte seule" : "الخريطة فقط"}
            >
              <MapIcon className="size-3.5" />
              <span>{isFr ? "Carte" : "الخريطة"}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-all cursor-pointer",
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={isFr ? "Grille seule" : "البطاقات فقط"}
            >
              <LayoutGrid className="size-3.5" />
              <span>{isFr ? "Grille" : "البطاقات"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Responsive Display Area */}
      {filteredPoints.length === 0 ? (
        <EmptyState
          title={isFr ? "Aucun point ne correspond à vos critères" : "لم يتم العثور على أي نقاط مطابقة"}
          description={
            isFr
              ? "Essayez d'élargir votre recherche ou de réinitialiser les filtres."
              : "جرب تغيير مصطلحات البحث أو إعادة تعيين الفلاتر لعرض كافة النقاط."
          }
        />
      ) : (
        <>
          {/* Mobile Display: Tabbed with Floating Marker Card Overlay */}
          <div className="block lg:hidden">
            {mobileTab === "map" ? (
              <div className="relative space-y-3">
                {/* Full-Height Responsive Map Container */}
                <div className="relative h-[calc(100dvh-270px)] min-h-[460px] w-full rounded-2xl overflow-hidden border border-border shadow-xs">
                  <ReliefMap
                    points={filteredPoints}
                    selectedPointId={selectedPointId}
                    onSelectPoint={(p) => setSelectedPointId(p.id)}
                    locale={locale}
                  />

                  {/* Floating Action Hint */}
                  {!selectedPoint && (
                    <div className="absolute top-3 inset-x-3 pointer-events-none flex justify-center z-10">
                      <div className="rounded-full bg-background/90 backdrop-blur px-3.5 py-1 text-[11px] font-bold text-muted-foreground shadow-md border border-border">
                        {isFr ? "Touchez un marqueur pour voir les détails" : "اضغط على أي علامة في الخريطة لعرض التفاصيل"}
                      </div>
                    </div>
                  )}

                  {/* Interactive Floating Bottom Preview Sheet on Map */}
                  {selectedPoint && (
                    <div className="absolute bottom-3 inset-x-3 z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="rounded-2xl border border-border/80 bg-background/98 backdrop-blur p-4 shadow-xl space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <PointStatusBadge status={selectedPoint.status} locale={locale} />
                              <VerificationBadge level={selectedPoint.verificationLevel} locale={locale} />
                            </div>
                            <h3 className="text-sm font-black text-foreground">{selectedPoint.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <span className="font-bold text-foreground">ولاية {selectedPoint.wilaya}</span>
                              <span>•</span>
                              <span>بلدية {selectedPoint.commune}</span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedPointId(null)}
                            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                            aria-label="إغلاق"
                          >
                            <X className="size-4" />
                          </button>
                        </div>

                        {/* Quick 1-Tap Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {selectedPoint.phone ? (
                            <a
                              href={`tel:${selectedPoint.phone}`}
                              className="flex items-center justify-center gap-2 rounded-xl bg-algeria-green text-white h-11 px-3 text-xs font-bold shadow-xs active:scale-95 transition-transform"
                            >
                              <Phone className="size-4" />
                              <span>{isFr ? "Appeler" : "اتصال مباشر"}</span>
                            </a>
                          ) : (
                            <div className="flex items-center justify-center rounded-xl bg-muted text-muted-foreground h-11 px-3 text-[11px] font-semibold">
                              {isFr ? "Sans téléphone" : "لا يوجد هاتف"}
                            </div>
                          )}

                          <a
                            href={
                              selectedPoint.lat != null && selectedPoint.lng != null
                                ? `https://www.google.com/maps/dir/?api=1&destination=${selectedPoint.lat},${selectedPoint.lng}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    `${selectedPoint.name} ${selectedPoint.commune} ${selectedPoint.wilaya}`
                                  )}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted h-11 px-3 text-xs font-bold shadow-xs active:scale-95 transition-transform"
                          >
                            <Navigation className="size-4 text-algeria-green" />
                            <span>{isFr ? "Itinéraire" : "الاتجاهات GPS"}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-3.5 sm:grid-cols-2">
                {filteredPoints.map((p) => (
                  <PointCard
                    key={`${p.kind}-${p.id}`}
                    point={p}
                    locale={locale}
                    isSelected={selectedPointId === p.id}
                    onShowOnMap={handleSelectPointFromList}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop Display: Split / Map Focus / Grid Focus */}
          <div className="hidden lg:block">
            {viewMode === "split" && (
              <div className="grid grid-cols-12 gap-6 items-start">
                {/* Scrollable Cards Sidebar */}
                <div className="col-span-5 max-h-[750px] overflow-y-auto space-y-4 pr-1 pl-1">
                  {filteredPoints.map((p) => (
                    <div
                      key={`${p.kind}-${p.id}`}
                      onClick={() => setSelectedPointId(p.id)}
                      className="transition-transform"
                    >
                      <PointCard
                        point={p}
                        locale={locale}
                        isSelected={selectedPointId === p.id}
                        onShowOnMap={handleSelectPointFromList}
                      />
                    </div>
                  ))}
                </div>

                {/* Sticky Interactive Map */}
                <div className="col-span-7 sticky top-20 h-[750px]">
                  <ReliefMap
                    points={filteredPoints}
                    selectedPointId={selectedPointId}
                    onSelectPoint={(p) => setSelectedPointId(p.id)}
                    locale={locale}
                  />
                </div>
              </div>
            )}

            {viewMode === "map" && (
              <div className="h-[750px] w-full">
                <ReliefMap
                  points={filteredPoints}
                  selectedPointId={selectedPointId}
                  onSelectPoint={(p) => setSelectedPointId(p.id)}
                  locale={locale}
                />
              </div>
            )}

            {viewMode === "grid" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPoints.map((p) => (
                  <PointCard
                    key={`${p.kind}-${p.id}`}
                    point={p}
                    locale={locale}
                    isSelected={selectedPointId === p.id}
                    onShowOnMap={handleSelectPointFromList}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

