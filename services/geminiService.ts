
import { GoogleGenAI, Type } from "@google/genai";
import { RIYADH_BUILDING_REGULATIONS } from '../constants';
import { AuditReport } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface FileInput {
  base64: string;
  mimeType: string;
}

export const auditBuildingPlan = async (files: FileInput[], buildingType?: string): Promise<AuditReport> => {
  // Use gemini-3-pro-preview for deep architectural logic
  const modelName = 'gemini-3-pro-preview';

  const systemInstruction = `
    أنت "المهندس الشامل"، مدقق هندسي خبير.
    الهدف: فحص المخططات ومقارنتها مع "الدليل الموحد لاشتراطات رخص البناء في الرياض".
    
    التعليمات:
    1. استخرج المعايير بدقة (أرقام ومسافات).
    2. قارنها بالاشتراطات.
    3. كن مختصراً ودقيقاً جداً لتناسب النتيجة صفحة تقرير A4 واحدة أو صفحتين.
    4. في خانة (officialLetter) اكتب فقط النقاط الجوهرية التي تحتاج تعديل باختصار شديد.

    الدليل المرجعي:
    ${RIYADH_BUILDING_REGULATIONS}
  `;

  try {
    const fileParts = files.map(file => ({
      inlineData: {
        mimeType: file.mimeType,
        data: file.base64
      }
    }));

    const userMessage = buildingType 
      ? `المشروع: ${buildingType}. دقق المخطط واستخرج جدول المطابقة والملاحظات.`
      : `دقق المخطط المرفق بناء على الدليل الموحد. استخرج جدول المطابقة وقائمة التعديلات المطلوبة.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          ...fileParts,
          { text: userMessage }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        // تفعيل التفكير العميق لتحليل المخططات المعقدة
        thinkingConfig: { thinkingBudget: 16000 }, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectType: { type: Type.STRING },
            location: { type: Type.STRING },
            area: { type: Type.STRING },
            summary: { type: Type.STRING },
            finalVerdict: { type: Type.STRING, enum: ['مطابق', 'غير مطابق'] },
            auditorOpinion: { type: Type.STRING },
            officialLetter: { type: Type.STRING, description: "نقاط التعديل باختصار" },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  element: { type: Type.STRING },
                  planValue: { type: Type.STRING },
                  requiredValue: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ["مطابق", "مخالف", "غير موضح بالمخطط"] },
                  reference: { type: Type.STRING }
                },
                required: ["category", "element", "planValue", "requiredValue", "status", "reference"]
              }
            }
          },
          required: ["projectType", "location", "area", "items", "summary", "finalVerdict", "auditorOpinion", "officialLetter"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AuditReport;

  } catch (error) {
    console.error("Gemini Audit Error:", error);
    throw new Error("فشل التحليل. تأكد من وضوح المخططات وحاول مرة أخرى.");
  }
};

export const chatWithAuditor = async (message: string, history: { role: string, text: string }[]): Promise<string> => {
  const modelName = 'gemini-3-flash-preview';
  const systemInstruction = `أنت مساعد خبير في كود البناء السعودي والدليل الموحد. أجب بدقة واختصار.`;

  try {
    const contents = history.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: { systemInstruction, temperature: 0.7 },
    });

    return response.text || "عذراً، لا أستطيع الإجابة حالياً.";
  } catch (error) {
    return "حدث خطأ في الاتصال.";
  }
};
