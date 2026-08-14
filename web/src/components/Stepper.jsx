import Icon from './Icon.jsx';
import { VISIBLE_STEPS } from '../lib/models/constants.js';
import { t } from '../i18n/index.js';

/**
 * مؤشر الخطوات — البند ٢٣.
 * يجيب على «أين أنا؟ ما التالي؟ كم بقي؟» في شريط ارتفاعه ٣ بكسل،
 * بدل stepper ضخم يأكل ثلث الشاشة.
 */
/** `details` مرحلة فرعية من `photos` — البند ٢٣ يطلب ٧ خطوات لا ٨ */
const PROGRESS_STEP = { details: 'photos' };

export default function Stepper({ step, onBack }) {
  const index = Math.max(0, VISIBLE_STEPS.indexOf(PROGRESS_STEP[step] ?? step));
  const total = VISIBLE_STEPS.length;
  const percent = ((index + 1) / total) * 100;

  return (
    <div className="stepper">
      <div className="stepper__row">
        {onBack && (
          <button className="iconbtn" onClick={onBack} aria-label={t('common.back')}>
            <Icon name="back" size={20} />
          </button>
        )}
        <div className="grow">
          <div className="row" style={{ marginBottom: 6, gap: 'var(--s-2)' }}>
            <span className="stepper__label" style={{ color: 'var(--c-text)', fontWeight: 600 }}>
              {t(`steps.${step}`)}
            </span>
            <span className="stepper__label num">
              {index + 1}/{total}
            </span>
          </div>
          <div className="stepper__track">
            <div className="stepper__fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
