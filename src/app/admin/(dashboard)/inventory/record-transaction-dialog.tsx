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
import { categoryEmoji, unitLabels } from "@/lib/constants";
import { recordInventoryTransaction } from "@/actions/inventory";
import type { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Hub = Database["public"]["Tables"]["relief_hubs"]["Row"];

const txnTypeLabels = { in: "وارد (استلام)", out: "صادر (صرف)", adjustment: "تسوية", transfer: "نقل بين مراكز" };

const formSchema = z.object({
  hub_id: z.string().uuid("اختر المركز"),
  category_id: z.string().uuid("اختر المادة"),
  type: z.enum(["in", "out", "adjustment", "transfer"]),
  quantity: z.number().positive("يجب أن تكون أكبر من صفر"),
  unit: z.enum(["piece", "box", "portion", "carton", "liter", "kg", "ton", "bundle", "person"]),
  destination_hub_id: z.string().optional(),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function RecordTransactionDialog({ hubs, categories }: { hubs: Hub[]; categories: Category[] }) {
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
      hub_id: hubs[0]?.id ?? "",
      category_id: categories[0]?.id ?? "",
      type: "in",
      quantity: 0,
      unit: categories[0]?.default_unit ?? "piece",
      note: "",
    },
  });

  const type = watch("type");

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const res = await recordInventoryTransaction({
      ...values,
      destination_hub_id: values.type === "transfer" ? values.destination_hub_id : undefined,
    });
    setSubmitting(false);
    if (!res.success) {
      toast.error(res.error ?? "حدث خطأ");
      return;
    }
    toast.success("تم تسجيل حركة المخزون بنجاح");
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><Plus className="size-4" /> تسجيل حركة مخزون</Button>} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تسجيل حركة مخزون</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="mb-1.5">نوع الحركة</Label>
            <Select
              value={type}
              onValueChange={(v: string | null) => v && setValue("type", v as FormValues["type"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue>{(v: string) => txnTypeLabels[v as keyof typeof txnTypeLabels]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(txnTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5">{type === "transfer" ? "المركز المصدر" : "المركز"}</Label>
            <Select
              value={watch("hub_id")}
              onValueChange={(v: string | null) => v && setValue("hub_id", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر المركز">
                  {(v: string) => hubs.find((h) => h.id === v)?.name ?? "اختر المركز"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {hubs.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "transfer" && (
            <div>
              <Label className="mb-1.5">المركز الوجهة</Label>
              <Select
                value={watch("destination_hub_id")}
                onValueChange={(v: string | null) => v && setValue("destination_hub_id", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر المركز الوجهة">
                    {(v: string) => hubs.find((h) => h.id === v)?.name ?? "اختر المركز الوجهة"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {hubs
                    .filter((h) => h.id !== watch("hub_id"))
                    .map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
                  {(v: string) => {
                    const c = categories.find((cat) => cat.id === v);
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
              <Label className="mb-1.5">الكمية</Label>
              <Input type="number" {...register("quantity", { valueAsNumber: true })} />
              {errors.quantity && <p className="mt-1 text-xs text-destructive">{errors.quantity.message}</p>}
            </div>
            <div>
              <Label className="mb-1.5">الوحدة</Label>
              <Select
                value={watch("unit")}
                onValueChange={(v: string | null) => v && setValue("unit", v as FormValues["unit"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string) => unitLabels[v as keyof typeof unitLabels]}</SelectValue>
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

          <div>
            <Label className="mb-1.5">ملاحظة (اختياري)</Label>
            <Textarea {...register("note")} />
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
