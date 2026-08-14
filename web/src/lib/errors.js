import { t } from '../i18n/index.js';

/**
 * تحويل رموز الأخطاء إلى رسائل يفهمها المستخدم — البند ٢٥.
 * لا تظهر رسالة تقنية واحدة ولا رمز خطأ في الواجهة.
 */
const MESSAGES = {
  offline: 'errors.offline',
  timeout: 'errors.timeout',

  bad_key: 'errors.setup',
  missing_key: 'errors.setup',
  no_credit: 'errors.noCredit',
  rate_limited: 'errors.rateLimited',

  bad_image: 'errors.imageUnclear',
  image_unclear: 'errors.imageUnclear',
  image_too_dark: 'errors.imageTooDark',
  image_has_people: 'errors.imageHasPeople',
  image_not_room: 'errors.imageNotRoom',
  payload_too_large: 'errors.imageTooLarge',

  generation_failed: 'errors.generationFailed',
  empty_result: 'errors.generationFailed',
  submit_failed: 'errors.generationFailed',
  poll_failed: 'errors.generationFailed',
  result_failed: 'errors.generationFailed',
  image_fetch_failed: 'errors.generationFailed',

  storage_full: 'errors.storageFull',
};

export function errorText(err) {
  const key = MESSAGES[err?.code] ?? 'errors.generic';
  return t(key);
}
