import { useEffect, useRef, useState } from 'react';
import { Button, ScreenHeader } from '../../components/ui.jsx';
import Icon from '../../components/Icon.jsx';
import VersionStrip from '../../components/VersionStrip.jsx';
import { ai, INTENT_KIND } from '../../lib/ai/index.js';
import { storeGeneratedImage, blobURL } from '../../lib/storage/index.js';
import { cheaperAlternatives } from '../../lib/products/index.js';
import { currentDesign, uid } from '../../lib/models/project.js';
import { money } from '../../lib/format.js';
import { t } from '../../i18n/index.js';

/**
 * البند ١٨ — التعديل بالأوامر الطبيعية.
 *
 * الأوامر نوعان داخلياً (المستخدم لا يرى الفرق):
 *   · بصري   → «غيّر الثريا»            → نموذج الصور
 *   · تجاري  → «بميزانية أقل»           → محرّك المنتجات
 * بدون هذا التمييز يعطي «بميزانية أقل» نتيجة عشوائية بدل استبدال منتجات فعلي.
 */
export default function EditStep({ project, update, updateWith, onDone }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [heroSrc, setHeroSrc] = useState(null);
  const endRef = useRef(null);

  const design = currentDesign(project);

  useEffect(() => {
    if (design?.imageKey) blobURL(design.imageKey).then(setHeroSrc);
  }, [design?.imageKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [project.modifications.length, busy]);

  async function send(message) {
    const userText = (message ?? text).trim();
    if (!userText || busy) return;
    setText('');
    setBusy(true);

    const modId = uid('mod');
    updateWith((p) => ({
      modifications: [
        ...p.modifications,
        { id: modId, userText, intent: null, reply: null, status: 'pending', createdAt: new Date().toISOString() },
      ],
    }));

    try {
      const intent = await ai.parseEditIntent({ text: userText, currentDesign: design });

      if (intent.kind === INTENT_KIND.UNKNOWN) {
        finish(modId, { intent, reply: t('edit.notUnderstood'), status: 'done' });
        return;
      }

      if (intent.kind === INTENT_KIND.COMMERCIAL) {
        updateWith((p) => {
          const result = cheaperAlternatives(p.products, {
            category: intent.target === 'overall' ? null : categoryFor(intent.target),
          });
          return {
            products: result.products,
            costByCategory: result.byCategory,
            totalEstimatedCost: result.total,
            modifications: p.modifications.map((m) =>
              m.id === modId
                ? {
                    ...m,
                    intent,
                    reply: t('edit.doneCommercial', { cost: money(result.total.amount) }),
                    status: 'done',
                  }
                : m,
            ),
          };
        });
        return;
      }

      // تعديل بصري → نسخة جديدة، ولا نستبدل السابقة أبداً (البند ١٩)
      const result = await ai.applyEdit({
        baseDesign: design,
        intent,
        styleProfile: project.generatedStyleProfile,
        roomType: project.roomType,
      });
      const imageKey = await storeGeneratedImage(result.imageURI);

      updateWith((p) => {
        const versionNumber = p.finalDesigns.length + 1;
        const newDesign = {
          id: uid('dsg'),
          versionNumber,
          imageKey,
          palette: result.palette,
          basedOnConcept: result.basedOnConcept,
          basedOnImageId: design.basedOnImageId,
          detectedItems: result.detectedItems,
          promptUsed: result.promptUsed,
          isApproved: false,
          generatedAt: new Date().toISOString(),
        };
        return {
          finalDesigns: [...p.finalDesigns, newDesign],
          currentVersion: versionNumber,
          designVersions: [
            ...p.designVersions,
            {
              versionNumber,
              designId: newDesign.id,
              label: userText,
              parentVersion: p.currentVersion,
              createdAt: newDesign.generatedAt,
              thumbnailKey: imageKey,
            },
          ],
          modifications: p.modifications.map((m) =>
            m.id === modId
              ? {
                  ...m,
                  intent,
                  reply: t('edit.doneVisual', { target: intent.targetLabel }),
                  status: 'done',
                  resultDesignId: newDesign.id,
                }
              : m,
          ),
        };
      });
    } catch {
      finish(modId, { reply: t('errors.generationFailed'), status: 'failed' });
    } finally {
      setBusy(false);
    }
  }

  function finish(modId, patch) {
    updateWith((p) => ({
      modifications: p.modifications.map((m) => (m.id === modId ? { ...m, ...patch } : m)),
    }));
  }

  return (
    <>
      <div className="screen screen--wizard" style={{ paddingBottom: 140 }}>
        <ScreenHeader title={t('edit.title')} />

        {heroSrc ? <img src={heroSrc} className="hero" alt="" /> : <div className="hero skeleton" />}

        {project.designVersions.length > 1 && (
          <VersionStrip
            versions={project.designVersions}
            current={project.currentVersion}
            onRestore={(versionNumber) => update({ currentVersion: versionNumber })}
          />
        )}

        {/* اقتراحات — تساعد من لا يعرف بماذا يبدأ */}
        {project.modifications.length === 0 && (
          <div className="mt-6">
            <p className="small faint" style={{ marginBottom: 'var(--s-2)' }}>
              {t('edit.hintsTitle')}
            </p>
            <div className="chips">
              {t('edit.hints').map((hint) => (
                <button key={hint} className="chip" onClick={() => send(hint)}>
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* المحادثة */}
        <div className="chat mt-6">
          {project.modifications.map((mod) => (
            <div key={mod.id} style={{ display: 'contents' }}>
              <div className="bubble bubble--user">{mod.userText}</div>
              {mod.reply && <div className="bubble bubble--ai">{mod.reply}</div>}
            </div>
          ))}
          {busy && <div className="bubble bubble--ai faint">{t('edit.working')}</div>}
          <div ref={endRef} />
        </div>

        <div className="mt-6 center">
          <Button variant="secondary" onClick={onDone}>
            {t('design.approveCta')}
          </Button>
        </div>
      </div>

      <div className="composer">
        <textarea
          className="field grow"
          rows={1}
          value={text}
          placeholder={t('edit.placeholder')}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          style={{ minHeight: 48, maxHeight: 120 }}
        />
        <button
          className="btn btn--primary"
          style={{ minHeight: 48, width: 48, padding: 0, borderRadius: 'var(--r-full)' }}
          disabled={!text.trim() || busy}
          onClick={() => send()}
          aria-label={t('edit.send')}
        >
          <Icon name="send" size={19} filled />
        </button>
      </div>
    </>
  );
}

/** ربط هدف التعديل بفئة المنتج */
const CATEGORY_OF = {
  lighting: 'lighting',
  sofa: 'furniture',
  bed: 'furniture',
  rug: 'rug',
  curtains: 'curtains',
  table: 'table',
};
const categoryFor = (target) => CATEGORY_OF[target] ?? null;
