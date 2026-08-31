"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { severityLabels } from "@/lib/constants";
import { AdminListFilter } from "@/components/admin/list-filter";
import { SeveritySelect } from "./severity-select";
import { AreaActions } from "./area-actions";
import type { Database } from "@/types/database";

type Area = Database["public"]["Tables"]["affected_areas"]["Row"];

const SEVERITY_OPTIONS = Object.entries(severityLabels).map(([value, label]) => ({
  value,
  label,
}));

export function AffectedAreasList({ rows }: { rows: Area[] }) {
  return (
    <AdminListFilter
      rows={rows}
      searchPlaceholder="ابحث بالبؤرة، الولاية، الدائرة، أو البلدية..."
      searchMatch={(a, q) =>
        (a.spot ?? "").toLowerCase().includes(q) ||
        a.wilaya.toLowerCase().includes(q) ||
        a.daira.toLowerCase().includes(q) ||
        a.commune.toLowerCase().includes(q)
      }
      filters={[{ label: "شدة الضرر", options: SEVERITY_OPTIONS, match: (a, v) => a.severity === v }]}
      emptyTitle="لا توجد مناطق مسجَّلة بعد"
      renderRow={(a) => (
        <Card key={a.id} className="py-4">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5">
            <div className="min-w-0">
              <p className="font-bold leading-tight">{a.spot}</p>
              <p className="text-sm text-muted-foreground">
                ولاية {a.wilaya} · دائرة {a.daira} · بلدية {a.commune}
              </p>
              {a.status_raw && (
                <p className="text-xs text-muted-foreground/80" dir="ltr">
                  {a.status_raw}
                </p>
              )}
              {a.source && <p className="text-[11px] text-muted-foreground/70 mt-0.5">المصدر: {a.source}</p>}
            </div>
            <div className="flex items-center gap-2">
              <SeverityBadge severity={a.severity} />
              <SeveritySelect id={a.id} severity={a.severity} />
              <AreaActions id={a.id} spot={a.spot || a.commune} />
            </div>
          </CardContent>
        </Card>
      )}
    />
  );
}
