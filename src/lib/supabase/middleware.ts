import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // مسارات إدارية متاحة للعامة دون تسجيل دخول — صفحة الدخول نفسها، وصفحتا
  // استرجاع/إعادة تعيين كلمة المرور (يصل إليهما مستخدم غير مسجَّل دخوله أصلًا،
  // وصفحة إعادة التعيين تُنشئ جلسة استرجاع مؤقتة من رابط البريد بنفسها).
  const publicAdminRoutes = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];
  const isPublicAdminRoute = publicAdminRoutes.includes(request.nextUrl.pathname);
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin") && !isPublicAdminRoute;

  if (isAdminRoute && !user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (request.nextUrl.pathname === "/admin/login" && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return supabaseResponse;
}
