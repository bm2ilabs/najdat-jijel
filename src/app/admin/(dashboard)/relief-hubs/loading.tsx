import { SkeletonHeader, SkeletonGridCards } from "@/components/admin/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader withAction />
      <SkeletonGridCards count={6} />
    </div>
  );
}
