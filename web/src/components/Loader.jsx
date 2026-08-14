import { t } from '../i18n/index.js';

/**
 * حالة التحميل — البند ٢٤.
 *
 * المراحل المعروضة هي مراحل **حقيقية** يبلّغ عنها المزوّد عبر `onProgress`.
 * لا مؤقّت يبدّل النصوص ليوهم المستخدم بعمل لا يحدث.
 */
export default function Loader({ phases = [], current }) {
  const activeIndex = phases.indexOf(current);

  return (
    <div className="loader">
      <div className="loader__orb" />
      <div className="stack center">
        <p className="heading">{t(`loading.${current}`)}</p>
        <p className="small faint">قد يستغرق هذا لحظات</p>
      </div>

      {phases.length > 1 && (
        <div className="loader__phases">
          {phases.map((phase, i) => (
            <div
              key={phase}
              className="phase"
              data-state={i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending'}
            >
              <span className="phase__dot" />
              <span>{t(`loading.${phase}`)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
