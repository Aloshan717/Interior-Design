import { useEffect, useState } from 'react';
import ProductCard from './ProductCard.jsx';
import { Badge, Lightbox, Notice } from './ui.jsx';
import { blobURL } from '../lib/storage/index.js';
import { money, moneyWithCurrency } from '../lib/format.js';
import { t } from '../i18n/index.js';

/**
 * عرض التصميم — البنود ١٥ و١٦ و١٧.
 * مشترك بين شاشة التصميم وشاشة التصميم النهائي.
 */
export default function DesignSummary({ design, project, onSwapProduct, showProducts = true }) {
  const [src, setSrc] = useState(null);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (design?.imageKey) blobURL(design.imageKey).then(setSrc);
  }, [design?.imageKey]);

  if (!design) return null;

  const profile = project.generatedStyleProfile;
  const concept = project.generatedConcepts.find((c) => c.id === design.basedOnConcept);
  const total = project.totalEstimatedCost;
  const breakdown = project.costByCategory ?? {};
  const overBudget =
    project.budget?.amount && total?.amount ? total.amount > project.budget.amount : false;

  return (
    <>
      {src ? (
        <img src={src} className="hero" alt="" onClick={() => setZoom(true)} />
      ) : (
        <div className="hero skeleton" />
      )}

      <p className="tiny faint center" style={{ marginTop: 'var(--s-2)' }}>
        {t('design.disclaimer')}
      </p>

      {/* الملخّص */}
      <div className="card card--pad mt-4">
        <div className="row-between">
          <div>
            <div className="small faint">{t('design.styleLabel')}</div>
            <div className="heading">{concept?.titleAr ?? '—'}</div>
          </div>
          <div style={{ textAlign: 'end' }}>
            <div className="small faint">{t('design.costLabel')}</div>
            <div className="heading num">
              {total ? `${money(total.amount)} ${t('common.sar')}` : '—'}
            </div>
          </div>
        </div>
        {profile && (
          <p className="small soft" style={{ marginTop: 'var(--s-3)', lineHeight: 1.7 }}>
            {profile.descriptionAr}
          </p>
        )}
      </div>

      {overBudget && (
        <div className="mt-4">
          <Notice tone="warn">
            الميزانية {money(project.budget.amount)} · التقدير الحالي {money(total.amount)} —
            جرّب «أبي نفس التصميم بميزانية أقل» في شاشة التعديل.
          </Notice>
        </div>
      )}

      {showProducts && project.products?.length > 0 && (
        <>
          <h2 className="heading mt-6" style={{ marginBottom: 'var(--s-3)' }}>
            {t('design.itemsTitle')}
          </h2>

          <div className="stack">
            {project.products.map((product) => (
              <ProductCard key={product.instanceId} product={product} onSwap={onSwapProduct} />
            ))}
          </div>

          {/* تفصيل التكلفة — البند ١٧ */}
          <div className="card card--pad mt-5">
            {Object.entries(breakdown).map(([category, amount]) => (
              <div key={category} className="cost-row">
                <span className="soft">{t(`products.categories.${category}`)}</span>
                <span className="num">{moneyWithCurrency(amount)}</span>
              </div>
            ))}
            <div className="cost-row cost-row--total">
              <span>
                {t('design.costLabel')} <Badge>{t('common.estimate')}</Badge>
              </span>
              <span className="num">{total ? moneyWithCurrency(total.amount) : '—'}</span>
            </div>
          </div>

          <p className="tiny faint mt-4" style={{ lineHeight: 1.8 }}>
            {t('products.disclaimer')}
          </p>
        </>
      )}

      {zoom && src && <Lightbox src={src} onClose={() => setZoom(false)} />}
    </>
  );
}
