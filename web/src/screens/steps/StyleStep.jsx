import { useState } from 'react';
import { ActionBar, Button, Notice, ScreenHeader } from '../../components/ui.jsx';
import Icon from '../../components/Icon.jsx';
import Loader from '../../components/Loader.jsx';
import { ai, PHASES, STYLE_REFERENCES } from '../../lib/ai/index.js';
import { t } from '../../i18n/index.js';

const MIN_PICKS = 3;
const FLOW = [PHASES.ANALYZING_SPACE, PHASES.BUILDING_PROFILE];

/**
 * البند ١١ — اكتشاف الذوق بالصور.
 * لا نسأل «ما نمطك المفضل؟» — المستخدم العادي لا يعرف أسماء الأنماط.
 */
export default function StyleStep({ project, update, onNext }) {
  const [phase, setPhase] = useState(null);
  const [error, setError] = useState(null);

  const picked = project.selectedStyleImages;
  const profile = project.generatedStyleProfile;

  function toggle(id) {
    update({
      selectedStyleImages: picked.includes(id)
        ? picked.filter((x) => x !== id)
        : [...picked, id],
      generatedStyleProfile: null, // تغيير الاختيار يبطل الملف السابق
    });
  }

  async function analyze() {
    setError(null);
    try {
      const spaceAnalysis = await ai.analyzeSpace(
        {
          images: project.uploadedImages,
          roomType: project.roomType,
          notes: project.userNotes,
        },
        setPhase,
      );
      const styleProfile = await ai.buildStyleProfile({ selectedRefs: picked }, setPhase);
      update({ spaceAnalysis, generatedStyleProfile: styleProfile });
    } catch {
      setError(t('errors.generic'));
    } finally {
      setPhase(null);
    }
  }

  if (phase) return <Loader phases={FLOW} current={phase} />;

  /* ── نتيجة التحليل ── */
  if (profile) {
    return (
      <>
        <div className="screen screen--wizard">
          <ScreenHeader title={t('style.resultTitle')} />

          <div className="card card--pad">
            <p className="body" style={{ lineHeight: 1.8 }}>
              {profile.descriptionAr}
            </p>
            <div className="row mt-4" style={{ gap: 6 }}>
              {profile.paletteColors.map((color) => (
                <span
                  key={color}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 'var(--r-full)',
                    background: color,
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.07)',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="grid-3 mt-4">
            {picked.slice(0, 6).map((id) => {
              const ref = STYLE_REFERENCES.find((r) => r.id === id);
              return <img key={id} src={ref?.imageURI} className="thumb" alt="" />;
            })}
          </div>

          <div className="mt-4 center">
            <Button
              variant="ghost"
              onClick={() => update({ generatedStyleProfile: null })}
            >
              {t('style.redo')}
            </Button>
          </div>
        </div>

        <ActionBar>
          <Button block onClick={onNext}>
            {t('style.resultCta')}
          </Button>
        </ActionBar>
      </>
    );
  }

  /* ── شبكة الاختيار ── */
  return (
    <>
      <div className="screen screen--wizard">
        <ScreenHeader title={t('style.title')} subtitle={t('style.subtitle')} />

        {error && (
          <div style={{ marginBottom: 'var(--s-4)' }}>
            <Notice tone="warn">{error}</Notice>
          </div>
        )}

        <div className="grid-2">
          {STYLE_REFERENCES.map((ref) => (
            <button
              key={ref.id}
              className="pick"
              data-selected={picked.includes(ref.id)}
              onClick={() => toggle(ref.id)}
              aria-pressed={picked.includes(ref.id)}
            >
              <img src={ref.imageURI} className="pick__media" alt="" />
              {picked.includes(ref.id) && (
                <span className="pick__check">
                  <Icon name="check" size={15} strokeWidth={2.6} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <ActionBar>
        <p className="small faint center" style={{ marginBottom: 'var(--s-2)' }}>
          {picked.length < MIN_PICKS ? t('style.needMore') : t('style.selected', { n: picked.length })}
        </p>
        <Button block disabled={picked.length < MIN_PICKS} onClick={analyze}>
          {t('common.next')}
        </Button>
      </ActionBar>
    </>
  );
}
