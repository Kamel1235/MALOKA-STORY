
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { ProductCategory } from '../types';

// IMPORTANT: This uses process.env.API_KEY as per strict guidelines.
// Ensure API_KEY is set in your execution environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set in environment variables. AI features will not work.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
const modelName = 'gemini-2.5-flash-preview-04-17'; // This model supports multimodal input

export interface ImageInput {
  mimeType: string;
  data: string; // base64 encoded string
}

export const generateProductDescription = async (
  productName: string,
  category: ProductCategory | string,
  existingNotes: string = '',
  imageInput: ImageInput | null = null
): Promise<string> => {
  if (!ai) {
    return Promise.reject("Gemini API client is not initialized. Check API_KEY.");
  }

  const parts: Part[] = [];

  let promptText = `أنت مساعد إبداعي متخصص في كتابة أوصاف منتجات جذابة لمتجر إكسسوارات من الستانلس ستيل اسمه 'Maloka Story'.
المنتج الحالي هو:
الاسم: '${productName}'
الفئة: '${category}'
${existingNotes ? `ملاحظات إضافية أو كلمات مفتاحية أولية: '${existingNotes}'` : ''}

يرجى إنشاء وصف منتج فريد ومقنع باللغة العربية. يجب أن يكون الوصف موجزًا (حوالي 2-3 جمل)، جذابًا، ويسلط الضوء على أناقة المنتج وجودته وتميزه. اجعل الأسلوب متوافقًا مع العلامة التجارية التي تستهدف الشباب وتهتم بالموضة. تجنب استخدام markdown.`;
  
  parts.push({ text: promptText });

  if (imageInput) {
    parts.push({
      inlineData: {
        mimeType: imageInput.mimeType,
        data: imageInput.data,
      },
    });
    parts.push({ text: "الآن، بالتركيز بشكل أساسي على الصورة التي تم توفيرها أعلاه، قم بصياغة الوصف. استخدم المعلومات النصية السابقة (الاسم، الفئة، الملاحظات الأولية) فقط لتكملة أو تأكيد التفاصيل المرئية في الصورة." });
  }


  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: { parts }, // Pass as Content object with parts array
    });
    return response.text.trim();
  } catch (error) {
    console.error('Error generating product description:', error);
    if (error instanceof Error && error.message.includes("SAFETY")) {
         throw new Error('فشل إنشاء الوصف بسبب قيود السلامة. حاول تعديل الصورة أو النص.');
    }
    throw new Error('فشل في إنشاء وصف المنتج. يرجى المحاولة مرة أخرى.');
  }
};

export const getStylingTips = async (
  productName: string,
  productCategory: ProductCategory | string,
  productDescription: string
): Promise<string> => {
  if (!ai) {
    return Promise.reject("Gemini API client is not initialized. Check API_KEY.");
  }
  const prompt = `أنت خبير تنسيق أزياء (ستايلست) لمتجر إكسسوارات من الستانلس ستيل اسمه 'Maloka Story'.
المنتج الحالي:
الاسم: '${productName}'
الفئة: '${productCategory}'
الوصف: '${productDescription}'

يرجى تقديم 2-3 نصائح موجزة وعملية باللغة العربية (كل نصيحة في سطر منفصل) حول كيفية تنسيق هذه القطعة مع الملابس والإطلالات المختلفة. يجب أن تكون النصائح سهلة التطبيق وملهمة لعملاء المتجر. تجنب استخدام markdown.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: prompt, // Text-only model for this one is fine, or can upgrade if needed
    });
    return response.text.trim();
  } catch (error) {
    console.error('Error fetching styling tips:', error);
    if (error instanceof Error && error.message.includes("SAFETY")) {
         throw new Error('فشل جلب النصائح بسبب قيود السلامة.');
    }
    throw new Error('فشل في جلب نصائح التنسيق. يرجى المحاولة مرة أخرى.');
  }
};
