import { SCHEMA_VERSION, statusForStep } from './constants.js';

export const uid = (prefix) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** المشروع الفارغ — مرجع البند ٢٧ الكامل */
export function createProject(overrides = {}) {
  const now = new Date().toISOString();
  return {
    projectId: uid('prj'),
    projectName: '',
    roomType: null,

    uploadedImages: [],
    floorPlan: null,
    dimensions: null,
    budget: null,
    existingFurniturePreferences: { keepExisting: 'keepNone', keepItems: [], replaceItems: [] },
    userNotes: '',

    selectedStyleImages: [],
    generatedStyleProfile: null,

    // ناتج نموذج الرؤية عن المكان — يغذّي التوليد الواقعي (البند ١٤)
    spaceAnalysis: null,

    generatedConcepts: [],
    selectedConcept: null,
    finalDesigns: [],
    designVersions: [],
    currentVersion: null,

    products: [],
    costByCategory: {},
    totalEstimatedCost: null,

    modifications: [],

    currentStep: 'room_type',
    status: 'new',
    coverImageId: null,
    createdAt: now,
    updatedAt: now,
    schemaVersion: SCHEMA_VERSION,
    ...overrides,
  };
}

/** كل كتابة تمر من هنا — يضمن تناسق `status` و`updatedAt` و`coverImageId` (البند ٢٦) */
export function touch(project, patch = {}) {
  const next = { ...project, ...patch, updatedAt: new Date().toISOString() };
  next.status = statusForStep(next.currentStep);
  next.coverImageId = deriveCover(next);
  return next;
}

function deriveCover(p) {
  const design = currentDesign(p);
  if (design) return design.imageKey;
  const concept = p.generatedConcepts?.find((c) => c.id === p.selectedConcept);
  if (concept?.imageKey) return concept.imageKey;
  return p.uploadedImages?.[0]?.blobKey ?? null;
}

export function currentDesign(p) {
  if (!p.finalDesigns?.length) return null;
  if (p.currentVersion == null) return p.finalDesigns[p.finalDesigns.length - 1];
  return p.finalDesigns.find((d) => d.versionNumber === p.currentVersion) ?? null;
}

/**
 * ترقية المشاريع المحفوظة بنسخة أقدم من البنية.
 * وجودها من اليوم الأول يعني أن تغيير البنية لاحقاً لن يفقد مشاريعك.
 */
export function migrate(project) {
  let p = project;
  if (p.schemaVersion === SCHEMA_VERSION) return p;
  // مستقبلاً: if (p.schemaVersion < 2) { … }
  return { ...p, schemaVersion: SCHEMA_VERSION };
}

/** شروط الانتقال بين الخطوات */
export const canAdvance = {
  room_type: (p) => Boolean(p.roomType),
  photos: (p) => p.uploadedImages.length > 0,
  details: () => true,
  style: (p) => p.selectedStyleImages.length >= 3,
  concepts: (p) => Boolean(p.selectedConcept),
  design: (p) => p.finalDesigns.length > 0,
  edit: () => true,
  final: () => true,
};
