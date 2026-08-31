"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * حدّ خطأ (Error Boundary) لكل مسارات لوحة الإدارة — يلتقط أي خطأ غير
 * متوقَّع أثناء جلب البيانات أو العرض (فشل استعلام Supabase مثلًا) ويعرض
 * واجهة متّسقة مع هوية المنصة بدل شاشة Next.js الافتراضية.
 */
export default function AdminError({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-priority-critical/10">
        <AlertTriangle className="size-7 text-priority-critical" />
      </div>
      <div className="space-y-1.5">
        <p className="text-lg font-bold">حدث خطأ غير متوقَّع</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          تعذّر تحميل هذه الصفحة. حاول إعادة المحاولة، وإذا استمرت المشكلة تواصل مع فريق المنصة.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/70" dir="ltr">
            {error.digest}
          </p>
        )}
      </div>
      <Button onClick={reset}>
        <RotateCw className="size-4" /> إعادة المحاولة
      </Button>
    </div>
  );
}
