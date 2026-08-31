"use client";

import { Card, CardContent } from "@/components/ui/card";
import { relativeTimeAr, roleLabels, type AppRole } from "@/lib/constants";
import { AdminListFilter } from "@/components/admin/list-filter";
import { UserRoleSelect } from "./user-role-select";
import { DeleteUserButton } from "./delete-user-button";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const ROLE_OPTIONS = Object.entries(roleLabels).map(([value, label]) => ({ value, label }));

export function UsersList({
  rows,
  currentUserId,
  isAdmin,
}: {
  rows: Profile[];
  currentUserId?: string;
  isAdmin: boolean;
}) {
  return (
    <AdminListFilter
      rows={rows}
      searchPlaceholder="ابحث بالاسم أو رقم الهاتف..."
      searchMatch={(p, q) => (p.full_name ?? "").toLowerCase().includes(q) || (p.phone ?? "").includes(q)}
      filters={[{ label: "الدور", options: ROLE_OPTIONS, match: (p, v) => p.role === v }]}
      emptyTitle="لا يوجد مستخدمون بعد"
      renderRow={(p) => (
        <Card key={p.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5">
            <div className="min-w-0">
              <p className="font-medium">
                {p.full_name || "بدون اسم"}
                {p.id === currentUserId && (
                  <span className="ms-2 rounded-full bg-algeria-green/10 px-2 py-0.5 text-xs font-semibold text-algeria-green">
                    أنت
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {p.phone || "بدون رقم"} · {roleLabels[p.role as AppRole]} · انضم {relativeTimeAr(p.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <UserRoleSelect id={p.id} role={p.role} />
              {isAdmin && p.id !== currentUserId && (
                <DeleteUserButton id={p.id} name={p.full_name || "هذا المستخدم"} />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    />
  );
}
