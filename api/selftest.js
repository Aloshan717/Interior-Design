/**
 * فحص حي للاتصال بالخدمات — بلا توليد أي صورة وبلا تكلفة.
 *
 * الحيلة: نرسل طلباً فارغاً لكل نموذج ونقرأ **رمز الرد** لا محتواه.
 * الرمز وحده يكشف السبب بدقة:
 *   401/403 → المفتاح خاطئ
 *   402     → لا يوجد رصيد
 *   404     → اسم النموذج غير موجود (تغيّر أو أُلغي)
 *   422     → المفتاح والنموذج سليمان، ورفض فقط لأن الجسم فارغ ✅
 *
 * افتح: https://<موقعك>/api/selftest
 */
const QUEUE = 'https://queue.fal.run';

const MODELS = {
  edit: process.env.FAL_EDIT_MODEL || 'fal-ai/flux-pro/kontext',
  text2img: process.env.FAL_T2I_MODEL || 'fal-ai/flux/dev',
};

const VISION = process.env.VISION_MODEL || 'gemini-2.5-flash';

export default async function handler(req, res) {
  const result = { fal: {}, vision: null };

  for (const [role, model] of Object.entries(MODELS)) {
    result.fal[role] = await probeFal(model);
  }
  result.vision = await probeVision();

  const allGood =
    Object.values(result.fal).every((r) => r.verdict === 'جاهز') && result.vision.verdict === 'جاهز';

  res.status(200).json({
    ok: allGood,
    summary: allGood
      ? 'كل الخدمات جاهزة — المشكلة ليست في الإعداد'
      : 'هناك خدمة غير جاهزة، التفاصيل أدناه',
    ...result,
  });
}

async function probeFal(model) {
  const key = process.env.FAL_KEY;
  if (!key) return { model, verdict: 'المفتاح مفقود', status: null };

  try {
    const res = await fetch(`${QUEUE}/${model}`, {
      method: 'POST',
      headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
      body: '{}', // جسم فارغ عمداً — لا يولّد شيئاً ولا يكلّف
    });

    return { model, status: res.status, verdict: verdictFor(res.status) };
  } catch (err) {
    return { model, status: null, verdict: `تعذّر الاتصال: ${err.message}` };
  }
}

async function probeVision() {
  const key = process.env.GOOGLE_AI_KEY;
  if (!key) return { model: VISION, verdict: 'المفتاح مفقود', status: null };

  try {
    // قائمة النماذج: استدعاء قراءة فقط، مجاني ولا يستهلك حصة توليد
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${VISION}?key=${key}`,
    );
    const verdict =
      res.status === 200
        ? 'جاهز'
        : res.status === 400 || res.status === 403
          ? 'المفتاح مرفوض'
          : res.status === 404
            ? 'اسم النموذج غير موجود'
            : `رد غير متوقع (${res.status})`;

    return { model: VISION, status: res.status, verdict };
  } catch (err) {
    return { model: VISION, status: null, verdict: `تعذّر الاتصال: ${err.message}` };
  }
}

function verdictFor(status) {
  if (status === 422 || status === 400) return 'جاهز'; // رفض الجسم الفارغ = المصادقة والنموذج سليمان
  if (status === 401 || status === 403) return 'المفتاح مرفوض';
  if (status === 402) return 'لا يوجد رصيد';
  if (status === 404) return 'اسم النموذج غير موجود';
  if (status === 429) return 'تجاوزت حد الطلبات';
  if (status === 200) return 'جاهز';
  return `رد غير متوقع (${status})`;
}
