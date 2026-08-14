/**
 * كتالوج تجريبي — البند ٣٠.
 *
 * ⚠️ التزاماً بالبند ١٧: هذه بيانات **غير حقيقية**.
 *   · `source: 'mock'` → الواجهة تعرض شارة «بيانات تجريبية»
 *   · `productURL: null` → زر الشراء معطّل — لا نخترع روابط
 *   · أسماء المتاجر عامة — لا ننسب سعراً وهمياً لمتجر حقيقي
 *
 * عند ربط مصدر حقيقي: أنشئ catalog جديداً بنفس الشكل و`source: 'catalog'`.
 * لا شاشة تتغيّر.
 */

const P = (id, name, category, price, tier, colors) => ({
  productId: id,
  name,
  category,
  price,
  currency: 'SAR',
  tier, // budget | mid | premium — يخدم «بميزانية أقل» و«أفخم»
  colors,
  image: null, // يُرسم محلياً من `colors`
  store: 'متجر تجريبي',
  productURL: null,
  source: 'mock',
  availability: 'unknown',
  lastUpdated: null,
  similarityScore: null,
  matchType: 'similar',
});

export const MOCK_CATALOG = [
  // ── أثاث ────────────────────────────────────────────────
  P('sofa_b', 'كنبة قماش 3 مقاعد', 'furniture', 2400, 'budget', ['#C9BCA8', '#8E7C63']),
  P('sofa_m', 'كنبة بيج عصرية 3 مقاعد', 'furniture', 4800, 'mid', ['#D6C6AC', '#7A6749']),
  P('sofa_p', 'كنبة مخمل زاوية', 'furniture', 9600, 'premium', ['#8C7A5E', '#4A3F30']),
  P('bed_b', 'سرير خشبي مزدوج', 'furniture', 2200, 'budget', ['#CDBFA6', '#7E6C51']),
  P('bed_m', 'سرير منجّد بمسند عالٍ', 'furniture', 5400, 'mid', ['#D9CBB4', '#6E5E45']),
  P('bed_p', 'سرير منجّد فاخر بإضاءة', 'furniture', 11200, 'premium', ['#B79E7C', '#3E342A']),
  P('dining_b', 'طقم طعام 4 كراسي', 'furniture', 2900, 'budget', ['#C8B79B', '#7C6A4E']),
  P('dining_m', 'طقم طعام خشب 6 كراسي', 'furniture', 6300, 'mid', ['#B99C77', '#5C4B34']),
  P('dining_p', 'طقم طعام رخام 8 كراسي', 'furniture', 13500, 'premium', ['#D8D3C8', '#4A443A']),

  // ── إنارة ───────────────────────────────────────────────
  P('light_b', 'إنارة سقف بسيطة', 'lighting', 480, 'budget', ['#E2DCCF', '#9A927F']),
  P('light_m', 'ثريا معدنية دائرية', 'lighting', 1650, 'mid', ['#C7AC7E', '#6B5838']),
  P('light_p', 'ثريا كريستال متدرّجة', 'lighting', 4200, 'premium', ['#E8E1CE', '#B79A63']),
  P('lamp_b', 'أباجورة أرضية', 'lighting', 320, 'budget', ['#D5CDBB', '#8B8271']),
  P('lamp_m', 'أباجورة نحاسية', 'lighting', 890, 'mid', ['#C2A177', '#6F5A3B']),

  // ── طاولات ──────────────────────────────────────────────
  P('table_b', 'طاولة وسط خشبية', 'table', 540, 'budget', ['#CBB99B', '#7F6C50']),
  P('table_m', 'طاولة وسط رخام وخشب', 'table', 1450, 'mid', ['#DEDAD0', '#8A7455']),
  P('table_p', 'طاولة وسط رخام كامل', 'table', 3600, 'premium', ['#E4E0D6', '#5D564A']),
  P('side_b', 'كومدينة صغيرة', 'table', 290, 'budget', ['#CFC2A9', '#84745A']),
  P('side_m', 'طاولة جانبية معدنية', 'table', 760, 'mid', ['#C3A87F', '#5E4E36']),

  // ── سجاد ────────────────────────────────────────────────
  P('rug_b', 'سجادة عصرية 160×230', 'rug', 420, 'budget', ['#D4C6AF', '#9C8C71']),
  P('rug_m', 'سجادة صوف 200×300', 'rug', 1550, 'mid', ['#C9B99C', '#7C6C51']),
  P('rug_p', 'سجادة يدوية 240×340', 'rug', 4100, 'premium', ['#BFA582', '#5A4C38']),

  // ── ستائر ───────────────────────────────────────────────
  P('curtain_b', 'ستائر قطن سادة', 'curtains', 380, 'budget', ['#E0DACD', '#A79E8B']),
  P('curtain_m', 'ستائر كتّان بطبقتين', 'curtains', 1180, 'mid', ['#D8CFBC', '#8E836C']),
  P('curtain_p', 'ستائر مخمل معتمة', 'curtains', 2650, 'premium', ['#B7A488', '#574E3E']),

  // ── ديكور ───────────────────────────────────────────────
  P('decor_b', 'طقم ديكور 3 قطع', 'decor', 240, 'budget', ['#DCD4C3', '#A2977F']),
  P('decor_m', 'لوحات جدارية طقم 2', 'decor', 690, 'mid', ['#CDBEA2', '#7A6C55']),
  P('decor_p', 'مرآة دائرية بإطار نحاسي', 'decor', 1900, 'premium', ['#C6A87B', '#5F5138']),
];

export const byCategory = (category) => MOCK_CATALOG.filter((p) => p.category === category);
