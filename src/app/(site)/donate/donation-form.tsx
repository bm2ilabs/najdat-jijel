"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2, MapPin, Clock, CircleCheck } from "lucide-react";
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { PointStatusBadge } from "@/components/shared/status-badge";
import { donationSchema, unitOptions, type DonationInput } from "@/schemas/donation";
import { formatQuantity, getUnitLabel } from "@/lib/constants";
import { CategoryIcon } from "@/components/shared/category-icon";
import { wilayaNames } from "@/lib/wilayas";
import { WilayaSelect } from "@/components/ui/wilaya-select";
import { CommuneSelect } from "@/components/ui/commune-select";
import { SuccessPanel } from "@/components/shared/success-panel";
import { submitDonation, type SubmitDonationResult } from "@/actions/donations";
import type { Database } from "@/types/database";
import type { AvailableLocale } from "@/i18n/locales";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export function DonationForm({
  categories,
  defaultCategorySlug,
  locale = "ar",
}: {
  categories: Category[];
  defaultCategorySlug?: string;
  locale?: AvailableLocale;
}) {
  const isFr = locale === "fr";
  const [result, setResult] = useState<SubmitDonationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultCategory = categories.find((c) => c.slug === defaultCategorySlug) ?? categories[0];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DonationInput>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donor_name: "",
      donor_phone: "",
      current_wilaya: "",
      current_commune: "",
      needs_transport: false,
      can_deliver_self: false,
      notes: "",
      items: defaultCategory
        ? [
            {
              category_id: defaultCategory.id,
              category_slug: defaultCategory.slug,
              quantity: 1,
              unit: defaultCategory.default_unit,
              description: "",
            },
          ]
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  async function onSubmit(values: DonationInput) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const itemsWithSlug = values.items.map((it) => ({
        ...it,
        category_slug: categories.find((c) => c.id === it.category_id)?.slug ?? "",
      }));
      const res = await submitDonation({ ...values, items: itemsWithSlug });
      if (!res.success) {
        setSubmitError(
          res.error ??
            (isFr
              ? "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
              : "حدث خطأ أثناء تسجيل المساعدة. حاول مرة أخرى."),
        );
        return;
      }
      setResult(res);
    } catch {
      setSubmitError(
        isFr
          ? "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
          : "حدث خطأ أثناء تسجيل المساعدة. حاول مرة أخرى.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.success) {
    return (
      <div className="animate-rise space-y-5">
        <SuccessPanel
          title={isFr ? "Votre don a été enregistré avec succès" : "تم تسجيل مساعدتك بنجاح"}
          description={
            isFr
              ? "Merci pour votre contribution. L'équipe de coordination vous contactera bientôt. Ci-dessous, le besoin correspondant et le point de collecte recommandé."
              : "شكرًا لك. سيتواصل فريق التنسيق معك قريبًا لتأكيد التفاصيل. في الأسفل أقرب احتياج مطابق ونقطة التسليم المقترحة."
          }
          primaryHref="/map"
          primaryLabel={isFr ? "Voir les points de dépôt" : "عرض نقاط التسليم"}
        />

        {result.matches && result.matches.length > 0 && (
          <div>
            <h2 className="mb-2 font-bold">
              {isFr ? "Meilleures correspondances pour vos dons" : "أفضل تطابق لمساعدتك"}
            </h2>
            <div className="space-y-3">
              {result.matches.map((m) => (
                <Card key={m.need.id}>
                  <CardContent className="flex items-start justify-between gap-3 px-5">
                    <div>
                      <p className="flex items-center gap-1 font-bold">
                        <CategoryIcon slug={m.categorySlug} className="size-3.5" />
                        {m.need.title ?? categories.find((c) => c.slug === m.categorySlug)?.name_ar ?? m.categorySlug}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {m.need.commune}، {isFr ? `Wilaya de ${m.need.wilaya}` : `ولاية ${m.need.wilaya}`}
                      </p>
                      <p className="mt-1 text-sm">
                        {isFr ? "Manque : " : "النقص: "}
                        <strong className="text-priority-critical">
                          {formatQuantity(m.deficit, locale)} {getUnitLabel(m.need.unit, locale)}
                        </strong>
                      </p>
                    </div>
                    <PriorityBadge priority={m.need.priority} locale={locale} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {result.suggestedPoints && result.suggestedPoints.length > 0 && (
          <div>
            <h2 className="mb-2 font-bold">
              {isFr ? "Point de dépôt recommandé" : "نقطة التسليم المقترحة"}
            </h2>
            <div className="space-y-3">
              {result.suggestedPoints.map((p) => (
                <Card key={p.id}>
                  <CardContent className="space-y-2 px-5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold">{p.name}</p>
                      <PointStatusBadge status={p.status} />
                    </div>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {p.address ?? `${p.commune}، ${isFr ? `Wilaya de ${p.wilaya}` : `ولاية ${p.wilaya}`}`}
                      {p.distanceKm !== null
                        ? isFr
                          ? ` — à environ ${formatQuantity(p.distanceKm, locale)} km`
                          : ` — على بعد ${formatQuantity(p.distanceKm, locale)} كم تقريبًا`
                        : ""}
                    </p>
                    {p.openingHours ? (
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="size-3.5" />
                        {p.openingHours}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(!result.matches || result.matches.length === 0) && (
          <Alert>
            <AlertTitle className="flex items-center gap-1.5">
              <CircleCheck className="size-4 text-algeria-green" />{" "}
              {isFr ? "Cet article est actuellement bien approvisionné" : "هذه المادة متوفرة حاليًا بشكل جيد"}
            </AlertTitle>
            <AlertDescription>
              {isFr
                ? "Nous n'avons pas constaté de manque critique pour cet article. L'équipe de coordination orientera votre don vers le point le plus approprié."
                : "لم نجد نقصًا حرجًا في هذه المادة حاليًا. سيراجع فريق التنسيق تسجيلك ويوجّهه لأقرب نقطة مناسبة، أو يمكنك مراجعة صفحة الاحتياجات لرؤية ما هو أكثر إلحاحًا الآن."}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 px-5">
          <h2 className="font-bold">{isFr ? "Articles disponibles" : "المواد التي تملكها"}</h2>
          {fields.map((field, index) => {
            const categoryId = watch(`items.${index}.category_id`);
            return (
              <div key={field.id} className="space-y-3 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <Label>{isFr ? `Article ${index + 1}` : `المادة ${index + 1}`}</Label>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(index)}
                      aria-label={isFr ? "Supprimer cet article" : "حذف هذه المادة"}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <Select
                  value={categoryId}
                  onValueChange={(v: string | null) => {
                    if (!v) return;
                    setValue(`items.${index}.category_id`, v);
                    const cat = categories.find((c) => c.id === v);
                    if (cat) setValue(`items.${index}.unit`, cat.default_unit);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isFr ? "Catégorie" : "نوع المساعدة"}>
                      {(value: string) => {
                        const c = categories.find((cat) => cat.id === value);
                        return c ? (
                          <>
                            <CategoryIcon slug={c.slug} className="inline size-3.5" /> {c.name_ar}
                          </>
                        ) : (
                          isFr ? "Catégorie" : "نوع المساعدة"
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <CategoryIcon slug={c.slug} className="inline size-3.5" /> {c.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1.5">{isFr ? "Quantité" : "الكمية"}</Label>
                    <Input
                      type="number"
                      step="any"
                      min={0}
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5">{isFr ? "Unité" : "الوحدة"}</Label>
                    <Select
                      value={watch(`items.${index}.unit`)}
                      onValueChange={(v: string | null) =>
                        v && setValue(`items.${index}.unit`, v as DonationInput["items"][number]["unit"])
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {(value: string) => getUnitLabel(value, locale)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {unitOptions.map((u) => (
                          <SelectItem key={u.value} value={u.value}>
                            {getUnitLabel(u.value, locale)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Input
                  placeholder={isFr ? "Description courte (facultatif)" : "وصف مختصر (اختياري)"}
                  {...register(`items.${index}.description`)}
                />
              </div>
            );
          })}
          {errors.items?.message && (
            <p className="text-sm text-destructive">{errors.items.message as string}</p>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              append({
                category_id: categories[0]?.id ?? "",
                category_slug: categories[0]?.slug ?? "",
                quantity: 1,
                unit: categories[0]?.default_unit ?? "piece",
                description: "",
              })
            }
          >
            <Plus className="size-4" /> {isFr ? "Ajouter un autre article" : "إضافة مادة أخرى"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 px-5">
          <h2 className="font-bold">{isFr ? "Localisation et acheminement" : "موقعك وطريقة التسليم"}</h2>

          <div>
            <Label className="mb-1.5">{isFr ? "Wilaya actuelle" : "الولاية الحالية"}</Label>
            <WilayaSelect
              locale={locale}
              value={watch("current_wilaya")}
              onChange={(e) => {
                setValue("current_wilaya", e.target.value);
                setValue("current_commune", "");
              }}
            />
            {errors.current_wilaya && (
              <p className="mt-1 text-sm text-destructive">{errors.current_wilaya.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5">{isFr ? "Commune / Quartier (facultatif)" : "البلدية / الحي (اختياري)"}</Label>
            <CommuneSelect
              wilaya={watch("current_wilaya")}
              locale={locale}
              value={watch("current_commune")}
              onChange={(e) => setValue("current_commune", e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={watch("needs_transport")}
              onCheckedChange={(v) => setValue("needs_transport", Boolean(v))}
            />
            {isFr ? "J'ai besoin d'une aide pour le transport" : "أحتاج مساعدة في النقل"}
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={watch("can_deliver_self")}
              onCheckedChange={(v) => setValue("can_deliver_self", Boolean(v))}
            />
            {isFr ? "Je peux déposer les dons moi-même" : "أستطيع توصيلها بنفسي"}
          </label>

          <div>
            <Label className="mb-1.5">{isFr ? "Disponibilité (facultatif)" : "متى ستكون جاهزة؟ (اختياري)"}</Label>
            <Input type="date" {...register("ready_at")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 px-5">
          <h2 className="font-bold">{isFr ? "Vos coordonnées" : "بياناتك"}</h2>
          <div>
            <Label className="mb-1.5">{isFr ? "Nom complet ou organisation" : "الاسم الكامل"}</Label>
            <Input {...register("donor_name")} />
            {errors.donor_name && (
              <p className="mt-1 text-sm text-destructive">{errors.donor_name.message}</p>
            )}
          </div>
          <div>
            <Label className="mb-1.5">{isFr ? "Numéro de téléphone" : "رقم الهاتف"}</Label>
            <Input dir="ltr" placeholder="0555xxxxxx" {...register("donor_phone")} />
            {errors.donor_phone && (
              <p className="mt-1 text-sm text-destructive">{errors.donor_phone.message}</p>
            )}
          </div>
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
        {isFr ? "Envoyer le don" : "إرسال"}
      </Button>
    </form>
  );
}
