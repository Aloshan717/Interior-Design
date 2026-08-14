/**
 * صياغة التعليمات — أهم ملف في المرحلة الثانية.
 *
 * جودة التصميم النهائي تعتمد على هذه النصوص أكثر من أي كود آخر.
 * القاعدة الحاكمة: نحن **نعيد تأثيث غرفة قائمة**، لا نرسم غرفة جديدة.
 * لذلك كل تعليمة تبدأ بما يجب أن يبقى، قبل ما يجب أن يتغيّر.
 */

/** ما لا يجوز للنموذج المساس به — يتكرر في كل تعليمة توليد */
const PRESERVE = [
  'Keep the exact same room: identical camera angle, perspective and framing',
  'Preserve the existing architecture precisely: wall positions, ceiling height, window openings, door openings and their exact locations',
  'Do not add, remove, move or resize any window or door',
  'Do not change the room proportions or the viewpoint',
].join('. ');

const QUALITY =
  'Photorealistic interior photograph, natural realistic lighting, physically accurate shadows and reflections, ' +
  'architectural photography, sharp focus, high detail, no text, no watermark, no people';

const ROOM_LABEL = {
  master_bedroom: 'master bedroom',
  kids_bedroom: "child's bedroom",
  living_room: 'living room',
  majlis: 'formal Arabic majlis sitting room',
  dining_room: 'dining room',
  office: 'home office',
  entrance: 'entrance hallway',
  other: 'interior room',
};

/** يترجم مستوى الميزانية إلى لغة يفهمها نموذج الصور — لا يفهم «ريال» */
function budgetTone(budget) {
  if (!budget?.amount) return 'well balanced, tasteful furnishing';
  if (budget.amount <= 12000) return 'simple, affordable and practical furnishing';
  if (budget.amount <= 30000) return 'mid-range quality furnishing with tasteful details';
  return 'high-end luxurious furnishing with premium materials and refined details';
}

/**
 * قيود المستخدم.
 * التفاصيل المكتوبة بالعربية تصل مترجمة في `constraintsEn` من دالة التحليل —
 * نموذج الصور لا يفهم العربية، فتمريرها كما هي يضيّعها.
 */
function constraintsText({ keep, constraintsEn }) {
  const parts = [];
  if (keep?.keepExisting === 'keepAll') {
    parts.push('Keep the existing furniture in place and restyle around it');
  } else if (keep?.keepExisting === 'keepSome') {
    parts.push('Keep some of the existing furniture and blend the new pieces with it');
  } else {
    parts.push('Replace the existing furniture with a new coherent set');
  }
  if (constraintsEn) parts.push(constraintsEn);
  return parts.join('. ');
}

/* ── ١ · التصورات الأولية على غرفة المستخدم ─────────────── */

export const DIRECTIONS = [
  {
    tag: 'warm_contemporary',
    titleAr: 'عصري دافئ',
    en: 'warm contemporary style, warm neutral palette, oak and linen textures, soft diffused lighting, cozy but uncluttered',
  },
  {
    tag: 'modern_luxury',
    titleAr: 'فخامة عصرية',
    en: 'modern luxury style, rich dark wood and marble, brushed brass accents, velvet upholstery, dramatic accent lighting, statement chandelier',
  },
  {
    tag: 'minimal_warm',
    titleAr: 'بساطة دافئة',
    en: 'warm minimalist style, off-white and beige palette, very few carefully chosen pieces, generous empty space, matte natural materials',
  },
  {
    tag: 'hotel_inspired',
    titleAr: 'مستوحى من الفنادق',
    en: 'five star hotel suite style, layered lighting, upholstered headboard or lounge seating, symmetrical arrangement, crisp tailored textiles',
  },
  {
    tag: 'natural_calm',
    titleAr: 'طبيعي هادئ',
    en: 'calm natural style, light wood, woven rattan, stone and clay textures, abundant daylight, indoor plants',
  },
  {
    tag: 'bold_statement',
    titleAr: 'جريء ومميز',
    en: 'bold characterful style, deep saturated accent colour on one surface, strong contrast, sculptural furniture, striking artwork',
  },
];

export function conceptPrompt({ direction, roomType, styleProfile, budget }) {
  return [
    `Redesign and refurnish this ${ROOM_LABEL[roomType] ?? ROOM_LABEL.other}`,
    PRESERVE,
    `New interior design direction: ${direction.en}`,
    styleProfile?.promptFragment ? `Owner taste: ${styleProfile.promptFragment}` : '',
    budgetTone(budget),
    QUALITY,
  ]
    .filter(Boolean)
    .join('. ');
}

/* ── ٢ · التصميم الواقعي النهائي ────────────────────────── */

export function designPrompt({ direction, roomType, styleProfile, spaceAnalysis, constraints }) {
  const observed = spaceAnalysis?.features
    ? `Observed in the room: ${describeFeatures(spaceAnalysis.features)}`
    : '';

  return [
    `Fully furnish and finish this ${ROOM_LABEL[roomType] ?? ROOM_LABEL.other} as a complete interior design`,
    PRESERVE,
    observed,
    `Design direction: ${direction?.en ?? 'warm contemporary interior'}`,
    styleProfile?.promptFragment ? `Owner taste: ${styleProfile.promptFragment}` : '',
    constraintsText({ ...(constraints ?? {}), constraintsEn: spaceAnalysis?.constraintsEn }),
    'Include appropriate furniture, ceiling light fixture, floor covering, window treatment and wall decor, all coherent with each other',
    budgetTone(constraints?.budget),
    QUALITY,
  ]
    .filter(Boolean)
    .join('. ');
}

function describeFeatures(f) {
  const bits = [];
  if (f.windows) bits.push(`${f.windows} window(s)`);
  if (f.doors) bits.push(`${f.doors} door(s)`);
  if (f.flooring && f.flooring !== 'unknown') bits.push(`${f.flooring} flooring`);
  if (f.naturalLight) bits.push(`${f.naturalLight} natural light`);
  return bits.join(', ') || 'standard room features';
}

/* ── ٣ · التعديل الموضعي ────────────────────────────────── */

/**
 * التعديل يجب أن يمس العنصر المطلوب وحده.
 * لذلك التعليمة تذكر التغيير أولاً ثم تؤكد على تثبيت كل ما عداه.
 */
const TARGET_EN = {
  lighting: 'the ceiling light fixture / chandelier',
  sofa: 'the sofa',
  bed: 'the bed',
  rug: 'the rug',
  curtains: 'the curtains',
  table: 'the table',
  walls: 'the wall colour',
  floor: 'the flooring',
  overall: 'the overall styling',
};

const CHANGE_EN = {
  replace: 'replace it with a different one that suits the room',
  remove: 'remove it completely and leave the space naturally empty',
  bigger: 'make it noticeably larger in scale',
  smaller: 'make it noticeably smaller in scale',
  lighter: 'make it a lighter, brighter shade',
  darker: 'make it a deeper, darker shade',
  more_luxury: 'make it more luxurious and refined, with richer materials',
  simpler: 'make it simpler and calmer, with less visual noise',
};

export function editPrompt({ intent, rawText }) {
  const target = TARGET_EN[intent.target] ?? TARGET_EN.overall;
  const change = CHANGE_EN[intent.change] ?? CHANGE_EN.replace;

  const scope =
    intent.target === 'overall'
      ? 'Apply this change across the room while keeping the same furniture layout'
      : `Change ONLY ${target}. Every other element must stay pixel-identical: same furniture, same positions, same colours, same lighting, same camera angle`;

  return [
    `Edit this interior photograph. ${scope}`,
    `Requested change: ${change}`,
    rawText ? `Original request (Arabic): "${rawText}"` : '',
    PRESERVE,
    QUALITY,
  ]
    .filter(Boolean)
    .join('. ');
}

/* ── ٤ · صور الذوق المرجعية ─────────────────────────────── */

/**
 * ١٢ صورة تغطي أطراف محاور الذوق الأربعة.
 * تُولَّد مرة واحدة وتُخزّن على الجهاز — فلا تتكرر التكلفة أبداً.
 */
export const STYLE_REFERENCE_PROMPTS = [
  { id: 'ref_01', warmth: 0.9,  luxury: 0.35, contrast: 0.2,  density: 0.35, en: 'warm minimalist bedroom, oak wood, cream linen bedding, soft morning light, uncluttered' },
  { id: 'ref_02', warmth: 0.75, luxury: 0.95, contrast: 0.8,  density: 0.7,  en: 'opulent living room, dark marble, brass details, deep velvet sofa, crystal chandelier, dramatic lighting' },
  { id: 'ref_03', warmth: 0.2,  luxury: 0.4,  contrast: 0.25, density: 0.2,  en: 'cool scandinavian living room, pale grey walls, light concrete floor, simple linen sofa, bright daylight' },
  { id: 'ref_04', warmth: 0.85, luxury: 0.55, contrast: 0.5,  density: 0.65, en: 'earthy terracotta living room, clay plaster walls, dark walnut furniture, wool textiles, warm lamplight' },
  { id: 'ref_05', warmth: 0.3,  luxury: 0.6,  contrast: 0.3,  density: 0.3,  en: 'serene stone and glass living room, travertine surfaces, muted grey palette, floor to ceiling windows' },
  { id: 'ref_06', warmth: 0.55, luxury: 0.3,  contrast: 0.35, density: 0.55, en: 'relaxed bohemian living room, rattan furniture, many indoor plants, natural fibre rug, daylight' },
  { id: 'ref_07', warmth: 0.8,  luxury: 0.75, contrast: 0.45, density: 0.5,  en: 'refined warm bedroom, walnut panelling, leather bench, brushed brass sconces, layered warm lighting' },
  { id: 'ref_08', warmth: 0.35, luxury: 0.85, contrast: 0.7,  density: 0.4,  en: 'sleek modern dining room, grey marble table, polished steel, monochrome palette, sculptural pendant light' },
  { id: 'ref_09', warmth: 0.95, luxury: 0.25, contrast: 0.3,  density: 0.75, en: 'cosy rustic family living room, exposed wood beams, layered rugs, worn cotton sofa, warm evening light' },
  { id: 'ref_10', warmth: 0.6,  luxury: 0.8,  contrast: 0.9,  density: 0.35, en: 'dramatic dark living room, matte black walls, gold accents, single bold artwork, focused spot lighting' },
  { id: 'ref_11', warmth: 0.25, luxury: 0.45, contrast: 0.15, density: 0.15, en: 'airy all white bedroom, matte white walls, pale oak floor, minimal furniture, soft diffused daylight' },
  { id: 'ref_12', warmth: 0.7,  luxury: 0.65, contrast: 0.55, density: 0.6,  en: 'modern organic dining room, olive green walls, oiled wood table, handmade ceramics, warm pendant lights' },
];

export const styleReferencePrompt = (ref) =>
  `Interior design photograph of a ${ref.en}. ${QUALITY}`;
