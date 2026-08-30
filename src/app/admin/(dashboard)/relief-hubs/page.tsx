import type { Metadata } from "next";
import { getAllReliefHubs } from "@/lib/data/admin";
import { CreateHubDialog } from "./create-hub-dialog";
import { ReliefHubsTable } from "./relief-hubs-table";

export const metadata: Metadata = { title: "مراكز الاستقبال والإيواء", robots: { index: false } };

export default async function AdminReliefHubsPage() {
  const hubs = await getAllReliefHubs();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">مراكز الاستقبال والإيواء</h1>
        <p className="text-xs text-muted">
          المراكز والمستودعات ومراكز إيواء العائلات داخل ولاية جيجل والولايات المعنية بالحملة. لكل مركز سجله ومخزونه الخاص.
        </p>
      </div>

      <ReliefHubsTable
        initialHubs={hubs}
        actionButton={<CreateHubDialog />}
      />
    </div>
  );
}
