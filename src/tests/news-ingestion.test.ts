import { describe, it, expect } from "vitest";
import {
  classifyNewsItem,
  OFFICIAL_ALGERIAN_SOURCES,
} from "@/config/news-sources";
import { z } from "zod";

const webhookPayloadSchema = z.object({
  title: z.string().optional(),
  text: z.string().optional(),
  message: z.string().optional(),
  url: z.string().optional().nullable(),
  source: z.string().optional(),
});

describe("Bloc 1: Crisis Intelligence & News Classification", () => {
  describe("Heuristic Disaster Classifier (`classifyNewsItem`)", () => {
    it("detects critical urgency keywords", () => {
      const urgentTexts = [
        "عاجل: إخلاء فوري لسكان قرية تيمريز بسبب اقتراب ألسنة اللهب",
        "طريق مقطوع تماما بسبب تساقط الحجارة والحرائق",
        "تحذير عالي من مصالح الحماية المدنية: خطر داهم",
      ];

      for (const text of urgentTexts) {
        const result = classifyNewsItem(text);
        expect(result.is_urgent).toBe(true);
      }
    });

    it("identifies Jijel wilaya and its various communes", () => {
      expect(classifyNewsItem("حريق غابة بقرية العوانة بولاية جيجل").wilaya).toBe("جيجل");
      expect(classifyNewsItem("تدخل الرتل المتنقل في زيامة منصورية").wilaya).toBe("جيجل");
      expect(classifyNewsItem("محافظة الغابات تفتح مسالك جديدة في تاكسنة").wilaya).toBe("جيجل");
      expect(classifyNewsItem("إخماد حريق أحراش ببلدية الميلية").wilaya).toBe("جيجل");
      expect(classifyNewsItem("فرق الإطفاء في جيملة وسلمى بن زيادة").wilaya).toBe("جيجل");
      expect(classifyNewsItem("عملية حراسة وقائية في الشقفة والطاهير").wilaya).toBe("جيجل");
    });

    it("identifies neighboring wilayas in border crises", () => {
      expect(classifyNewsItem("الحماية المدنية تخمد حريق غابة في خراطة بولاية بجاية").wilaya).toBe("بجاية");
      expect(classifyNewsItem("جهود إخماد متواصلة في غابات بابور بسطيف").wilaya).toBe("سطيف");
      expect(classifyNewsItem("نشرية خاصة ببلدية فرجيوة في ميلة").wilaya).toBe("ميلة");
      expect(classifyNewsItem("حريق في أحراش القل بسكيكدة").wilaya).toBe("سكيكدة");
    });

    it("classifies update types correctly", () => {
      // 1. Road status
      const roadResult = classifyNewsItem("إعادة فتح الطريق الوطني RN43 أمام حركة المرور والشاحنات");
      expect(roadResult.update_type).toBe("road_status");

      const road77Result = classifyNewsItem("الدرك الوطني (طريقي): انقطاع حركة السير على الطريق الوطني 77");
      expect(road77Result.update_type).toBe("road_status");

      // 2. Fire alerts & modern firefighting terms
      const fireResult = classifyNewsItem("طلعات جوية لطائرات الإخماد بيريف BE-200 للسيطرة على بؤر النيران");
      expect(fireResult.update_type).toBe("fire_alert");

      // 3. Weather warnings & BMS
      const weatherResult = classifyNewsItem("الديوان الوطني للأرصاد: نشرية خاصة BMS تحذر من هبوب رياح سيروكو حارة");
      expect(weatherResult.update_type).toBe("weather_warning");

      // 4. Safety & evacuation guidelines
      const safetyResult = classifyNewsItem("توجيهات ووقاية: إرشادات السلامة للمواطنين وتجنب المسالك الغابية");
      expect(safetyResult.update_type).toBe("safety_guidelines");
    });
  });

  describe("Official Sources Configuration", () => {
    it("contains all required verified sources with proper URLs", () => {
      const sourceIds = OFFICIAL_ALGERIAN_SOURCES.map((s) => s.id);
      expect(sourceIds).toContain("dgpc_jijel");
      expect(sourceIds).toContain("dgpc_setif");
      expect(sourceIds).toContain("dgpc_mila");
      expect(sourceIds).toContain("meteo_algerie");
      expect(sourceIds).toContain("cra_algerie");
      expect(sourceIds).toContain("tariki");
      expect(sourceIds).toContain("dgf");

      const setif = OFFICIAL_ALGERIAN_SOURCES.find((s) => s.id === "dgpc_setif");
      expect(setif?.sourceUrl).toBe("https://www.facebook.com/DGPC0019/");

      const mila = OFFICIAL_ALGERIAN_SOURCES.find((s) => s.id === "dgpc_mila");
      expect(mila?.sourceUrl).toBe("https://www.facebook.com/DGPC0043/");

      const meteo = OFFICIAL_ALGERIAN_SOURCES.find((s) => s.id === "meteo_algerie");
      expect(meteo?.sourceUrl).toBe("https://www.facebook.com/MeteoAlgerieOfficiel/");

      const cra = OFFICIAL_ALGERIAN_SOURCES.find((s) => s.id === "cra_algerie");
      expect(cra?.sourceUrl).toBe("https://www.facebook.com/algerianred/?locale=fr_FR");
    });
  });

  describe("Webhook Payload Validation", () => {
    it("validates well-formed webhook payloads", () => {
      const validPayload = {
        title: "بيان عاجل",
        message: "حريق غابة العوانة تحت السيطرة",
        url: "https://facebook.com/DGPC0018/posts/999",
        source: "مديرية الحماية المدنية لولاية جيجل",
      };

      const parsed = webhookPayloadSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
    });

    it("accepts text or message field flexibly", () => {
      const payloadWithTextOnly = {
        text: "حالة الطرقات: الطريق الوطني 43 سالك",
      };
      const parsed = webhookPayloadSchema.safeParse(payloadWithTextOnly);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.text).toBe("حالة الطرقات: الطريق الوطني 43 سالك");
      }
    });
  });
});
