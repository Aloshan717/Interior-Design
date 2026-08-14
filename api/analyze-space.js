/**
 * تحليل صور الغرفة الحقيقية — البند ١٤.
 * ناتجه يغذّي تعليمة التوليد بما هو موجود فعلاً في المكان،
 * ويكشف مشاكل الصورة لعرض رسالة مفيدة (البند ٢٥).
 */
import { handler, required } from './_lib/http.js';
import { askJSON, imagePart, textPart } from './_lib/llm.js';

const SCHEMA = {
  type: 'object',
  properties: {
    isInteriorRoom: { type: 'boolean' },
    hasPeople: { type: 'boolean' },
    isTooDark: { type: 'boolean' },
    isBlurry: { type: 'boolean' },
    features: {
      type: 'object',
      properties: {
        windows: { type: 'integer' },
        doors: { type: 'integer' },
        flooring: { type: 'string' },
        wallColour: { type: 'string' },
        ceilingType: { type: 'string' },
        naturalLight: { type: 'string' },
        existingFurniture: { type: 'array', items: { type: 'string' } },
        approximateSize: { type: 'string' },
      },
      required: ['windows', 'doors', 'flooring', 'naturalLight'],
    },
    constraintsEn: { type: 'string' },
  },
  required: ['isInteriorRoom', 'hasPeople', 'isTooDark', 'isBlurry', 'features', 'constraintsEn'],
};

const INSTRUCTION = `You are an interior designer surveying a room before redesigning it.
Look at the photograph(s) of one single room and report what you actually observe.
Count windows and doors that are fully or partly visible.
Describe flooring, wall colour, ceiling and the amount of natural light in short English words.
List existing furniture pieces you can identify.
Give approximateSize as a rough guess like "small", "medium" or "large" — never invent exact measurements.
Also flag image quality problems: people visible, too dark to work with, or badly out of focus.
If the picture is not an indoor room at all, set isInteriorRoom to false.

Finally, translate the owner's wishes into constraintsEn: one short English sentence capturing what they
want kept, what they want replaced, and any preference in their notes. Write it as design instructions,
not as a translation exercise. If they said nothing, return an empty string.`;

export default handler(async ({ body }) => {
  required(body, 'images');

  const images = (body.images ?? []).slice(0, 4); // أربع صور تكفي وتوفّر التكلفة
  if (!images.length) throw new Error('no_images');

  const parts = [
    textPart(INSTRUCTION),
    textPart(`Room type stated by the owner: ${body.roomType ?? 'unspecified'}`),
    ...images.map(imagePart),
  ];

  // رغبات المالك بالعربية → تُترجم هنا مرة واحدة، فلا تصل كلمات عربية
  // إلى نموذج الصور الذي لا يفهمها
  const wishes = [
    body.notes && `Notes: ${body.notes}`,
    body.keepItems?.length && `Wants to keep: ${body.keepItems.join('، ')}`,
    body.replaceItems?.length && `Wants to replace: ${body.replaceItems.join('، ')}`,
  ].filter(Boolean);

  if (wishes.length) parts.push(textPart(`Owner wishes (Arabic):\n${wishes.join('\n')}`));

  const result = await askJSON(parts, SCHEMA);

  return {
    ...result,
    // نصرّح بمستوى الثقة بدل ادعاء الدقة — البند ١٤
    confidence: images.length >= 2 ? 'medium' : 'low',
  };
});
