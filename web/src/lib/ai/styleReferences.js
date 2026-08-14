/**
 * الصور المرجعية لاكتشاف الذوق — البند ١١.
 *
 * ليست ١٢ صورة عشوائية جميلة: هي **مصفوفة مقصودة** تغطي أطراف أربعة محاور
 * (الدفء، الفخامة، التباين، الامتلاء) حتى تفرّق فعلاً بين الأذواق.
 * لو كانت كلها «جميلة ومتشابهة» لما استطعنا استنتاج شيء من الاختيار.
 *
 * حالياً مرسومة محلياً. عند الإنتاج تُستبدل بـ١٢ صورة حقيقية مولّدة مرة واحدة
 * ومخزّنة في `public/` — ملكية كاملة وتكلفة صفر متكررة.
 */
import { roomImage } from './mockImages.js';

const defs = [
  { id: 'ref_01', palette: 'warm_neutral', warmth: 0.9, luxury: 0.35, contrast: 0.2, density: 0.35, materials: ['خشب فاتح', 'قطن'], lighting: 'warm_soft' },
  { id: 'ref_02', palette: 'luxe_dark',    warmth: 0.75, luxury: 0.95, contrast: 0.8, density: 0.7,  materials: ['رخام', 'نحاس', 'مخمل'], lighting: 'dramatic' },
  { id: 'ref_03', palette: 'soft_grey',    warmth: 0.2,  luxury: 0.4,  contrast: 0.25, density: 0.2, materials: ['خرسانة ناعمة', 'كتّان'], lighting: 'daylight' },
  { id: 'ref_04', palette: 'earthy',       warmth: 0.85, luxury: 0.55, contrast: 0.5, density: 0.65, materials: ['طين', 'خشب داكن', 'صوف'], lighting: 'warm_soft' },
  { id: 'ref_05', palette: 'cool_calm',    warmth: 0.3,  luxury: 0.6,  contrast: 0.3, density: 0.3,  materials: ['حجر', 'زجاج'], lighting: 'daylight' },
  { id: 'ref_06', palette: 'fresh_green',  warmth: 0.55, luxury: 0.3,  contrast: 0.35, density: 0.55, materials: ['خيزران', 'نباتات'], lighting: 'daylight' },
  { id: 'ref_07', palette: 'warm_neutral', warmth: 0.8,  luxury: 0.75, contrast: 0.45, density: 0.5, materials: ['جوز', 'جلد', 'نحاس'], lighting: 'warm_soft' },
  { id: 'ref_08', palette: 'soft_grey',    warmth: 0.35, luxury: 0.85, contrast: 0.7, density: 0.4,  materials: ['رخام رمادي', 'فولاذ'], lighting: 'dramatic' },
  { id: 'ref_09', palette: 'earthy',       warmth: 0.95, luxury: 0.25, contrast: 0.3, density: 0.75, materials: ['سعف', 'قطن خشن'], lighting: 'warm_soft' },
  { id: 'ref_10', palette: 'luxe_dark',    warmth: 0.6,  luxury: 0.8,  contrast: 0.9, density: 0.35, materials: ['خشب أسود', 'ذهبي'], lighting: 'dramatic' },
  { id: 'ref_11', palette: 'cool_calm',    warmth: 0.25, luxury: 0.45, contrast: 0.15, density: 0.15, materials: ['أبيض مطفي', 'كتّان'], lighting: 'daylight' },
  { id: 'ref_12', palette: 'fresh_green',  warmth: 0.7,  luxury: 0.65, contrast: 0.55, density: 0.6, materials: ['خشب زيتي', 'سيراميك'], lighting: 'warm_soft' },
];

export const STYLE_REFERENCES = defs.map((d, i) => ({
  ...d,
  traits: { warmth: d.warmth, luxury: d.luxury, contrast: d.contrast, density: d.density },
  imageURI: roomImage({
    seed: d.id,
    palette: d.palette,
    luxury: d.luxury,
    roomType: i % 3 === 0 ? 'master_bedroom' : i % 3 === 1 ? 'living_room' : 'dining_room',
  }),
}));

export const referenceById = (id) => STYLE_REFERENCES.find((r) => r.id === id);
