import { SkeletonHeader, SkeletonStatCards, SkeletonChartRow, SkeletonListRows } from "@/components/admin/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <SkeletonStatCards count={6} />
      <SkeletonChartRow />
      <SkeletonListRows count={4} withFilterBar={false} lines={1} />
    </div>
  );
}
