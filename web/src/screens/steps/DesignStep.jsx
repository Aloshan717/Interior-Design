import { useEffect, useRef, useState } from 'react';
import { ActionBar, Button, Notice, ScreenHeader } from '../../components/ui.jsx';
import Loader from '../../components/Loader.jsx';
import DesignSummary from '../../components/DesignSummary.jsx';
import VersionStrip from '../../components/VersionStrip.jsx';
import { ai, PHASES } from '../../lib/ai/index.js';
import { storeGeneratedImage } from '../../lib/storage/index.js';
import { matchProducts, swapProduct } from '../../lib/products/index.js';
import { currentDesign, uid } from '../../lib/models/project.js';
import { t } from '../../i18n/index.js';

const FLOW = [PHASES.RENDERING_DESIGN, PHASES.MATCHING_PRODUCTS];

/**
 * البنود ١٤ و١٥ و١٦ — التصميم الواقعي للمكان.
 *
 * ملاحظة صدق (البند ١٤): المزوّد التجريبي لا يعيد تصميم صورتك فعلاً —
 * يرسم غرفة توضيحية بذوقك. التوليد الحقيقي يبدأ من صورتك عند تفعيل fal.ai.
 */
export default function DesignStep({ project, update, updateWith, onEdit, onApprove }) {
  const [phase, setPhase] = useState(null);
  const [error, setError] = useState(null);
  const started = useRef(false);

  const design = currentDesign(project);

  useEffect(() => {
    if (!project.finalDesigns.length && !started.current) {
      started.current = true;
      generate();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function generate() {
    setError(null);
    try {
      const concept = project.generatedConcepts.find((c) => c.id === project.selectedConcept);

      const result = await ai.generateRoomDesign(
        {
          roomImage: project.uploadedImages[0],
          spaceAnalysis: project.spaceAnalysis,
          styleProfile: project.generatedStyleProfile,
          concept,
          roomType: project.roomType,
          constraints: {
            budget: project.budget,
            keep: project.existingFurniturePreferences,
            notes: project.userNotes,
          },
        },
        setPhase,
      );

      const imageKey = await storeGeneratedImage(result.imageURI);

      setPhase(PHASES.MATCHING_PRODUCTS);
      const matched = matchProducts({
        detectedItems: result.detectedItems,
        budget: project.budget,
        styleProfile: project.generatedStyleProfile,
      });

      const newDesign = {
        id: uid('dsg'),
        versionNumber: 1,
        imageKey,
        basedOnConcept: result.basedOnConcept,
        basedOnImageId: project.uploadedImages[0]?.id ?? null,
        detectedItems: result.detectedItems,
        promptUsed: result.promptUsed,
        isApproved: false,
        generatedAt: new Date().toISOString(),
      };

      update({
        finalDesigns: [newDesign],
        currentVersion: 1,
        designVersions: [
          {
            versionNumber: 1,
            designId: newDesign.id,
            label: t('design.version', { n: 1 }),
            parentVersion: null,
            createdAt: newDesign.generatedAt,
            thumbnailKey: imageKey,
          },
        ],
        products: matched.products,
        costByCategory: matched.byCategory,
        totalEstimatedCost: matched.total,
      });
    } catch {
      setError(t('errors.generationFailed'));
    } finally {
      setPhase(null);
    }
  }

  function onSwapProduct(instanceId, newProductId) {
    updateWith((p) => {
      const result = swapProduct(p.products, instanceId, newProductId);
      return {
        products: result.products,
        costByCategory: result.byCategory,
        totalEstimatedCost: result.total,
      };
    });
  }

  if (phase) return <Loader phases={FLOW} current={phase} />;

  if (error && !design) {
    return (
      <div className="screen screen--wizard">
        <Notice tone="warn">{error}</Notice>
        <div className="mt-5">
          <Button block onClick={generate}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="screen screen--wizard">
        <ScreenHeader title={project.projectName || t('design.title')} />

        <DesignSummary design={design} project={project} onSwapProduct={onSwapProduct} />

        {project.designVersions.length > 1 && (
          <VersionStrip
            versions={project.designVersions}
            current={project.currentVersion}
            onRestore={(versionNumber) => update({ currentVersion: versionNumber })}
          />
        )}
      </div>

      <ActionBar>
        <div className="row" style={{ gap: 'var(--s-3)' }}>
          <Button variant="secondary" block pair onClick={onEdit}>
            {t('design.editCta')}
          </Button>
          <Button block pair onClick={onApprove}>
            {t('design.approveCta')}
          </Button>
        </div>
      </ActionBar>
    </>
  );
}
