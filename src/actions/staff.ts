"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/services/activity-log";
import { roleLabels, type AppRole } from "@/lib/constants";
import { siteConfig } from "@/config/site";

const staffRoles = ["admin", "coordinator", "volunteer"] as const;

const schema = z.object({
  email: z.string().trim().email("بريد إلكتروني غير صحيح"),
  full_name: z.string().trim().min(2, "الاسم مطلوب").max(120),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  role: z.enum(staffRoles),
});

export type CreateStaffInput = z.infer<typeof schema>;

/** كلمة مرور مؤقتة قوية تُعرض مرة واحدة للأدمن ليسلّمها للعضو الجديد. */
function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint32Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("") + "!7";
}

/**
 * إنشاء حساب لعضو في الطاقم (أدمن / منسّق / متطوع).
 * يتطلب أن يكون المنفِّذ أدمن — يُتحقق من ذلك على الخادم قبل استعمال مفتاح الخدمة،
 * لأن مفتاح الخدمة يتجاوز RLS بالكامل.
 */
export async function createStaffUser(input: CreateStaffInput) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة." };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: "يجب تسجيل الدخول." };

  // التحقق من صلاحية الأدمن على الخادم — لا يُعتمد على إخفاء الزر في الواجهة
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "admin") {
    return { success: false as const, error: "إضافة الأعضاء متاحة لحسابات الأدمن فقط." };
  }

  const admin = createAdminClient();
  const password = generatePassword();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: data.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: data.full_name },
  });

  if (createError || !created?.user) {
    const msg = createError?.message ?? "";
    return {
      success: false as const,
      error: /already|registered|exists/i.test(msg)
        ? "هذا البريد الإلكتروني مسجَّل مسبقًا."
        : "تعذر إنشاء الحساب. تحقق من البريد الإلكتروني.",
    };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ role: data.role, full_name: data.full_name, phone: data.phone || null })
    .eq("id", created.user.id);

  if (profileError) {
    // تفادي ترك حساب معلّق بلا دور صحيح
    await admin.auth.admin.deleteUser(created.user.id);
    return { success: false as const, error: "تعذر ضبط دور الحساب. لم يتم إنشاء العضو." };
  }

  await logActivity(supabase, {
    actorId: user.id,
    action: `أنشأ حساب ${roleLabels[data.role]} جديدًا: ${data.email}`,
    entityType: "profile",
    entityId: created.user.id,
  });

  revalidatePath("/admin/users");
  return { success: true as const, email: data.email, password };
}

/** حذف حساب عضو نهائيًا — للأدمن فقط، ولا يمكن حذف النفس. */
export async function deleteStaffUser(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "يجب تسجيل الدخول." };
  if (user.id === id) return { success: false, error: "لا يمكنك حذف حسابك الخاص." };

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "admin") return { success: false, error: "الحذف متاح لحسابات الأدمن فقط." };

  const admin = createAdminClient();
  const { data: target } = await admin.from("profiles").select("role").eq("id", id).maybeSingle();
  if (target?.role === "admin") {
    const { count } = await admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) <= 1) {
      return { success: false, error: "لا يمكن حذف آخر حساب أدمن في المنصة." };
    }
  }

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { success: false, error: "تعذر حذف الحساب." };

  await logActivity(supabase, {
    actorId: user.id,
    action: `حذف حساب مستخدم`,
    entityType: "profile",
    entityId: id,
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function listStaffRoles(): Promise<AppRole[]> {
  return [...staffRoles];
}

/**
 * يرسل رابط إعادة تعيين كلمة المرور لعضو موجود — مفيد عندما ينسى أحد الأدمن أو
 * الطاقم كلمة مروره ولا يستطيع الدخول بنفسه لطلب ذلك من /admin/forgot-password.
 * الأدمن فقط يستطيع تفعيل هذا لعضو آخر غير نفسه (لنفسه يستعمل صفحة نسيت كلمة المرور).
 */
export async function sendPasswordResetLink(targetUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: "يجب تسجيل الدخول." };

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "admin") {
    return { success: false as const, error: "إرسال رابط إعادة التعيين متاح لحسابات الأدمن فقط." };
  }

  const admin = createAdminClient();
  const { data: target, error: fetchError } = await admin.auth.admin.getUserById(targetUserId);
  if (fetchError || !target?.user?.email) {
    return { success: false as const, error: "تعذر العثور على البريد الإلكتروني لهذا الحساب." };
  }

  const { error: resetError } = await admin.auth.resetPasswordForEmail(target.user.email, {
    redirectTo: `${siteConfig.url}/admin/reset-password`,
  });
  if (resetError) {
    return { success: false as const, error: "تعذر إرسال رابط إعادة التعيين." };
  }

  await logActivity(supabase, {
    actorId: user.id,
    action: `أرسل رابط إعادة تعيين كلمة مرور لمستخدم`,
    entityType: "profile",
    entityId: targetUserId,
  });

  return { success: true as const, email: target.user.email };
}
