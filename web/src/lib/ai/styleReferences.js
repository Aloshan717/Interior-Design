/**
 * صور اكتشاف الذوق — البند ١١.
 *
 * ليست ١٢ صورة عشوائية جميلة: هي **مصفوفة مقصودة** تغطي أطراف أربعة محاور
 * (الدفء، الفخامة، التباين، الامتلاء) حتى تفرّق فعلاً بين الأذواق.
 *
 * تُولَّد **مرة واحدة في عمر التطبيق** وتُخزّن على الجهاز، فتكلفتها تُدفع
 * مرة ولا تتكرر أبداً. المزوّد التجريبي يرسمها محلياً بلا تكلفة.
 */
import { storage, blobURL, storeGeneratedImage } from '../storage/index.js';

const CACHE_KEY = 'style-references';

/**
 * @param {object} provider مزوّد الذكاء الاصطناعي
 * @param {(ratio:number)=>void} onProgress نسبة الإنجاز 0..1 عند التوليد
 * @returns {Promise<Array<{id, traits, imageKey}>>}
 */
export async function getStyleReferences(provider, onProgress, onRef) {
  const cached = readCache(provider.id);
  if (cached && (await allPresent(cached))) return cached;

  const stored = [];

  // نخزّن كل صورة لحظة وصولها ونمرّرها للشاشة فوراً
  const generated = await provider.generateStyleReferences(onProgress, async (ref) => {
    const entry = {
      id: ref.id,
      traits: ref.traits,
      palette: ref.palette ?? null,
      paletteColors: ref.paletteColors ?? null,
      materials: ref.materials ?? null,
      imageKey: await storeGeneratedImage(ref.imageURI),
    };
    stored.push(entry);
    await onRef?.(entry);
  });

  // مزوّد لا يدعم التسليم التدريجي: نخزّن دفعة واحدة
  if (!stored.length) {
    for (const ref of generated) {
      stored.push({
        id: ref.id,
        traits: ref.traits,
        palette: ref.palette ?? null,
        paletteColors: ref.paletteColors ?? null,
        materials: ref.materials ?? null,
        imageKey: await storeGeneratedImage(ref.imageURI),
      });
    }
  }

  stored.sort((a, b) => a.id.localeCompare(b.id));
  writeCache(provider.id, stored);
  return stored;
}

/** يعيد عنواناً قابلاً للعرض لصورة مرجعية */
export const referenceSrc = (ref) => blobURL(ref.imageKey);

export function clearStyleReferences(providerId) {
  const cached = readCache(providerId);
  cached?.forEach((ref) => storage.deleteBlob(ref.imageKey).catch(() => {}));
  localStorage.removeItem(`${CACHE_KEY}:${providerId}`);
}

/* ── الذاكرة المحلية ─────────────────────────────────────
   المفتاح يحمل معرّف المزوّد: تبديل المزوّد يولّد مجموعة جديدة
   بدل خلط رسومات تجريبية بصور حقيقية. */

function readCache(providerId) {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}:${providerId}`);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(providerId, refs) {
  try {
    localStorage.setItem(`${CACHE_KEY}:${providerId}`, JSON.stringify(refs));
  } catch {
    /* التخزين ممتلئ أو ممنوع — نعمل بلا ذاكرة ونعيد التوليد لاحقاً */
  }
}

/** يتحقق أن الصور ما زالت موجودة فعلاً — قد يُمسح التخزين دون الذاكرة */
async function allPresent(refs) {
  for (const ref of refs) {
    if (!(await storage.getBlob(ref.imageKey))) return false;
  }
  return true;
}
