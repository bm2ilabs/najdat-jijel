import { SkeletonHeader, SkeletonListRows } from "@/components/admin/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <SkeletonListRows count={6} lines={3} />
    </div>
  );
}
