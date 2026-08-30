import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { HeartHandshake, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "دخول فرق التنسيق",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-2/40 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-verified text-white shadow-xs">
            <HeartHandshake className="size-6" />
          </span>
          <h1 className="text-xl font-bold text-foreground">{siteConfig.shortName}</h1>
          <p className="text-xs text-muted">غرفة العمليات ودخول فرق التنسيق والإدارة</p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <div className="text-center">
          <a
            href="/api/admin/demo-login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-action-deep hover:underline"
          >
            <Sparkles className="size-3.5 text-action" />
            <span>رابط مباشر للدخول التجريبي السريع (بدون نموذج)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
