import { ActionBar, Button, ScreenHeader } from '../../components/ui.jsx';
import { BUDGET_PRESETS, KEEP_OPTIONS } from '../../lib/models/constants.js';
import { money } from '../../lib/format.js';
import { t } from '../../i18n/index.js';

/** البندان ١٠ و٣١ — كل شيء اختياري */
export default function DetailsStep({ project, update, onNext }) {
  const dims = project.dimensions ?? {};
  const prefs = project.existingFurniturePreferences;

  const setDim = (key, value) =>
    update({
      dimensions: { ...dims, [key]: value === '' ? null : Number(value), unit: 'm' },
    });

  const setPref = (patch) =>
    update({ existingFurniturePreferences: { ...prefs, ...patch } });

  return (
    <>
      <div className="screen screen--wizard">
        <ScreenHeader title={t('details.title')} subtitle={t('details.subtitle')} />

        {/* الأبعاد */}
        <div className="card card--pad">
          <div className="heading" style={{ marginBottom: 'var(--s-3)' }}>
            {t('details.dimensions')}
          </div>
          <div className="row" style={{ gap: 'var(--s-2)' }}>
            <NumField label={t('details.width')} value={dims.width} onChange={(v) => setDim('width', v)} />
            <NumField label={t('details.length')} value={dims.length} onChange={(v) => setDim('length', v)} />
            <NumField
              label={t('details.ceiling')}
              value={dims.ceilingHeight}
              onChange={(v) => setDim('ceilingHeight', v)}
            />
          </div>
        </div>

        {/* الميزانية */}
        <div className="card card--pad mt-4">
          <div className="heading">{t('details.budget')}</div>
          <p className="small soft" style={{ marginTop: 4, marginBottom: 'var(--s-3)' }}>
            {t('details.budgetNote')}
          </p>
          <div className="chips">
            {BUDGET_PRESETS.map((amount) => (
              <button
                key={amount}
                className="chip num"
                data-selected={project.budget?.amount === amount}
                onClick={() =>
                  update({
                    budget:
                      project.budget?.amount === amount ? null : { amount, currency: 'SAR' },
                  })
                }
              >
                {money(amount)} {t('common.sar')}
              </button>
            ))}
          </div>
          <input
            className="field mt-4 num"
            type="number"
            inputMode="numeric"
            placeholder={t('details.budgetCustom')}
            value={
              project.budget && !BUDGET_PRESETS.includes(project.budget.amount)
                ? project.budget.amount
                : ''
            }
            onChange={(e) =>
              update({
                budget: e.target.value ? { amount: Number(e.target.value), currency: 'SAR' } : null,
              })
            }
          />
        </div>

        {/* الأثاث الحالي */}
        <div className="card card--pad mt-4">
          <div className="heading" style={{ marginBottom: 'var(--s-3)' }}>
            {t('details.keepTitle')}
          </div>
          <div className="chips">
            {KEEP_OPTIONS.map((option) => (
              <button
                key={option}
                className="chip"
                data-selected={prefs.keepExisting === option}
                onClick={() => setPref({ keepExisting: option })}
              >
                {t(`details.${option}`)}
              </button>
            ))}
          </div>

          {prefs.keepExisting !== 'keepNone' && (
            <div className="mt-4">
              <label className="label">{t('details.keepItems')}</label>
              <input
                className="field"
                placeholder={t('details.keepItemsPlaceholder')}
                value={prefs.keepItems.join('، ')}
                onChange={(e) => setPref({ keepItems: splitList(e.target.value) })}
              />
            </div>
          )}

          <div className="mt-4">
            <label className="label">{t('details.replaceItems')}</label>
            <input
              className="field"
              placeholder={t('details.replaceItemsPlaceholder')}
              value={prefs.replaceItems.join('، ')}
              onChange={(e) => setPref({ replaceItems: splitList(e.target.value) })}
            />
          </div>
        </div>

        {/* ملاحظات */}
        <div className="card card--pad mt-4">
          <label className="label">{t('details.notes')}</label>
          <textarea
            className="field"
            rows={4}
            placeholder={t('details.notesPlaceholder')}
            value={project.userNotes}
            onChange={(e) => update({ userNotes: e.target.value })}
          />
        </div>
      </div>

      <ActionBar>
        <Button block onClick={onNext}>
          {t('common.next')}
        </Button>
      </ActionBar>
    </>
  );
}

function NumField({ label, value, onChange }) {
  return (
    <label className="grow">
      <span className="label">
        {label} <span className="faint">({t('details.meters')})</span>
      </span>
      <input
        className="field num"
        type="number"
        inputMode="decimal"
        step="0.1"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

const splitList = (text) =>
  text
    .split(/[،,]/)
    .map((s) => s.trim())
    .filter(Boolean);
