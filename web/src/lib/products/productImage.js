/**
 * صورة المنتج للكتالوج التجريبي — رسم بسيط من ألوان المنتج.
 * تُحذف عند ربط مصدر منتجات حقيقي (يأتي معه رابط صورة فعلي).
 */
const SHAPES = {
  furniture: (a, b) =>
    `<rect x="18" y="52" width="124" height="42" rx="14" fill="${a}"/>
     <rect x="26" y="30" width="108" height="34" rx="12" fill="${b}"/>
     <rect x="34" y="94" width="14" height="14" rx="4" fill="${b}"/>
     <rect x="112" y="94" width="14" height="14" rx="4" fill="${b}"/>`,
  lighting: (a, b) =>
    `<line x1="80" y1="14" x2="80" y2="48" stroke="${b}" stroke-width="4"/>
     <path d="M46 92 L114 92 L100 48 L60 48 Z" fill="${a}"/>
     <ellipse cx="80" cy="100" rx="46" ry="12" fill="${b}" opacity="0.28"/>`,
  table: (a, b) =>
    `<ellipse cx="80" cy="50" rx="56" ry="16" fill="${a}"/>
     <rect x="74" y="58" width="12" height="42" fill="${b}"/>
     <rect x="50" y="98" width="60" height="8" rx="4" fill="${b}"/>`,
  rug: (a, b) =>
    `<ellipse cx="80" cy="66" rx="62" ry="34" fill="${a}"/>
     <ellipse cx="80" cy="66" rx="46" ry="22" fill="none" stroke="${b}" stroke-width="4"/>`,
  curtains: (a, b) =>
    `<rect x="30" y="18" width="38" height="88" rx="10" fill="${a}"/>
     <rect x="92" y="18" width="38" height="88" rx="10" fill="${b}"/>
     <rect x="22" y="12" width="116" height="7" rx="3" fill="${b}"/>`,
  decor: (a, b) =>
    `<circle cx="62" cy="62" r="28" fill="${a}"/>
     <rect x="92" y="40" width="34" height="46" rx="8" fill="${b}"/>`,
};

export function productImage(product) {
  const [a, b] = product.colors ?? ['#D8CFBC', '#8A7C63'];
  const shape = (SHAPES[product.category] ?? SHAPES.decor)(a, b);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">
    <rect width="160" height="120" fill="#F3F0E9"/>${shape}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' '))}`;
}
