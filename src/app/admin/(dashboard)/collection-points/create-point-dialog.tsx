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
import { Checkbox } from "@/components/ui/checkbox";
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
import { categoryEmoji } from "@/lib/constants";
import { wilayaNames } from "@/lib/wilayas";
import { createCollectionPoint } from "@/actions/points";
import type { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["categories"]["Row"];

const formSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  wilaya: z.string().min(1, "الولاية مطلوبة"),
  commune: z.string().min(1, "البلدية مطلوبة"),
  address: z.string().optional(),
  phone: z.string().optional(),
  show_phone_publicly: z.boolean(),
  contact_name: z.string().optional(),
  opening_hours: z.string().optional(),
  notes: z.string().optional(),
  accepted_categories: z.array(z.string()),
});
type FormValues = z.infer<typeof formSchema>;

export function CreatePointDialog({ categories }: { categories: Category[] }) {
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
      name: "",
      wilaya: "",
      commune: "",
      address: "",
      phone: "",
      show_phone_publicly: false,
      contact_name: "",
      opening_hours: "",
      notes: "",
      accepted_categories: [],
    },
  });

  const acceptedCategories = watch("accepted_categories");

  function toggleCategory(slug: string) {
    const current = acceptedCategories ?? [];
    setValue(
      "accepted_categories",
      current.includes(slug) ? current.filter((v) => v !== slug) : [...current, slug],
    );
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const res = await createCollectionPoint(values);
    setSubmitting(false);
    if (!res.success) {
      toast.error(res.error ?? "حدث خطأ");
      return;
    }
    toast.success("تمت إضافة نقطة التجميع بنجاح");
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><Plus className="size-4" /> إضافة نقطة تجميع</Button>} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة نقطة تجميع</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="mb-1.5">اسم النقطة</Label>
            <Input {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">الولاية</Label>
              <Select
                value={watch("wilaya")}
                onValueChange={(v: string | null) => v && setValue("wilaya", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {wilayaNames.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.wilaya && <p className="mt-1 text-xs text-destructive">{errors.wilaya.message}</p>}
            </div>
            <div>
              <Label className="mb-1.5">البلدية</Label>
              <Input {...register("commune")} />
              {errors.commune && <p className="mt-1 text-xs text-destructive">{errors.commune.message}</p>}
            </div>
          </div>

          <div>
            <Label className="mb-1.5">العنوان (اختياري)</Label>
            <Input {...register("address")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">الهاتف (اختياري)</Label>
              <Input dir="ltr" {...register("phone")} />
            </div>
            <div>
              <Label className="mb-1.5">اسم المسؤول (اختياري)</Label>
              <Input {...register("contact_name")} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={watch("show_phone_publicly")}
              onCheckedChange={(v) => setValue("show_phone_publicly", Boolean(v))}
            />
            عرض رقم الهاتف للعامة
          </label>

          <div>
            <Label className="mb-1.5">ساعات العمل (اختياري)</Label>
            <Input {...register("opening_hours")} />
          </div>

          <div>
            <Label className="mb-2">المواد المقبولة</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-1.5 text-xs">
                  <Checkbox
                    checked={acceptedCategories?.includes(c.slug)}
                    onCheckedChange={() => toggleCategory(c.slug)}
                  />
                  {categoryEmoji[c.slug] ?? "📦"} {c.name_ar}
                </label>
              ))}
            </div>
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
