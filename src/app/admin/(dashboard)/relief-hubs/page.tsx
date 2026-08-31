import type { Metadata } from "next";
import { getAllReliefHubs } from "@/lib/data/admin";
import { CreateHubDialog } from "./create-hub-dialog";
import { ExportReliefHubsCsvButton } from "./export-csv-button";
import { ReliefHubsList } from "./relief-hubs-list";

export const metadata: Metadata = { title: "مراكز الاستقبال", robots: { index: false } };

export default async function AdminReliefHubsPage() {
  const hubs = await getAllReliefHubs();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">مراكز الاستقبال</h1>
          <p className="text-sm text-muted-foreground">مراكز الاستقبال داخل ولايات الحملة، ولكل مركز مخزونه الخاص.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportReliefHubsCsvButton rows={hubs} />
          <CreateHubDialog />
        </div>
      </div>

      <ReliefHubsList hubs={hubs} />
    </div>
  );
}
