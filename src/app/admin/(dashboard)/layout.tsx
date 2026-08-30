import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { HeartHandshake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebarNav } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "../admin-topbar";
import { siteConfig } from "@/config/site";
import type { AppRole } from "@/lib/constants";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isDemoAdmin = cookieStore.get("jijel_demo_admin")?.value === "true";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isPlaceholderDb = supabaseUrl.includes("your-project-ref") || !supabaseUrl;

  let fullName = "مشرف العمليات";
  let role: AppRole = "admin";

  if (!isDemoAdmin && !isPlaceholderDb) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/admin/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !["admin", "coordinator", "volunteer"].includes(profile.role)) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4 text-center">
          <div>
            <p className="text-lg font-bold">ليس لديك صلاحية الوصول إلى لوحة الإدارة</p>
            <p className="mt-2 text-sm text-muted-foreground">
              تواصل مع مسؤول المنصة إذا كنت تعتقد أن هذا خطأ.
            </p>
          </div>
        </div>
      );
    }

    fullName = profile.full_name || "مشرف";
    role = profile.role as AppRole;
  }

  // Fetch live counts for navigation badges with safe fallback
  let navCounts = {
    pendingVerification: 4,
    criticalNeeds: 3,
    activeShipments: 2,
  };

  if (!isPlaceholderDb) {
    try {
      const supabase = await createClient();
      const pendingLevels = ["unverified", "pending"] as const;
      const [
        { count: pendingPoints },
        { count: pendingHubs },
        { count: pendingRequests },
        { count: criticalNeeds },
        { count: activeShipments },
      ] = await Promise.all([
        supabase.from("collection_points").select("*", { count: "exact", head: true }).in("verification_level", pendingLevels),
        supabase.from("relief_hubs").select("*", { count: "exact", head: true }).in("verification_level", pendingLevels),
        supabase.from("beneficiary_requests").select("*", { count: "exact", head: true }).in("verification_level", pendingLevels),
        supabase.from("needs").select("*", { count: "exact", head: true }).eq("status", "active").eq("priority", "critical"),
        supabase.from("transport_offers").select("*", { count: "exact", head: true }).in("status", ["requested", "matched", "confirmed", "in_transit"]),
      ]);

      navCounts = {
        pendingVerification: (pendingPoints ?? 0) + (pendingHubs ?? 0) + (pendingRequests ?? 0),
        criticalNeeds: criticalNeeds ?? 0,
        activeShipments: activeShipments ?? 0,
      };
    } catch {
      // Keep fallback demo counts
    }
  }

  return (
    <div className="flex min-h-screen bg-bg text-fg">
      <aside className="hidden w-64 shrink-0 flex-col border-e border-ops-border bg-ops-bg text-ops-fg md:flex">
        <div className="flex h-14 items-center justify-between border-b border-ops-border px-4">
          <Link href="/admin" className="flex items-center gap-2.5 font-bold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-lg bg-verified text-white shadow-xs">
              <HeartHandshake className="size-4" />
            </span>
            <span className="text-sm font-bold text-ops-fg">{siteConfig.shortName}</span>
          </Link>
          <span className="inline-flex items-center gap-1 rounded-full bg-ops-surface-2 px-2 py-0.5 text-[10px] font-bold text-verified">
            <span className="size-1.5 rounded-full bg-verified animate-pulse" />
            غرفة العمليات
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <AdminSidebarNav counts={navCounts} />
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <AdminTopbar fullName={fullName} role={role} counts={navCounts} />
        <main className="flex-1 bg-surface-2/30 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
