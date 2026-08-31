import { z } from "zod";

export const fieldVolunteerSkills = [
  "sorting_packaging",
  "loading_unloading",
  "distribution",
  "debris_clearing",
  "cooking_prep",
  "local_scouting",
  "first_aid",
  "general",
] as const;

export const fieldVolunteerMobilityOptions = [
  "has_4x4",
  "has_car",
  "has_motorcycle",
  "needs_transport",
  "none",
] as const;

export const fieldVolunteerAvailabilityOptions = [
  "immediate",
  "weekend",
  "specific_days",
  "on_call",
] as const;

export const fieldVolunteerEquipmentOptions = [
  "safety_boots",
  "gloves",
  "tools_shovels",
  "first_aid_kit",
] as const;

export const fieldVolunteerSchema = z.object({
  full_name: z
    .string({ error: "الاسم واللقب مطلوب" })
    .min(3, "الاسم يجب أن يحتوي على 3 أحرف على الأقل"),
  phone: z
    .string({ error: "رقم الهاتف مطلوب" })
    .regex(/^(0)(5|6|7)[0-9]{8}$/, "رقم الهاتف غير صحيح (مثال: 0612345678)"),
  wilaya_code: z.string({ error: "يرجى اختيار الولاية" }).min(1, "الولاية مطلوبة"),
  commune_id: z.string({ error: "يرجى اختيار البلدية أو مكان التواجد" }).min(1, "البلدية مطلوبة"),
  skills: z
    .array(z.string())
    .min(1, "يرجى اختيار مهارة أو مجال مساعدة واحد على الأقل"),
  mobility: z.string(),
  availability: z.string(),
  equipment: z.array(z.string()),
  emergency_contact: z
    .string()
    .max(50, "رقم أو اسم جهة الطوارئ لا يتجاوز 50 حرفًا")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(500, "الملاحظات لا يجب أن تتجاوز 500 حرف")
    .optional()
    .or(z.literal("")),
  show_phone_publicly: z.boolean(),
});

export type FieldVolunteerInput = z.infer<typeof fieldVolunteerSchema>;
