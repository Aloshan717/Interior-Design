import { useEffect, useRef, useState } from 'react';
import { ActionBar, Button, Lightbox, Notice, ScreenHeader } from '../../components/ui.jsx';
import Icon from '../../components/Icon.jsx';
import Loader from '../../components/Loader.jsx';
import { ai, PHASES } from '../../lib/ai/index.js';
import { errorText } from '../../lib/errors.js';
import { storeGeneratedImage, blobURL } from '../../lib/storage/index.js';
import { t } from '../../i18n/index.js';

/**
 * البندان ١٢ و١٣ — التصورات الأولية.
 * ٤ تصورات + «أرني المزيد» بدل ٦ دفعة واحدة: انتظار أقصر وتكلفة أقل.
 */
export default function ConceptsStep({ project, update, updateWith, onNext }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(null);
  const started = useRef(false);

  const concepts = project.generatedConcepts;

  useEffect(() => {
    if (!concepts.length && !started.current) {
      started.current = true;
      generate();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      await ai.generateConcepts(
        {
          images: project.uploadedImages,
          spaceAnalysis: project.spaceAnalysis,
          styleProfile: project.generatedStyleProfile,
          roomType: project.roomType,
          budget: project.budget,
          count: 4,
          exclude: concepts.map((c) => c.directionTag),
        },
        () => {},
        async (concept) => {
          // نخزّن الصورة ونضيف التصور فور جاهزيته — لا انتظار للدفعة كاملة
          const imageKey = await storeGeneratedImage(concept.imageURI);
          const { imageURI, ...rest } = concept;
          updateWith((p) => ({
            generatedConcepts: [...p.generatedConcepts, { ...rest, imageKey }],
          }));
        },
      );
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  if (busy && concepts.length === 0) {
    return <Loader phases={[PHASES.GENERATING_CONCEPTS]} current={PHASES.GENERATING_CONCEPTS} />;
  }

  return (
    <>
      <div className="screen screen--wizard">
        <ScreenHeader title={t('concepts.title')} subtitle={t('concepts.subtitle')} />

        {error && (
          <div style={{ marginBottom: 'var(--s-4)' }}>
            <Notice tone="warn">{error}</Notice>
          </div>
        )}

        <div className="stack-lg">
          {concepts.map((concept) => (
            <ConceptCard
              key={concept.id}
              concept={concept}
              selected={project.selectedConcept === concept.id}
              onSelect={() => update({ selectedConcept: concept.id })}
              onZoom={setZoom}
            />
          ))}

          {busy && <div className="hero skeleton" />}
        </div>

        <p className="tiny faint center mt-4">{t('concepts.tapToExpand')}</p>

        <div className="mt-5 center">
          <Button variant="secondary" disabled={busy} onClick={generate}>
            {t('concepts.more')}
          </Button>
        </div>
      </div>

      <ActionBar>
        <Button block disabled={!project.selectedConcept} onClick={onNext}>
          {t('concepts.approve')}
        </Button>
      </ActionBar>

      {zoom && <Lightbox src={zoom} onClose={() => setZoom(null)} />}
    </>
  );
}

function ConceptCard({ concept, selected, onSelect, onZoom }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    blobURL(concept.imageKey).then(setSrc);
  }, [concept.imageKey]);

  return (
    <div>
      <button
        className="pick"
        data-selected={selected}
        onClick={onSelect}
        style={{ borderRadius: 'var(--r-lg)' }}
      >
        {src ? (
          <img src={src} className="pick__media" alt={concept.titleAr} />
        ) : (
          <div className="pick__media skeleton" />
        )}
        {selected && (
          <span className="pick__check">
            <Icon name="check" size={15} strokeWidth={2.6} />
          </span>
        )}
      </button>

      <div className="row-between" style={{ marginTop: 'var(--s-2)' }}>
        <span className="heading">{concept.titleAr}</span>
        <button
          className="iconbtn"
          onClick={() => src && onZoom(src)}
          aria-label={t('concepts.tapToExpand')}
        >
          <Icon name="image" size={18} />
        </button>
      </div>
    </div>
  );
}
