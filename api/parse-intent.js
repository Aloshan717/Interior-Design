/**
 * فهم أمر التعديل العربي — البند ١٨.
 *
 * التصنيف إلى «بصري» و«تجاري» هو جوهر هذه الدالة:
 * «غيّر الثريا» تذهب لنموذج الصور، و«بميزانية أقل» تذهب لمحرّك المنتجات.
 * بدون هذا التمييز يعطي الطلب الثاني نتيجة عشوائية.
 */
import { handler, required } from './_lib/http.js';
import { askJSON, textPart } from './_lib/llm.js';

const TARGETS = ['lighting', 'sofa', 'bed', 'rug', 'curtains', 'table', 'walls', 'floor', 'overall'];
const CHANGES = ['replace', 'remove', 'bigger', 'smaller', 'lighter', 'darker', 'more_luxury', 'simpler', 'cheaper'];

const SCHEMA = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['visual', 'commercial', 'unknown'] },
    target: { type: 'string', enum: TARGETS },
    change: { type: 'string', enum: CHANGES },
    targetLabel: { type: 'string' },
  },
  required: ['kind', 'target', 'change', 'targetLabel'],
};

const INSTRUCTION = `You classify Arabic interior-design edit requests, including Gulf/Saudi dialect.

kind:
- "commercial" when the user is asking about cost, budget or cheaper products
  (e.g. "بميزانية أقل", "أرخص", "أوفر", "قلل التكلفة"). These are handled by swapping products, not by editing the image.
- "visual" when the user wants the picture changed (colour, size, style, replacing or removing an object).
- "unknown" only when the request is genuinely unrelated to redesigning the room.

target: which element the request is about. Use "overall" when it is about the whole room mood.
change: the closest action. Use "replace" when they simply want something different.
targetLabel: the element's name in Arabic as a short noun phrase with the definite article
(e.g. "الثريا", "الكنبة", "الجدران", "التصميم").

Examples:
"غيّر الثريا" -> visual / lighting / replace / "الثريا"
"خل لون الجدران أفتح" -> visual / walls / lighter / "الجدران"
"أبي كنبة أكبر" -> visual / sofa / bigger / "الكنبة"
"احذف الطاولة الجانبية" -> visual / table / remove / "الطاولة"
"خل التصميم أفخم" -> visual / overall / more_luxury / "التصميم"
"أبي نفس التصميم بميزانية أقل" -> commercial / overall / cheaper / "التصميم"
"أبي سجادة أرخص" -> commercial / rug / cheaper / "السجادة"`;

export default handler(async ({ body }) => {
  required(body, 'text');

  const intent = await askJSON(
    [textPart(INSTRUCTION), textPart(`Request: "${String(body.text).slice(0, 400)}"`)],
    SCHEMA,
  );

  // حارس: لو خرج النموذج عن القيم المسموحة نعامله كغير مفهوم بدل تمرير قيمة فاسدة
  if (!TARGETS.includes(intent.target) || !CHANGES.includes(intent.change)) {
    return { kind: 'unknown', target: null, change: null, targetLabel: null, params: {} };
  }

  return { ...intent, params: {} };
});
