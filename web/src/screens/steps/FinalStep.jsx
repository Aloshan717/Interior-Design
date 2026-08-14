import { useState } from 'react';
import { ActionBar, Button, Notice, ScreenHeader } from '../../components/ui.jsx';
import Icon from '../../components/Icon.jsx';
import DesignSummary from '../../components/DesignSummary.jsx';
import { blobURL } from '../../lib/storage/index.js';
import { currentDesign } from '../../lib/models/project.js';
import { money } from '../../lib/format.js';
import { t } from '../../i18n/index.js';

/** البند ٢٠ — شاشة التصميم النهائي */
export default function FinalStep({ project, update, onBackToEdit, onClose }) {
  const [error, setError] = useState(null);
  const design = currentDesign(project);

  async function share() {
    setError(null);
    const src = await blobURL(design.imageKey);
    const text = t('final.shareText', {
      room: project.projectName,
      cost: money(project.totalEstimatedCost?.amount ?? 0),
    });

    try {
      const blob = await (await fetch(src)).blob();
      const file = new File([blob], `${project.projectName || 'design'}.jpg`, { type: blob.type });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return;
      }
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
      downloadImage(src, project.projectName);
    } catch (err) {
      if (err?.name !== 'AbortError') setError(t('final.shareFailed'));
    }
  }

  async function save() {
    const src = await blobURL(design.imageKey);
    downloadImage(src, project.projectName);
  }

  return (
    <>
      <div className="screen screen--wizard">
        <ScreenHeader title={t('final.congrats')} subtitle={project.projectName} />

        <DesignSummary design={design} project={project} />

        {/* ملاحظات المستخدم */}
        <div className="card card--pad mt-5">
          <label className="label">{t('final.notesTitle')}</label>
          <textarea
            className="field"
            rows={3}
            value={project.userNotes}
            onChange={(e) => update({ userNotes: e.target.value })}
          />
        </div>

        {error && (
          <div className="mt-4">
            <Notice tone="warn">{error}</Notice>
          </div>
        )}

        <div className="row mt-5" style={{ gap: 'var(--s-3)' }}>
          <Button variant="secondary" block pair onClick={share}>
            <Icon name="share" size={18} />
            {t('final.share')}
          </Button>
          <Button variant="secondary" block pair onClick={save}>
            {t('final.saveImage')}
          </Button>
        </div>

        <div className="mt-4 center">
          <Button variant="ghost" onClick={onBackToEdit}>
            {t('final.backToEdit')}
          </Button>
        </div>
      </div>

      <ActionBar>
        <Button block onClick={onClose}>
          {t('common.done')}
        </Button>
      </ActionBar>
    </>
  );
}

function downloadImage(src, name) {
  const a = document.createElement('a');
  a.href = src;
  a.download = `${name || 'design'}.jpg`;
  a.click();
}
