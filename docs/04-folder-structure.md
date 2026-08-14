# ٤ — هيكل المجلدات

```
Interior-Design/
├── README.md
├── docs/                       ← الوثائق (هذه الملفات)
└── web/                        ← التطبيق
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── public/
    │   ├── icon.svg            ← أيقونة الشاشة الرئيسية
    │   └── manifest.webmanifest
    └── src/
        ├── main.jsx            ← نقطة الدخول
        ├── App.jsx             ← التبويبات + تحويل المسار
        │
        ├── theme/
        │   └── brand.js        ← الاسم والهوية — البند ٣٤
        │
        ├── styles/
        │   ├── tokens.css      ← الألوان والمسافات والحركة — البند ٢٢
        │   └── global.css      ← أصناف الواجهة
        │
        ├── i18n/
        │   ├── ar.js           ← كل النصوص — البند ٣٢
        │   └── index.js        ← دالة t()
        │
        ├── lib/                ← المنطق — لا React هنا إطلاقاً
        │   ├── models/
        │   │   ├── constants.js
        │   │   └── project.js  ← البنية والانتقالات — البند ٢٧
        │   ├── storage/
        │   │   ├── localStore.js   ← IndexedDB
        │   │   └── index.js        ← الواجهة المجردة
        │   ├── ai/
        │   │   ├── types.js        ← العقد — البند ٢٨
        │   │   ├── mockProvider.js ← يعمل الآن بلا تكلفة
        │   │   ├── falProvider.js  ← جاهز للتفعيل
        │   │   ├── mockImages.js   ← صور توضيحية (تُحذف لاحقاً)
        │   │   ├── styleReferences.js ← الـ١٢ صورة — البند ١١
        │   │   └── index.js        ← نقطة التبديل الوحيدة
        │   ├── products/
        │   │   ├── mockCatalog.js  ← بيانات تجريبية — البند ٣٠
        │   │   ├── productImage.js
        │   │   └── index.js        ← المطابقة والتكلفة — البنود ١٦/١٧/٣١
        │   └── format.js           ← الأسعار والتواريخ
        │
        ├── state/
        │   └── AppContext.jsx  ← الحالة + الحفظ التلقائي — البند ٢٦
        │
        ├── components/         ← مكوّنات معاد استخدامها
        │   ├── ui.jsx          ← Button · Card · Sheet · Lightbox …
        │   ├── Icon.jsx
        │   ├── Stepper.jsx     ← البند ٢٣
        │   ├── TabBar.jsx      ← البند ٣٣
        │   ├── Loader.jsx      ← البند ٢٤
        │   ├── ProjectCard.jsx
        │   ├── ProductCard.jsx
        │   ├── DesignSummary.jsx
        │   └── VersionStrip.jsx ← البند ١٩
        │
        └── screens/
            ├── HomeScreen.jsx
            ├── ProjectsScreen.jsx
            ├── SettingsScreen.jsx
            ├── Wizard.jsx      ← حاوية الرحلة
            └── steps/
                ├── RoomTypeStep.jsx   ← البند ٧
                ├── PhotosStep.jsx     ← البندان ٨/٩
                ├── DetailsStep.jsx    ← البندان ١٠/٣١
                ├── StyleStep.jsx      ← البند ١١
                ├── ConceptsStep.jsx   ← البندان ١٢/١٣
                ├── DesignStep.jsx     ← البنود ١٤/١٥/١٦
                ├── EditStep.jsx       ← البند ١٨
                └── FinalStep.jsx      ← البند ٢٠
```

---

## القواعد التي يحرسها هذا الهيكل

| القاعدة | لماذا |
|---|---|
| `lib/` لا يستورد React أبداً | المنطق ينتقل لأي واجهة — بما فيها SwiftUI لاحقاً |
| `screens/` لا تستدعي `fetch` مباشرة | كل شيء عبر `lib/ai` أو `lib/products` |
| لا نص عربي خارج `i18n/ar.js` | إضافة الإنجليزية = ملف واحد جديد |
| لا لون أو مسافة خارج `tokens.css` | تغيير الطابع البصري من مكان واحد |
| كل ملف في `lib/ai` قابل للاستبدال | تبديل المزوّد لا يلمس أي شاشة |

## عند إضافة نسخة iOS لاحقاً

```
├── web/          ← يبقى كما هو
├── ios/          ← يُضاف
└── server/       ← مشترك بين الاثنين
```

`lib/` هي المرجع الذي يُترجم إلى Swift — البنية والعقود والقواعد كلها موثّقة فيه.
