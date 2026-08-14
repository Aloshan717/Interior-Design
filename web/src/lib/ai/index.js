/**
 * نقطة التبديل الوحيدة بين مزوّدي الذكاء الاصطناعي — البند ٢٨.
 *
 * لتفعيل التوليد الحقيقي: ضع VITE_AI_PROVIDER=fal في متغيرات البيئة.
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
export { STYLE_REFERENCES } from './styleReferences.js';
