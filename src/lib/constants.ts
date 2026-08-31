import {
  Circle,
  Flame,
  Droplet,
  Utensils,
  Shirt,
  BedDouble,
  Baby,
  ShowerHead,
  Pill,
  PawPrint,
  CookingPot,
  Package,
  Tent,
  Construction,
  HardHat,
  Tag,
  type LucideIcon,
} from "lucide-react";
import type { Database } from "@/types/database";
import type { AvailableLocale } from "@/i18n/locales";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type VerificationLevel = Database["public"]["Enums"]["verification_level"];
export type PriorityLevel = Database["public"]["Enums"]["priority_level"];
export type RequestStatus = Database["public"]["Enums"]["request_status"];
export type PointStatus = Database["public"]["Enums"]["point_status"];
export type TransportStatus = Database["public"]["Enums"]["transport_status"];
export type InventoryTxnType = Database["public"]["Enums"]["inventory_txn_type"];
export type SourceType = Database["public"]["Enums"]["source_type"];
export type UnitType = Database["public"]["Enums"]["unit_type"];
export type VehicleType = Database["public"]["Enums"]["vehicle_type"];
export type DonationStatus = Database["public"]["Enums"]["donation_status"];
export type NeedStatus = Database["public"]["Enums"]["need_status"];
export type AffectedSeverity = Database["public"]["Enums"]["affected_severity"];

export const priorityLabels: Record<PriorityLevel, string> = {
  critical: "حرج",
  high: "عالٍ",
  medium: "متوسط",
  low: "منخفض",
};

export const localizedPriorityLabels: Record<AvailableLocale, Record<PriorityLevel, string>> = {
  ar: { critical: "حرج", high: "عالٍ", medium: "متوسط", low: "منخفض" },
  fr: { critical: "Critique", high: "Élevé", medium: "Moyen", low: "Faible" },
};

export function getPriorityLabel(priority: PriorityLevel, locale: AvailableLocale = "ar"): string {
  return localizedPriorityLabels[locale]?.[priority] ?? priorityLabels[priority];
}

/** أيقونة موحّدة (نقطة ملوّنة) — اللون يأتي من text-priority-* في المكوّن. */
export const priorityIcon: Record<PriorityLevel, LucideIcon> = {
  critical: Circle,
  high: Circle,
  medium: Circle,
  low: Circle,
};

export const priorityEmoji: Record<PriorityLevel, string> = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🟢",
};

export const verificationLabels: Record<VerificationLevel, string> = {
  unverified: "غير موثق",
  pending: "قيد التحقق",
  verified: "موثق",
  field_verified: "موثق ميدانيًا",
};

export const localizedVerificationLabels: Record<AvailableLocale, Record<VerificationLevel, string>> = {
  ar: {
    unverified: "غير موثق",
    pending: "قيد التحقق",
    verified: "موثق",
    field_verified: "موثق ميدانيًا",
  },
  fr: {
    unverified: "Non vérifié",
    pending: "En cours",
    verified: "Vérifié",
    field_verified: "Vérifié sur le terrain",
  },
};

export function getVerificationLabel(
  level: VerificationLevel,
  locale: AvailableLocale = "ar",
): string {
  return localizedVerificationLabels[locale]?.[level] ?? verificationLabels[level];
}

/** أيقونة موحّدة (نقطة ملوّنة) — اللون يأتي من text-verify-* في المكوّن. */
export const verificationIcon: Record<VerificationLevel, LucideIcon> = {
  unverified: Circle,
  pending: Circle,
  verified: Circle,
  field_verified: Circle,
};

export const verificationEmoji: Record<VerificationLevel, string> = {
  unverified: "⚪",
  pending: "🟡",
  verified: "🟢",
  field_verified: "🔵",
};

export const requestStatusLabels: Record<RequestStatus, string> = {
  pending: "قيد الانتظار",
  under_review: "قيد المراجعة",
  verified: "تم التحقق",
  partially_helped: "مساعدة جزئية",
  helped: "تمت المساعدة",
  closed: "مغلق",
  rejected: "مرفوض",
};

export const localizedRequestStatusLabels: Record<AvailableLocale, Record<RequestStatus, string>> = {
  ar: {
    pending: "قيد الانتظار",
    under_review: "قيد المراجعة",
    verified: "تم التحقق",
    partially_helped: "مساعدة جزئية",
    helped: "تمت المساعدة",
    closed: "مغلق",
    rejected: "مرفوض",
  },
  fr: {
    pending: "En attente",
    under_review: "En révision",
    verified: "Vérifié",
    partially_helped: "Aide partielle",
    helped: "Aidé",
    closed: "Fermé",
    rejected: "Rejeté",
  },
};

export function getRequestStatusLabel(
  status: RequestStatus,
  locale: AvailableLocale = "ar",
): string {
  return localizedRequestStatusLabels[locale]?.[status] ?? requestStatusLabels[status];
}

export const pointStatusLabels: Record<PointStatus, string> = {
  open: "مفتوحة",
  full: "ممتلئة",
  paused: "متوقفة مؤقتًا",
  closed: "مغلقة",
};

export const localizedPointStatusLabels: Record<AvailableLocale, Record<PointStatus, string>> = {
  ar: {
    open: "مفتوحة",
    full: "ممتلئة",
    paused: "متوقفة مؤقتًا",
    closed: "مغلقة",
  },
  fr: {
    open: "Ouvert",
    full: "Complet",
    paused: "En pause",
    closed: "Fermé",
  },
};

export function getPointStatusLabel(status: PointStatus, locale: AvailableLocale = "ar"): string {
  return localizedPointStatusLabels[locale]?.[status] ?? pointStatusLabels[status];
}

export const transportStatusLabels: Record<TransportStatus, string> = {
  requested: "مطلوب",
  matched: "تمت المطابقة",
  confirmed: "مؤكَّد",
  in_transit: "في الطريق",
  delivered: "تم التسليم",
  cancelled: "ملغى",
};

export const localizedTransportStatusLabels: Record<AvailableLocale, Record<TransportStatus, string>> = {
  ar: {
    requested: "مطلوب",
    matched: "تمت المطابقة",
    confirmed: "مؤكَّد",
    in_transit: "في الطريق",
    delivered: "تم التسليم",
    cancelled: "ملغى",
  },
  fr: {
    requested: "Demandé",
    matched: "Attribué",
    confirmed: "Confirmé",
    in_transit: "En route",
    delivered: "Livré",
    cancelled: "Annulé",
  },
};

export function getTransportStatusLabel(
  status: TransportStatus,
  locale: AvailableLocale = "ar",
): string {
  return localizedTransportStatusLabels[locale]?.[status] ?? transportStatusLabels[status];
}

export const sourceTypeLabels: Record<SourceType, string> = {
  field_team: "فريق ميداني",
  organization: "جمعية",
  municipality: "بلدية",
  official: "جهة رسمية",
  volunteer: "متطوع",
  public_report: "بلاغ عام",
};

export const unitLabels: Record<UnitType, string> = {
  piece: "قطعة",
  box: "صندوق",
  portion: "حصة",
  carton: "كرتون",
  liter: "لتر",
  kg: "كيلوغرام",
  ton: "طن",
  bundle: "طرد",
  person: "شخص",
};

export const localizedUnitLabels: Record<AvailableLocale, Record<UnitType, string>> = {
  ar: {
    piece: "قطعة",
    box: "صندوق",
    portion: "حصة",
    carton: "كرتون",
    liter: "لتر",
    kg: "كيلوغرام",
    ton: "طن",
    bundle: "طرد",
    person: "شخص",
  },
  fr: {
    piece: "pièce",
    box: "boîte",
    portion: "portion",
    carton: "carton",
    liter: "litre",
    kg: "kg",
    ton: "tonne",
    bundle: "colis",
    person: "personne",
  },
};

export function getUnitLabel(unit: UnitType | string | null | undefined, locale: AvailableLocale = "ar"): string {
  if (!unit) return "";
  if (unit in (localizedUnitLabels[locale] || {})) {
    return localizedUnitLabels[locale][unit as UnitType];
  }
  return unitLabels[unit as UnitType] ?? unit;
}

export const vehicleLabels: Record<VehicleType, string> = {
  car: "سيارة",
  van: "فان",
  small_truck: "شاحنة صغيرة",
  medium_truck: "شاحنة متوسطة",
  large_truck: "شاحنة كبيرة",
  trailer: "مقطورة",
};

export const localizedVehicleLabels: Record<AvailableLocale, Record<VehicleType, string>> = {
  ar: {
    car: "سيارة",
    van: "فان",
    small_truck: "شاحنة صغيرة",
    medium_truck: "شاحنة متوسطة",
    large_truck: "شاحنة كبيرة",
    trailer: "مقطورة",
  },
  fr: {
    car: "Voiture",
    van: "Fourgonnette",
    small_truck: "Petit camion",
    medium_truck: "Camion moyen",
    large_truck: "Grand camion",
    trailer: "Semi-remorque",
  },
};

export function getVehicleLabel(type: VehicleType, locale: AvailableLocale = "ar"): string {
  return localizedVehicleLabels[locale]?.[type] ?? vehicleLabels[type];
}

export const donationStatusLabels: Record<DonationStatus, string> = {
  registered: "مسجَّلة",
  matched: "تمت المطابقة",
  delivered: "تم التسليم",
  cancelled: "ملغاة",
};

export const needStatusLabels: Record<NeedStatus, string> = {
  active: "نشط",
  resolved: "تمت التلبية",
  expired: "منتهي",
};

export const roleLabels: Record<AppRole, string> = {
  admin: "مدير",
  coordinator: "منسّق",
  volunteer: "متطوع",
  verified_organization: "جمعية موثقة",
  donor: "متبرع",
  driver: "سائق",
  beneficiary: "مستفيد",
};

// يجب أن تطابق slugs جدول categories في قاعدة البيانات (migration 0009)
export const categoryIcon: Record<string, LucideIcon> = {
  water: Droplet,
  food: Utensils,
  clothing: Shirt,
  blankets: BedDouble,
  baby_supplies: Baby,
  hygiene: ShowerHead,
  medical: Pill,
  veterinary: PawPrint,
  kitchenware: CookingPot,
  relief_materials: Package,
  shelter: Tent,
  construction_materials: Construction,
  cooking_gas: Flame,
  manpower: HardHat,
  other: Tag,
};

export const categoryEmoji: Record<string, string> = {
  water: "💧",
  food: "🍚",
  food_baskets: "🍲",
  clothing: "👕",
  blankets: "🛏️",
  blankets_mattresses: "🛏️",
  baby_supplies: "🍼",
  hygiene: "🧼",
  medical: "💊",
  medicines_first_aid: "💊",
  kitchenware: "🍳",
  cooking_supplies: "🍳",
  relief_materials: "📦",
  shelter: "⛺",
  construction_materials: "🧱",
  cooking_gas: "🛢️",
  manpower: "👷",
  other: "🔖",
};

export const categoryNamesFr: Record<string, string> = {
  water: "Eau potable",
  food: "Denrées alimentaires",
  clothing: "Vêtements",
  blankets: "Couvertures",
  baby_supplies: "Besoins pour bébés",
  hygiene: "Produits d'hygiène",
  medical: "Médicaments & Soins",
  kitchenware: "Ustensiles de cuisine",
  relief_materials: "Matériel de secours",
  shelter: "Abris d'urgence",
  construction_materials: "Matériaux de construction",
  cooking_gas: "Gaz butane",
  manpower: "Bénévolat & Main d'œuvre",
  other: "Autres matériels",
};

export function getCategoryName(
  slug?: string | null,
  fallbackAr?: string | null,
  locale: AvailableLocale = "ar",
): string {
  if (!slug) return fallbackAr || "";
  if (locale === "fr") {
    return categoryNamesFr[slug] || fallbackAr || slug;
  }
  return fallbackAr || slug;
}

export function relativeTimeAr(dateString: string | null | undefined): string {
  return formatRelativeTime(dateString, "ar");
}

export function formatRelativeTime(
  dateString: string | null | undefined,
  locale: AvailableLocale = "ar",
): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (locale === "fr") {
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 30) return `Il y a ${diffDays} j`;
    const diffMonths = Math.round(diffDays / 30);
    return `Il y a ${diffMonths} mois`;
  }

  if (diffMin < 1) return "الآن";
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `منذ ${diffDays} يوم`;
  const diffMonths = Math.round(diffDays / 30);
  return `منذ ${diffMonths} شهر`;
}

export function formatQuantity(value: number, locale: AvailableLocale = "ar"): string {
  const langTag = locale === "fr" ? "fr-DZ" : "ar-DZ";
  return new Intl.NumberFormat(langTag).format(value);
}

export const severityLabels: Record<AffectedSeverity, string> = {
  ravaged: "أضرار جسيمة",
  evacuated: "تم الإجلاء",
  threatened: "منازل مهددة",
  burning: "منطقة متضررة",
  unconfirmed: "بلاغ غير مؤكد",
};

export const localizedSeverityLabels: Record<AvailableLocale, Record<AffectedSeverity, string>> = {
  ar: {
    ravaged: "أضرار جسيمة",
    evacuated: "تم الإجلاء",
    threatened: "منازل مهددة",
    burning: "منطقة متضررة",
    unconfirmed: "بلاغ غير مؤكد",
  },
  fr: {
    ravaged: "Dégâts majeurs",
    evacuated: "Évacué",
    threatened: "Menacé",
    burning: "Zone touchée",
    unconfirmed: "Non confirmé",
  },
};

export function getSeverityLabel(
  severity: AffectedSeverity,
  locale: AvailableLocale = "ar",
): string {
  return localizedSeverityLabels[locale]?.[severity] ?? severityLabels[severity];
}

export const severityIcon: Record<AffectedSeverity, LucideIcon> = {
  ravaged: Circle,
  evacuated: Circle,
  threatened: Circle,
  burning: Flame,
  unconfirmed: Circle,
};

export const severityEmoji: Record<AffectedSeverity, string> = {
  ravaged: "🔴",
  evacuated: "🟠",
  threatened: "🟡",
  burning: "🔥",
  unconfirmed: "⚪",
};

/** ترتيب العرض: الأخطر أولًا، والبلاغات غير المؤكدة في الأخير. */
export const severityRank: Record<AffectedSeverity, number> = {
  ravaged: 0,
  evacuated: 1,
  threatened: 2,
  burning: 3,
  unconfirmed: 4,
};

export type MedicalVerificationStatus = Database["public"]["Enums"]["medical_verification_status"];

export const medicalVerificationStatusLabels: Record<MedicalVerificationStatus, string> = {
  pending: "قيد التحقق",
  verified: "موثّق",
  rejected: "مرفوض",
};

export const localizedMedicalVerificationStatusLabels: Record<
  AvailableLocale,
  Record<MedicalVerificationStatus, string>
> = {
  ar: {
    pending: "قيد التحقق",
    verified: "موثّق",
    rejected: "مرفوض",
  },
  fr: {
    pending: "En attente",
    verified: "Vérifié",
    rejected: "Rejeté",
  },
};

export function getMedicalVerificationStatusLabel(
  status: MedicalVerificationStatus,
  locale: AvailableLocale = "ar",
): string {
  return localizedMedicalVerificationStatusLabels[locale]?.[status] ?? medicalVerificationStatusLabels[status];
}

export type ArtisanVerificationStatus = Database["public"]["Enums"]["artisan_verification_status"];

export const artisanVerificationStatusLabels: Record<ArtisanVerificationStatus, string> = {
  pending: "قيد التحقق",
  verified: "موثّق",
  rejected: "مرفوض",
};

export const localizedArtisanVerificationStatusLabels: Record<
  AvailableLocale,
  Record<ArtisanVerificationStatus, string>
> = {
  ar: {
    pending: "قيد التحقق",
    verified: "موثّق",
    rejected: "مرفوض",
  },
  fr: {
    pending: "En attente",
    verified: "Vérifié",
    rejected: "Rejeté",
  },
};

export function getArtisanVerificationStatusLabel(
  status: ArtisanVerificationStatus,
  locale: AvailableLocale = "ar",
): string {
  return localizedArtisanVerificationStatusLabels[locale]?.[status] ?? artisanVerificationStatusLabels[status];
}

export type DamageAssessmentStatus = Database["public"]["Enums"]["damage_assessment_status"];

export const damageAssessmentStatusLabels: Record<DamageAssessmentStatus, string> = {
  pending: "قيد المراجعة",
  estimated: "تم التقدير",
  matched: "تمت المطابقة",
  in_progress: "قيد التنفيذ",
  completed: "منجَز",
  rejected: "مرفوض",
};

export const localizedDamageAssessmentStatusLabels: Record<
  AvailableLocale,
  Record<DamageAssessmentStatus, string>
> = {
  ar: {
    pending: "قيد المراجعة",
    estimated: "تم التقدير",
    matched: "تمت المطابقة",
    in_progress: "قيد التنفيذ",
    completed: "منجَز",
    rejected: "مرفوض",
  },
  fr: {
    pending: "En attente",
    estimated: "Estimé",
    matched: "Attribué",
    in_progress: "En cours",
    completed: "Terminé",
    rejected: "Rejeté",
  },
};

export function getDamageAssessmentStatusLabel(
  status: DamageAssessmentStatus,
  locale: AvailableLocale = "ar",
): string {
  return localizedDamageAssessmentStatusLabels[locale]?.[status] ?? damageAssessmentStatusLabels[status];
}


export const localizedCategoryLabels: Record<AvailableLocale, Record<string, string>> = {
  ar: {
    water: "ماء",
    food: "غذاء",
    clothing: "ملابس",
    blankets: "أغطية وبطانيات",
    baby_supplies: "مستلزمات أطفال",
    hygiene: "مواد نظافة",
    medical: "أدوية ومستلزمات طبية",
    veterinary: "أدوية ومستلزمات بيطرية",
    kitchenware: "أدوات طبخ",
    relief_materials: "مواد إغاثة متنوعة",
    shelter: "مأوى",
    construction_materials: "مواد بناء",
    cooking_gas: "غاز طهي",
    manpower: "أيدي عاملة",
    other: "أخرى",
  },
  fr: {
    water: "Eau potable",
    food: "Nourriture",
    clothing: "Vêtements",
    blankets: "Couvertures",
    baby_supplies: "Articles pour bébés",
    hygiene: "Produits d'hygiène",
    medical: "Médicaments & soins",
    veterinary: "Médicaments & soins vétérinaires",
    kitchenware: "Ustensiles de cuisine",
    relief_materials: "Matériel d'urgence",
    shelter: "Hébergement d'urgence",
    construction_materials: "Matériaux de construction",
    cooking_gas: "Bouteilles de gaz",
    manpower: "Main-d'œuvre",
    other: "Autre",
  },
};

export function getCategoryLabel(
  slug: string | null | undefined,
  defaultName?: string,
  locale: AvailableLocale = "ar",
): string {
  if (!slug) return defaultName ?? "";
  return localizedCategoryLabels[locale]?.[slug] ?? defaultName ?? slug;
}
