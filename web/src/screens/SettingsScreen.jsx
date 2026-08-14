import { useEffect, useState } from 'react';
import { Button, Notice } from '../components/ui.jsx';
import { storage } from '../lib/storage/index.js';
import { ai } from '../lib/ai/index.js';
import { bytes } from '../lib/format.js';
import { brand } from '../theme/brand.js';
import { t } from '../i18n/index.js';

export default function SettingsScreen({ projects, onClearAll }) {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    storage.usage().then(setUsage).catch(() => {});
  }, [projects]);

  return (
    <div className="screen">
      <h1 className="title" style={{ marginBottom: 'var(--s-5)' }}>
        {t('settings.title')}
      </h1>

      <Section title={t('settings.aiSection')}>
        <Row label={t('settings.provider')} value={ai.isMock ? t('settings.providerMock') : t('settings.providerFal')} />
        <div className="mt-4">
          <Notice>{t('settings.providerHint')}</Notice>
        </div>
      </Section>

      <Section title={t('settings.dataSection')}>
        <Row label={t('settings.projectCount')} value={String(projects.length)} />
        <Row label={t('settings.storageUsed')} value={usage ? bytes(usage.usage) : '—'} />
        <div className="mt-4">
          <Button
            variant="secondary"
            block
            disabled={projects.length === 0}
            onClick={() => {
              if (window.confirm(t('settings.clearConfirm'))) onClearAll();
            }}
          >
            {t('settings.clearAll')}
          </Button>
        </div>
      </Section>

      <Section title={t('settings.aboutSection')}>
        <Row label={brand.fullName} value="" />
        <Row label={t('settings.version')} value="0.1.0" />
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 'var(--s-6)' }}>
      <h2 className="small" style={{ color: 'var(--c-text-faint)', marginBottom: 'var(--s-2)' }}>
        {title}
      </h2>
      <div className="card card--pad">{children}</div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="row-between" style={{ padding: 'var(--s-2) 0' }}>
      <span className="body soft">{label}</span>
      <span className="body num" style={{ fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}
