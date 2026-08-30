import type { Metadata } from "next";
import { Phone, Stethoscope, PawPrint, Radio, HandHelping, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { relativeTimeAr, medicalVerificationStatusLabels } from "@/lib/constants";
import { MedicalStatusSelect } from "./medical-status-select";

export const metadata: Metadata = { title: "الأطقم الطبية والبيطرية", robots: { index: false } };

const statusOrder = { pending: 0, verified: 1, rejected: 2 };

export default async function AdminMedicalPage() {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from("medical_volunteers")
    .select("*")
    .order("created_at", { ascending: false });

  const rows: any[] = ((data ?? []) as any[]).slice().sort((a: any, b: any) => ((statusOrder as any)[a.status] ?? 0) - ((statusOrder as any)[b.status] ?? 0));
  const pendingCount = rows.filter((r: any) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الأطقم الطبية والبيطرية</h1>
        <p className="text-sm text-muted-foreground">
          {pendingCount === 0
            ? "لا يوجد متطوعون بانتظار التحقق حاليًا."
            : `${pendingCount} متطوعًا بانتظار المراجعة والتحقق.`}
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="لا يوجد متطوعون مسجَّلون بعد" />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const isVet = r.specialty.includes("بيطر") || r.specialty.toLowerCase().includes("vet");
            return (
              <Card key={r.id}>
                <CardContent className="space-y-2 px-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-bold">{r.full_name}</p>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        {isVet ? <PawPrint className="size-3.5" /> : <Stethoscope className="size-3.5" />}
                        {r.specialty}
                      </p>
                    </div>
                    <MedicalStatusSelect id={r.id} status={r.status} />
                  </div>

                  <p className="text-sm">
                    {r.commune_id}، ولاية {r.wilaya_code}
                    {r.current_workplace && ` — ${r.current_workplace}`}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {r.phone && (
                      <a
                        href={`tel:${r.phone.replace(/\s/g, "")}`}
                        dir="ltr"
                        className="flex items-center gap-1 font-semibold text-algeria-green hover:underline"
                      >
                        <Phone className="size-3.5" /> {r.phone}
                      </a>
                    )}
                    {r.license_number && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="size-3.5" /> رقم الرخصة: {r.license_number}
                      </span>
                    )}
                    {r.can_teleconsult && (
                      <span className="flex items-center gap-1 text-algeria-green">
                        <Radio className="size-3.5" /> استشارات هاتفية
                      </span>
                    )}
                    {r.can_field_intervene && (
                      <span className="flex items-center gap-1">
                        <HandHelping className="size-3.5" /> تدخل ميداني
                      </span>
                    )}
                  </div>

                  {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}

                  <p className="text-xs text-muted-foreground">
                    {medicalVerificationStatusLabels[r.status]} · {relativeTimeAr(r.created_at)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
