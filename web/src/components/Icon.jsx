/** أيقونات خطّية — خفيفة ومتناسقة مع الطابع الهادئ (البند ٢٢) */
const paths = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  settings:
    'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1v.3a2 2 0 11-4 0v-.2a1.6 1.6 0 00-2.8-1.1l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 004 15a2 2 0 01-2-2 2 2 0 012-2 1.6 1.6 0 001.1-2.7l-.1-.1a2 2 0 112.8-2.8l.1.1A1.6 1.6 0 009 4.6V4a2 2 0 114 0v.2a1.6 1.6 0 002.7 1.1l.1-.1a2 2 0 112.8 2.8l-.1.1A1.6 1.6 0 0020 11a2 2 0 010 4z',
  plus: 'M12 5v14M5 12h14',
  back: 'M9 6l6 6-6 6',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 13l4 4L19 7',
  camera:
    'M3 8.5A1.5 1.5 0 014.5 7h2L8 5h8l1.5 2h2A1.5 1.5 0 0121 8.5v9A1.5 1.5 0 0119.5 19h-15A1.5 1.5 0 013 17.5zM12 16a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
  image: 'M4 5h16v14H4zM4 15l4.5-4.5L13 15M14.5 12.5L17 10l3 3M15 9h.01',
  send: 'M4 12l16-8-6 8 6 8z',
  wand: 'M5 19l10-10M14 4l1.5 3L19 8.5 15.5 10 14 13.5 12.5 10 9 8.5 12.5 7z',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
  cart: 'M4 5h2l2 10h9l2-7H7M9 20a1 1 0 100-2 1 1 0 000 2zM17 20a1 1 0 100-2 1 1 0 000 2z',
  share: 'M12 15V3M8 7l4-4 4 4M4 13v6a1 1 0 001 1h14a1 1 0 001-1v-6',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  history: 'M3 12a9 9 0 109-9 9 9 0 00-6.4 2.7L3 8M3 4v4h4M12 7v5l3 2',
  file: 'M13 3H6v18h12V8zM13 3v5h5',
};

export default function Icon({ name, size = 22, strokeWidth = 1.7, filled, ...rest }) {
  const d = paths[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}
