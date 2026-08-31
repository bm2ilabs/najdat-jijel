import { SkeletonHeader, SkeletonFormCard, SkeletonListRows } from "@/components/admin/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <SkeletonFormCard fields={2} />
      <SkeletonListRows count={4} withFilterBar={false} lines={2} />
    </div>
  );
}
