"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        setLoading(false);
        return;
      }

      router.push(next);
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("تعذر الاتصال بخادم المصادقة. يرجى المحاولة مرة أخرى.");
      setLoading(false);
    }
  }

  return (
    <Card className="border-border shadow-xs">
      <CardContent className="space-y-5 px-6 py-5">
        <form onSubmit={onSubmit} className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label className="mb-1.5 text-xs font-bold text-foreground">البريد الإلكتروني</Label>
            <Input
              type="email"
              dir="ltr"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-10 text-xs font-medium"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground">كلمة المرور</Label>
              <Link href="/admin/forgot-password" className="text-xs font-medium text-algeria-green hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>
            <Input
              type="password"
              dir="ltr"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 text-xs font-medium"
            />
          </div>

          <Button type="submit" className="w-full h-10 font-bold gap-2" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            <span>تسجيل الدخول</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
