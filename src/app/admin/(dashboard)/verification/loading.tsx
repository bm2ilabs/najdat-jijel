import { SkeletonHeader, SkeletonListRows } from "@/components/admin/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <SkeletonHeader />
      {Array.from({ length: 3 }).map((_, i) => (
        <section key={i} className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <SkeletonListRows count={2} withFilterBar={false} lines={1} />
        </section>
      ))}
    </div>
  );
}
