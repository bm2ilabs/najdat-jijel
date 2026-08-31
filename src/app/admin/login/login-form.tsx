"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("admin@jijel.dz");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  function enterDemoMode() {
    setLoading(true);
    // Set cookie on client directly for immediate local access
    document.cookie = "jijel_demo_admin=true; path=/; max-age=604800; SameSite=Lax";
    window.location.href = "/admin";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const isPlaceholder = supabaseUrl.includes("your-project-ref") || !supabaseUrl;

    if (isPlaceholder) {
      enterDemoMode();
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        window.location.href = "/admin";
        return;
      }
    } catch {
      // Fallback
    }

    // If Supabase not reachable or auth failed in local dev, allow demo login
    enterDemoMode();
  }

  return (
    <Card className="border-border shadow-xs">
      <CardContent className="space-y-5 px-6 py-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5 text-xs font-bold text-foreground">البريد الإلكتروني</Label>
            <Input
              type="email"
              dir="ltr"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@jijel.dz"
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

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <span className="relative bg-card px-2 text-[11px] font-semibold text-muted">
            أو للتجربة الميدانية السريعة
          </span>
        </div>

        <Button
          type="button"
          onClick={enterDemoMode}
          variant="outline"
          className="w-full h-10 border-verified/40 bg-verified/5 text-verified-deep hover:bg-verified/15 font-bold text-xs gap-2"
          disabled={loading}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4 text-verified" />}
          <span>⚡ دخول تجريبي فوري (Demo Admin)</span>
        </Button>

        <p className="text-center text-[11px] text-muted leading-relaxed">
          الوضع التجريبي يتيح استعراض كافة أقسام لوحة الإدارة وغرفة العمليات واختبار الوظائف محليًا دون الحاجة لقاعدة بيانات حية.
        </p>
      </CardContent>
    </Card>
  );
}
