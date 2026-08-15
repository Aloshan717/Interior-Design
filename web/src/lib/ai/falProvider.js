/**
 * المزوّد الحقيقي — fal.ai (Flux Kontext) + نموذج رؤية للتحليل.
 *
 * ينفّذ نفس عقد `types.js` بالضبط، فالشاشات لا تعرف أنها بدّلت المزوّد.
 * كل استدعاء يمر بـ`/api/*` — لا مفتاح داخل المتصفح إطلاقاً.
 */
import { PHASES, INTENT_KIND } from './types.js';
import { itemsFor } from './detectedItems.js';
import { buildProfileFrom } from './styleProfile.js';
import { imageAsDataURI } from '../storage/index.js';

const POLL_MS = 2500;
const POLL_TIMEOUT_MS = 240000;

export class AIError extends Error {
  constructor(code, message) {
    super(message ?? code);
    this.code = code;
  }
}

async function post(path, body) {
  let res;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AIError('offline');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AIError(data.code ?? 'generic', data.message);
  return data;
}

/** ينتظر مهمة واحدة حتى تكتمل ويعيد الصورة كـdata URI */
async function awaitJob(jobId) {
  const startedAt = Date.now();
  for (;;) {
    if (Date.now() - startedAt > POLL_TIMEOUT_MS) throw new AIError('timeout');

    let job;
    try {
      const res = await fetch(`/api/job/${encodeURIComponent(jobId)}`);
      job = await res.json();
      if (!res.ok) throw new AIError(job.code ?? 'generation_failed', job.message);
    } catch (err) {
      if (err instanceof AIError) throw err;
      throw new AIError('offline');
    }

    if (job.status === 'done') return job.image;
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}

/** الصورة الأولى للغرفة — أساس كل توليد (البند ١٤) */
async function roomImageOf(images) {
  const first = images?.[0];
  if (!first?.blobKey) throw new AIError('bad_image');
  const dataURI = await imageAsDataURI(first.blobKey);
  if (!dataURI) throw new AIError('bad_image');
  return dataURI;
}

/* ── ١ · تحليل المكان ──────────────────────────────────── */

async function analyzeSpace({ images, roomType, notes, keepItems, replaceItems }, onProgress) {
  onProgress?.(PHASES.ANALYZING_SPACE);

  const encoded = [];
  for (const img of (images ?? []).slice(0, 3)) {
    const dataURI = await imageAsDataURI(img.blobKey, { maxSize: 900, quality: 0.75 });
    if (dataURI) encoded.push(dataURI);
  }
  if (!encoded.length) throw new AIError('bad_image');

  const result = await post('/api/analyze-space', {
    images: encoded,
    roomType,
    notes,
    keepItems,
    replaceItems,
  });

  // مشاكل الصورة تُبلَّغ للمستخدم برسالة مفيدة بدل فشل غامض (البند ٢٥)
  if (result.isInteriorRoom === false) throw new AIError('image_not_room');
  if (result.hasPeople) throw new AIError('image_has_people');
  if (result.isTooDark) throw new AIError('image_too_dark');
  if (result.isBlurry) throw new AIError('image_unclear');

  return { ...result, roomType, imageCount: encoded.length };
}

/* ── ٢ · الملف الذوقي — يُحسب محلياً بلا تكلفة ─────────── */

async function buildStyleProfile({ selectedRefs, references }, onProgress) {
  onProgress?.(PHASES.BUILDING_PROFILE);
  return buildProfileFrom(selectedRefs, references);
}

/* ── ٣ · التصورات على غرفة المستخدم ────────────────────── */

async function generateConcepts(
  { images, roomType, styleProfile, budget, count = 4, exclude = [] },
  onProgress,
  onConcept,
) {
  onProgress?.(PHASES.GENERATING_CONCEPTS);
  const roomImage = await roomImageOf(images);

  const { jobs } = await post('/api/generate', {
    task: 'concepts',
    roomImage,
    roomType,
    styleProfile,
    budget,
    count,
    exclude,
  });

  // ننتظر المهام بالتوازي ونسلّم كل تصور فور جاهزيته — لا انتظار للدفعة
  const results = [];
  await Promise.all(
    jobs.map(async (job, index) => {
      try {
        const imageURI = await awaitJob(job.jobId);
        const concept = {
          id: `cpt_${job.jobId.slice(-10)}`,
          index,
          directionTag: job.directionTag,
          titleAr: job.titleAr,
          imageURI,
          promptUsed: '',
          status: 'ready',
          generatedAt: new Date().toISOString(),
        };
        results.push(concept);
        await onConcept?.(concept);
      } catch (err) {
        // فشل تصور واحد لا يسقط البقية
        console.warn('فشل تصور:', err?.code);
      }
    }),
  );

  if (!results.length) throw new AIError('generation_failed');
  return results;
}

/* ── ٤ · التصميم الواقعي ───────────────────────────────── */

async function generateRoomDesign(
  { images, roomType, styleProfile, spaceAnalysis, concept, constraints },
  onProgress,
) {
  onProgress?.(PHASES.RENDERING_DESIGN);
  const roomImage = await roomImageOf(images);

  const { jobs } = await post('/api/generate', {
    task: 'room_design',
    roomImage,
    roomType,
    styleProfile,
    spaceAnalysis,
    constraints,
    conceptTag: concept?.directionTag,
  });

  return {
    imageURI: await awaitJob(jobs[0].jobId),
    detectedItems: itemsFor(roomType),
    promptUsed: '',
    basedOnConcept: concept?.id ?? null,
    palette: null,
  };
}

/* ── ٥ · فهم أمر التعديل ───────────────────────────────── */

async function parseEditIntent({ text }) {
  const intent = await post('/api/parse-intent', { text });
  return {
    kind: intent.kind ?? INTENT_KIND.UNKNOWN,
    target: intent.target ?? null,
    targetLabel: intent.targetLabel ?? null,
    change: intent.change ?? null,
    params: {},
  };
}

/* ── ٦ · تطبيق التعديل ─────────────────────────────────── */

async function applyEdit({ baseDesign, intent, rawText, roomType }, onProgress) {
  onProgress?.(PHASES.APPLYING_EDIT);

  const baseImage = await imageAsDataURI(baseDesign.imageKey);
  if (!baseImage) throw new AIError('bad_image');

  const { jobId } = await post('/api/edit', { baseImage, intent, rawText });

  return {
    imageURI: await awaitJob(jobId),
    detectedItems: baseDesign.detectedItems ?? itemsFor(roomType),
    promptUsed: '',
    basedOnConcept: baseDesign.basedOnConcept,
    palette: baseDesign.palette ?? null,
  };
}

/* ── ٧ · صور الذوق المرجعية (مرة واحدة) ────────────────── */

async function generateStyleReferences(onProgress, onRef) {
  const { jobs } = await post('/api/generate', { task: 'style_references' });

  const refs = [];
  let done = 0;
  await Promise.all(
    jobs.map(async (job) => {
      try {
        const imageURI = await awaitJob(job.jobId);
        const ref = { id: job.refId, traits: job.traits, imageURI };
        refs.push(ref);
        // نسلّم كل صورة فور جاهزيتها — المستخدم يرى الشبكة تمتلئ
        // بدل شاشة انتظار فارغة دقيقتين
        await onRef?.(ref);
      } catch {
        /* صورة مرجعية واحدة ناقصة لا توقف الباقي */
      } finally {
        onProgress?.(++done / jobs.length, jobs.length);
      }
    }),
  );

  if (refs.length < 6) throw new AIError('generation_failed');
  return refs.sort((a, b) => a.id.localeCompare(b.id));
}

export const falProvider = {
  id: 'fal-kontext',
  isMock: false,
  analyzeSpace,
  buildStyleProfile,
  generateConcepts,
  generateRoomDesign,
  parseEditIntent,
  applyEdit,
  generateStyleReferences,
};
