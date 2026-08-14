import { uid } from '../models/project.js';

/**
 * العناصر التي نتوقّع وجودها في التصميم حسب نوع الغرفة — الجسر بين
 * الصورة والمنتجات (البند ١٦).
 *
 * مشترك بين المزوّد التجريبي والحقيقي: القائمة تُشتق من نوع الغرفة لا من
 * الصورة، لأن الغرض ترشيح منتجات لفئات معروفة سلفاً — والمنتج يُعرض دائماً
 * بوسم «منتج مشابه» فلا ندّعي أنه العنصر المرسوم بعينه (البند ١٧).
 *
 * `subtype` ضروري: الفئة وحدها لا تفرّق بين سرير وكنبة، ولا بين طاولة وسط
 * وكومدينة.
 */
const SHARED = [
  { category: 'lighting', subtype: 'light', labelAr: 'الإنارة', descriptor: 'ceiling light fixture' },
  { category: 'rug', subtype: 'rug', labelAr: 'السجادة', descriptor: 'area rug' },
  { category: 'curtains', subtype: 'curtain', labelAr: 'الستائر', descriptor: 'floor length curtains' },
  { category: 'decor', subtype: 'decor', labelAr: 'الديكور', descriptor: 'wall art and accessories' },
];

const BY_ROOM = {
  bedroom: [
    { category: 'furniture', subtype: 'bed', labelAr: 'السرير', descriptor: 'upholstered bed frame' },
    { category: 'table', subtype: 'side', labelAr: 'الكومدينة', descriptor: 'bedside table' },
  ],
  dining: [
    { category: 'furniture', subtype: 'dining', labelAr: 'طقم الطعام', descriptor: 'dining table and chairs' },
    { category: 'table', subtype: 'side', labelAr: 'الكونسول', descriptor: 'console table' },
  ],
  seating: [
    { category: 'furniture', subtype: 'sofa', labelAr: 'الكنبة', descriptor: 'fabric sofa' },
    { category: 'table', subtype: 'table', labelAr: 'طاولة الوسط', descriptor: 'coffee table' },
  ],
};

export function itemsFor(roomType) {
  const group =
    roomType === 'master_bedroom' || roomType === 'kids_bedroom'
      ? BY_ROOM.bedroom
      : roomType === 'dining_room'
        ? BY_ROOM.dining
        : BY_ROOM.seating;

  return [...group, ...SHARED].map((item) => ({
    id: uid('itm'),
    ...item,
    matchedProductId: null,
  }));
}
