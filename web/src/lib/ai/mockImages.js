/**
 * مولّد صور توضيحية للمزوّد التجريبي.
 * يرسم غرفة بمنظور نقطة واحدة بألوان الملف الذوقي، لتجربة الرحلة بصرياً
 * بدون أي استدعاء خارجي أو تكلفة.
 *
 * ⚠️ يُحذف بالكامل عند تفعيل المزوّد الحقيقي — لا يُستخدم في الإنتاج.
 */

export const PALETTES = {
  warm_neutral: ['#EFE7DA', '#D8C6AC', '#B99C77', '#6E5B44', '#2E2A24'],
  soft_grey: ['#F1F0ED', '#D9D8D3', '#B4B3AD', '#6F6E69', '#2B2B29'],
  earthy: ['#EDE3D6', '#CBAF92', '#A8794F', '#5C4630', '#2A2119'],
  cool_calm: ['#EEF0F0', '#D2D9D8', '#A6B4B2', '#5F6E6C', '#252C2B'],
  luxe_dark: ['#E6E0D6', '#C0A98A', '#8A6B45', '#3B3126', '#1B1712'],
  fresh_green: ['#EFF0E8', '#D4D8C2', '#A5AE8B', '#5F6B4C', '#242A1D'],
};

export const PALETTE_KEYS = Object.keys(PALETTES);

/** مولّد أرقام شبه عشوائي ثابت — نفس البذرة تعطي نفس الصورة دائماً */
function rng(seed) {
  let s = 0;
  for (let i = 0; i < String(seed).length; i++) s = (s * 31 + String(seed).charCodeAt(i)) | 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/**
 * @param {object} opts
 * @param {string} opts.seed        بذرة ثابتة (معرّف التصور أو النسخة)
 * @param {string} opts.palette     مفتاح من PALETTES
 * @param {number} opts.warmth      0..1 يميل للدفء
 * @param {number} opts.luxury      0..1 يزيد التفاصيل الفاخرة
 * @param {string} opts.roomType    يغيّر الأثاث المرسوم
 */
export function roomImage({
  seed = 'x',
  palette = 'warm_neutral',
  luxury = 0.5,
  roomType = 'living_room',
} = {}) {
  const r = rng(seed);
  const [c0, c1, c2, c3, c4] = PALETTES[palette] ?? PALETTES.warm_neutral;
  const W = 1200;
  const H = 900;

  // نقطة التلاشي تتحرك قليلاً حسب البذرة → زوايا مختلفة
  const vx = W * (0.42 + r() * 0.16);
  const horizon = H * 0.54;

  const wallL = W * 0.16;
  const wallR = W * 0.84;
  const wallT = H * 0.16;
  const wallB = H * 0.72;

  const hasChandelier = luxury > 0.45;
  const rugTone = r() > 0.5 ? c2 : c1;

  const furniture =
    roomType === 'master_bedroom' || roomType === 'kids_bedroom'
      ? bed(vx, wallB, c2, c0, c3)
      : roomType === 'dining_room'
        ? diningSet(vx, wallB, c3, c1)
        : sofaSet(vx, wallB, c2, c0, c3, r);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${mix(c2, c3, 0.25)}"/><stop offset="1" stop-color="${c1}"/>
    </linearGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${mix(c0, c1, 0.5)}"/>
    </linearGradient>
    <linearGradient id="light" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.42" r="0.7">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.12"/>
      <stop offset="0.7" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="1" stop-color="${c4}" stop-opacity="0.16"/>
    </radialGradient>
  </defs>

  <!-- الأرضية والجدران الجانبية بالمنظور -->
  <rect width="${W}" height="${H}" fill="url(#floor)"/>
  <polygon points="0,0 ${wallL},${wallT} ${wallL},${wallB} 0,${H}" fill="${mix(c0, c3, 0.3)}"/>
  <polygon points="${W},0 ${wallR},${wallT} ${wallR},${wallB} ${W},${H}" fill="${mix(c0, c3, 0.42)}"/>
  <polygon points="0,0 ${wallL},${wallT} ${wallR},${wallT} ${W},0" fill="${mix(c0, '#FFFFFF', 0.4)}"/>

  <!-- الجدار الخلفي -->
  <rect x="${wallL}" y="${wallT}" width="${wallR - wallL}" height="${wallB - wallT}" fill="url(#wall)"/>

  <!-- النافذة — مصدر الإضاءة -->
  <g>
    <rect x="${vx - 190}" y="${wallT + 42}" width="230" height="215" rx="6" fill="${mix('#FFFFFF', c0, 0.25)}"/>
    <rect x="${vx - 190}" y="${wallT + 42}" width="230" height="215" rx="6" fill="none" stroke="${c3}" stroke-width="5" stroke-opacity="0.5"/>
    <line x1="${vx - 75}" y1="${wallT + 42}" x2="${vx - 75}" y2="${wallT + 257}" stroke="${c3}" stroke-width="4" stroke-opacity="0.4"/>
    <polygon points="${vx - 190},${wallT + 257} ${vx + 40},${wallT + 257} ${vx + 150},${wallB + 130} ${vx - 300},${wallB + 130}" fill="url(#light)"/>
  </g>

  <!-- ستارة -->
  <rect x="${vx + 44}" y="${wallT + 28}" width="46" height="${wallB - wallT - 28}" rx="8" fill="${mix(c1, '#FFFFFF', 0.3)}" opacity="0.92"/>

  ${hasChandelier ? chandelier(vx + 120, wallT + 10, c3, c2) : pendant(vx + 120, wallT + 10, c3)}

  <!-- السجادة -->
  <ellipse cx="${vx}" cy="${wallB + 128}" rx="330" ry="96" fill="${rugTone}" opacity="0.85"/>
  <ellipse cx="${vx}" cy="${wallB + 128}" rx="278" ry="74" fill="none" stroke="${mix(rugTone, c4, 0.3)}" stroke-width="3" opacity="0.5"/>

  ${furniture}

  <!-- نبات -->
  <g transform="translate(${wallR - 96} ${wallB - 6})">
    <rect x="-26" y="0" width="52" height="52" rx="8" fill="${mix(c3, c4, 0.4)}"/>
    <path d="M0 0 C -18 -46 -46 -58 -52 -84 C -20 -74 -6 -46 0 -16 C 8 -50 26 -76 56 -86 C 44 -54 20 -38 0 0 Z" fill="${mix('#7C8A63', c3, 0.25)}"/>
  </g>

  <!-- لوحة على الجدار -->
  <rect x="${wallL + 60}" y="${wallT + 66}" width="118" height="152" rx="4" fill="${mix(c1, '#FFFFFF', 0.42)}" stroke="${c3}" stroke-width="4" stroke-opacity="0.42"/>

  <!-- غلاف الإضاءة العام -->
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, ' '))}`;
}

function sofaSet(vx, baseY, body, cushion, shadow, r) {
  const y = baseY + 40;
  const w = 420;
  return `<g>
    <ellipse cx="${vx}" cy="${y + 132}" rx="${w / 2}" ry="26" fill="${shadow}" opacity="0.2"/>
    <rect x="${vx - w / 2}" y="${y}" width="${w}" height="88" rx="26" fill="${body}"/>
    <rect x="${vx - w / 2 + 14}" y="${y - 54}" width="${w - 28}" height="66" rx="20" fill="${mix(body, '#FFFFFF', 0.16)}"/>
    <rect x="${vx - w / 2 + 34}" y="${y - 40}" width="86" height="58" rx="16" fill="${mix(cushion, body, 0.4)}"/>
    <rect x="${vx + w / 2 - 120}" y="${y - 40}" width="86" height="58" rx="16" fill="${mix(cushion, body, 0.55)}"/>
    <rect x="${vx - 92}" y="${y + 96}" width="184" height="16" rx="8" fill="${mix(shadow, '#FFFFFF', 0.5)}"/>
    ${r() > 0.4 ? `<circle cx="${vx + 268}" cy="${y + 46}" r="42" fill="${mix(cushion, shadow, 0.3)}"/>` : ''}
  </g>`;
}

function bed(vx, baseY, body, linen, shadow) {
  const y = baseY + 30;
  const w = 460;
  return `<g>
    <ellipse cx="${vx}" cy="${y + 158}" rx="${w / 2}" ry="30" fill="${shadow}" opacity="0.2"/>
    <rect x="${vx - w / 2 - 10}" y="${y - 118}" width="${w + 20}" height="126" rx="18" fill="${body}"/>
    <rect x="${vx - w / 2}" y="${y}" width="${w}" height="126" rx="14" fill="${mix(linen, '#FFFFFF', 0.5)}"/>
    <rect x="${vx - w / 2}" y="${y + 74}" width="${w}" height="52" rx="12" fill="${mix(body, linen, 0.5)}"/>
    <rect x="${vx - 168}" y="${y - 34}" width="140" height="52" rx="14" fill="#FFFFFF" opacity="0.9"/>
    <rect x="${vx + 28}" y="${y - 34}" width="140" height="52" rx="14" fill="#FFFFFF" opacity="0.9"/>
  </g>`;
}

function diningSet(vx, baseY, wood, chair) {
  const y = baseY + 24;
  return `<g>
    <ellipse cx="${vx}" cy="${y + 150}" rx="270" ry="26" fill="${wood}" opacity="0.18"/>
    <ellipse cx="${vx}" cy="${y + 20}" rx="240" ry="62" fill="${wood}"/>
    <ellipse cx="${vx}" cy="${y + 8}" rx="240" ry="62" fill="${mix(wood, '#FFFFFF', 0.22)}"/>
    <rect x="${vx - 16}" y="${y + 30}" width="32" height="104" fill="${wood}"/>
    <rect x="${vx - 96}" y="${y + 126}" width="192" height="14" rx="7" fill="${wood}"/>
    <rect x="${vx - 216}" y="${y - 76}" width="76" height="132" rx="14" fill="${chair}"/>
    <rect x="${vx + 140}" y="${y - 76}" width="76" height="132" rx="14" fill="${chair}"/>
  </g>`;
}

function chandelier(x, y, metal, glass) {
  return `<g>
    <line x1="${x}" y1="${y}" x2="${x}" y2="${y + 78}" stroke="${metal}" stroke-width="4"/>
    <ellipse cx="${x}" cy="${y + 96}" rx="76" ry="20" fill="none" stroke="${metal}" stroke-width="5"/>
    <ellipse cx="${x}" cy="${y + 130}" rx="52" ry="14" fill="none" stroke="${metal}" stroke-width="4"/>
    ${[-62, -30, 0, 30, 62]
      .map(
        (dx) =>
          `<circle cx="${x + dx}" cy="${y + 110 + Math.abs(dx) * 0.18}" r="9" fill="${mix(glass, '#FFFFFF', 0.6)}"/>`,
      )
      .join('')}
    <ellipse cx="${x}" cy="${y + 118}" rx="104" ry="52" fill="#FFF6E2" opacity="0.2"/>
  </g>`;
}

function pendant(x, y, metal) {
  return `<g>
    <line x1="${x}" y1="${y}" x2="${x}" y2="${y + 96}" stroke="${metal}" stroke-width="3"/>
    <path d="M${x - 44} ${y + 140} L${x + 44} ${y + 140} L${x + 26} ${y + 96} L${x - 26} ${y + 96} Z" fill="${metal}"/>
    <ellipse cx="${x}" cy="${y + 150}" rx="72" ry="34" fill="#FFF6E2" opacity="0.22"/>
  </g>`;
}

/** مزج لونين hex بنسبة */
function mix(a, b, ratio) {
  const pa = hex(a);
  const pb = hex(b);
  const out = pa.map((v, i) => Math.round(v + (pb[i] - v) * ratio));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function hex(h) {
  const s = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
}
