import { brand } from '../theme/brand.js';
import { t } from '../i18n/index.js';

/** ١٨٬٧٥٠ — بأرقام عربية شرقية أم لاتينية؟ نستخدم اللاتينية: أوضح للأسعار. */
export function money(amount) {
  if (amount == null || Number.isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount);
}

export function moneyWithCurrency(amount) {
  if (amount == null) return t('products.noPrice');
  return `${money(amount)} ${t('common.sar')}`;
}

/** «اليوم» · «أمس» · «قبل ٣ أيام» · تاريخ كامل */
export function relativeDate(iso) {
  if (!iso) return '';
  const then = new Date(iso);
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(then)) / 86400000);

  if (days <= 0) return t('projects.today');
  if (days === 1) return t('projects.yesterday');
  if (days < 30) return t('projects.daysAgo', { n: days });
  return new Intl.DateTimeFormat(brand.locale, { day: 'numeric', month: 'long' }).format(then);
}

export function bytes(n) {
  if (!n) return '0 KB';
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
