"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * صورة مصغَّرة تفتح معرض صور بملء الشاشة عند النقر — تنقّل بالأسهم بين كل
 * صور نفس المجموعة (مثلًا صور تقييم ضرر واحد) دون فتح رابط جديد في تبويب.
 */
export function PhotoLightbox({ urls, className }: { urls: string[]; className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (urls.length === 0) return null;

  return (
    <>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {urls.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="overflow-hidden rounded-lg border border-border transition-opacity hover:opacity-80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- روابط موقّعة مؤقتة من Storage، لا تناسب next/image الثابت */}
            <img src={url} alt="صورة أضرار" className="size-20 object-cover" />
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(v) => !v && setOpenIndex(null)}>
        <DialogContent
          showCloseButton
          className="flex max-w-[calc(100%-2rem)] items-center justify-center border-none bg-transparent p-0 shadow-none ring-0 sm:max-w-3xl"
        >
          {openIndex !== null && (
            <div className="relative flex w-full items-center justify-center">
              {urls.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute start-2 z-10 rounded-full bg-card/90"
                  onClick={() => setOpenIndex((i) => (i === null ? null : (i - 1 + urls.length) % urls.length))}
                  aria-label="السابقة"
                >
                  <ChevronRight className="size-4 rtl:hidden" />
                  <ChevronLeft className="hidden size-4 rtl:block" />
                </Button>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element -- روابط موقّعة مؤقتة من Storage */}
              <img
                src={urls[openIndex]}
                alt={`صورة أضرار ${openIndex + 1} من ${urls.length}`}
                className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain"
              />

              {urls.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute end-2 z-10 rounded-full bg-card/90"
                    onClick={() => setOpenIndex((i) => (i === null ? null : (i + 1) % urls.length))}
                    aria-label="التالية"
                  >
                    <ChevronLeft className="size-4 rtl:hidden" />
                    <ChevronRight className="hidden size-4 rtl:block" />
                  </Button>
                  <span className="absolute bottom-2 start-1/2 -translate-x-1/2 rounded-full bg-card/90 px-2.5 py-0.5 text-xs font-medium text-foreground">
                    {openIndex + 1} / {urls.length}
                  </span>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
