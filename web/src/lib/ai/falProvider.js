/**
 * المزوّد الحقيقي — fal.ai · Flux Kontext.
 *
 * ⚠️ غير مفعّل بعد. يحتاج:
 *   ١. رصيد ومفتاح في fal.ai
 *   ٢. متغير البيئة FAL_KEY في Vercel  (لا في المتصفح أبداً)
 *   ٣. دوال /api الموضّحة في docs/02-architecture.md
 *
 * لاحظ: كل الاستدعاءات تمر بـ `/api/*` — لا استدعاء مباشر لـfal.ai من المتصفح،
 * وإلا صار مفتاحك مقروءاً لأي شخص يفتح الصفحة.
 *
 * التفعيل: بدّل السطر الأخير في `index.js` فقط. لا شاشة تتغير.
 */
import { PHASES, INTENT_KIND } from './types.js';

const POLL_MS = 2000;
const POLL_TIMEOUT_MS = 180000;

async function post(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new AIError(detail.code ?? 'generic', detail.message);
  }
  return res.json();
}

/** التوليد يستغرق ٢٠–٦٠ ثانية — نمط المهمة في الخلفية (docs/02) */
async function awaitJob(jobId, onProgress) {
  const startedAt = Date.now();
  for (;;) {
    if (Date.now() - startedAt > POLL_TIMEOUT_MS) throw new AIError('timeout');
    const job = await (await fetch(`/api/job/${jobId}`)).json();
    if (job.phase) onProgress?.(job.phase);
    if (job.status === 'done') return job.result;
    if (job.status === 'failed') throw new AIError(job.code ?? 'generation_failed');
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

export class AIError extends Error {
  constructor(code, message) {
    super(message ?? code);
    this.code = code;
  }
}

export const falProvider = {
  id: 'fal-kontext',
  isMock: false,

  async analyzeSpace({ images, roomType, notes }, onProgress) {
    onProgress?.(PHASES.ANALYZING_SPACE);
    return post('/api/analyze-space', { images, roomType, notes });
  },

  async buildStyleProfile({ selectedRefs }, onProgress) {
    onProgress?.(PHASES.BUILDING_PROFILE);
    return post('/api/style-profile', { selectedRefs });
  },

  async generateConcepts(input, onProgress) {
    const { jobId } = await post('/api/generate', { task: 'concepts', ...input });
    return awaitJob(jobId, onProgress);
  },

  async generateRoomDesign(input, onProgress) {
    const { jobId } = await post('/api/generate', { task: 'room_design', ...input });
    return awaitJob(jobId, onProgress);
  },

  async parseEditIntent({ text, currentDesign }) {
    const intent = await post('/api/parse-intent', { text, currentDesign });
    return { kind: INTENT_KIND.UNKNOWN, ...intent };
  },

  async applyEdit(input, onProgress) {
    const { jobId } = await post('/api/edit', input);
    return awaitJob(jobId, onProgress);
  },
};
