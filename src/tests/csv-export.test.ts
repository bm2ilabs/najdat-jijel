import { describe, it, expect } from "vitest";
import { toCsvCell, buildCsv } from "@/lib/csv";

describe("CSV Export Module", () => {
  describe("toCsvCell escaping and sanitation", () => {
    it("handles null and undefined values by returning an empty string", () => {
      expect(toCsvCell(null)).toBe("");
      expect(toCsvCell(undefined)).toBe("");
    });

    it("formats numbers and booleans correctly", () => {
      expect(toCsvCell(42)).toBe("42");
      expect(toCsvCell(0)).toBe("0");
      expect(toCsvCell(true)).toBe("نعم");
      expect(toCsvCell(false)).toBe("لا");
      expect(toCsvCell(NaN)).toBe("");
      expect(toCsvCell(Infinity)).toBe("");
    });

    it("escapes quotes according to RFC 4180", () => {
      expect(toCsvCell('جمعية "الأمل" للإغاثة')).toBe('"جمعية ""الأمل"" للإغاثة"');
    });

    it("escapes cells containing commas and semicolons", () => {
      expect(toCsvCell("جيجل, الطاهير")).toBe('"جيجل, الطاهير"');
      expect(toCsvCell("مواد غذائية; أفرشة")).toBe('"مواد غذائية; أفرشة"');
    });

    it("normalizes CRLF and escapes newlines", () => {
      expect(toCsvCell("سطر أول\r\nسطر ثان")).toBe('"سطر أول\nسطر ثان"');
      expect(toCsvCell("سطر أول\rسطر ثان")).toBe('"سطر أول\nسطر ثان"');
    });

    it("protects international phone numbers from Excel formula crash (#NAME?)", () => {
      const phoneCell = toCsvCell("+213 555 12 34 56");
      expect(phoneCell).toBe('"\t+213 555 12 34 56"');
    });

    it("protects local phone numbers from leading-zero stripping in Excel", () => {
      const localPhone = toCsvCell("0550123456");
      expect(localPhone).toBe('"\t0550123456"');
    });

    it("prevents formula injection starting with =, -, @", () => {
      expect(toCsvCell("=SUM(A1:A10)")).toBe('"\t=SUM(A1:A10)"');
      expect(toCsvCell("@special_user")).toBe('"\t@special_user"');
      expect(toCsvCell("-10% تخفيض")).toBe('"\t-10% تخفيض"');
    });
  });

  describe("buildCsv table output", () => {
    it("generates well-formed CSV with headers and rows", () => {
      interface TestItem {
        id: string;
        name: string;
        phone: string;
        count: number;
        verified: boolean;
      }

      const rows: TestItem[] = [
        {
          id: "1",
          name: 'علي "الأمين"',
          phone: "+213 555 00 11 22",
          count: 5,
          verified: true,
        },
        {
          id: "2",
          name: "فاطمة الزهراء",
          phone: "0661123456",
          count: 2,
          verified: false,
        },
      ];

      const columns = [
        { header: "المعرف", value: (r: TestItem) => r.id },
        { header: "الاسم", value: (r: TestItem) => r.name },
        { header: "الهاتف", value: (r: TestItem) => r.phone },
        { header: "العدد", value: (r: TestItem) => r.count },
        { header: "تم التحقق", value: (r: TestItem) => r.verified },
      ];

      const csv = buildCsv(rows, columns);
      const lines = csv.split("\r\n");

      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe("المعرف,الاسم,الهاتف,العدد,تم التحقق");
      expect(lines[1]).toBe('1,"علي ""الأمين""","\t+213 555 00 11 22",5,نعم');
      expect(lines[2]).toBe('2,فاطمة الزهراء,"\t0661123456",2,لا');
    });
  });
});