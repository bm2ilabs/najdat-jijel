import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // مسارات إدارية متاحة للعامة دون تسجيل دخول
  const publicAdminRoutes = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];
  const isPublicAdminRoute = publicAdminRoutes.includes(pathname);
  const isAdminRoute = pathname.startsWith("/admin") && !isPublicAdminRoute;
  const isLoginPage = pathname === "/admin/login";

  // 1. مسار فوري وسريع للزوار العاديين والصفحات العامة (يتجنب استدعاء الشبكة الخارجي تماماً)
  if (!isAdminRoute && !isLoginPage) {
    return NextResponse.next({ request });
  }

  // 2. التحقق من وجود كوكيز المصادقة قبل الاتصال بـ Supabase
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some((c) => c.name.startsWith("sb-"));

  // مستخدم غير مسجل يحاول الدخول للوحة الإدارة — توجيه فوري دون أي تأخير في الشبكة
  if (isAdminRoute && !hasAuthCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // مستخدم بدون كوكيز في صفحة الدخول — عرض الصفحة مباشرة دون استدعاء Supabase
  if (isLoginPage && !hasAuthCookie) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 3. استدعاء التحقق مع مهلة زمنية صارمة (3 ثوانٍ) لمنع تجمد الـ Middleware عند بطء الاتصال
  let user = null;
  try {
    const authPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase auth timeout")), 3000)
    );
    const result = await Promise.race([authPromise, timeoutPromise]);
    user = result.data.user;
  } catch (err) {
    console.error("Middleware auth check timed out or failed:", err);
    user = null;
  }

  if (isAdminRoute && !user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return supabaseResponse;
}
