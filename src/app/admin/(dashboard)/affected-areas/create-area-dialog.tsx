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
import { WilayaSelect } from "@/components/ui/wilaya-select";
import { CommuneSelect } from "@/components/ui/commune-select";
import { createAffectedArea } from "@/actions/affected-areas";
import type { AffectedSeverity } from "@/lib/constants";

const formSchema = z.object({
  wilaya: z.string().min(1, "الولاية مطلوبة"),
  daira: z.string().min(1, "الدائرة مطلوبة"),
  commune: z.string().min(1, "البلدية مطلوبة"),
  spot: z.string().min(2, "اسم المنطقة أو البؤرة مطلوب"),
  severity: z.enum(["ravaged", "evacuated", "threatened", "burning", "unconfirmed"]),
  notes: z.string().optional(),
  source: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function CreateAreaDialog() {
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
      wilaya: "جيجل",
      daira: "",
      commune: "",
      spot: "",
      severity: "burning",
      notes: "",
      source: "إدارة المنصة",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const res = await createAffectedArea({
      wilaya: values.wilaya,
      daira: values.daira,
      commune: values.commune,
      spot: values.spot,
      severity: values.severity as AffectedSeverity,
      notes: values.notes,
      source: values.source,
    });
    setSubmitting(false);

    if (!res.success) {
      toast.error(res.error ?? "حدث خطأ");
      return;
    }

    toast.success("تمت إضافة المنطقة بنجاح");
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><Plus className="size-4" /> إضافة بؤرة متضررة</Button>} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة بؤرة أو منطقة متضررة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">الولاية</Label>
              <WilayaSelect
                value={watch("wilaya")}
                onChange={(e) => {
                  setValue("wilaya", e.target.value);
                  setValue("commune", "");
                }}
              />
              {errors.wilaya && <p className="mt-1 text-xs text-destructive">{errors.wilaya.message}</p>}
            </div>
            <div>
              <Label className="mb-1.5">البلدية</Label>
              <CommuneSelect
                wilaya={watch("wilaya")}
                value={watch("commune")}
                onChange={(e) => setValue("commune", e.target.value)}
              />
              {errors.commune && <p className="mt-1 text-xs text-destructive">{errors.commune.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">الدائرة (اختياري)</Label>
              <Input {...register("daira")} placeholder="مثال: الشقفة" />
              {errors.daira && <p className="mt-1 text-xs text-destructive">{errors.daira.message}</p>}
            </div>
            <div>
              <Label className="mb-1.5">اسم البؤرة / القرية</Label>
              <Input {...register("spot")} placeholder="مثال: تغراست" />
              {errors.spot && <p className="mt-1 text-xs text-destructive">{errors.spot.message}</p>}
            </div>
          </div>

          <div>
            <Label className="mb-1.5">مستوى الخطورة</Label>
            <Select
              value={watch("severity")}
              onValueChange={(v: string | null) => v && setValue("severity", v as FormValues["severity"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر مستوى الخطورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="burning">حريق نشط / متضرر</SelectItem>
                <SelectItem value="ravaged">أضرار جسيمة / ضحايا</SelectItem>
                <SelectItem value="evacuated">تم إجلاء السكان</SelectItem>
                <SelectItem value="threatened">منازل مهددة</SelectItem>
                <SelectItem value="unconfirmed">بلاغ غير مؤكد</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5">المصدر (اختياري)</Label>
            <Input {...register("source")} placeholder="مثال: الحماية المدنية، طاقم الميدان" />
          </div>

          <div>
            <Label className="mb-1.5">ملاحظات ميدانية (اختياري)</Label>
            <Textarea {...register("notes")} placeholder="تفاصيل التدخلات أو الاحتياجات الخاصة..." />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              حفظ ونشر
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
