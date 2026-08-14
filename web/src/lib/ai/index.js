/**
 * نقطة التبديل الوحيدة بين مزوّدي الذكاء الاصطناعي — البند ٢٨.
 *
 * لتفعيل التوليد الحقيقي: VITE_AI_PROVIDER=fal في متغيرات بيئة Vercel.
 * لا شاشة ولا مكوّن يتغيّر.
 */
import { mockProvider } from './mockProvider.js';
import { falProvider } from './falProvider.js';

const providers = {
  mock: mockProvider,
  fal: falProvider,
};

const selected = import.meta.env.VITE_AI_PROVIDER ?? 'mock';

export const ai = providers[selected] ?? mockProvider;

export { PHASES, INTENT_KIND } from './types.js';
export { getStyleReferences, referenceSrc, clearStyleReferences } from './styleReferences.js';
export { AIError } from './falProvider.js';
