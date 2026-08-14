/**
 * التعديل الموضعي — البند ١٨.
 * يبني على صورة التصميم الحالية، فيبقى كل ما لم يُطلب تغييره كما هو.
 */
import { handler, required } from './_lib/http.js';
import { submit, editInput, AppError } from './_lib/fal.js';
import { editPrompt } from './_lib/prompts.js';

export default handler(async ({ body }) => {
  required(body, 'baseImage', 'intent');

  if (!/^data:image\/[a-z+]+;base64,/.test(body.baseImage)) {
    throw new AppError('bad_image', 'صورة التصميم الحالية مفقودة', 400);
  }

  const { model, input } = editInput({
    imageDataURI: body.baseImage,
    prompt: editPrompt({ intent: body.intent, rawText: body.rawText }),
    // توجيه أعلى = التزام أشد بالصورة الأصلية، وهو المطلوب في التعديل
    strength: 4,
  });

  return { jobId: await submit(model, input) };
});
