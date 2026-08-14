import Icon from './Icon.jsx';
import { t } from '../i18n/index.js';

/** تنقّل بسيط — ثلاثة تبويبات فقط (البند ٣٣) */
const TABS = [
  { key: 'home', icon: 'home' },
  { key: 'projects', icon: 'grid' },
  { key: 'settings', icon: 'settings' },
];

export default function TabBar({ current, onChange }) {
  return (
    <nav className="tabbar">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className="tab"
          data-active={current === tab.key}
          onClick={() => onChange(tab.key)}
        >
          <Icon name={tab.icon} size={21} />
          <span>{t(`tabs.${tab.key}`)}</span>
        </button>
      ))}
    </nav>
  );
}
