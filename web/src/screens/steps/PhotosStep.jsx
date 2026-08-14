import { useRef, useState } from 'react';
import { ActionBar, Button, Notice, ScreenHeader, StoredImage } from '../../components/ui.jsx';
import Icon from '../../components/Icon.jsx';
import { storeImage, storage } from '../../lib/storage/index.js';
import { uid } from '../../lib/models/project.js';
import { t } from '../../i18n/index.js';

/** البندان ٨ و٩ — رفع الصور والمخطط */
export default function PhotosStep({ project, update, updateWith, onNext }) {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const planRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function addFiles(files) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const stored = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        stored.push(await storeImage(file));
      }
      updateWith((p) => ({
        uploadedImages: [...p.uploadedImages, ...stored].map((img, i) => ({ ...img, order: i })),
      }));
    } catch {
      setError(t('errors.generic'));
    } finally {
      setBusy(false);
    }
  }

  function removeImage(id) {
    updateWith((p) => ({
      uploadedImages: p.uploadedImages
        .filter((img) => img.id !== id)
        .map((img, i) => ({ ...img, order: i })),
    }));
  }

  /** نقل الصورة خطوة للأمام في الترتيب — أول صورة هي الغلاف */
  function moveEarlier(id) {
    updateWith((p) => {
      const list = [...p.uploadedImages];
      const i = list.findIndex((img) => img.id === id);
      if (i <= 0) return {};
      [list[i - 1], list[i]] = [list[i], list[i - 1]];
      return { uploadedImages: list.map((img, idx) => ({ ...img, order: idx })) };
    });
  }

  async function addFloorPlan(file) {
    if (!file) return;
    const isPDF = file.type === 'application/pdf';
    const key = uid('plan');
    await storage.putBlob(key, file);
    update({
      floorPlan: {
        id: key,
        blobKey: key,
        type: isPDF ? 'pdf' : 'image',
        addedAt: new Date().toISOString(),
      },
    });
  }

  return (
    <>
      <div className="screen screen--wizard">
        <ScreenHeader title={t('photos.title')} subtitle={t('photos.subtitle')} />

        {/* أزرار الإضافة */}
        <div className="row" style={{ gap: 'var(--s-3)' }}>
          <Button variant="secondary" block onClick={() => cameraRef.current.click()}>
            <Icon name="camera" size={19} />
            {t('photos.camera')}
          </Button>
          <Button variant="secondary" block onClick={() => galleryRef.current.click()}>
            <Icon name="image" size={19} />
            {t('photos.gallery')}
          </Button>
        </div>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => addFiles([...e.target.files])}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => addFiles([...e.target.files])}
        />

        {error && (
          <div className="mt-4">
            <Notice tone="warn">{error}</Notice>
          </div>
        )}

        {/* الصور المرفوعة */}
        {project.uploadedImages.length > 0 && (
          <div className="mt-5">
            <div className="grid-3">
              {project.uploadedImages.map((img, i) => (
                <div key={img.id} className="thumb-wrap">
                  <StoredImage imageKey={img.thumbnailKey} alt="" />
                  <button
                    className="thumb-wrap__x"
                    aria-label={t('common.delete')}
                    onClick={() => removeImage(img.id)}
                  >
                    <Icon name="close" size={13} strokeWidth={2.4} />
                  </button>
                  {i > 0 && (
                    <button
                      className="badge"
                      style={{ position: 'absolute', bottom: 4, insetInlineStart: 4 }}
                      onClick={() => moveEarlier(img.id)}
                      aria-label={t('common.back')}
                    >
                      <Icon name="back" size={12} />
                    </button>
                  )}
                  {i === 0 && (
                    <span
                      className="badge badge--accent"
                      style={{ position: 'absolute', bottom: 4, insetInlineStart: 4 }}
                    >
                      ★
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="tiny faint" style={{ marginTop: 'var(--s-2)' }}>
              {t('photos.reorderHint')}
            </p>
          </div>
        )}

        {busy && (
          <div className="mt-4">
            <Notice>…</Notice>
          </div>
        )}

        {/* النصائح */}
        <div className="card card--pad mt-5">
          <div className="heading" style={{ marginBottom: 'var(--s-2)' }}>
            {t('photos.tipsTitle')}
          </div>
          <ul className="small soft" style={{ margin: 0, paddingInlineStart: 'var(--s-4)', lineHeight: 2 }}>
            {t('photos.tips').map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>

        {/* المخطط — البند ٩ */}
        <div className="card card--pad mt-4">
          <div className="heading">{t('photos.floorPlanTitle')}</div>
          <p className="small soft" style={{ marginTop: 4 }}>
            {t('photos.floorPlanBody')}
          </p>
          {project.floorPlan ? (
            <div className="row-between mt-4">
              <span className="row small">
                <Icon name="file" size={17} />
                {t('photos.floorPlanAdded')}
              </span>
              <Button size="sm" variant="ghost" onClick={() => update({ floorPlan: null })}>
                {t('photos.removeFloorPlan')}
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <Button size="sm" variant="secondary" onClick={() => planRef.current.click()}>
                {t('photos.addFloorPlan')}
              </Button>
            </div>
          )}
          <input
            ref={planRef}
            type="file"
            accept="image/*,application/pdf"
            hidden
            onChange={(e) => addFloorPlan(e.target.files[0])}
          />
        </div>
      </div>

      <ActionBar>
        {project.uploadedImages.length === 0 && (
          <p className="small faint center" style={{ marginBottom: 'var(--s-2)' }}>
            {t('photos.needOne')}
          </p>
        )}
        <Button block disabled={project.uploadedImages.length === 0 || busy} onClick={onNext}>
          {t('common.next')}
        </Button>
      </ActionBar>
    </>
  );
}
