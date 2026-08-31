"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Phone, MapPin, Stethoscope, Briefcase, Search, PawPrint } from "lucide-react";
import { findWilaya } from "@/lib/algeria-cities";
import type { AvailableLocale } from "@/i18n/locales";

export interface Volunteer {
  id: string;
  full_name: string;
  specialty: string;
  commune_id: string;
  wilaya_code?: string;
  phone: string | null;
  current_workplace?: string | null;
  can_teleconsult?: boolean;
}

export function MedicalVolunteersList({
  volunteers,
  locale = "ar",
}: {
  volunteers: Volunteer[];
  locale?: AvailableLocale;
}) {
  const isFr = locale === "fr";
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "human" | "vet">("all");

  if (!volunteers || volunteers.length === 0) {
    return null;
  }

  const filtered = volunteers.filter((v) => {
    const term = search.toLowerCase();
    const matchesSearch =
      v.full_name.toLowerCase().includes(term) ||
      v.specialty.toLowerCase().includes(term) ||
      v.commune_id.toLowerCase().includes(term);

    const isVet = v.specialty.includes("بيطر") || v.specialty.toLowerCase().includes("vet");

    if (filterType === "vet") return matchesSearch && isVet;
    if (filterType === "human") return matchesSearch && !isVet;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pt-10">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold">
          {isFr ? "Personnel médical et vétérinaire bénévole" : "الأطقم الطبية والبيطرية المتطوعة"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isFr
            ? "Annuaire des professionnels inscrits pour les interventions d'urgence et les téléconsultations"
            : "قائمة الكوادر المسجلة للتدخل السريع وتقديم الاستشارات"}
        </p>
      </div>

      {/* Search bar and filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isFr ? "Rechercher par nom, spécialité ou commune..." : "ابحث بالاسم، التخصص أو البلدية..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>

        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filterType === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted text-muted-foreground"
            }`}
          >
            {isFr ? `Tous (${volunteers.length})` : `الكل (${volunteers.length})`}
          </button>
          <button
            type="button"
            onClick={() => setFilterType("human")}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filterType === "human"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-background hover:bg-muted text-muted-foreground"
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <Stethoscope className="size-3.5" /> {isFr ? "Médecine humaine" : "طب بشري"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType("vet")}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filterType === "vet"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-background hover:bg-muted text-muted-foreground"
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <PawPrint className="size-3.5" /> {isFr ? "Médecine vétérinaire" : "طب بيطري"}
            </span>
          </button>
        </div>
      </div>

      {/* Cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((v) => (
          <Card key={v.id} className="border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-emerald-600" />
                  {v.full_name}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">{v.specialty}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>
                  {v.commune_id}
                  {v.wilaya_code ? `، ${isFr ? (findWilaya(v.wilaya_code)?.name_fr ?? v.wilaya_code) : (findWilaya(v.wilaya_code)?.name_ar ?? v.wilaya_code)}` : ""}
                </span>
              </div>
              {v.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <a href={`tel:${v.phone}`} className="text-foreground font-medium hover:underline" dir="ltr">
                    {v.phone}
                  </a>
                </div>
              )}
              {v.current_workplace && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary shrink-0" />
                  <span>{v.current_workplace}</span>
                </div>
              )}
              {v.can_teleconsult && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs mt-1">
                  {isFr ? "Téléconsultation disponible" : "متاح للاستشارة الهاتفية"}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-6">
          {isFr ? "Aucun résultat ne correspond à votre recherche." : "لا توجد نتائج مطابقة لبحثك."}
        </p>
      )}
    </div>
  );
}
