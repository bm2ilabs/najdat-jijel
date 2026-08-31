"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { siteConfig } from "@/config/site";

/**
 * حدّ الخطأ الجذري (Global Error Boundary) — يُعرَض فقط إذا فشل التخطيط
 * الجذري نفسه (root layout)، وهو استثناء يتطلّب تعريف <html>/<body> خاصَّين
 * به (لا يمكن الاعتماد على layout.tsx هنا لأنه هو نفسه قد يكون سبب الخطأ) —
 * لذا لا يُستعمَل getLocale() الخادمي، والافتراضي عربي/RTL مطابق للغة الأساسية.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f7f5] px-6 text-center font-sans text-[#171717]">
        <div className="flex size-14 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="size-7 text-red-600" />
        </div>
        <div className="space-y-1.5">
          <p className="text-lg font-bold">حدث خطأ غير متوقَّع في {siteConfig.shortName}</p>
          <p className="max-w-sm text-sm text-neutral-500">
            تعذّر تحميل المنصة. حاول إعادة المحاولة، وإذا استمرت المشكلة أعد تحميل الصفحة لاحقًا.
          </p>
          {error.digest && (
            <p className="text-xs text-neutral-400" dir="ltr">
              {error.digest}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-[#00843d] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <RotateCw className="size-4" /> إعادة المحاولة
        </button>
      </body>
    </html>
  );
}
