import { SkeletonHeader, SkeletonChartRow } from "@/components/admin/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <SkeletonChartRow />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-2 px-5">
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-3.5 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
