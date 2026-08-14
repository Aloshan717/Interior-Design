/**
 * يحزم مخرجات vite في صفحة واحدة مكتفية بذاتها للنشر كـArtifact.
 * لا ملفات خارجية ولا طلبات شبكة — كل شيء مضمّن.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = new URL('../dist', import.meta.url).pathname;
const OUT = new URL('../preview-artifact.html', import.meta.url).pathname;

const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

const cssHref = html.match(/href="(\/assets\/[^"]+\.css)"/)?.[1];
const jsSrc = html.match(/src="(\/assets\/[^"]+\.js)"/)?.[1];
if (!cssHref || !jsSrc) throw new Error('تعذّر إيجاد ملفات البناء');

const css = fs.readFileSync(path.join(DIST, cssHref), 'utf8');
const js = fs.readFileSync(path.join(DIST, jsSrc), 'utf8');

const page = `<title>مصمم داخلي</title>

<script>
  // الاتجاه يُضبط قبل أول رسم — إطار الـArtifact لا يسمح بتعديل وسم <html> مسبقاً
  document.documentElement.setAttribute('dir', 'rtl');
  document.documentElement.setAttribute('lang', 'ar');

  // بدون هذا يفترض متصفح الجوال عرض 980px فيظهر كل شيء مصغّراً
  if (!document.querySelector('meta[name="viewport"]')) {
    var vp = document.createElement('meta');
    vp.name = 'viewport';
    vp.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
    document.head.appendChild(vp);
  }
</script>

<style>
${css}
</style>

<div id="root"></div>

<script type="module">
${js}
</script>
`;

fs.writeFileSync(OUT, page);
console.log(`✓ ${OUT} — ${(page.length / 1024).toFixed(0)} KB`);
