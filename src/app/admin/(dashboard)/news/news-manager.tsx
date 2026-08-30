"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Eye, EyeOff, Newspaper, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { createPost, deletePost, togglePostPublished } from "@/actions/posts";
import type { Database } from "@/types/database";

type Post = Database["public"]["Tables"]["posts"]["Row"];

export function NewsManager({ posts }: { posts: Post[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [publish, setPublish] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Post | null>(null);
  const [, startTransition] = useTransition();

  async function submit() {
    setSubmitting(true);
    const res = await createPost({ title, excerpt, body, is_published: publish });
    setSubmitting(false);
    if (!res.success) {
      toast.error(res.error ?? "حدث خطأ");
      return;
    }
    toast.success(publish ? "تم نشر الخبر" : "تم حفظ المسودة");
    setTitle(""); setExcerpt(""); setBody(""); setPublish(true);
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm"><Plus className="size-4" /> خبر جديد</Button>} />
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>نشر خبر جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="mb-1.5">العنوان</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
              </div>
              <div>
                <Label className="mb-1.5">مقدمة قصيرة (اختياري)</Label>
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  maxLength={400}
                  rows={2}
                />
              </div>
              <div>
                <Label className="mb-1.5">نص الخبر</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={9}
                  placeholder="اترك سطرًا فارغًا بين كل فقرة وأخرى."
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={publish} onCheckedChange={(v) => setPublish(Boolean(v))} />
                نشر مباشرة (أزل التحديد لحفظه كمسودة)
              </label>
              <DialogFooter>
                <Button onClick={() => void submit()} disabled={submitting} className="w-full">
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  {publish ? "نشر" : "حفظ كمسودة"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {posts.length === 0 ? (
        <EmptyState icon={Newspaper} title="لا توجد أخبار بعد" description="انشر أول خبر للمنصة." />
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <Card key={p.id} className={p.is_published ? "" : "opacity-70"}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5">
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-tight">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.is_published ? "منشور" : "مسودة"}
                    {p.published_at ? ` · ${relativeTimeAr(p.published_at)}` : ""}
                    {p.author_name ? ` · ${p.author_name}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {p.is_published && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="عرض"
                      render={<Link href={`/news/${p.slug}`} target="_blank" />}
                    >
                      <ExternalLink className="size-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={p.is_published ? "إلغاء النشر" : "نشر"}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await togglePostPublished(p.id, !p.is_published);
                        if (!res.success) toast.error(res.error ?? "حدث خطأ");
                      })
                    }
                  >
                    {p.is_published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="حذف"
                    onClick={() => setPendingDelete(p)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الخبر؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيُحذف &quot;{pendingDelete?.title}&quot; نهائيًا. لا يمكن التراجع.
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
                  const res = await deletePost(target.id);
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
