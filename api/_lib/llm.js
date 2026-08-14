/**
 * نموذج النص والرؤية — يقرأ صور الغرفة ويفهم أوامر التعديل العربية.
 *
 * منفصل تماماً عن مزوّد الصور (البند ٢٩): تغيير أحدهما لا يمس الآخر.
 */
import { AppError } from './fal.js';

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = process.env.VISION_MODEL || 'gemini-2.5-flash';

function key() {
  const k = process.env.GOOGLE_AI_KEY;
  if (!k) throw new AppError('missing_key', 'GOOGLE_AI_KEY غير مضبوط في متغيرات البيئة');
  return k;
}

/**
 * يستدعي النموذج ويطلب JSON صرفاً.
 * @param {Array} parts أجزاء المحتوى (نص و/أو صور)
 * @param {object} schema مخطط الرد المتوقع
 */
export async function askJSON(parts, schema) {
  const res = await fetch(`${BASE}/${MODEL}:generateContent?key=${key()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        ...(schema ? { responseSchema: schema } : {}),
      },
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const code =
      res.status === 400 || res.status === 403 ? 'bad_key' : res.status === 429 ? 'rate_limited' : 'llm_failed';
    throw new AppError(code, data?.error?.message || `النموذج رفض الطلب (${res.status})`, res.status);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new AppError('llm_empty', 'النموذج لم يُعِد رداً');

  try {
    return JSON.parse(text);
  } catch {
    throw new AppError('llm_bad_json', 'رد النموذج ليس JSON صالحاً');
  }
}

/** يحوّل data URI إلى الشكل الذي يتوقعه النموذج */
export function imagePart(dataURI) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataURI ?? '');
  if (!match) throw new AppError('bad_image', 'صيغة الصورة غير مدعومة', 400);
  return { inline_data: { mime_type: match[1], data: match[2] } };
}

export const textPart = (text) => ({ text });
