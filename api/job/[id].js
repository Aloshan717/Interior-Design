/**
 * حالة مهمة التوليد.
 *
 * عند الاكتمال نجلب الصورة على الخادم ونعيدها مضمّنة بدل رابط fal —
 * فلا نعتمد على أذونات CORS الخارجية، ولا ينكسر التخزين المحلي.
 */
import { handler } from '../_lib/http.js';
import { poll, AppError } from '../_lib/fal.js';

export default handler(async ({ req }) => {
  const id = req.query?.id;
  if (!id) throw new AppError('bad_request', 'معرّف المهمة مفقود', 400);

  const result = await poll(id);
  if (result.status !== 'done') return { status: 'pending', queuePosition: result.queuePosition };

  return { status: 'done', image: await inline(result.images[0]) };
});

async function inline(url) {
  const res = await fetch(url);
  if (!res.ok) throw new AppError('image_fetch_failed', 'تعذّر تحميل الصورة الناتجة', 502);

  const type = res.headers.get('content-type') || 'image/jpeg';
  const buffer = Buffer.from(await res.arrayBuffer());
  return `data:${type};base64,${buffer.toString('base64')}`;
}
