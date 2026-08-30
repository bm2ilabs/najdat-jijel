"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  beneficiaryRequestSchema,
  needCategoryOptions,
  type BeneficiaryRequestInput,
} from "@/schemas/beneficiary-request";
import { SuccessPanel } from "@/components/shared/success-panel";
import { submitBeneficiaryRequest } from "@/actions/beneficiary-requests";
import { campaignWilayas } from "@/config/site";
import { WilayaSelect } from "@/components/ui/wilaya-select";
import { CommuneSelect } from "@/components/ui/commune-select";
import { priorityWilayas } from "@/lib/algeria-cities";
import { cn } from "@/lib/utils";
import type { AvailableLocale } from "@/i18n/locales";

const categoryLabelsFr: Record<string, string> = {
  water: "Eau potable",
  food: "Nourriture",
  clothing: "Vêtements",
  blankets: "Couvertures",
  baby_supplies: "Articles pour bébés",
  medical: "Médicaments / Soins",
  hygiene: "Produits d'hygiène",
  kitchenware: "Ustensiles de cuisine",
  shelter: "Hébergement d'urgence",
  construction_materials: "Matériaux de construction",
  other: "Autre",
};

export function HelpRequestForm({
  locale = "ar",
}: {
  locale?: AvailableLocale;
}) {
  const isFr = locale === "fr";
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BeneficiaryRequestInput>({
    resolver: zodResolver(beneficiaryRequestSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      wilaya: "جيجل",
      commune: "",
      address_note: "",
      family_members_count: 1,
      children_count: 0,
      housing_status: "",
      is_housing_habitable: "unknown",
      has_injuries: false,
      injuries_note: "",
      needs_medical: false,
      medical_note: "",
      lost_livestock: false,
      lost_income: false,
      needed_categories: [],
      other_needs_note: "",
    },
  });

  const neededCategories = watch("needed_categories");
  const hasInjuries = watch("has_injuries");
  const needsMedical = watch("needs_medical");

  function toggleCategory(value: string) {
    const current = neededCategories ?? [];
    setValue(
      "needed_categories",
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      { shouldValidate: true },
    );
  }

  async function onSubmit(values: BeneficiaryRequestInput) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitBeneficiaryRequest(values);
      if (!res.success) {
        setSubmitError(
          res.error ??
            (isFr
              ? "Une erreur est survenue lors de l'enregistrement de votre demande. Veuillez réessayer."
              : "حدث خطأ أثناء تسجيل طلبك. حاول مرة أخرى."),
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError(
        isFr
          ? "Une erreur est survenue lors de l'enregistrement de votre demande. Veuillez réessayer."
          : "حدث خطأ أثناء تسجيل طلبك. حاول مرة أخرى.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <SuccessPanel
        title={isFr ? "Demande d'aide reçue avec succès" : "تم استلام طلبك بنجاح"}
        description={
          isFr
            ? "L'équipe de coordination examinera votre demande et vous contactera dans les plus brefs délais. Vos données sont protégées et restent strictement confidentielles."
            : "سيراجع فريق التنسيق طلبك ويتواصل معك في أقرب وقت ممكن. بياناتك محمية ولا تُعرض للعامة إطلاقًا."
        }
        primaryHref="/map"
        primaryLabel={isFr ? "Centres d'hébergement proches" : "مراكز الإيواء القريبة"}
      >
        {watch("is_housing_habitable") !== "yes" && (
          <div className="rounded-xl border border-border bg-muted/40 p-4 text-center text-sm">
            {isFr ? (
              <>
                Le logement lui-même a-t-il été endommagé ?{" "}
                <Link href="/help/damage-assessment" className="font-medium text-algeria-green hover:underline">
                  Soumettez une évaluation détaillée des dégâts
                </Link>{" "}
                (avec photos) pour estimer les matériaux de réparation nécessaires et vous mettre en relation
                avec des donateurs et artisans.
              </>
            ) : (
              <>
                هل تضرر السكن نفسه؟{" "}
                <Link href="/help/damage-assessment" className="font-medium text-algeria-green hover:underline">
                  قدّم تقييمًا تفصيليًا للأضرار
                </Link>{" "}
                (مع صور) لنقدّر مواد الترميم اللازمة ونربطك بمتبرعين وحرفيين.
              </>
            )}
          </div>
        )}
      </SuccessPanel>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 px-5">
          <h2 className="font-bold">{isFr ? "Vos coordonnées" : "بياناتك"}</h2>
          <div>
            <Label className="mb-1.5">{isFr ? "Nom complet ou représentant" : "الاسم الكامل"}</Label>
            <Input {...register("full_name")} />
            {errors.full_name && (
              <p className="mt-1 text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>
          <div>
            <Label className="mb-1.5">{isFr ? "Numéro de téléphone" : "رقم الهاتف"}</Label>
            <Input dir="ltr" placeholder="0555xxxxxx" {...register("phone")} />
            {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>}
          </div>
          <div>
            <Label className="mb-2 flex items-center justify-between">
              <span>{isFr ? "Wilaya *" : "الولاية *"}</span>
              <span className="text-xs font-bold text-priority-critical flex items-center gap-1">
                <span className="inline-block size-1.5 rounded-full bg-priority-critical animate-pulse" />
                {isFr ? "Zones sinistrées prioritaires" : "المناطق المتضررة ذات الأولوية"}
              </span>
            </Label>
            
            {/* Quick Priority Wilaya Buttons with distinct emergency colors */}
            <div className="flex flex-wrap gap-2 mb-3">
              {priorityWilayas.map((pw) => {
                const active = watch("wilaya") === pw.name_ar;
                return (
                  <button
                    key={pw.code}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setValue("wilaya", pw.name_ar, { shouldValidate: true });
                      setValue("commune", "");
                    }}
                    className={cn(
                      "rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                      active
                        ? "border-priority-critical bg-priority-critical text-white shadow-sm scale-105"
                        : "border-priority-critical/30 bg-priority-critical/10 text-priority-critical hover:bg-priority-critical/20",
                    )}
                  >
                    <span>⚡</span>
                    <span>{isFr ? `${pw.codeStr} - ${pw.name_fr}` : `${pw.codeStr} - ${pw.name_ar}`}</span>
                  </button>
                );
              })}
            </div>

            {/* Complete Wilaya Select Dropdown */}
            <WilayaSelect
              locale={locale}
              value={watch("wilaya")}
              onChange={(e) => {
                setValue("wilaya", e.target.value, { shouldValidate: true });
                setValue("commune", "");
              }}
            />
            {errors.wilaya && (
              <p className="mt-1 text-sm text-destructive">{errors.wilaya.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Commune *" : "البلدية *"}</Label>
            <CommuneSelect
              wilaya={watch("wilaya")}
              locale={locale}
              value={watch("commune")}
              onChange={(e) => setValue("commune", e.target.value, { shouldValidate: true })}
            />
            {errors.commune && (
              <p className="mt-1 text-sm text-destructive">{errors.commune.message}</p>
            )}
          </div>
          <div>
            <Label className="mb-1.5">{isFr ? "Adresse / Village / Repère (facultatif)" : "الحي / أقرب معلم (اختياري)"}</Label>
            <Input {...register("address_note")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 px-5">
          <h2 className="font-bold">{isFr ? "Situation de la famille" : "وضع الأسرة"}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">{isFr ? "Nombre de membres" : "عدد أفراد الأسرة"}</Label>
              <Input
                type="number"
                min={1}
                {...register("family_members_count", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label className="mb-1.5">{isFr ? "Nombre d'enfants" : "عدد الأطفال"}</Label>
              <Input
                type="number"
                min={0}
                {...register("children_count", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "État du logement (facultatif)" : "حالة السكن (اختياري)"}</Label>
            <Input
              placeholder={isFr ? "Ex: Partiellement endommagé, détruit..." : "مثال: متضرر جزئيًا، محترق كليًا..."}
              {...register("housing_status")}
            />
          </div>

          <div>
            <Label className="mb-2">{isFr ? "Le logement est-il habitable ?" : "هل السكن صالح للسكن؟"}</Label>
            <RadioGroup
              value={watch("is_housing_habitable")}
              onValueChange={(v: string | null) =>
                v && setValue("is_housing_habitable", v as BeneficiaryRequestInput["is_housing_habitable"])
              }
              className="flex gap-4"
            >
              <label className="flex items-center gap-1.5 text-sm">
                <RadioGroupItem value="yes" /> {isFr ? "Oui" : "نعم"}
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <RadioGroupItem value="no" /> {isFr ? "Non" : "لا"}
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <RadioGroupItem value="unknown" /> {isFr ? "Incertain" : "غير متأكد"}
              </label>
            </RadioGroup>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={hasInjuries}
              onCheckedChange={(v) => setValue("has_injuries", Boolean(v))}
            />
            {isFr ? "Blessures constatées dans la famille" : "توجد إصابات في الأسرة"}
          </label>
          {hasInjuries && (
            <Input
              placeholder={isFr ? "Détails des blessures (facultatif)" : "تفاصيل مختصرة (اختياري)"}
              {...register("injuries_note")}
            />
          )}

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={needsMedical}
              onCheckedChange={(v) => setValue("needs_medical", Boolean(v))}
            />
            {isFr ? "Besoin de soins médicaux d'urgence" : "توجد حاجة طبية"}
          </label>
          {needsMedical && (
            <Input
              placeholder={isFr ? "Détails des besoins médicaux (facultatif)" : "تفاصيل مختصرة (اختياري)"}
              {...register("medical_note")}
            />
          )}

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={watch("lost_livestock")}
              onCheckedChange={(v) => setValue("lost_livestock", Boolean(v))}
            />
            {isFr ? "Perte de bétail / animaux" : "فقدت الأسرة الماشية"}
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={watch("lost_income")}
              onCheckedChange={(v) => setValue("lost_income", Boolean(v))}
            />
            {isFr ? "Perte de la source de revenu" : "فقدت الأسرة مصدر الدخل"}
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 px-5">
          <h2 className="font-bold">{isFr ? "De quoi la famille a-t-elle besoin ?" : "ما الذي تحتاجه الأسرة؟"}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {needCategoryOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={neededCategories?.includes(opt.value)}
                  onCheckedChange={() => toggleCategory(opt.value)}
                />
                {isFr ? (categoryLabelsFr[opt.value] ?? opt.label) : opt.label}
              </label>
            ))}
          </div>
          {errors.needed_categories && (
            <p className="text-sm text-destructive">{errors.needed_categories.message}</p>
          )}
          <div>
            <Label className="mb-1.5">{isFr ? "Précisions ou besoins spécifiques (facultatif)" : "تفاصيل إضافية (اختياري)"}</Label>
            <Textarea {...register("other_needs_note")} />
          </div>
        </CardContent>
      </Card>

      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="size-4 animate-spin" />}
        {isFr ? "Envoyer la demande" : "إرسال الطلب"}
      </Button>
    </form>
  );
}
