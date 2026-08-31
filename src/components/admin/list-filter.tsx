"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export interface AdminFilterOption {
  value: string;
  label: string;
}

export interface AdminFilterDef<T> {
  label: string;
  options: AdminFilterOption[];
  /** يُطابق الصف مع قيمة الفلتر المختارة — يُتجاهل إن كانت القيمة "الكل". */
  match: (row: T, value: string) => boolean;
}

export interface AdminBulkAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "outline" | "destructive";
  /** تُنفَّذ لكل صف محدَّد على حدة (نفس صلاحيات إجراء الصف المفرد) — تُرمى الأخطاء لتُحتسَب كفشل. */
  run: (row: T) => Promise<{ success: boolean; error?: string }>;
  /** تأكيد قبل التنفيذ (مثلاً للحذف) — نص السؤال، أو تجاهله لتنفيذ مباشر. */
  confirmMessage?: string;
}

const PAGE_SIZE = 24;

/**
 * شريط بحث + فلاتر + تحديد جماعي عامّ لأي قائمة إدارية — يعمل بالكامل في
 * المتصفح على الصفوف المُحمَّلة مسبقًا (نفس نمط "اجلب كل شيء دون Pagination
 * من الخادم" المتّبع في كل صفحات لوحة الإدارة)، مع تصفّح "عرض المزيد" على
 * العميل لتفادي عرض مئات البطاقات دفعة واحدة.
 */
export function AdminListFilter<T>({
  rows,
  searchPlaceholder,
  searchMatch,
  filters = [],
  renderRow,
  emptyTitle,
  noResultsTitle = "لا توجد نتائج مطابقة",
  listClassName = "space-y-3",
  getRowId,
  bulkActions,
}: {
  rows: T[];
  searchPlaceholder: string;
  /** يُطابق الصف مع نص البحث (بعد تحويله lowercase) — أعد true إذا طابق أي حقل مهم. */
  searchMatch: (row: T, query: string) => boolean;
  filters?: AdminFilterDef<T>[];
  renderRow: (row: T) => React.ReactNode;
  emptyTitle: string;
  noResultsTitle?: string;
  /** حاوية الصفوف — الافتراضي عمود واحد، يمكن تمرير شبكة (grid) للبطاقات القصيرة. */
  listClassName?: string;
  /** مطلوب لتفعيل التحديد الجماعي — معرِّف فريد لكل صف. */
  getRowId?: (row: T) => string;
  /** إجراءات جماعية تُعرض عند تحديد صف واحد على الأقل. */
  bulkActions?: AdminBulkAction<T>[];
}) {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<number, string>>({});
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (q && !searchMatch(row, q)) return false;
      for (const [idx, value] of Object.entries(activeFilters)) {
        if (value === "الكل" || !value) continue;
        const def = filters[Number(idx)];
        if (def && !def.match(row, value)) return false;
      }
      return true;
    });
  }, [rows, query, activeFilters, searchMatch, filters]);

  // إعادة الصفحة الأولى عند تغيّر البحث أو الفلاتر حتى لا تظهر قائمة فارغة
  // بينما "عرض المزيد" لا يزال محدودًا بعدد الصفحة السابقة — تعديل الحالة أثناء
  // العرض نفسه (نمط React الموصى به) بدل useEffect لتفادي عرض مضاعف.
  const filterKey = query + "|" + JSON.stringify(activeFilters);
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  const hasActiveFilters = query.trim() !== "" || Object.values(activeFilters).some((v) => v && v !== "الكل");
  const visible = filtered.slice(0, visibleCount);
  const canBulkSelect = Boolean(getRowId && bulkActions && bulkActions.length > 0);
  const selectedRows = canBulkSelect ? rows.filter((r) => selected.has(getRowId!(r))) : [];

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    if (!getRowId) return;
    const visibleIds = visible.map(getRowId);
    const allSelected = visibleIds.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }

  async function runBulkAction(action: AdminBulkAction<T>) {
    if (action.confirmMessage && !window.confirm(action.confirmMessage)) return;
    setRunningAction(action.label);
    let okCount = 0;
    let failCount = 0;
    for (const row of selectedRows) {
      try {
        const res = await action.run(row);
        if (res.success) okCount++;
        else failCount++;
      } catch {
        failCount++;
      }
    }
    setRunningAction(null);
    setSelected(new Set());
    if (failCount === 0) toast.success(`تم تنفيذ "${action.label}" على ${okCount} عنصرًا`);
    else toast.error(`نجح ${okCount}، وفشل ${failCount} من إجمالي ${okCount + failCount}`);
    // يعيد تحميل بيانات المكوّن الخادمي الأب (page.tsx) دون فقد حالة البحث/الفلاتر هنا
    startTransition(() => router.refresh());
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 ps-8"
          />
        </div>
        {filters.map((def, idx) => (
          <div key={def.label} className="flex flex-wrap gap-1.5">
            {["الكل", ...def.options.map((o) => o.value)].map((value) => {
              const label = value === "الكل" ? `${def.label}: الكل` : def.options.find((o) => o.value === value)?.label ?? value;
              const active = (activeFilters[idx] ?? "الكل") === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveFilters((prev) => ({ ...prev, [idx]: value }))}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-algeria-green bg-algeria-green/10 text-algeria-green"
                      : "border-border bg-card text-muted-foreground hover:border-algeria-green/50 hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ))}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveFilters({});
            }}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" /> مسح الفلاتر
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          عرض <strong className="text-foreground">{Math.min(visible.length, filtered.length)}</strong> من أصل{" "}
          {filtered.length}
          {filtered.length !== rows.length && ` (إجمالي ${rows.length})`}
        </p>
        {canBulkSelect && (
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Checkbox
              checked={visible.length > 0 && visible.every((r) => selected.has(getRowId!(r)))}
              onCheckedChange={toggleAllVisible}
            />
            تحديد الكل في هذه الصفحة
          </label>
        )}
      </div>

      {canBulkSelect && selected.size > 0 && (
        <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-algeria-green/30 bg-algeria-green/10 px-3 py-2">
          <span className="text-xs font-bold text-algeria-green">{selected.size} عنصرًا محدَّدًا</span>
          <div className="flex flex-wrap gap-1.5">
            {bulkActions!.map((action) => {
              const Icon = action.icon;
              const busy = runningAction === action.label;
              return (
                <Button
                  key={action.label}
                  type="button"
                  size="sm"
                  variant={action.variant ?? "outline"}
                  disabled={runningAction !== null}
                  onClick={() => void runBulkAction(action)}
                >
                  {busy ? <Loader2 className="size-3.5 animate-spin" /> : Icon ? <Icon className="size-3.5" /> : null}
                  {action.label}
                </Button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ms-auto flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" /> إلغاء التحديد
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={noResultsTitle} />
      ) : (
        <>
          <div className={listClassName}>
            {visible.map((row) =>
              canBulkSelect ? (
                <div key={getRowId!(row)} className="flex items-start gap-2">
                  <Checkbox
                    className="mt-4 shrink-0"
                    checked={selected.has(getRowId!(row))}
                    onCheckedChange={() => toggleRow(getRowId!(row))}
                  />
                  <div className="min-w-0 flex-1">{renderRow(row)}</div>
                </div>
              ) : (
                renderRow(row)
              ),
            )}
          </div>
          {visibleCount < filtered.length && (
            <div className="flex justify-center pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                <ChevronDown className="size-3.5" />
                عرض المزيد ({filtered.length - visibleCount} متبقٍ)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
