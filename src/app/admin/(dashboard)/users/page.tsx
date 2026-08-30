import type { Metadata } from "next";
import { ShieldCheck, Info, UserCheck, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { relativeTimeAr, roleLabels } from "@/lib/constants";
import { UserRoleSelect } from "./user-role-select";
import { AddStaffDialog } from "./add-staff-dialog";
import { DeleteUserButton } from "./delete-user-button";

export const metadata: Metadata = { title: "المشرفون وفريق العمل", robots: { index: false } };

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profiles }, { data: me }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    user
      ? supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const rows = profiles ?? [];
  const isAdmin = me?.role === "admin";
  const adminCount = rows.filter((p) => p.role === "admin").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">فريق العمل والمشرفون</h1>
          <p className="text-xs text-muted">
            {isAdmin
              ? "بصفتك مدير النظام يمكنك إضافة منسقين ومتطوعين جدد وتعيين صلاحياتهم."
              : "إدارة الصلاحيات وإضافة الحسابات متاحة لمديري النظام فقط."}
          </p>
        </div>
        {isAdmin && <AddStaffDialog />}
      </div>

      {isAdmin && (
        <div className="flex items-start gap-3 rounded-xl border border-verified/30 bg-verified/10 p-3.5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-verified-deep" />
          <p className="text-xs text-verified-deep font-semibold">
            يوجد حاليًا <strong className="font-bold">{adminCount}</strong> من حسابات إدارة النظام.
            يحمي النظام المنصة من حذف آخر حساب مدير لضمان استمرارية التحكم.
          </p>
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState title="لا يوجد مستخدمون بعد" />
      ) : (
        <div className="space-y-2.5">
          {rows.map((p) => {
            const isMe = p.id === user?.id;
            const initials = p.full_name
              ? p.full_name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
              : "م";

            return (
              <Card key={p.id} className="p-3.5 hover:border-border-strong transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-foreground">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground truncate">{p.full_name || "بدون اسم"}</p>
                        {isMe && (
                          <span className="rounded-full bg-verified/15 px-2 py-0.5 text-[10px] font-bold text-verified-deep">
                            أنت
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted">
                        {p.phone ? <span dir="ltr">{p.phone}</span> : "بدون رقم هاتف"} · انضم {relativeTimeAr(p.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <UserRoleSelect id={p.id} role={p.role} />
                    {isAdmin && !isMe && (
                      <DeleteUserButton id={p.id} name={p.full_name || "هذا المستخدم"} />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-border bg-surface/50 p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-muted" />
        <p className="text-xs text-muted">
          يمكن أيضًا إنشاء حساب مسؤول مباشرة من الطرفية:{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] font-mono text-foreground">
            node scripts/create-admin.mjs &lt;email&gt; &lt;password&gt; &quot;الاسم&quot;
          </code>
        </p>
      </div>
    </div>
  );
}
