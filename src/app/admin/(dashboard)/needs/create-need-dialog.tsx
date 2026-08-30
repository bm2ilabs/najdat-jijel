"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryEmoji, priorityLabels, unitLabels } from "@/lib/constants";
import { wilayaNames } from "@/lib/wilayas";
import { createNeed } from "@/actions/needs";
import type { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["categories"]["Row"];

const formSchema = z.object({
  category_id: z.string().uuid("اختر الفئة"),
  wilaya: z.string().min(1, "الولاية مطلوبة"),
  commune: z.string().min(1, "البلدية مطلوبة"),
  title: z.string().optional(),
  quantity_needed: z.number().positive("يجب أن تكون أكبر من صفر"),
  quantity_available: z.number().min(0),
  unit: z.enum(["piece", "box", "portion", "carton", "liter", "kg", "ton", "bundle", "person"]),
  priority: z.enum(["critical", "high", "medium", "low"]),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function CreateNeedDialog({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_id: categories[0]?.id ?? "",
      wilaya: "جيجل",
      commune: "",
      title: "",
      quantity_needed: 0,
      quantity_available: 0,
      unit: categories[0]?.default_unit ?? "piece",
      priority: "medium",
      notes: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const res = await createNeed(values);
    setSubmitting(false);
    if (!res.success) {
      toast.error(res.error ?? "حدث خطأ");
      return;
    }
    toast.success("تمت إضافة الاحتياج بنجاح");
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><Plus className="size-4" /> إضافة احتياج</Button>} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة احتياج جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="mb-1.5">المادة</Label>
            <Select
              value={watch("category_id")}
              onValueChange={(v: string | null) => {
                if (!v) return;
                setValue("category_id", v);
                const cat = categories.find((c) => c.id === v);
                if (cat) setValue("unit", cat.default_unit);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر المادة">
                  {(val: string) => {
                    const c = categories.find((cat) => cat.id === val);
                    return c ? `${categoryEmoji[c.slug] ?? "📦"} ${c.name_ar}` : "اختر المادة";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {categoryEmoji[c.slug] ?? "📦"} {c.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">الولاية</Label>
              <Select
                value={watch("wilaya")}
                onValueChange={(v: string | null) => v && setValue("wilaya", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {wilayaNames.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5">البلدية</Label>
              <Input {...register("commune")} />
              {errors.commune && <p className="mt-1 text-xs text-destructive">{errors.commune.message}</p>}
            </div>
          </div>

          <div>
            <Label className="mb-1.5">عنوان مختصر (اختياري)</Label>
            <Input {...register("title")} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="mb-1.5">المطلوب</Label>
              <Input type="number" {...register("quantity_needed", { valueAsNumber: true })} />
            </div>
            <div>
              <Label className="mb-1.5">المتوفر</Label>
              <Input type="number" {...register("quantity_available", { valueAsNumber: true })} />
            </div>
            <div>
              <Label className="mb-1.5">الوحدة</Label>
              <Select
                value={watch("unit")}
                onValueChange={(v: string | null) => v && setValue("unit", v as FormValues["unit"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{(val: string) => unitLabels[val as keyof typeof unitLabels] ?? val}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(unitLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {errors.quantity_needed && (
            <p className="text-xs text-destructive">{errors.quantity_needed.message}</p>
          )}

          <div>
            <Label className="mb-1.5">الأولوية</Label>
            <Select
              value={watch("priority")}
              onValueChange={(v: string | null) => v && setValue("priority", v as FormValues["priority"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue>{(val: string) => priorityLabels[val as keyof typeof priorityLabels] ?? val}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5">ملاحظات (اختياري)</Label>
            <Textarea {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              حفظ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
