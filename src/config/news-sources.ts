export interface OfficialSourceConfig {
  id: string;
  name: string;
  authority: "protection_civile" | "gendarmerie" | "police" | "forets" | "wilaya" | "aps" | "humanitarian" | "meteo";
  badgeNameAr: string;
  avatarColor: string;
  feedUrl?: string;
  sourceUrl: string;
  scrapeSelector?: string;
  enabled: boolean;
}

export interface IngestedNewsItem {
  id?: string;
  title: string;
  body?: string | null;
  source: string;
  authority?: OfficialSourceConfig["authority"];
  url?: string | null;
  update_type?: "fire_alert" | "road_status" | "weather_warning" | "safety_guidelines" | "statement" | "news";
  wilaya?: string;
  is_urgent?: boolean;
  published_at: string;
  external_id?: string;
}

export const OFFICIAL_ALGERIAN_SOURCES: OfficialSourceConfig[] = [
  {
    id: "dgpc_jijel",
    name: "مديرية الحماية المدنية لولاية جيجل",
    authority: "protection_civile",
    badgeNameAr: "الحماية المدنية - جيجل",
    avatarColor: "bg-red-500/15 text-red-600 border-red-500/30",
    sourceUrl: "https://www.facebook.com/DGPC0018",
    enabled: true,
  },
  {
    id: "dgpc_setif",
    name: "مديرية الحماية المدنية لولاية سطيف",
    authority: "protection_civile",
    badgeNameAr: "الحماية المدنية - سطيف",
    avatarColor: "bg-red-500/15 text-red-600 border-red-500/30",
    sourceUrl: "https://www.facebook.com/DGPC0019/",
    enabled: true,
  },
  {
    id: "dgpc_mila",
    name: "مديرية الحماية المدنية لولاية ميلة",
    authority: "protection_civile",
    badgeNameAr: "الحماية المدنية - ميلة",
    avatarColor: "bg-red-500/15 text-red-600 border-red-500/30",
    sourceUrl: "https://www.facebook.com/DGPC0043/",
    enabled: true,
  },
  {
    id: "dgpc_bejaia",
    name: "مديرية الحماية المدنية لولاية بجاية",
    authority: "protection_civile",
    badgeNameAr: "الحماية المدنية - بجاية",
    avatarColor: "bg-red-500/15 text-red-600 border-red-500/30",
    sourceUrl: "https://www.facebook.com/DGPC0006",
    enabled: true,
  },
  {
    id: "dgpc_skikda",
    name: "مديرية الحماية المدنية لولاية سكيكدة",
    authority: "protection_civile",
    badgeNameAr: "الحماية المدنية - سكيكدة",
    avatarColor: "bg-red-500/15 text-red-600 border-red-500/30",
    sourceUrl: "https://www.facebook.com/DGPC0021",
    enabled: true,
  },
  {
    id: "dgpc_national",
    name: "المديرية العامة للحماية المدنية",
    authority: "protection_civile",
    badgeNameAr: "الحماية المدنية (الوطنية)",
    avatarColor: "bg-red-500/15 text-red-600 border-red-500/30",
    sourceUrl: "https://www.facebook.com/DGPC.Algerie",
    enabled: true,
  },
  {
    id: "meteo_algerie",
    name: "الديوان الوطني للأرصاد الجوية (Météo Algérie)",
    authority: "meteo",
    badgeNameAr: "الأرصاد الجوية",
    avatarColor: "bg-sky-500/15 text-sky-600 border-sky-500/30",
    sourceUrl: "https://www.facebook.com/MeteoAlgerieOfficiel/",
    enabled: true,
  },
  {
    id: "cra_algerie",
    name: "الهلال الأحمر الجزائري",
    authority: "humanitarian",
    badgeNameAr: "الهلال الأحمر الجزائري",
    avatarColor: "bg-rose-500/15 text-rose-700 border-rose-500/30",
    sourceUrl: "https://www.facebook.com/algerianred/?locale=fr_FR",
    enabled: true,
  },
  {
    id: "tariki",
    name: "طريقي - مركز الإعلام وتنسيق المرور للدرك الوطني",
    authority: "gendarmerie",
    badgeNameAr: "الدرك الوطني / طريقي",
    avatarColor: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    sourceUrl: "https://www.facebook.com/tariki.gendarmerie.algerie",
    enabled: true,
  },
  {
    id: "dgf",
    name: "المديرية العامة للغابات",
    authority: "forets",
    badgeNameAr: "محافظة الغابات",
    avatarColor: "bg-green-600/15 text-green-700 border-green-600/30",
    sourceUrl: "https://www.facebook.com/forets.algerie",
    enabled: true,
  },
  {
    id: "dgsn",
    name: "المديرية العامة للأمن الوطني",
    authority: "police",
    badgeNameAr: "الأمن الوطني",
    avatarColor: "bg-blue-600/15 text-blue-700 border-blue-600/30",
    sourceUrl: "https://www.facebook.com/algeriepolice.dz",
    enabled: true,
  },
  {
    id: "wilaya_jijel",
    name: "خلية الأزمة ومتابعة الطوارئ - ولاية جيجل",
    authority: "wilaya",
    badgeNameAr: "خلية الأزمة - جيجل",
    avatarColor: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    sourceUrl: "https://www.facebook.com/WilayadeJijel",
    enabled: true,
  },
];

/**
 * Heuristic classifier for news content based on domain keywords
 */
export function classifyNewsItem(text: string): {
  update_type: IngestedNewsItem["update_type"];
  wilaya?: string;
  is_urgent: boolean;
} {
  const normalized = text.toLowerCase();

  // 1. Detect Urgency
  const is_urgent =
    normalized.includes("عاجل") ||
    normalized.includes("urgent") ||
    normalized.includes("إنذار") ||
    normalized.includes("تحذير عالي") ||
    normalized.includes("إخلاء فوري") ||
    normalized.includes("طريق مقطوع") ||
    normalized.includes("غلق تام") ||
    normalized.includes("خطر داهم") ||
    normalized.includes("ضحايا") ||
    normalized.includes("حصار النيران");

  // 2. Detect Wilaya & Municipalities (Communes)
  let wilaya: string | undefined = undefined;

  const jijelKeywords = [
    "جيجل", "العوانة", "زيامة", "منصورية", "الميلية", "الطاهير", "جيملة",
    "تاكسنة", "الشقفة", "قاوس", "سلمى بن زيادة", "إيراقن", "سيدي عبد العزيز",
    "بني حبيبي", "بوراوي بلهادف", "السطارة", "جمعة بني حبيبي", "برج الطهر",
    "العنصر", "خيري واد عجول", "اميلكار", "واد الصغير", "الخيارة"
  ];

  const bejaiaKeywords = [
    "بجاية", "bejaia", "béjaïa", "تيشي", "أوقاس", "خراطة", "سوق الاثنين", "القصر", "أميزور", "تاسكريوت"
  ];

  const setifKeywords = [
    "سطيف", "setif", "sétif", "بابور", "بوسلام", "عين الروى", "بني ورتيلان", "عموشة", "العلمة"
  ];

  const milaKeywords = [
    "ميلة", "mila", "فرجيوة", "شلغوم العيد", "قرارم", "تسدان حدادة", "بوحاتم"
  ];

  const skikdaKeywords = [
    "سكيكدة", "skikda", "القل", "تمالوس", "الزردازة", "عين قشرة", "أولاد عطية"
  ];

  if (jijelKeywords.some((kw) => normalized.includes(kw))) {
    wilaya = "جيجل";
  } else if (bejaiaKeywords.some((kw) => normalized.includes(kw))) {
    wilaya = "بجاية";
  } else if (setifKeywords.some((kw) => normalized.includes(kw))) {
    wilaya = "سطيف";
  } else if (milaKeywords.some((kw) => normalized.includes(kw))) {
    wilaya = "ميلة";
  } else if (skikdaKeywords.some((kw) => normalized.includes(kw))) {
    wilaya = "سكيكدة";
  }

  // 3. Detect Category Type
  let update_type: IngestedNewsItem["update_type"] = "statement";

  const roadKeywords = [
    "طريق", "مرور", "مسلك", "شاحنات", "حركة السير", "حركة المرور",
    "rn43", "rn77", "cw137", "cw135", "طريق وطني", "طريق ولائي", "منعرجات", "طريقي"
  ];

  const fireKeywords = [
    "حريق", "حرائق", "بؤرة", "بؤر", "إخماد", "إطفاء", "ألسنة اللهب",
    "رتل متحرك", "رتل متنقل", "طائرة إطفاء", "طائرات الإخماد", "قاذفات",
    "بيريف", "be-200", "air tractor", "حماية مدنية", "غابات", "طوفان", "مروحية"
  ];

  const weatherKeywords = [
    "نشرية", "أرصاد", "رياح", "سيروكو", "حرارة", "طقس", "درجة مئوية",
    "bms", "إنذار جوي", "موجة حر", "هبوب رياح", "عواصف"
  ];

  const safetyKeywords = [
    "توجيهات", "إرشادات", "سلامة", "وقاية", "إخلاء", "مأوى", "إسعافات أولية",
    "تجنب المسالك", "تعليمات للمواطنين", "الهلال الأحمر"
  ];

  if (fireKeywords.some((kw) => normalized.includes(kw))) {
    update_type = "fire_alert";
  } else if (roadKeywords.some((kw) => normalized.includes(kw))) {
    update_type = "road_status";
  } else if (weatherKeywords.some((kw) => normalized.includes(kw))) {
    update_type = "weather_warning";
  } else if (safetyKeywords.some((kw) => normalized.includes(kw))) {
    update_type = "safety_guidelines";
  }

  return { update_type, wilaya, is_urgent };
}
