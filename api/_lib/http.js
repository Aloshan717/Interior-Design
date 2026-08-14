/**
 * غلاف مشترك لكل دوال الـAPI: قراءة الجسم، حدود الحجم، وتحويل
 * أي خطأ إلى رمز يفهمه التطبيق ويعرضه بالعربية.
 */
import { AppError } from './fal.js';

const MAX_BODY_MB = 6;

export function handler(fn) {
  return async (req, res) => {
    try {
      if (req.method === 'OPTIONS') return res.status(204).end();
      const body = req.method === 'POST' ? await readBody(req) : {};
      const result = await fn({ req, res, body });
      if (!res.headersSent) res.status(200).json(result ?? {});
    } catch (err) {
      const known = err instanceof AppError;
      const status = known ? (err.status >= 400 ? err.status : 500) : 500;
      // الرسالة التفصيلية للسجلّات فقط — التطبيق يعرض نصاً عربياً حسب الرمز
      console.error('[api]', err?.code ?? 'unknown', err?.message);
      if (!res.headersSent) {
        res.status(status).json({
          code: known ? err.code : 'generic',
          message: known ? err.message : 'خطأ غير متوقع في الخادم',
        });
      }
    }
  };
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_MB * 1024 * 1024) {
      throw new AppError('payload_too_large', 'حجم الصور أكبر من المسموح', 413);
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new AppError('bad_request', 'صيغة الطلب غير صالحة', 400);
  }
}

export function required(body, ...fields) {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null) {
      throw new AppError('bad_request', `الحقل ${field} مطلوب`, 400);
    }
  }
}
