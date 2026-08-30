import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env.local if present
function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = (match[2] || "").trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const [email, password, fullName] = process.argv.slice(2);

if (!email || !password) {
  console.log(`
الاستخدام:
  node scripts/create-admin.mjs <email> <password> [fullName]

مثال:
  node scripts/create-admin.mjs admin@jijel.dz "Admin@123456" "مشرف العمليات"
`);
  process.exit(1);
}

if (!url || !serviceKey || url.includes("your-project-ref")) {
  console.error(`
[خطأ]: لم يتم ضبط مفاتيح Supabase في ملف .env.local!
يرجى التأكد من وضع:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
`);
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`جارٍ إنشاء حساب الأدمن: ${email} ...`);

  // 1. Create or get user
  const { data: userRecord, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || "مشرف المنصة" },
  });

  let userId = userRecord?.user?.id;

  if (authError) {
    if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
      console.log("الحساب مسجّل مسبقًا في Auth، جاري تحديث كلمة المرور والدور إلى أدمن...");
      const { data: usersList } = await supabase.auth.admin.listUsers();
      const existing = usersList?.users?.find((u) => u.email === email);
      if (existing) {
        userId = existing.id;
        await supabase.auth.admin.updateUserById(userId, {
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName || "مشرف المنصة" },
        });
      } else {
        console.error("تعذر العثور على الحساب لتحديثه:", authError.message);
        process.exit(1);
      }
    } else {
      console.error("خطأ أثناء إنشاء الحساب:", authError.message);
      process.exit(1);
    }
  }

  // 2. Set profile role to 'admin'
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    role: "admin",
    full_name: fullName || "مشرف المنصة",
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    console.error("خطأ في تحديث جدول profiles:", profileError.message);
    process.exit(1);
  }

  console.log(`
=========================================
  تم إنشاء / ترقية حساب الأدمن بنجاح!
=========================================
  البريد الإلكتروني: ${email}
  كلمة المرور:        ${password}
  الاسم:              ${fullName || "مشرف المنصة"}
  الدور:              admin
=========================================
يمكنك الآن التوجه إلى /admin/login وتسجيل الدخول.
`);
}

main();
