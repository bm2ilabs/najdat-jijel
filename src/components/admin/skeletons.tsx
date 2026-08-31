import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * كتل جاهزة لبناء `loading.tsx` في كل مسار من مسارات لوحة الإدارة — كل مسار
 * يركّبها بما يقارب شكل صفحته الفعلي (عنوان، بطاقات إحصاء، قائمة أو شبكة...)
 * حتى يظهر هيكل مألوف فورًا أثناء جلب البيانات، بدل شاشة فارغة أو دوّارة تحميل.
 */

export function SkeletonHeader({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      {withAction && <Skeleton className="h-9 w-32 rounded-lg" />}
    </div>
  );
}

export function SkeletonStatCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="gap-2 py-5">
          <CardContent className="flex items-center justify-between gap-3 px-5">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
            <Skeleton className="size-11 shrink-0 rounded-2xl" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SkeletonChartRow() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardContent className="space-y-3 px-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 px-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

/** شريط بحث/فلاتر وهمي — يطابق شكل AdminListFilter الحقيقي. */
export function SkeletonFilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Skeleton className="h-9 min-w-[220px] flex-1 rounded-md" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

export function SkeletonListRows({
  count = 6,
  withFilterBar = true,
  lines = 2,
}: {
  count?: number;
  withFilterBar?: boolean;
  lines?: number;
}) {
  return (
    <div className="space-y-4">
      {withFilterBar && <SkeletonFilterBar />}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                {Array.from({ length: lines - 1 }).map((_, j) => (
                  <Skeleton key={j} className="h-3.5 w-56" />
                ))}
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SkeletonFormCard({ fields = 3 }: { fields?: number }) {
  return (
    <Card>
      <CardContent className="space-y-4 px-5">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function SkeletonGridCards({
  count = 6,
  withFilterBar = true,
}: {
  count?: number;
  withFilterBar?: boolean;
}) {
  return (
    <div className="space-y-4">
      {withFilterBar && <SkeletonFilterBar />}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-2.5 px-5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3.5 w-28" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
