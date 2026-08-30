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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PointCard, type PointCardData } from "@/components/shared/point-card";
import { EmptyState } from "@/components/shared/empty-state";
import { campaignWilayas } from "@/config/site";
import { WilayaSelect } from "@/components/ui/wilaya-select";
import { priorityWilayas } from "@/lib/algeria-cities";
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
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // View States
  const [viewMode, setViewMode] = useState<"split" | "map" | "grid">("split");
  const [mobileTab, setMobileTab] = useState<"map" | "list">("map");

  // Filter Logic
  const filteredPoints = useMemo(() => {
    const q = search.trim().toLowerCase();

    return points.filter((p) => {
      // Kind Filter
      if (selectedKind !== "all" && p.kind !== selectedKind) return false;

      // Wilaya Filter
      if (selectedWilaya !== "all" && p.wilaya !== selectedWilaya) return false;

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
  }, [points, search, selectedKind, selectedWilaya, selectedStatus]);

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

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedKind !== "all" ||
    selectedWilaya !== "all" ||
    selectedStatus !== "all";

  const handleResetFilters = useCallback(() => {
    setSearch("");
    setSelectedKind("all");
    setSelectedWilaya("all");
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
    <div className="space-y-6">
      {/* 1. Interactive Metric Cards / Quick Kind Filter */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* All Points */}
        <button
          type="button"
          onClick={() => setSelectedKind("all")}
          className={cn(
            "group relative flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all cursor-pointer",
            selectedKind === "all"
              ? "border-foreground bg-foreground/5 shadow-md ring-2 ring-foreground/20"
              : "border-border bg-card/60 hover:border-foreground/40 hover:bg-card",
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-foreground/10 text-foreground group-hover:scale-105 transition-transform">
            <Layers className="size-5" />
          </div>
          <span className="mt-2 text-2xl font-black tabular-nums">{counts.all}</span>
          <span className="text-xs font-semibold text-muted-foreground">
            {isFr ? "Tous les points" : "كل النقاط"}
          </span>
        </button>

        {/* Shelters */}
        <button
          type="button"
          onClick={() => setSelectedKind(selectedKind === "shelter" ? "all" : "shelter")}
          className={cn(
            "group relative flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all cursor-pointer",
            selectedKind === "shelter"
              ? "border-[#7c3aed] bg-[#7c3aed]/10 shadow-md ring-2 ring-[#7c3aed]/30"
              : "border-border bg-card/60 hover:border-[#7c3aed]/50 hover:bg-card",
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#7c3aed]/15 text-[#7c3aed] group-hover:scale-105 transition-transform">
            <Home className="size-5" />
          </div>
          <span className="mt-2 text-2xl font-black tabular-nums text-[#7c3aed]">{counts.shelters}</span>
          <span className="text-xs font-semibold text-muted-foreground">
            {isFr ? "Centres d'hébergement" : "مراكز الإيواء"}
          </span>
        </button>

        {/* Relief Hubs */}
        <button
          type="button"
          onClick={() => setSelectedKind(selectedKind === "relief_hub" ? "all" : "relief_hub")}
          className={cn(
            "group relative flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all cursor-pointer",
            selectedKind === "relief_hub"
              ? "border-[#1d4ed8] bg-[#1d4ed8]/10 shadow-md ring-2 ring-[#1d4ed8]/30"
              : "border-border bg-card/60 hover:border-[#1d4ed8]/50 hover:bg-card",
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#1d4ed8]/15 text-[#1d4ed8] group-hover:scale-105 transition-transform">
            <HeartHandshake className="size-5" />
          </div>
          <span className="mt-2 text-2xl font-black tabular-nums text-[#1d4ed8]">{counts.reliefHubs}</span>
          <span className="text-xs font-semibold text-muted-foreground">
            {isFr ? "Centres d'accueil" : "مراكز الاستقبال"}
          </span>
        </button>

        {/* Collection Points */}
        <button
          type="button"
          onClick={() => setSelectedKind(selectedKind === "collection_point" ? "all" : "collection_point")}
          className={cn(
            "group relative flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all cursor-pointer",
            selectedKind === "collection_point"
              ? "border-[#00843D] bg-[#00843D]/10 shadow-md ring-2 ring-[#00843D]/30"
              : "border-border bg-card/60 hover:border-[#00843D]/50 hover:bg-card",
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#00843D]/15 text-[#00843D] group-hover:scale-105 transition-transform">
            <Package className="size-5" />
          </div>
          <span className="mt-2 text-2xl font-black tabular-nums text-[#00843D]">{counts.collectionPoints}</span>
          <span className="text-xs font-semibold text-muted-foreground">
            {isFr ? "Points de collecte" : "نقاط التجميع"}
          </span>
        </button>
      </div>

      {/* 2. Unified Search, Filter & View Mode Bar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground rtl:right-3.5 ltr:left-3.5 ltr:right-auto" />
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
                className="absolute left-3.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground rtl:left-3.5 rtl:right-auto ltr:right-3.5 ltr:left-auto cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Wilaya Filter Dropdown / Select with All 69 Wilayas */}
          <div className="flex flex-wrap items-center gap-2">
            <WilayaSelect
              locale={locale}
              includeAllOption={true}
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="w-auto min-w-[170px] cursor-pointer"
            />

            {/* Status Filter */}
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

            {/* Reset Button */}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-11 rounded-xl text-xs font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive gap-1.5 cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>{isFr ? "Réinitialiser" : "مسح الفلاتر"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Priority Affected Wilayas Quick Chips Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-priority-critical flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-priority-critical animate-pulse" />
            {isFr ? "Zones sinistrées prioritaires :" : "الولايات المتضررة (أولوية الإغاثة) :"}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {priorityWilayas.map((pw) => {
              const active = selectedWilaya === pw.name_ar;
              return (
                <button
                  key={pw.code}
                  type="button"
                  onClick={() => setSelectedWilaya(active ? "all" : pw.name_ar)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer border",
                    active
                      ? "bg-priority-critical text-white border-priority-critical shadow-sm scale-105"
                      : "bg-priority-critical/10 text-priority-critical border-priority-critical/30 hover:bg-priority-critical/20 hover:border-priority-critical/50",
                  )}
                >
                  <span>⚡</span>
                  <span>{isFr ? `${pw.codeStr} - ${pw.name_fr}` : `${pw.codeStr} - ${pw.name_ar}`}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Mobile View Switcher & Result Count */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-bold text-foreground tabular-nums text-sm">
              {filteredPoints.length}
            </span>
            <span>{isFr ? "points trouvés" : "نقطة ومركز متاح"}</span>
          </div>

          {/* Mobile Tabs */}
          <div className="flex lg:hidden rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setMobileTab("map")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                mobileTab === "map"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <MapIcon className="size-3.5" />
              <span>{isFr ? "Carte" : "الخريطة"}</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                mobileTab === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="size-3.5" />
              <span>{isFr ? "Liste" : "القائمة"}</span>
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
          {/* Mobile Display: Tabbed */}
          <div className="block lg:hidden">
            {mobileTab === "map" ? (
              <div className="space-y-4">
                <div className="relative h-[65vh] min-h-[440px] w-full">
                  <ReliefMap
                    points={filteredPoints}
                    selectedPointId={selectedPointId}
                    onSelectPoint={(p) => setSelectedPointId(p.id)}
                    locale={locale}
                  />
                </div>

                {/* Floating Preview Card on Mobile when a pin is tapped */}
                {selectedPoint && (
                  <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                    <PointCard
                      point={selectedPoint}
                      locale={locale}
                      isSelected={true}
                      onShowOnMap={handleSelectPointFromList}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
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

