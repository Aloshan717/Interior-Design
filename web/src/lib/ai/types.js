/**
 * عقد المزوّد — البندان ٢٨ و٢٩.
 *
 * أي مزوّد جديد يجب أن ينفّذ هذه الدوال بنفس المدخلات والمخرجات.
 * الشاشات تستدعي هذه الأسماء فقط ولا تعرف من ينفّذها.
 *
 * كل دالة تستقبل `onProgress(phaseKey)` اختيارياً لتغذية شاشات التحميل
 * بمراحل **حقيقية** لا مؤقّت وهمي (البند ٢٤).
 *
 * @typedef {object} AIProvider
 * @property {(input: {images, roomType, notes}, onProgress?) => Promise<SpaceAnalysis>} analyzeSpace
 * @property {(input: {selectedRefs}, onProgress?) => Promise<StyleProfile>} buildStyleProfile
 * @property {(input: {spaceAnalysis, styleProfile, roomType, count, exclude?}, onProgress?) => Promise<Concept[]>} generateConcepts
 * @property {(input: {roomImage, spaceAnalysis, styleProfile, concept, constraints}, onProgress?) => Promise<DesignResult>} generateRoomDesign
 * @property {(input: {text, currentDesign}) => Promise<EditIntent>} parseEditIntent
 * @property {(input: {baseDesign, intent, styleProfile, roomType}, onProgress?) => Promise<DesignResult>} applyEdit
 * @property {string} id
 * @property {boolean} isMock
 */

export const PHASES = {
  ANALYZING_SPACE: 'analyzing_space',
  BUILDING_PROFILE: 'building_profile',
  GENERATING_CONCEPTS: 'generating_concepts',
  RENDERING_DESIGN: 'rendering_design',
  MATCHING_PRODUCTS: 'matching_products',
  APPLYING_EDIT: 'applying_edit',
};

/** أنواع أوامر التعديل — الفرق بينها يحدد من يعالج الأمر (البند ١٨) */
export const INTENT_KIND = {
  VISUAL: 'visual', // يذهب لنموذج الصور
  COMMERCIAL: 'commercial', // يذهب لمحرّك المنتجات
  UNKNOWN: 'unknown',
};
