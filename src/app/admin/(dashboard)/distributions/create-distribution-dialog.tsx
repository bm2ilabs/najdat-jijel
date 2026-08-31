"use client";

import { useActionState, useState } from "react";
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
import { categoryEmoji, unitLabels, type UnitType } from "@/lib/constants";
import { createDistributionAction } from "@/actions/distributions";
import type { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Hub = Database["public"]["Tables"]["relief_hubs"]["Row"];

const initialState = { success: false, error: undefined as string | undefined };

export function CreateDistributionDialog({ hubs, categories }: { hubs: Hub[]; categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState(categories[0]?.default_unit ?? "piece");
  const [, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const res = await createDistributionAction(formData);
    if (res.success) {
      toast.success("تم تسجيل عملية التوزيع بنجاح");
      setOpen(false);
    } else {
      toast.error(res.error ?? "حدث خطأ");
    }
    return { success: res.success, error: "error" in res ? res.error : undefined };
  }, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm"><Plus className="size-4" /> تسجيل توزيع</Button>} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تسجيل عملية توزيع</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div>
            <Label className="mb-1.5">المركز</Label>
            <Select name="hub_id" defaultValue={hubs[0]?.id}>
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

          <div>
            <Label className="mb-1.5">المادة</Label>
            <Select
              name="category_id"
              defaultValue={categories[0]?.id}
              onValueChange={(v: string | null) => {
                const cat = categories.find((c) => c.id === v);
                if (cat) setUnit(cat.default_unit);
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
              <Input type="number" name="quantity" required />
            </div>
            <div>
              <Label className="mb-1.5">الوحدة</Label>
              <Select
                name="unit"
                value={unit}
                onValueChange={(v: string | null) => v && setUnit(v as UnitType)}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">عدد الأسر المستفيدة</Label>
              <Input type="number" name="beneficiary_family_count" defaultValue={0} required />
            </div>
            <div>
              <Label className="mb-1.5">تاريخ التوزيع</Label>
              <Input type="date" name="distribution_date" />
            </div>
          </div>

          <div>
            <Label className="mb-1.5">اسم المسؤول عن التوزيع</Label>
            <Input name="responsible_name" required />
          </div>

          <div>
            <Label className="mb-1.5">إثبات التوزيع (صورة، اختياري)</Label>
            <Input type="file" name="proof_file" accept="image/*" />
          </div>

          <div>
            <Label className="mb-1.5">ملاحظات (اختياري)</Label>
            <Textarea name="notes" />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full">
              {pending && <Loader2 className="size-4 animate-spin" />}
              حفظ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
