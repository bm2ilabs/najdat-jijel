"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Eye, EyeOff, Megaphone, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { relativeTimeAr } from "@/lib/constants";
import { AdminListFilter, type AdminBulkAction } from "@/components/admin/list-filter";
import { ExportAnnouncementsCsvButton } from "./export-csv-button";
import {
  createAnnouncement,
  deleteAnnouncement,
  toggleAnnouncement,
} from "@/actions/announcements";
import type { Database } from "@/types/database";

type Announcement = Database["public"]["Tables"]["announcements"]["Row"];

const STATUS_OPTIONS = [
  { value: "active", label: "مفعّلة" },
  { value: "inactive", label: "متوقفة" },
];

const BULK_ACTIONS: AdminBulkAction<Announcement>[] = [
  { label: "تفعيل", icon: CheckCircle2, run: (a) => toggleAnnouncement(a.id, true) },
  { label: "إيقاف", icon: XCircle, variant: "outline", run: (a) => toggleAnnouncement(a.id, false) },
  {
    label: "حذف",
    icon: Trash2,
    variant: "destructive",
    confirmMessage: "حذف الرسائل المحدَّدة نهائيًا؟",
    run: (a) => deleteAnnouncement(a.id),
  },
];

export function AnnouncementsManager({ items }: { items: Announcement[] }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Announcement | null>(null);
  const [, startTransition] = useTransition();

  async function add() {
    if (message.trim().length < 3) {
      toast.error("اكتب نص الرسالة أولًا");
      return;
    }
    setSubmitting(true);
    const res = await createAnnouncement({ message, sort_order: 0 });
    setSubmitting(false);
    if (!res.success) {
      toast.error(res.error ?? "حدث خطأ");
      return;
    }
    toast.success("أُضيفت الرسالة إلى الشريط");
    setMessage("");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-3 px-5">
          <Label>رسالة جديدة</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="مثال: امتلأت نقطة تجميع الطاهير — وجّهوا المساعدات إلى الميلية"
              maxLength={300}
              onKeyDown={(e) => {
                if (e.key === "Enter") void add();
              }}
            />
            <Button onClick={() => void add()} disabled={submitting} className="shrink-0">
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              إضافة
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            تظهر الرسائل المفعّلة فورًا في الشريط الأحمر أعلى الصفحة الرئيسية، وتتناوب تلقائيًا.
          </p>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="لا توجد رسائل في الشريط"
          description="عند عدم وجود رسائل مفعّلة يظهر التنبيه الافتراضي حول عدم إرسال مساعدات عشوائية."
        />
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end">
            <ExportAnnouncementsCsvButton rows={items} />
          </div>
          <AdminListFilter
            rows={items}
            searchPlaceholder="ابحث في نص الرسائل..."
            searchMatch={(a, q) => a.message.toLowerCase().includes(q)}
            filters={[
              {
                label: "الحالة",
                options: STATUS_OPTIONS,
                match: (a, v) => (v === "active" ? a.is_active : !a.is_active),
              },
            ]}
            getRowId={(a) => a.id}
            bulkActions={BULK_ACTIONS}
            emptyTitle="لا توجد رسائل في الشريط"
            listClassName="space-y-2"
            renderRow={(a) => (
              <Card key={a.id} className={a.is_active ? "" : "opacity-60"}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{a.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.is_active ? "مفعّلة" : "متوقفة"} · {relativeTimeAr(a.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={a.is_active ? "إيقاف" : "تفعيل"}
                      onClick={() =>
                        startTransition(async () => {
                          const res = await toggleAnnouncement(a.id, !a.is_active);
                          if (!res.success) toast.error(res.error ?? "حدث خطأ");
                        })
                      }
                    >
                      {a.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="حذف"
                      onClick={() => setPendingDelete(a)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          />
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الرسالة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الرسالة نهائيًا من شريط الأخبار. لا يمكن التراجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = pendingDelete;
                setPendingDelete(null);
                if (!target) return;
                startTransition(async () => {
                  const res = await deleteAnnouncement(target.id);
                  if (!res.success) toast.error(res.error ?? "حدث خطأ");
                  else toast.success("تم الحذف");
                });
              }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
