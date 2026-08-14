import ar from './ar.js';

const dictionaries = { ar };
let current = 'ar';

/**
 * t('photos.title')            → نص
 * t('common.step', {n:2, total:7}) → استبدال المتغيرات
 * t('photos.tips')             → مصفوفة كما هي
 */
export function t(path, vars) {
  const value = path
    .split('.')
    .reduce((node, key) => (node == null ? undefined : node[key]), dictionaries[current]);

  if (value === undefined) {
    if (import.meta.env.DEV) console.warn(`[i18n] مفتاح مفقود: ${path}`);
    return path;
  }
  if (typeof value !== 'string' || !vars) return value;

  return value.replace(/\{(\w+)\}/g, (match, key) =>
    vars[key] !== undefined ? String(vars[key]) : match,
  );
}

export function setLocale(locale) {
  if (dictionaries[locale]) current = locale;
}

export const dir = () => 'rtl';
