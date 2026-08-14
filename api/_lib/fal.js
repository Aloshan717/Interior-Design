/**
 * التعامل مع fal.ai عبر طابور المهام.
 *
 * لماذا الطابور وليس استدعاءً مباشراً؟
 * توليد الصورة يستغرق ٢٠–٦٠ ثانية، ودالة Vercel تنتهي مهلتها قبل ذلك.
 * الطابور يحل هذا: نرسل الطلب فيعيد fal معرّفاً فوراً، ثم يسأل التطبيق
 * عن الحالة كل ثانيتين. لا نحتاج قاعدة بيانات لتخزين المهام — معرّف fal
 * نفسه هو الحالة.
 */

const QUEUE = 'https://queue.fal.run';

/** أسماء النماذج قابلة للتغيير من متغيرات البيئة دون لمس الكود */
const MODELS = {
  // تحرير صورة موجودة مع الحفاظ على بنيتها — قلب المشروع
  edit: process.env.FAL_EDIT_MODEL || 'fal-ai/flux-pro/kontext',
  // توليد من نص فقط — لصور الذوق المرجعية
  text2img: process.env.FAL_T2I_MODEL || 'fal-ai/flux/dev',
};

function key() {
  const k = process.env.FAL_KEY;
  if (!k) throw new AppError('missing_key', 'FAL_KEY غير مضبوط في متغيرات البيئة');
  return k;
}

export class AppError extends Error {
  constructor(code, message, status = 500) {
    super(message ?? code);
    this.code = code;
    this.status = status;
  }
}

/** يرسل مهمة للطابور ويعيد معرّفاً يحمل اسم النموذج معه */
export async function submit(model, input) {
  const res = await fetch(`${QUEUE}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${key()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new AppError(
      res.status === 401 ? 'bad_key' : res.status === 402 ? 'no_credit' : 'submit_failed',
      data?.detail || `fal رفض الطلب (${res.status})`,
      res.status,
    );
  }
  if (!data.request_id) throw new AppError('submit_failed', 'fal لم يُعِد معرّف مهمة');

  return encodeJob(model, data.request_id);
}

/** يسأل عن حالة المهمة، ويجلب النتيجة عند اكتمالها */
export async function poll(jobId) {
  const { model, requestId } = decodeJob(jobId);
  const auth = { Authorization: `Key ${key()}` };

  const statusRes = await fetch(
    `${QUEUE}/${model}/requests/${requestId}/status`,
    { headers: auth },
  );
  const status = await statusRes.json().catch(() => ({}));

  if (!statusRes.ok) {
    throw new AppError('poll_failed', status?.detail || `تعذّر قراءة حالة المهمة`, statusRes.status);
  }

  if (status.status !== 'COMPLETED') {
    return { status: 'pending', queuePosition: status.queue_position ?? null };
  }

  const resultRes = await fetch(`${QUEUE}/${model}/requests/${requestId}`, { headers: auth });
  const result = await resultRes.json().catch(() => ({}));

  if (!resultRes.ok) {
    throw new AppError('result_failed', result?.detail || 'تعذّر جلب نتيجة المهمة', resultRes.status);
  }

  const images = (result.images ?? []).map((img) => img.url).filter(Boolean);
  if (!images.length) throw new AppError('empty_result', 'انتهت المهمة بلا صورة');

  return { status: 'done', images };
}

/* ── بناء المدخلات لكل نوع مهمة ─────────────────────────── */

/** تحرير صورة قائمة — الغرفة الحقيقية تبقى الأساس */
export function editInput({ imageDataURI, prompt, strength }) {
  return {
    model: MODELS.edit,
    input: {
      prompt,
      image_url: imageDataURI,
      guidance_scale: strength ?? 3.5,
      num_images: 1,
      output_format: 'jpeg',
      safety_tolerance: '2',
    },
  };
}

/** توليد من نص — لصور الذوق المرجعية فقط */
export function textInput({ prompt, aspectRatio = 'landscape_4_3' }) {
  return {
    model: MODELS.text2img,
    input: {
      prompt,
      image_size: aspectRatio,
      num_images: 1,
      num_inference_steps: 28,
      output_format: 'jpeg',
      enable_safety_checker: true,
    },
  };
}

/* ── ترميز المعرّف ──────────────────────────────────────── */

const encodeJob = (model, requestId) =>
  Buffer.from(`${model}::${requestId}`).toString('base64url');

function decodeJob(jobId) {
  const raw = Buffer.from(String(jobId), 'base64url').toString('utf8');
  const idx = raw.lastIndexOf('::');
  if (idx < 0) throw new AppError('bad_job_id', 'معرّف المهمة غير صالح', 400);
  return { model: raw.slice(0, idx), requestId: raw.slice(idx + 2) };
}
