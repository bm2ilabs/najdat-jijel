import type { Metadata } from "next";
import { getAllCategories, getAllCollectionPoints } from "@/lib/data/admin";
import { CreatePointDialog } from "./create-point-dialog";
import { CollectionPointsTable } from "./collection-points-table";

export const metadata: Metadata = { title: "نقاط التجميع", robots: { index: false } };

export default async function AdminCollectionPointsPage() {
  const [points, categories] = await Promise.all([getAllCollectionPoints(), getAllCategories()]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">نقاط تجميع المساعدات</h1>
        <p className="text-xs text-muted">
          المواقع والمقرات المعتمدة في مختلف البلديات والولايات حيث يسلّم المتبرعون مساعداتهم قبل شحنها ونقلها إلى مراكز الاستقبال بولاية جيجل.
        </p>
      </div>

      <CollectionPointsTable
        initialPoints={points}
        categories={categories}
        actionButton={<CreatePointDialog categories={categories} />}
      />
    </div>
  );
}
