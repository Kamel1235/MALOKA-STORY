
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { ProductCategory, Product } from '../types';

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
    let imageFocusPrompt = "الآن، بالتركيز بشكل أساسي على الصورة التي تم توفيرها أعلاه، قم بصياغة الوصف. استخدم المعلومات النصية السابقة (الاسم، الفئة، الملاحظات الأولية) فقط لتكملة أو تأكيد التفاصيل المرئية في الصورة.";
    if (category === ProductCategory.Rings) {
      imageFocusPrompt += " ركز بشكل خاص على وصف شكل الخاتم الظاهر في الصورة (مثلاً: دائري، بيضاوي، مربع، تصميم هندسي، ملتوي، مفتوح، إلخ) وأي أحجار كريمة أو نقوش أو تفاصيل تصميمية فريدة أخرى مرئية في الخاتم.";
    }
    parts.push({ text: imageFocusPrompt });
  }


  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: { parts }, 
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
        contents: prompt,
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

export interface GiftSuggestionInput {
  recipient: string;
  occasion: string;
  stylePreference: string;
  budget: string;
  availableProducts: Pick<Product, 'id' | 'name' | 'category' | 'price' | 'description'>[];
}

export interface GiftSuggestion {
  productName: string;
  reason: string;
  productId?: string;
}

export const suggestGifts = async (input: GiftSuggestionInput): Promise<GiftSuggestion[] | string> => {
  if (!ai) {
    return Promise.reject("Gemini API client is not initialized. Check API_KEY.");
  }

  const productListText = input.availableProducts.map(
    (p, index) => 
    `${index + 1}. اسم المنتج: ${p.name}, الفئة: ${p.category}, السعر: ${p.price} جنيه, الوصف: ${p.description.substring(0,100)}...`
  ).join('\n');

  const prompt = `أنت "مساعد الهدايا من ملوكة"، خبير في اقتراح هدايا إكسسوارات من متجر "Maloka Story".
مهمتك هي مساعدة المستخدم في إيجاد الهدية المثالية بناءً على إجاباته وقائمة المنتجات المتوفرة.

معلومات من المستخدم:
- الهدية موجهة لـ: ${input.recipient}
- المناسبة: ${input.occasion}
- الستايل المفضل للشخص: ${input.stylePreference}
- الميزانية التقريبية: ${input.budget}

قائمة المنتجات المتوفرة للاختيار منها (يرجى اختيار 2-3 منتجات فقط من هذه القائمة):
${productListText}

التعليمات:
1. اقترح 2 أو 3 منتجات من القائمة أعلاه كهدية.
2. يجب أن يكون كل اقتراح مصحوبًا بشرح موجز (جملة واحدة أو اثنتين) لسبب اختيارك لهذا المنتج بناءً على معطيات المستخدم.
3. قم بتنسيق الإجابة بحيث يكون كل اقتراح على النحو التالي، مع استخدام الفاصل "---" بين كل اقتراح والآخر إذا كان هناك أكثر من اقتراح:
   اسم المنتج: [اسم المنتج المقترح بالضبط كما هو في القائمة]
   سبب الاقتراح: [شرحك الموجز]
4. إذا لم تجد أي منتج من القائمة مناسبًا تمامًا بناءً على معايير المستخدم، اذكر ذلك بلطف في جملة واحدة، مثل: "لم أجد منتجًا يطابق هذه المعايير بدقة في الوقت الحالي. ربما يمكنك تجربة معايير بحث مختلفة أو تصفح الأقسام مباشرة."
5. لا تقم بتضمين أي مقدمات أو خواتيم إضافية خارج نسق الاقتراحات المطلوبة أو رسالة عدم التطابق.

الآن، بناءً على ما سبق، ما هي أفضل 2-3 هدايا يمكنك اقتراحها؟
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { temperature: 0.7 } 
    });

    const textResponse = response.text.trim();

    // Check for "no match" message
    if (textResponse.includes("لم أجد منتجًا يطابق") || textResponse.includes("لا يوجد منتج مناسب")) {
      return textResponse; // Return the "no match" message as a string
    }
    
    const suggestions: GiftSuggestion[] = [];
    const suggestionBlocks = textResponse.split('---').map(block => block.trim()).filter(block => block);

    for (const block of suggestionBlocks) {
      const nameMatch = block.match(/اسم المنتج:\s*(.*)/i);
      const reasonMatch = block.match(/سبب الاقتراح:\s*(.*)/i);

      if (nameMatch && nameMatch[1] && reasonMatch && reasonMatch[1]) {
        const productName = nameMatch[1].trim();
        const reason = reasonMatch[1].trim();
        // Find the product ID from the available products list
        const matchedProduct = input.availableProducts.find(p => p.name.trim().toLowerCase() === productName.toLowerCase());
        suggestions.push({ 
          productName, 
          reason,
          productId: matchedProduct?.id 
        });
      }
    }
    
    if (suggestions.length === 0 && !textResponse.startsWith("لم أجد منتجًا يطابق")) {
        // This case handles if the API returns something unexpected that isn't a "no match" message
        // and isn't parsable into suggestions.
        console.warn("Gemini response for gift suggestion was not in expected format:", textResponse);
        return "لم أتمكن من فهم اقتراحات الهدايا. الرجاء المحاولة مرة أخرى أو تعديل بحثك.";
    }

    return suggestions;

  } catch (error) {
    console.error('Error suggesting gifts:', error);
    if (error instanceof Error && error.message.includes("SAFETY")) {
      throw new Error('فشل اقتراح الهدايا بسبب قيود السلامة. حاول تعديل معايير البحث.');
    }
    throw new Error('فشل في اقتراح الهدايا. يرجى المحاولة مرة أخرى.');
  }
};
