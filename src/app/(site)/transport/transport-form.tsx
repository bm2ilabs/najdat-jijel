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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState } from "@/components/shared/empty-state";
import { transportOfferSchema, vehicleOptions, type TransportOfferInput } from "@/schemas/transport-offer";
import { WilayaSelect } from "@/components/ui/wilaya-select";
import { formatQuantity, getVehicleLabel } from "@/lib/constants";
import { SuccessPanel } from "@/components/shared/success-panel";
import { submitTransportOffer, type SubmitTransportResult } from "@/actions/transport";
import type { AvailableLocale } from "@/i18n/locales";

export function TransportForm({
  locale = "ar",
}: {
  locale?: AvailableLocale;
}) {
  const isFr = locale === "fr";
  const [result, setResult] = useState<SubmitTransportResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransportOfferInput>({
    resolver: zodResolver(transportOfferSchema),
    defaultValues: {
      driver_name: "",
      phone: "",
      origin_wilaya: "",
      origin_note: "",
      destination_wilaya: "جيجل",
      destination_note: "",
      vehicle_type: "van",
      available_space_note: "",
      time_window: "",
      has_empty_space: true,
      notes: "",
    },
  });

  async function onSubmit(values: TransportOfferInput) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitTransportOffer(values);
      if (!res.success) {
        setSubmitError(
          res.error ??
            (isFr
              ? "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
              : "حدث خطأ أثناء التسجيل. حاول مرة أخرى."),
        );
        return;
      }
      setResult(res);
    } catch {
      setSubmitError(
        isFr
          ? "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
          : "حدث خطأ أثناء التسجيل. حاول مرة أخرى.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.success) {
    return (
      <div className="animate-rise space-y-5">
        <SuccessPanel
          title={isFr ? "Offre de transport enregistrée avec succès" : "تم تسجيل عرض النقل بنجاح"}
          description={
            isFr
              ? "L'équipe de coordination vous contactera pour planifier un trajet. Ci-dessous les dons pouvant être acheminés sur votre parcours."
              : "سيتواصل فريق التنسيق معك لتأكيد التفاصيل والمسار. في الأسفل المساعدات التي يمكن تحميلها على مسارك."
          }
          primaryHref="/map"
          primaryLabel={isFr ? "Voir les points de dépôt" : "عرض نقاط الاستلام"}
        />

        <h2 className="font-bold">{isFr ? "Dons pouvant être acheminés sur votre trajet" : "مساعدات يمكن تحميلها على مسارك"}</h2>
        {!result.candidates || result.candidates.length === 0 ? (
          <EmptyState
            title={isFr ? "Aucun don ne nécessite de transport sur votre trajet actuellement" : "لا توجد حاليًا مساعدات تحتاج نقلًا على مسارك"}
            description={isFr ? "La liste est mise à jour régulièrement." : "سيتم تحديث القائمة باستمرار — يمكنك مراجعة لوحة الإشعارات لاحقًا."}
          />
        ) : (
          <div className="space-y-3">
            {result.candidates.map((c) => (
              <Card key={c.donationId}>
                <CardContent className="flex items-center justify-between gap-3 px-5">
                  <div>
                    <p className="font-bold">{c.itemsSummary || (isFr ? "Dons divers" : "مساعدات متنوعة")}</p>
                    <p className="text-sm text-muted-foreground">{isFr ? "De : " : "من: "}{c.donorWilaya}</p>
                  </div>
                  {c.distanceKm !== null && (
                    <span className="shrink-0 text-sm text-muted-foreground">
                      ~{formatQuantity(c.distanceKm, locale)} km
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 px-5">
          <h2 className="font-bold">{isFr ? "Vos coordonnées" : "بياناتك"}</h2>
          <div>
            <Label className="mb-1.5">{isFr ? "Nom complet" : "الاسم الكامل"}</Label>
            <Input {...register("driver_name")} />
            {errors.driver_name && (
              <p className="mt-1 text-sm text-destructive">{errors.driver_name.message}</p>
            )}
          </div>
          <div>
            <Label className="mb-1.5">{isFr ? "Numéro de téléphone" : "رقم الهاتف"}</Label>
            <Input dir="ltr" placeholder="0555xxxxxx" {...register("phone")} />
            {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 px-5">
          <h2 className="font-bold">{isFr ? "Itinéraire et véhicule" : "المسار والمركبة"}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">{isFr ? "Point de départ (Wilaya)" : "نقطة الانطلاق (الولاية)"}</Label>
              <WilayaSelect
                locale={locale}
                value={watch("origin_wilaya")}
                onChange={(e) => setValue("origin_wilaya", e.target.value, { shouldValidate: true })}
              />
              {errors.origin_wilaya && (
                <p className="mt-1 text-sm text-destructive">{errors.origin_wilaya.message}</p>
              )}
            </div>
            <div>
              <Label className="mb-1.5">{isFr ? "Destination (Wilaya)" : "الوجهة (الولاية)"}</Label>
              <WilayaSelect
                locale={locale}
                value={watch("destination_wilaya")}
                onChange={(e) => setValue("destination_wilaya", e.target.value, { shouldValidate: true })}
              />
              {errors.destination_wilaya && (
                <p className="mt-1 text-sm text-destructive">{errors.destination_wilaya.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Type de véhicule" : "نوع المركبة"}</Label>
            <Select
              value={watch("vehicle_type")}
              onValueChange={(v: string | null) =>
                v && setValue("vehicle_type", v as TransportOfferInput["vehicle_type"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => getVehicleLabel(value as TransportOfferInput["vehicle_type"], locale)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {vehicleOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {getVehicleLabel(o.value, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">{isFr ? "Capacité maximale (kg) — facultatif" : "الحمولة القصوى (كغ) — اختياري"}</Label>
              <Input
                type="number"
                min={0}
                {...register("max_capacity_kg", {
                  setValueAs: (v) => (v === "" || v === null || isNaN(Number(v)) ? undefined : Number(v)),
                })}
              />
            </div>
            <div>
              <Label className="mb-1.5">{isFr ? "Date (facultatif)" : "التاريخ (اختياري)"}</Label>
              <Input type="date" {...register("travel_date")} />
            </div>
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Créneau horaire (facultatif)" : "الوقت المتاح (اختياري)"}</Label>
            <Input placeholder={isFr ? "Ex: Matin, après-midi" : "مثال: صباحًا، بعد الظهر"} {...register("time_window")} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={watch("has_empty_space")}
              onCheckedChange={(v) => setValue("has_empty_space", Boolean(v))}
            />
            {isFr ? "J'ai de l'espace disponible dans le véhicule" : "لدي مساحة فارغة متاحة"}
          </label>

          <div>
            <Label className="mb-1.5">{isFr ? "Remarques (facultatif)" : "ملاحظات (اختياري)"}</Label>
            <Textarea {...register("notes")} />
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
        {isFr ? "Envoyer l'offre" : "إرسال"}
      </Button>
    </form>
  );
}
