/**
 * واجهة التخزين المجردة.
 * الشاشات تستورد `storage` فقط ولا تعرف أين تعيش البيانات.
 * لتفعيل المزامنة السحابية لاحقاً: أضف supabaseStore.js بنفس الشكل وبدّل السطر أدناه.
 */
import { localStore, blobURL, releaseURL, isEphemeral } from './localStore.js';
import { uid } from '../models/project.js';

export const storage = localStore;
export { blobURL, releaseURL };

/** هل نعمل بلا تخزين دائم؟ تُقرأ بعد أول عملية قراءة */
export const isStorageEphemeral = () => isEphemeral;

/** يقلّص الصورة قبل التخزين — صور iPhone تصل ٥ ميجا، ولا نحتاج أكثر من 1600px */
export async function storeImage(file, { maxSize = 1600, thumbSize = 400 } = {}) {
  const bitmap = await createImageBitmap(file);
  const blobKey = uid('img');
  const thumbnailKey = `${blobKey}_t`;

  const full = await resize(bitmap, maxSize, 0.86);
  const thumb = await resize(bitmap, thumbSize, 0.78);
  bitmap.close?.();

  await storage.putBlob(blobKey, full.blob);
  await storage.putBlob(thumbnailKey, thumb.blob);

  return {
    id: blobKey,
    blobKey,
    thumbnailKey,
    width: full.width,
    height: full.height,
    order: 0,
    capturedAt: new Date().toISOString(),
    quality: null,
  };
}

async function resize(bitmap, maxSize, quality) {
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality),
  );
  return { blob, width, height };
}

/** تخزين صورة مولّدة (تصل كـdata URI من المزوّد) */
export async function storeGeneratedImage(dataURI) {
  const blob = await (await fetch(dataURI)).blob();
  const key = uid('gen');
  await storage.putBlob(key, blob);
  return key;
}
