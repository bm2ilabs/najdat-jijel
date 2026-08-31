"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WilayaSelect } from "@/components/ui/wilaya-select";
import { CommuneSelect } from "@/components/ui/commune-select";
import { priorityWilayas } from "@/lib/algeria-cities";
import { cn } from "@/lib/utils";
import { artisanVolunteerSchema, type ArtisanVolunteerInput } from "@/schemas/artisan-volunteer";
import { SuccessPanel } from "@/components/shared/success-panel";
import { submitArtisanVolunteer } from "@/actions/artisans";
import type { AvailableLocale } from "@/i18n/locales";

export function ArtisanForm({ locale = "ar" }: { locale?: AvailableLocale }) {
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
  } = useForm<ArtisanVolunteerInput>({
    resolver: zodResolver(artisanVolunteerSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      specialty: "",
      wilaya_code: "جيجل",
      commune_id: "",
      can_travel: true,
      has_own_tools: false,
      show_phone_publicly: false,
      notes: "",
    },
  });

  const selectedWilaya = watch("wilaya_code");
  const canTravel = watch("can_travel");
  const hasOwnTools = watch("has_own_tools");
  const showPhonePublicly = watch("show_phone_publicly");

  async function onSubmit(values: ArtisanVolunteerInput) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitArtisanVolunteer(values);
      if (!res.success) {
        setSubmitError(
          res.message ??
            (isFr
              ? "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
              : "حدث خطأ أثناء تسجيل بياناتك. حاول مرة أخرى."),
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError(
        isFr
          ? "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
          : "حدث خطأ أثناء تسجيل بياناتك. حاول مرة أخرى.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <SuccessPanel
        title={isFr ? "Merci pour votre engagement solidaire" : "شكراً لمبادرتكم الإنسانية"}
        description={
          isFr
            ? "Vos informations ont été enregistrées avec succès. L'équipe de coordination vous contactera dès que des travaux nécessiteront votre expertise."
            : "تم تسجيل بياناتكم بنجاح. ستتواصل معكم خلية التنسيق عند وجود أعمال ترميم تحتاج تخصصكم."
        }
        primaryHref="/"
        primaryLabel={isFr ? "Retour à l'accueil" : "العودة للرئيسية"}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <h2 className="font-bold">{isFr ? "Informations professionnelles et personnelles" : "المعلومات المهنية والشخصية"}</h2>

          <div>
            <Label className="mb-1.5">{isFr ? "Nom et prénom *" : "الاسم واللقب *"}</Label>
            <Input placeholder={isFr ? "Mohamed Belhadj" : "محمد بلحاج"} {...register("full_name")} />
            {errors.full_name && (
              <p className="mt-1 text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Numéro de téléphone *" : "رقم الهاتف *"}</Label>
            <Input dir="ltr" placeholder="0555xxxxxx" {...register("phone")} />
            {errors.phone && (
              <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Spécialité artisanale *" : "التخصص الحرفي *"}</Label>
            <Input placeholder={isFr ? "Peintre, maçon, plombier, électricien..." : "دهان، بناء، سباك، كهربائي..."} {...register("specialty")} />
            {errors.specialty && (
              <p className="mt-1 text-sm text-destructive">{errors.specialty.message}</p>
            )}
          </div>

          {/* Wilaya selection */}
          <div>
            <Label className="mb-2 flex items-center justify-between">
              <span>{isFr ? "Wilaya de résidence ou d'activité *" : "الولاية (مقر الإقامة أو النشاط) *"}</span>
              <span className="text-xs font-bold text-priority-critical flex items-center gap-1">
                <span className="inline-block size-1.5 rounded-full bg-priority-critical animate-pulse" />
                {isFr ? "Zones sinistrées prioritaires" : "المناطق المتضررة ذات الأولوية"}
              </span>
            </Label>

            {/* Quick Priority Wilaya Buttons */}
            <div className="flex flex-wrap gap-2 mb-3">
              {priorityWilayas.map((pw) => {
                const active = selectedWilaya === pw.name_ar || selectedWilaya === pw.codeStr || selectedWilaya === String(pw.code);
                return (
                  <button
                    key={pw.code}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setValue("wilaya_code", pw.name_ar, { shouldValidate: true });
                      setValue("commune_id", "");
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

            <WilayaSelect
              locale={locale}
              value={selectedWilaya}
              onChange={(e) => {
                setValue("wilaya_code", e.target.value, { shouldValidate: true });
                setValue("commune_id", "");
              }}
            />
            {errors.wilaya_code && (
              <p className="mt-1 text-sm text-destructive">{errors.wilaya_code.message}</p>
            )}
          </div>

          {/* Commune selection */}
          <div>
            <Label className="mb-1.5">{isFr ? "Commune de résidence *" : "البلدية (مكان الإقامة أو الورشة) *"}</Label>
            <CommuneSelect
              wilaya={selectedWilaya}
              locale={locale}
              value={watch("commune_id")}
              onChange={(e) => setValue("commune_id", e.target.value, { shouldValidate: true })}
            />
            {errors.commune_id && (
              <p className="mt-1 text-sm text-destructive">{errors.commune_id.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 px-5 pt-6">
          <h2 className="font-bold">{isFr ? "Disponibilités et équipements" : "مجالات التطوع والاستعداد"}</h2>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={canTravel}
              onCheckedChange={(v) => setValue("can_travel", Boolean(v))}
            />
            {isFr ? "Prêt à se déplacer vers d'autres zones sinistrées" : "الاستعداد للتنقل إلى المناطق المتضررة الأخرى"}
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={hasOwnTools}
              onCheckedChange={(v) => setValue("has_own_tools", Boolean(v))}
            />
            {isFr ? "Dispose de ses propres outils de travail" : "حيازة أدوات العمل الخاصة"}
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={showPhonePublicly}
              onCheckedChange={(v) => setValue("show_phone_publicly", Boolean(v))}
            />
            {isFr ? "J'accepte la publication de mon numéro dans l'annuaire des artisans après vérification" : "أوافق على نشر رقم هاتفي للعموم في قائمة الحرفيين بعد التحقق من انضمامي"}
          </label>

          <div>
            <Label className="mb-1.5">{isFr ? "Remarques supplémentaires (créneaux de disponibilité...)" : "ملاحظات إضافية (أوقات التوفر...)"}</Label>
            <Textarea placeholder={isFr ? "Toute précision utile pour l'équipe de coordination..." : "أي تفاصيل تساعد فريق التنسيق..."} {...register("notes")} />
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
        {isFr ? "Confirmer l'inscription" : "تأكيد تسجيل التطوع"}
      </Button>
    </form>
  );
}
