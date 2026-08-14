import { useState } from 'react';
import { Badge, Button, Sheet } from './ui.jsx';
import { productImage } from '../lib/products/productImage.js';
import { productById } from '../lib/products/index.js';
import { moneyWithCurrency } from '../lib/format.js';
import { t } from '../i18n/index.js';

/**
 * بطاقة المنتج — البندان ١٦ و١٧.
 *
 * الصدق أولاً:
 *   · «منتج مشابه» دائماً — لأن الصورة لم تُبنَ من منتج حقيقي
 *   · بيانات تجريبية → شارة واضحة وزر شراء معطّل
 *   · لا سعر موثوق → «السعر غير متوفر»، لا رقم مخترع
 */
export default function ProductCard({ product, onSwap }) {
  const [showAlts, setShowAlts] = useState(false);
  const alternatives = (product.alternatives ?? []).map(productById).filter(Boolean);
  const isMock = product.source === 'mock';

  return (
    <>
      <div className="card" style={{ display: 'flex', gap: 'var(--s-3)', padding: 'var(--s-3)' }}>
        <img
          src={product.image ?? productImage(product)}
          alt={product.name}
          style={{ width: 86, height: 66, objectFit: 'cover', borderRadius: 'var(--r-sm)', flexShrink: 0 }}
        />

        <div className="grow" style={{ minWidth: 0 }}>
          <div className="small faint">{product.itemLabelAr}</div>
          <div className="body" style={{ fontWeight: 600, lineHeight: 1.4 }}>
            {product.name}
          </div>

          <div className="row" style={{ gap: 'var(--s-2)', marginTop: 4, flexWrap: 'wrap' }}>
            <span className="body num" style={{ fontWeight: 700 }}>
              {moneyWithCurrency(product.price)}
            </span>
            <Badge>{t('products.similar')}</Badge>
            {isMock && <Badge tone="warn">{t('products.mockBadge')}</Badge>}
          </div>

          <div className="row" style={{ gap: 'var(--s-2)', marginTop: 'var(--s-2)' }}>
            <Button
              size="sm"
              variant="secondary"
              disabled={!product.productURL}
              onClick={() => product.productURL && window.open(product.productURL, '_blank')}
            >
              {product.productURL ? t('products.view') : t('products.unavailableLink')}
            </Button>
            {alternatives.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => setShowAlts(true)}>
                {t('products.alternatives')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {showAlts && (
        <Sheet onClose={() => setShowAlts(false)}>
          <h2 className="title" style={{ marginBottom: 'var(--s-4)' }}>
            {t('products.alternatives')}
          </h2>
          <div className="stack">
            {alternatives.map((alt) => (
              <button
                key={alt.productId}
                className="card card--tap"
                style={{ display: 'flex', gap: 'var(--s-3)', padding: 'var(--s-3)', alignItems: 'center' }}
                onClick={() => {
                  onSwap?.(product.instanceId, alt.productId);
                  setShowAlts(false);
                }}
              >
                <img
                  src={productImage(alt)}
                  alt=""
                  style={{ width: 62, height: 48, objectFit: 'cover', borderRadius: 'var(--r-sm)' }}
                />
                <div className="grow" style={{ textAlign: 'start' }}>
                  <div className="body" style={{ fontWeight: 600 }}>
                    {alt.name}
                  </div>
                  <div className="small num soft">{moneyWithCurrency(alt.price)}</div>
                </div>
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </>
  );
}
