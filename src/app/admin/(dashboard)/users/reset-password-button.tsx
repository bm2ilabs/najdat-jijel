"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendPasswordResetLink } from "@/actions/staff";

export function ResetPasswordButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label="إرسال رابط إعادة تعيين كلمة المرور"
      title="إرسال رابط إعادة تعيين كلمة المرور"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await sendPasswordResetLink(id);
          if (!res.success) toast.error(res.error);
          else toast.success(`أُرسل رابط إعادة التعيين إلى ${res.email}`);
        })
      }
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
    </Button>
  );
}
