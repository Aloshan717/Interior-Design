# ٣ — نماذج البيانات

تنفيذ كامل للبندين ٢٧ و٣٠. التعريف المرجعي في `web/src/lib/models/`.

---

## Project — المشروع

كل غرفة مشروع مستقل (البند ٥). لا مفهوم "منزل".

```js
{
  projectId:        "prj_a1b2c3",
  projectName:      "غرفة النوم الرئيسية",
  roomType:         "master_bedroom",

  // المكان (البنود ٨–١٠)
  uploadedImages:   [ RoomImage ],
  floorPlan:        FloorPlan | null,
  dimensions:       { width: 4.5, length: 5.2, ceilingHeight: 3.0, unit: "m" } | null,
  budget:           { amount: 20000, currency: "SAR" } | null,
  existingFurniturePreferences: {
    keepExisting:   "none" | "some" | "all",
    keepItems:      ["الدولاب"],
    replaceItems:   ["السرير", "الستائر"]
  },
  userNotes:        "أبي إضاءة هادئة",

  // الذوق (البند ١١)
  selectedStyleImages: ["ref_03", "ref_07", "ref_11"],
  generatedStyleProfile: StyleProfile | null,

  // التصميم (البنود ١٢–١٤)
  generatedConcepts: [ Concept ],
  selectedConcept:   "cpt_02" | null,
  finalDesigns:      [ Design ],
  designVersions:    [ DesignVersion ],

  // المنتجات (البنود ١٦–١٧)
  products:          [ Product ],
  totalEstimatedCost: { amount: 18750, currency: "SAR", isEstimate: true },

  // التعديلات (البند ١٨)
  modifications:     [ Modification ],

  // الحالة (البنود ٦ و٢٦)
  currentStep:       "style" ,
  status:            "new" | "selecting" | "editing" | "completed",
  coverImageId:      "img_01" | null,
  createdAt:         "2026-08-14T12:00:00Z",
  updatedAt:         "2026-08-14T12:40:00Z",
  schemaVersion:     1
}
```

> `schemaVersion` غير مذكور في البند ٢٧ لكنه إضافة ضرورية: يسمح بترقية المشاريع القديمة عند تغيير البنية بدل فقدانها.

---

## الكيانات الفرعية

### RoomImage
```js
{ id, blobKey, thumbnailKey, width, height, order, capturedAt,
  quality: { isBlurry, isTooDark, hasPeople, score } | null }
```
`quality` يُملأ عند التحليل ويغذّي رسائل الخطأ في البند ٢٥.

### FloorPlan
```js
{ id, blobKey, type: "image" | "pdf", pageCount, addedAt }
```

### StyleProfile
```js
{
  id, generatedFrom: ["ref_03","ref_07"],
  traits: {
    warmth:   0.8,   // بارد ← دافئ
    luxury:   0.7,   // بسيط ← فاخر
    contrast: 0.3,   // هادئ ← جريء
    density:  0.4    // خفيف ← ممتلئ
  },
  palette:  ["#EDE7DD", "#C9B79C", "#3A3A38"],
  materials: ["خشب طبيعي", "قماش كتّان", "نحاس"],
  lighting:  "warm_soft",
  descriptionAr: "ذوقك يميل إلى التصميم العصري الدافئ مع ألوان محايدة وتفاصيل فاخرة.",
  promptFragment: "warm contemporary, neutral palette, soft ambient lighting, subtle luxury"
}
```
**ملاحظة (البند ١١):** `descriptionAr` هو ما يراه المستخدم. `traits` و`promptFragment` داخليان — لا يُعرضان أبداً.

### Concept — التصور الأولي
```js
{ id, index, imageKey, titleAr: "عصري دافئ", directionTag: "warm_contemporary",
  promptUsed, status: "pending" | "ready" | "failed", generatedAt }
```
`status` يسمح بالعرض التدريجي: كل تصور يظهر فور جاهزيته.

### Design — التصميم الواقعي
```js
{ id, versionNumber, imageKey, basedOnConcept, basedOnImageId,
  detectedItems: [ DetectedItem ], promptUsed,
  isApproved, generatedAt,
  disclaimerAr: "تصور تقريبي — قد تختلف التفاصيل الدقيقة عن مكانك." }
```
`disclaimer` ليس نصاً تجميلياً — هو التزام بالبند ١٤ (لا ادعاء بدقة الأبعاد).

### DetectedItem — عنصر مرصود في الصورة
```js
{ id, category: "sofa", labelAr: "كنبة", boundingBox: {x,y,w,h},
  descriptor: "beige 3-seater fabric sofa", matchedProductId | null }
```
الجسر بين الصورة والمنتج: نرصد العنصر، ثم نبحث عن أقرب منتج له.

### Product (البند ٣٠)
```js
{
  productId, name, category, image, price, currency: "SAR",
  store, productURL,
  source: "mock" | "catalog" | "affiliate" | "manual",
  availability: "in_stock" | "unknown" | "out_of_stock",
  lastUpdated,
  similarityScore: 0.82,
  matchType: "similar",          // دائماً "similar" في المرحلة الحالية
  alternatives: [ productId ]
}
```

**قاعدة صارمة (البند ١٧):**
- `matchType: "similar"` ← الواجهة **يجب** أن تكتب «منتج مشابه»
- `source: "mock"` ← يظهر شارة «بيانات تجريبية» ويُعطّل زر الشراء
- منتج بلا `price` موثوق ← يُعرض بلا سعر، **لا بسعر مخمّن**

### DesignVersion (البند ١٩)
```js
{ versionNumber, designId, label: "غيّرت الثريا", parentVersion,
  createdAt, thumbnailKey }
```
لا نستبدل أبداً — نضيف نسخة. الرجوع = تغيير مؤشر لا حذف.

### Modification (البند ١٨)
```js
{
  id, versionNumber, userText: "غيّر الثريا",
  intent: {
    kind: "visual" | "commercial",   // ← التصنيف المهم
    target: "chandelier",
    change: "replace",
    params: { style: "أكبر" }
  },
  resultDesignId, status: "pending"|"done"|"failed", createdAt
}
```

**عن `kind`:** الأوامر نوعان جوهرياً — `visual` يذهب لنموذج الصور، و`commercial` (مثل «بميزانية أقل») يذهب لمحرّك المنتجات. بدون هذا التمييز يعطي «بميزانية أقل» نتيجة عشوائية. المستخدم لا يرى الفرق — يكتب بلغته الطبيعية دائماً.

---

## آلة الحالات

`currentStep` يتحرك في اتجاه واحد للأمام، والرجوع مسموح دائماً:

```
room_type → photos → details → style → concepts → design → edit → final
```

| القيمة | يقابل | `status` |
|---|---|---|
| `room_type` | البند ٧ | `new` |
| `photos` | البند ٨ | `new` |
| `details` | البنود ٩–١٠ | `new` |
| `style` | البند ١١ | `new` |
| `concepts` | البنود ١٢–١٣ | `selecting` |
| `design` | البنود ١٤–١٥ | `editing` |
| `edit` | البند ١٨ | `editing` |
| `final` | البند ٢٠ | `completed` |

**البند ٦:** فتح مشروع محفوظ يقفز مباشرة إلى `currentStep`.
**البند ٢٦:** كل تغيير يُحفظ فوراً — لا زر حفظ في الواجهة إطلاقاً.

---

## التخزين

| البيانات | المكان | السبب |
|---|---|---|
| كائن المشروع (JSON) | IndexedDB | صغير وسريع |
| الصور الأصلية | IndexedDB كـBlob | ٢–٥ ميجا للصورة — لا تُرفع بلا داعٍ |
| المصغّرات | IndexedDB (٤٠٠px) | العرض في القوائم |
| نسخة سحابية | Supabase (اختياري) | المزامنة بين أجهزتك |

المشروع يشير للصور بـ`blobKey` لا ببيانات مضمّنة — يبقى JSON خفيفاً ويمكن مزامنته وحده.

### Supabase — للتفعيل الاختياري لاحقاً
```sql
create table projects (
  project_id   text primary key,
  data         jsonb not null,
  updated_at   timestamptz default now()
);
create table project_images (
  image_id     text primary key,
  project_id   text references projects(project_id) on delete cascade,
  storage_path text not null
);
```
`jsonb` مقصود: البنية ما زالت تتطوّر، ولا داعي لترحيل مخطط عند كل تغيير في هذه المرحلة.
