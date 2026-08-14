import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { blobURL } from '../lib/storage/index.js';
import { t } from '../i18n/index.js';

/* ── الأزرار ─────────────────────────────────────────────── */

export function Button({ variant = 'primary', block, size, pair, children, ...rest }) {
  const cls = [
    'btn',
    `btn--${variant}`,
    block && 'btn--block',
    size === 'sm' && 'btn--sm',
    pair && 'btn--pair',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/** شريط الإجراء الثابت أسفل شاشات المعالج */
export function ActionBar({ children }) {
  return <div className="action-bar">{children}</div>;
}

/* ── العرض ───────────────────────────────────────────────── */

export function Badge({ tone, children }) {
  return <span className={`badge${tone ? ` badge--${tone}` : ''}`}>{children}</span>;
}

export function Notice({ tone, children }) {
  return <div className={`notice${tone ? ` notice--${tone}` : ''}`}>{children}</div>;
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="empty stack">
      <div className="heading" style={{ color: 'var(--c-text-soft)' }}>
        {title}
      </div>
      {body && <p className="small">{body}</p>}
      {action}
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="row-between mt-6" style={{ marginBottom: 'var(--s-3)' }}>
      <h2 className="heading">{children}</h2>
      {action}
    </div>
  );
}

/* ── الصور المخزّنة محلياً ───────────────────────────────── */

/** يحوّل مفتاح Blob إلى عنوان قابل للعرض، ويتعامل مع الغياب بهدوء */
export function StoredImage({ imageKey, className = 'thumb', alt = '', onClick }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let alive = true;
    blobURL(imageKey).then((url) => alive && setSrc(url));
    return () => {
      alive = false;
    };
  }, [imageKey]);

  if (!src) return <div className={`${className} skeleton`} />;
  return <img src={src} className={className} alt={alt} onClick={onClick} loading="lazy" />;
}

/* ── الطبقة المنبثقة ─────────────────────────────────────── */

export function Sheet({ onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__grip" />
        {children}
      </div>
    </div>
  );
}

/* ── عارض الصورة بملء الشاشة — البند ١٣ ─────────────────── */

export function Lightbox({ src, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="lightbox" onClick={onClose} role="presentation">
      <img src={src} alt="" />
      <button className="lightbox__close" aria-label={t('common.close')}>
        <Icon name="close" size={20} />
      </button>
    </div>
  );
}

/* ── رأس الشاشة ──────────────────────────────────────────── */

export function ScreenHeader({ title, subtitle }) {
  return (
    <header className="stack" style={{ marginBottom: 'var(--s-5)' }}>
      <h1 className="title">{title}</h1>
      {subtitle && <p className="body soft">{subtitle}</p>}
    </header>
  );
}
