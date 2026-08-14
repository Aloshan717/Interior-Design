import { StoredImage, Badge } from './ui.jsx';
import { t } from '../i18n/index.js';

/**
 * سجل النسخ — البند ١٩.
 * لا نستبدل تصميماً أبداً؛ نضيف نسخة. الرجوع لا يحذف شيئاً.
 */
export default function VersionStrip({ versions, current, onRestore }) {
  return (
    <section className="mt-6">
      <h2 className="heading" style={{ marginBottom: 'var(--s-3)' }}>
        {t('design.versionsTitle')}
      </h2>

      <div className="hscroll">
        {versions.map((version) => {
          const isCurrent = version.versionNumber === current;
          return (
            <button
              key={version.versionNumber}
              className="pick"
              data-selected={isCurrent}
              style={{ width: 132 }}
              onClick={() => onRestore(version.versionNumber)}
            >
              <StoredImage
                imageKey={version.thumbnailKey}
                className="pick__media"
                alt={version.label}
              />
              <span className="pick__label">
                {t('design.version', { n: version.versionNumber })}
              </span>
            </button>
          );
        })}
      </div>

      <div className="row" style={{ marginTop: 'var(--s-2)', gap: 'var(--s-2)' }}>
        <Badge tone="accent">{t('design.current')}</Badge>
        <span className="tiny faint">
          {versions.find((v) => v.versionNumber === current)?.label}
        </span>
      </div>
    </section>
  );
}
