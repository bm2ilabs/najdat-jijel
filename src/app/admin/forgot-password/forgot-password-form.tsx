"use client";

import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    setLoading(false);
    // نعرض نفس الرسالة سواء وُجد الحساب أم لا — لا نكشف عن وجود بريد إلكتروني معيّن في النظام.
    if (resetError) {
      setError("حدث خطأ، حاول مرة أخرى بعد قليل.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 px-6 py-8 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-algeria-green/15 text-algeria-green">
            <MailCheck className="size-5" />
          </span>
          <p className="font-bold">تحقّق من بريدك الإلكتروني</p>
          <p className="text-sm text-muted-foreground">
            إذا كان البريد {email} مسجَّلًا لدينا، وصلك رابط لإعادة تعيين كلمة المرور — قد تستغرق
            الرسالة بضع دقائق، وتحقّق من مجلد الرسائل غير المرغوبة (Spam).
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="px-6 py-2">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5">البريد الإلكتروني</Label>
            <Input
              type="email"
              dir="ltr"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            إرسال رابط إعادة التعيين
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
