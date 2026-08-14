/**
 * بناء الملف الذوقي من الصور المختارة — البند ١١.
 *
 * يُحسب محلياً بلا أي استدعاء خارجي: كل صورة مرجعية تحمل إحداثياتها على
 * المحاور الأربعة، والملف هو متوسط ما اختاره المستخدم. النتيجة فورية،
 * مجانية، وقابلة للتفسير — ولا حاجة لنموذج لغوي هنا.
 */
import { uid } from '../models/project.js';

export function buildProfileFrom(selectedIds, references) {
  const refs = (references ?? []).filter((r) => selectedIds.includes(r.id));
  if (!refs.length) throw new Error('no_refs');

  const avg = (key) => refs.reduce((sum, r) => sum + (r.traits?.[key] ?? 0.5), 0) / refs.length;
  const traits = {
    warmth: avg('warmth'),
    luxury: avg('luxury'),
    contrast: avg('contrast'),
    density: avg('density'),
  };

  return {
    id: uid('sty'),
    generatedFrom: selectedIds,
    traits,
    descriptionAr: describe(traits),
    promptFragment: promptFrom(traits),
    // اللوحة تُستخدم في الرسم التوضيحي فقط؛ المزوّد الحقيقي يستنتج الألوان من التعليمة
    palette: refs[0]?.palette ?? null,
    paletteColors: refs[0]?.paletteColors ?? null,
  };
}

/** الجملة التي يراها المستخدم — بلا مصطلحات تصميم يحتاج شرحها */
export function describe(t, materials = []) {
  const warmth = t.warmth > 0.65 ? 'الدافئ' : t.warmth < 0.4 ? 'الهادئ البارد' : 'المتوازن';
  const luxury =
    t.luxury > 0.7
      ? 'مع لمسات فاخرة واضحة'
      : t.luxury < 0.4
        ? 'بروح بسيطة ومريحة'
        : 'مع تفاصيل أنيقة';
  const density = t.density > 0.6 ? 'وأجواء ممتلئة دافئة' : 'ومساحات مفتوحة مرتّبة';
  const mat = materials.length ? ` تميل لخامات مثل ${materials.slice(0, 2).join(' و')}.` : '';
  return `ذوقك يميل إلى التصميم العصري ${warmth} ${luxury} ${density}.${mat}`;
}

/** الترجمة الداخلية لتعليمة نموذج الصور — لا تُعرض للمستخدم أبداً */
export function promptFrom(t) {
  return [
    t.warmth > 0.6 ? 'warm tones' : t.warmth < 0.4 ? 'cool tones' : 'balanced neutral tones',
    t.luxury > 0.7 ? 'refined luxury details' : t.luxury < 0.4 ? 'simple and calm' : 'elegant details',
    t.contrast > 0.6 ? 'strong contrast' : 'soft tonal contrast',
    t.density > 0.6 ? 'layered and cosy' : 'uncluttered',
  ].join(', ');
}
