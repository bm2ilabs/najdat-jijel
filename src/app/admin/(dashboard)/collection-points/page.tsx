import type { Metadata } from "next";
import { getAllCategories, getAllCollectionPoints } from "@/lib/data/admin";
import { CreatePointDialog } from "./create-point-dialog";
import { ExportCollectionPointsCsvButton } from "./export-csv-button";
import { CollectionPointsList } from "./collection-points-list";

export const metadata: Metadata = { title: "نقاط التجميع", robots: { index: false } };

export default async function AdminCollectionPointsPage() {
  const [points, categories] = await Promise.all([getAllCollectionPoints(), getAllCategories()]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">نقاط التجميع</h1>
          <p className="text-sm text-muted-foreground">
            حيث يسلّم المتبرعون مساعداتهم قبل نقلها إلى ولايات الحملة.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportCollectionPointsCsvButton rows={points} />
          <CreatePointDialog categories={categories} />
        </div>
      </div>

      <CollectionPointsList points={points} />
    </div>
  );
}
