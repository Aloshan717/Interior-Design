/** أنواع الأماكن — البند ٧ */
export const ROOM_TYPES = [
  'master_bedroom',
  'kids_bedroom',
  'living_room',
  'majlis',
  'dining_room',
  'office',
  'entrance',
  'other',
];

/** آلة الحالات — البند ٢٧ */
export const STEPS = [
  'room_type',
  'photos',
  'details',
  'style',
  'concepts',
  'design',
  'edit',
  'final',
];

/** الخطوات المعروضة في المؤشر — البند ٢٣ (٧ خطوات، `details` مدمجة مع `photos`) */
export const VISIBLE_STEPS = [
  'room_type',
  'photos',
  'style',
  'concepts',
  'design',
  'edit',
  'final',
];

export const STATUSES = ['new', 'selecting', 'editing', 'completed'];

/** حالة المشروع مشتقة من الخطوة — لا تُخزّن مستقلة لتفادي التعارض */
export function statusForStep(step) {
  if (step === 'final') return 'completed';
  if (step === 'design' || step === 'edit') return 'editing';
  if (step === 'concepts') return 'selecting';
  return 'new';
}

export const BUDGET_PRESETS = [10000, 20000, 50000];

export const KEEP_OPTIONS = ['keepAll', 'keepSome', 'keepNone'];

/** فئات المنتجات — البند ١٦ */
export const PRODUCT_CATEGORIES = [
  'furniture',
  'lighting',
  'rug',
  'curtains',
  'table',
  'decor',
];

export const SCHEMA_VERSION = 1;
