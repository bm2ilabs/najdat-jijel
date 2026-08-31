/**
 * أداة تصدير CSV عامة لصفحات الإدارة — نفس منطق تهريب الخلايا وBOM المستعمل
 * في src/app/admin/(dashboard)/{beneficiaries,users}/export-csv-button.tsx
 * (لم تُعدَّل تلك الملفات، هذه نسخة مشتركة للاستعمال في الصفحات الجديدة فقط).
 */

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

function toCsvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => toCsvCell(c.header)).join(",");
  const lines = rows.map((r) => columns.map((c) => toCsvCell(c.value(r))).join(","));
  // BOM حتى يفتح Excel النص العربي بترميز UTF-8 صحيح بدل تشويهه.
  return "﻿" + [header, ...lines].join("\r\n");
}

export function downloadCsv(csv: string, filenamePrefix: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
