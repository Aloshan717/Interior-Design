/**
 * المزوّد التجريبي — يعمل بلا مفاتيح وبلا تكلفة.
 * الغرض: تجربة الرحلة كاملة والحكم على التصميم والتدفق قبل إنفاق ريال واحد.
 *
 * ينفّذ نفس عقد `types.js` بالضبط، فاستبداله بالمزوّد الحقيقي
 * لا يمس أي شاشة.
 */
import { roomImage, PALETTES, PALETTE_KEYS } from './mockImages.js';
import { PHASES, INTENT_KIND } from './types.js';
import { describe, promptFrom } from './styleProfile.js';
import { itemsFor } from './detectedItems.js';
import { uid } from '../models/project.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── صور الذوق المرجعية (مرسومة محلياً) ─────────────────── */

/** مصفوفة مقصودة تغطي أطراف المحاور الأربعة — لا صوراً متشابهة */
const REF_DEFS = [
  { id: 'ref_01', palette: 'warm_neutral', warmth: 0.9,  luxury: 0.35, contrast: 0.2,  density: 0.35, materials: ['خشب فاتح', 'قطن'] },
  { id: 'ref_02', palette: 'luxe_dark',    warmth: 0.75, luxury: 0.95, contrast: 0.8,  density: 0.7,  materials: ['رخام', 'نحاس', 'مخمل'] },
  { id: 'ref_03', palette: 'soft_grey',    warmth: 0.2,  luxury: 0.4,  contrast: 0.25, density: 0.2,  materials: ['خرسانة ناعمة', 'كتّان'] },
  { id: 'ref_04', palette: 'earthy',       warmth: 0.85, luxury: 0.55, contrast: 0.5,  density: 0.65, materials: ['طين', 'خشب داكن', 'صوف'] },
  { id: 'ref_05', palette: 'cool_calm',    warmth: 0.3,  luxury: 0.6,  contrast: 0.3,  density: 0.3,  materials: ['حجر', 'زجاج'] },
  { id: 'ref_06', palette: 'fresh_green',  warmth: 0.55, luxury: 0.3,  contrast: 0.35, density: 0.55, materials: ['خيزران', 'نباتات'] },
  { id: 'ref_07', palette: 'warm_neutral', warmth: 0.8,  luxury: 0.75, contrast: 0.45, density: 0.5,  materials: ['جوز', 'جلد', 'نحاس'] },
  { id: 'ref_08', palette: 'soft_grey',    warmth: 0.35, luxury: 0.85, contrast: 0.7,  density: 0.4,  materials: ['رخام رمادي', 'فولاذ'] },
  { id: 'ref_09', palette: 'earthy',       warmth: 0.95, luxury: 0.25, contrast: 0.3,  density: 0.75, materials: ['سعف', 'قطن خشن'] },
  { id: 'ref_10', palette: 'luxe_dark',    warmth: 0.6,  luxury: 0.8,  contrast: 0.9,  density: 0.35, materials: ['خشب أسود', 'ذهبي'] },
  { id: 'ref_11', palette: 'cool_calm',    warmth: 0.25, luxury: 0.45, contrast: 0.15, density: 0.15, materials: ['أبيض مطفي', 'كتّان'] },
  { id: 'ref_12', palette: 'fresh_green',  warmth: 0.7,  luxury: 0.65, contrast: 0.55, density: 0.6,  materials: ['خشب زيتي', 'سيراميك'] },
];

async function generateStyleReferences(onProgress) {
  const refs = REF_DEFS.map((d, i) => ({
    id: d.id,
    traits: { warmth: d.warmth, luxury: d.luxury, contrast: d.contrast, density: d.density },
    palette: d.palette,
    paletteColors: PALETTES[d.palette],
    materials: d.materials,
    imageURI: roomImage({
      seed: d.id,
      palette: d.palette,
      luxury: d.luxury,
      roomType: i % 3 === 0 ? 'master_bedroom' : i % 3 === 1 ? 'living_room' : 'dining_room',
    }),
  }));
  onProgress?.(1);
  return refs;
}

/* ── ١ · تحليل المكان ──────────────────────────────────────── */

async function analyzeSpace({ images, roomType, notes }, onProgress) {
  onProgress?.(PHASES.ANALYZING_SPACE);
  await wait(1400);

  return {
    imageCount: images.length,
    roomType,
    // في المزوّد الحقيقي هذه مستخرجة فعلاً من الصورة بنموذج رؤية
    features: {
      windows: 1,
      doors: 1,
      flooring: 'unknown',
      ceilingType: 'flat',
      naturalLight: 'medium',
      existingFurniture: [],
    },
    confidence: 'low', // ← تجريبي: لا ندّعي دقة (البند ١٤)
    notes: notes ?? '',
  };
}

/* ── ٢ · بناء الملف الذوقي ────────────────────────────────── */

async function buildStyleProfile({ selectedRefs, references }, onProgress) {
  onProgress?.(PHASES.BUILDING_PROFILE);
  await wait(1600);

  const refs = (references ?? []).filter((r) => selectedRefs.includes(r.id));
  if (!refs.length) throw new Error('no_refs');

  const avg = (key) => refs.reduce((sum, r) => sum + (r.traits?.[key] ?? 0.5), 0) / refs.length;
  const traits = {
    warmth: avg('warmth'),
    luxury: avg('luxury'),
    contrast: avg('contrast'),
    density: avg('density'),
  };

  // اللوحة الأكثر تكراراً بين اختياراته — تُستخدم في الرسم التوضيحي فقط
  const counts = {};
  refs.forEach((r) => {
    const p = r.palette ?? PALETTE_KEYS[0];
    counts[p] = (counts[p] ?? 0) + 1;
  });
  const palette = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  const materials = [...new Set(refs.flatMap((r) => r.materials ?? []))].slice(0, 4);

  return {
    id: uid('sty'),
    generatedFrom: selectedRefs,
    traits,
    palette,
    paletteColors: PALETTES[palette],
    materials,
    descriptionAr: describe(traits, materials),
    promptFragment: promptFrom(traits),
  };
}

/* ── ٣ · التصورات الأولية ─────────────────────────────────── */

/**
 * كل اتجاه يغيّر مستوى الفخامة **ولوحة الألوان** — البند ١٢ يطلب اتجاهات
 * مختلفة فعلاً لا نسخاً متطابقة. `palette: null` يعني «ابقَ على لوحة ذوقه».
 */
const DIRECTIONS = [
  { tag: 'warm_contemporary', titleAr: 'عصري دافئ', luxury: 0, palette: null },
  { tag: 'modern_luxury', titleAr: 'فخامة عصرية', luxury: 0.3, palette: 'luxe_dark' },
  { tag: 'minimal_warm', titleAr: 'بساطة دافئة', luxury: -0.25, palette: 'warm_neutral' },
  { tag: 'hotel_inspired', titleAr: 'مستوحى من الفنادق', luxury: 0.25, palette: 'soft_grey' },
  { tag: 'natural_calm', titleAr: 'طبيعي هادئ', luxury: -0.15, palette: 'fresh_green' },
  { tag: 'bold_statement', titleAr: 'جريء ومميز', luxury: 0.15, palette: 'earthy' },
];

async function generateConcepts(
  { styleProfile, roomType, count = 4, exclude = [] },
  onProgress,
  onConcept,
) {
  onProgress?.(PHASES.GENERATING_CONCEPTS);

  const pool = DIRECTIONS.filter((d) => !exclude.includes(d.tag));
  const picked = pool.slice(0, count);
  const results = [];

  // ننتج واحداً تلو الآخر لمحاكاة العرض التدريجي — كل تصور يظهر فور جاهزيته
  for (const dir of picked) {
    await wait(700);
    const luxury = clamp(styleProfile.traits.luxury + dir.luxury);
    const palette = dir.palette ?? styleProfile.palette;
    const concept = {
      id: uid('cpt'),
      index: results.length,
      directionTag: dir.tag,
      titleAr: dir.titleAr,
      palette,
      imageURI: roomImage({
        seed: `${styleProfile.id}_${dir.tag}`,
        palette,
        luxury,
        roomType,
      }),
      promptUsed: `${styleProfile.promptFragment}, ${dir.tag.replace('_', ' ')}`,
      status: 'ready',
      generatedAt: new Date().toISOString(),
    };
    results.push(concept);
    // العرض التدريجي: الشاشة تستقبل كل تصور فور جاهزيته
    await onConcept?.(concept);
  }
  return results;
}

/* ── ٤ · التصميم الواقعي ──────────────────────────────────── */

async function generateRoomDesign(
  { spaceAnalysis, styleProfile, concept, roomType, constraints },
  onProgress,
) {
  onProgress?.(PHASES.RENDERING_DESIGN);
  await wait(2600);

  const palette = concept.palette ?? styleProfile.palette;
  return {
    palette,
    imageURI: roomImage({
      seed: `${concept.id}_real`,
      palette,
      luxury: styleProfile.traits.luxury,
      roomType,
    }),
    detectedItems: itemsFor(roomType),
    promptUsed: `${styleProfile.promptFragment}, ${concept.directionTag}, preserve original room geometry`,
    basedOnConcept: concept.id,
  };
}

/* ── ٥ · فهم أمر التعديل ──────────────────────────────────── */

/** خريطة الكلمات العربية → العنصر المستهدف. تشمل العامية الخليجية. */
const TARGETS = [
  { key: 'lighting', labelAr: 'الإنارة', words: ['ثريا', 'الثريا', 'ثريات', 'إنارة', 'انارة', 'اضاءة', 'إضاءة', 'لمبة', 'نجفة'] },
  { key: 'sofa', labelAr: 'الكنبة', words: ['كنب', 'كنبة', 'الكنب', 'صوفا', 'مجلس'] },
  { key: 'bed', labelAr: 'السرير', words: ['سرير', 'السرير', 'التخت'] },
  { key: 'rug', labelAr: 'السجادة', words: ['سجاد', 'سجادة', 'السجادة', 'زولية'] },
  { key: 'curtains', labelAr: 'الستائر', words: ['ستارة', 'ستائر', 'الستائر', 'برادي'] },
  { key: 'table', labelAr: 'الطاولة', words: ['طاولة', 'الطاولة', 'طاولات', 'كومدينة'] },
  { key: 'walls', labelAr: 'الجدران', words: ['جدار', 'جدران', 'الجدران', 'حيطان', 'الحيط', 'دهان'] },
  { key: 'floor', labelAr: 'الأرضية', words: ['أرضية', 'ارضية', 'الأرضية', 'باركيه', 'رخام'] },
  { key: 'overall', labelAr: 'التصميم', words: ['التصميم', 'الغرفة', 'الجو', 'كل شي', 'الكل'] },
];

const CHANGES = [
  { key: 'remove', words: ['احذف', 'شيل', 'الغِ', 'الغي', 'ازل', 'أزل'] },
  { key: 'bigger', words: ['أكبر', 'اكبر', 'كبّر', 'كبر'] },
  { key: 'smaller', words: ['أصغر', 'اصغر', 'صغّر', 'صغر'] },
  { key: 'lighter', words: ['أفتح', 'افتح', 'فاتح', 'أنور', 'انور'] },
  { key: 'darker', words: ['أغمق', 'اغمق', 'غامق', 'داكن'] },
  { key: 'more_luxury', words: ['أفخم', 'افخم', 'فخم', 'فخامة', 'أرقى', 'ارقى'] },
  { key: 'simpler', words: ['أبسط', 'ابسط', 'بسيط', 'هادي', 'هادئ'] },
  { key: 'replace', words: ['غيّر', 'غير', 'بدّل', 'بدل', 'استبدل', 'أبي', 'ابي', 'ابغى', 'أريد'] },
];

/** الأوامر التجارية — تُعالَج بترشيح منتجات لا بتعديل صورة */
const COMMERCIAL_WORDS = ['أرخص', 'ارخص', 'أوفر', 'اوفر', 'ميزانية أقل', 'ميزانية اقل', 'أقل تكلفة', 'اقل تكلفة', 'رخيص'];

async function parseEditIntent({ text }) {
  await wait(600);
  const q = text.trim();

  if (COMMERCIAL_WORDS.some((w) => q.includes(w))) {
    const target = TARGETS.find((t) => t.words.some((w) => q.includes(w)));
    return {
      kind: INTENT_KIND.COMMERCIAL,
      target: target?.key ?? 'overall',
      targetLabel: target?.labelAr ?? 'التصميم',
      change: 'cheaper',
      params: {},
    };
  }

  const target = TARGETS.find((t) => t.words.some((w) => q.includes(w)));
  const change = CHANGES.find((c) => c.words.some((w) => q.includes(w)));

  if (!target && !change) {
    return { kind: INTENT_KIND.UNKNOWN, target: null, targetLabel: null, change: null, params: {} };
  }

  return {
    kind: INTENT_KIND.VISUAL,
    target: target?.key ?? 'overall',
    targetLabel: target?.labelAr ?? 'التصميم',
    change: change?.key ?? 'replace',
    params: {},
  };
}

/* ── ٦ · تطبيق التعديل ────────────────────────────────────── */

async function applyEdit({ baseDesign, intent, styleProfile, roomType }, onProgress) {
  onProgress?.(PHASES.APPLYING_EDIT);
  await wait(2200);

  // في المزوّد التجريبي: نغيّر البذرة قليلاً لتظهر نتيجة مختلفة لكن قريبة.
  // في المزوّد الحقيقي: نمرّر الصورة الأصلية + تعليمة التعديل لـFlux Kontext.
  const luxuryShift =
    intent.change === 'more_luxury' ? 0.25 : intent.change === 'simpler' ? -0.25 : 0;

  const palette = baseDesign.palette ?? styleProfile.palette;
  return {
    palette,
    imageURI: roomImage({
      seed: `${baseDesign.id}_${intent.target}_${intent.change}`,
      palette,
      luxury: clamp(styleProfile.traits.luxury + luxuryShift),
      roomType,
    }),
    detectedItems: baseDesign.detectedItems,
    promptUsed: `${baseDesign.promptUsed} | edit: ${intent.change} ${intent.target}`,
    basedOnConcept: baseDesign.basedOnConcept,
  };
}

const clamp = (n) => Math.max(0, Math.min(1, n));
export const mockProvider = {
  id: 'mock',
  isMock: true,
  analyzeSpace,
  buildStyleProfile,
  generateConcepts,
  generateRoomDesign,
  parseEditIntent,
  applyEdit,
  generateStyleReferences,
};
