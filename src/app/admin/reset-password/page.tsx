import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "إعادة تعيين كلمة المرور",
  robots: { index: false, follow: false },
};

export default function AdminResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-algeria-green text-algeria-green-foreground">
            <HeartHandshake className="size-6" />
          </span>
          <p className="text-xl font-bold">{siteConfig.shortName}</p>
          <p className="text-sm text-muted-foreground">اختر كلمة مرور جديدة لحسابك</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
