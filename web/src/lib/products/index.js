/**
 * محرّك المنتجات — البنود ١٦ و١٧ و٣١.
 *
 * المسار الحالي: نولّد التصميم ثم نبحث عن **أقرب منتج مشابه** لكل عنصر مرصود.
 * هذا يعني أن المنتج المعروض ليس «المنتج المستخدم في الصورة» — لأن الصورة
 * لم تُبنَ من منتج حقيقي أصلاً. الواجهة تقول ذلك صراحة.
 */
import { MOCK_CATALOG, byCategory } from './mockCatalog.js';
import { uid } from '../models/project.js';

const TIER_ORDER = ['budget', 'mid', 'premium'];

/** يختار مستوى السعر المناسب من الميزانية ومستوى الفخامة في الملف الذوقي */
function targetTier({ budget, luxury }) {
  if (budget?.amount) {
    if (budget.amount <= 12000) return 'budget';
    if (budget.amount <= 30000) return 'mid';
    return 'premium';
  }
  if (luxury > 0.7) return 'premium';
  if (luxury < 0.4) return 'budget';
  return 'mid';
}

/**
 * يطابق العناصر المرصودة بمنتجات.
 * @returns {{products: Product[], total: object, byCategory: object}}
 */
export function matchProducts({ detectedItems, budget, styleProfile }) {
  const tier = targetTier({ budget, luxury: styleProfile?.traits?.luxury ?? 0.5 });

  const products = detectedItems.map((item) => {
    const pool = poolFor(item);
    const chosen = pickTier(pool, tier) ?? pool[0];
    if (!chosen) return null;

    return {
      ...chosen,
      // معرّف فريد للنسخة داخل هذا المشروع — الكتالوج يبقى غير مُعدَّل
      instanceId: uid('prd'),
      forItemId: item.id,
      itemLabelAr: item.labelAr,
      similarityScore: round(0.68 + Math.random() * 0.24),
      alternatives: pool.filter((p) => p.productId !== chosen.productId).map((p) => p.productId),
    };
  });

  return summarize(products.filter(Boolean));
}

/** «أبي نفس التصميم بميزانية أقل» — البند ١٨ (أمر تجاري لا بصري) */
export function cheaperAlternatives(products, { category } = {}) {
  const next = products.map((p) => {
    if (category && p.category !== category) return p;
    const pool = poolFor({ category: p.category, subtype: subtypeOf(p) });
    const cheaper = pool
      .filter((c) => c.price < p.price)
      .sort((a, b) => b.price - a.price)[0];
    if (!cheaper) return p;
    return { ...p, ...cheaper, instanceId: p.instanceId, forItemId: p.forItemId, itemLabelAr: p.itemLabelAr, alternatives: p.alternatives };
  });
  return summarize(next);
}

/** استبدال منتج ببديل يختاره المستخدم يدوياً — البند ١٦ */
export function swapProduct(products, instanceId, newProductId) {
  const replacement = MOCK_CATALOG.find((p) => p.productId === newProductId);
  if (!replacement) return summarize(products);

  const next = products.map((p) =>
    p.instanceId === instanceId
      ? {
          ...p,
          ...replacement,
          instanceId: p.instanceId,
          forItemId: p.forItemId,
          itemLabelAr: p.itemLabelAr,
          alternatives: poolFor({
            category: replacement.category,
            subtype: subtypeOf(replacement),
          })
            .filter((c) => c.productId !== replacement.productId)
            .map((c) => c.productId),
        }
      : p,
  );
  return summarize(next);
}

export const productById = (id) => MOCK_CATALOG.find((p) => p.productId === id);

/* ── مساعدات ─────────────────────────────────────────────── */

/** معرّف المنتج يحمل نوعه الفرعي: `sofa_m` → `sofa` */
const subtypeOf = (product) => product.productId.split('_')[0];

/**
 * الفئة وحدها لا تكفي: `furniture` تضم الكنب والسرير وطقم الطعام.
 * نضيّق أولاً بالنوع الفرعي، وإن لم يوجد نرجع للفئة كاملة.
 */
function poolFor(item) {
  const inCategory = byCategory(item.category);
  if (!item.subtype) return inCategory;
  const exact = inCategory.filter((p) => subtypeOf(p) === item.subtype);
  return exact.length ? exact : inCategory;
}

function pickTier(pool, tier) {
  const exact = pool.filter((p) => p.tier === tier);
  if (exact.length) return exact[Math.floor(Math.random() * exact.length)];
  // أقرب مستوى متاح
  const idx = TIER_ORDER.indexOf(tier);
  for (const offset of [1, -1, 2, -2]) {
    const alt = pool.filter((p) => p.tier === TIER_ORDER[idx + offset]);
    if (alt.length) return alt[0];
  }
  return null;
}

/** يحسب الإجمالي والتوزيع حسب الفئة — البند ١٧ */
function summarize(products) {
  const groups = {};
  let total = 0;

  products.forEach((p) => {
    if (p.price == null) return; // لا نجمع سعراً غير موجود
    groups[p.category] = (groups[p.category] ?? 0) + p.price;
    total += p.price;
  });

  return {
    products,
    byCategory: groups,
    total: { amount: total, currency: 'SAR', isEstimate: true },
  };
}

const round = (n) => Math.round(n * 100) / 100;
