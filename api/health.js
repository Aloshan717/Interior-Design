/**
 * فحص سريع للإعداد.
 *
 * يخبرك هل وصلت المفاتيح للخادم أم لا — **بلا كشف قيمها**.
 * يعيد وجودها فقط وطولها، وهذا يكفي لتشخيص أغلب مشاكل الإعداد.
 *
 * افتح: https://<موقعك>/api/health
 */
export default function handler(req, res) {
  const check = (name) => {
    const value = process.env[name];
    return {
      set: Boolean(value),
      length: value ? value.length : 0,
      // مسافة أو سطر جديد ملتصق بالمفتاح سبب شائع لفشل صامت
      hasWhitespace: value ? value !== value.trim() : false,
    };
  };

  res.status(200).json({
    ok: Boolean(process.env.FAL_KEY && process.env.GOOGLE_AI_KEY),
    provider: process.env.VITE_AI_PROVIDER ?? '(غير مضبوط — التطبيق سيعمل بالمزوّد التجريبي)',
    keys: {
      FAL_KEY: check('FAL_KEY'),
      GOOGLE_AI_KEY: check('GOOGLE_AI_KEY'),
    },
    models: {
      edit: process.env.FAL_EDIT_MODEL || 'fal-ai/flux-pro/kontext (افتراضي)',
      text2img: process.env.FAL_T2I_MODEL || 'fal-ai/flux/dev (افتراضي)',
      vision: process.env.VISION_MODEL || 'gemini-2.5-flash (افتراضي)',
    },
    note: 'هذه الصفحة لا تعرض قيم المفاتيح، فقط وجودها من عدمه.',
  });
}
