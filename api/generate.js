/**
 * بدء مهام التوليد.
 *
 * يعيد قائمة مهام فوراً (لا ينتظر النتيجة)، والتطبيق يسأل عن كل مهمة
 * على حدة — فيظهر كل تصور فور جاهزيته بدل انتظار الدفعة كاملة.
 */
import { handler, required } from './_lib/http.js';
import { submit, editInput, textInput, AppError } from './_lib/fal.js';
import {
  DIRECTIONS,
  conceptPrompt,
  designPrompt,
  STYLE_REFERENCE_PROMPTS,
  styleReferencePrompt,
} from './_lib/prompts.js';

export default handler(async ({ body }) => {
  required(body, 'task');

  switch (body.task) {
    case 'concepts':
      return concepts(body);
    case 'room_design':
      return roomDesign(body);
    case 'style_references':
      return styleReferences();
    default:
      throw new AppError('bad_request', `مهمة غير معروفة: ${body.task}`, 400);
  }
});

/** ٤ اتجاهات مختلفة — كلها مبنية على صورة غرفة المستخدم نفسها */
async function concepts({ roomImage, roomType, styleProfile, budget, count = 4, exclude = [] }) {
  requireImage(roomImage);

  const picked = DIRECTIONS.filter((d) => !exclude.includes(d.tag)).slice(0, count);
  if (!picked.length) throw new AppError('no_more_directions', 'لا توجد اتجاهات إضافية', 400);

  const jobs = await Promise.all(
    picked.map(async (direction) => {
      const { model, input } = editInput({
        imageDataURI: roomImage,
        prompt: conceptPrompt({ direction, roomType, styleProfile, budget }),
      });
      return {
        jobId: await submit(model, input),
        directionTag: direction.tag,
        titleAr: direction.titleAr,
      };
    }),
  );

  return { jobs };
}

/** التصميم الواقعي الكامل بناءً على الاتجاه المعتمد */
async function roomDesign({ roomImage, roomType, styleProfile, spaceAnalysis, constraints, conceptTag }) {
  requireImage(roomImage);

  const direction = DIRECTIONS.find((d) => d.tag === conceptTag) ?? DIRECTIONS[0];
  const { model, input } = editInput({
    imageDataURI: roomImage,
    prompt: designPrompt({ direction, roomType, styleProfile, spaceAnalysis, constraints }),
  });

  return {
    jobs: [
      { jobId: await submit(model, input), directionTag: direction.tag, titleAr: direction.titleAr },
    ],
  };
}

/**
 * صور الذوق الـ١٢ — تُولَّد مرة واحدة في عمر التطبيق.
 * التطبيق يخزّنها على الجهاز فلا تتكرر التكلفة.
 */
async function styleReferences() {
  const jobs = await Promise.all(
    STYLE_REFERENCE_PROMPTS.map(async (ref) => {
      const { model, input } = textInput({ prompt: styleReferencePrompt(ref) });
      return {
        jobId: await submit(model, input),
        refId: ref.id,
        traits: {
          warmth: ref.warmth,
          luxury: ref.luxury,
          contrast: ref.contrast,
          density: ref.density,
        },
      };
    }),
  );

  return { jobs };
}

function requireImage(dataURI) {
  if (!/^data:image\/[a-z+]+;base64,/.test(dataURI ?? '')) {
    throw new AppError('bad_image', 'صورة الغرفة مفقودة أو بصيغة غير مدعومة', 400);
  }
}
