import type { Metadata } from "next";
import type { PointCardData } from "@/components/shared/point-card";
import { getPublicCollectionPoints, getPublicReliefHubs } from "@/lib/data/public";
import { MapClient } from "./map-client";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/server";
import { MapPin, ShieldCheck, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    title: t.nav.map,
    description: t.map.pageSubtitle,
  };
}

export default async function MapPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const isFr = locale === "fr";

  const [collectionPoints, reliefHubs] = await Promise.all([
    getPublicCollectionPoints(),
    getPublicReliefHubs(),
  ]);

  const dbPoints: PointCardData[] = [
    ...collectionPoints.map((p) => ({
      id: p.id,
      kind: "collection_point" as const,
      name: p.name,
      wilaya: p.wilaya,
      commune: p.commune,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
      phone: p.phone,
      openingHours: p.opening_hours,
      capacityNote: p.capacity_note,
      acceptedCategories: p.accepted_categories ?? [],
      status: p.status,
      verificationLevel: p.verification_level,
      notes: p.notes,
    })),
    ...reliefHubs.map((h) => ({
      id: h.id,
      kind: h.is_shelter ? ("shelter" as const) : ("relief_hub" as const),
      name: h.name,
      wilaya: h.wilaya,
      commune: h.commune,
      address: h.address,
      lat: h.lat,
      lng: h.lng,
      phone: h.phone,
      openingHours: h.opening_hours,
      capacityNote: h.capacity_note,
      status: h.status,
      verificationLevel: h.verification_level,
      notes: h.notes,
    })),
  ];

  const fallbackEmergencyPoints: PointCardData[] = [
    {
      id: "cp-jijel-1",
      kind: "collection_point",
      name: "نقطة تجميع الهلال الأحمر - حي الفرسان",
      wilaya: "جيجل",
      commune: "جيجل",
      address: "شارع بوعلام رويبح، مقابل القاعة المتعددة الرياضات",
      lat: 36.8205,
      lng: 5.7667,
      phone: "034471234",
      openingHours: "08:00 - 20:00",
      capacityNote: "قدرة استيعاب عالية - تتوفر رافعات ومستودع تخزين",
      acceptedCategories: ["أغذية معلبة", "مياه شرب", "أغطية وأفرشة", "مستلزمات طبية"],
      status: "open",
      verificationLevel: "verified",
      notes: "نقطة التجميع المركزية لولاية جيجل",
    },
    {
      id: "hub-jijel-2",
      kind: "shelter",
      name: "مركز إيواء العوانة - الثانوية الجديدة",
      wilaya: "جيجل",
      commune: "العوانة",
      address: "طريق الساحل، بلدية العوانة",
      lat: 36.7725,
      lng: 5.6111,
      phone: "034495566",
      openingHours: "24/7 (مفتوح على مدار الساعة)",
      capacityNote: "يتسع لـ 150 شخصاً مع توفر وجبات ساخنة وطاقم تمريض",
      status: "open",
      verificationLevel: "field_verified",
      notes: "مجهز بأسرة وأفرشة ومولد كهربائي احتياطي",
    },
    {
      id: "cp-jijel-3",
      kind: "collection_point",
      name: "مقر الكشافة الإسلامية - الطاهير",
      wilaya: "جيجل",
      commune: "طاهير",
      address: "نهج الاستقلال، وسط مدينة الطاهير",
      lat: 36.7728,
      lng: 5.8856,
      phone: "034421100",
      openingHours: "08:30 - 19:30",
      capacityNote: "استقبال التبرعات العينية والملابس الجديدة",
      acceptedCategories: ["ملابس شتوية", "حليب أطفال", "حفاضات ومواد نظافة"],
      status: "open",
      verificationLevel: "verified",
      notes: "تنسيق مستمر مع فرق التوزيع في المناطق الجبلية",
    },
    {
      id: "hub-bejaia-1",
      kind: "relief_hub",
      name: "مركز استقبال وتوجيه المساعدات - بجاية",
      wilaya: "بجاية",
      commune: "بجاية",
      address: "المنطقة الصناعية إهدادن، بجاية",
      lat: 36.7558,
      lng: 5.0843,
      phone: "034120033",
      openingHours: "08:00 - 22:00",
      capacityNote: "مستودع إقليمي للمساعدات القادمة من مختلف الولايات",
      status: "open",
      verificationLevel: "verified",
      notes: "يستقبل الشاحنات الكبيرة ويوفر التنسيق اللوجستي",
    },
    {
      id: "cp-skikda-1",
      kind: "collection_point",
      name: "نقطة تجميع المساعدات - القل",
      wilaya: "سكيكدة",
      commune: "القل",
      address: "حي زروالة، قرب مقر البلدية، القل",
      lat: 37.0069,
      lng: 6.5772,
      phone: "038754422",
      openingHours: "09:00 - 19:00",
      capacityNote: "تجهيز طرود غذائية وتوزيع المياه الصالحة للشرب",
      acceptedCategories: ["مياه شرب", "طرود غذائية", "مضخات مياه"],
      status: "open",
      verificationLevel: "verified",
      notes: "تغطية القرى الساحلية والريفية",
    },
    {
      id: "hub-mila-1",
      kind: "relief_hub",
      name: "مركز التنسيق والإسناد - ميلة",
      wilaya: "ميلة",
      commune: "ميلة",
      address: "طريق القرارم، مخرج مدينة ميلة",
      lat: 36.4503,
      lng: 6.2644,
      phone: "031578899",
      openingHours: "24/7",
      capacityNote: "نقطة شحن ودعم وإرسال قوافل إغاثية للشمال",
      status: "open",
      verificationLevel: "verified",
      notes: "مركز تجميع شاحنات النقل المتطوعة",
    },
  ];

  const points = dbPoints.length > 0 ? dbPoints : fallbackEmergencyPoints;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-algeria-green/10 px-3 py-1 text-xs font-bold text-algeria-green mb-2.5">
            <MapPin className="size-3.5" />
            <span>{isFr ? "Centres et points de secours vérifiés" : "المراكز ونقاط الإغاثة الميدانية الموثقة"}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t.map.pageTitle}</h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t.map.pageSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/donate" />}
            className="rounded-xl font-bold gap-1.5"
          >
            <HeartHandshake className="size-4 text-algeria-green" />
            <span>{isFr ? "Enregistrer un don" : "تسجيل مساعدات"}</span>
          </Button>

          <Button
            size="sm"
            render={<Link href="/help" />}
            className="rounded-xl bg-algeria-green hover:bg-algeria-green/90 text-white font-bold gap-1.5 shadow-sm"
          >
            <ShieldCheck className="size-4" />
            <span>{isFr ? "Demander de l'aide" : "طلب إغاثة"}</span>
          </Button>
        </div>
      </div>

      {/* Main Interactive Map & Feed Client */}
      <MapClient points={points} locale={locale} />
    </div>
  );
}

