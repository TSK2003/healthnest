import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
const dist = 'apps/web/dist';
let html = await readFile(path.join(dist, 'index.html'), 'utf8');
const files = await readdir(path.join(dist, 'assets'));
let js = await readFile(
  path.join(
    dist,
    'assets',
    files.find((f) => f.endsWith('.js')),
  ),
  'utf8',
);
const css = await readFile(
  path.join(
    dist,
    'assets',
    files.find((f) => f.endsWith('.css')),
  ),
  'utf8',
);
for (const file of await readdir(path.join(dist, 'images'))) {
  const bytes = await readFile(path.join(dist, 'images', file));
  const data = `data:image/webp;base64,${bytes.toString('base64')}`;
  js = js.replaceAll(`/images/${file}`, data);
}
// The portable review file mounts afresh so its disabled preview form is explicit.
html = html.replace(/<div id="root">[\s\S]*<\/div><!--app-end-->/, '<div id="root"></div>');
html = html.replace(/<script type="module"[^>]*src="[^"]+"[^>]*><\/script>/, '');
html = html.replace(/<link rel="stylesheet"[^>]*>/, () => `<style>${css}</style>`);
html = html.replace(/<link rel="icon"[^>]*>/, '');
html = html.replace('</head>', '<meta name="robots" content="noindex,nofollow"/></head>');
html = html.replace(
  '</body>',
  () =>
    `<script>window.__HEALNEST_PREVIEW__=true;</script><script type="module">${js.replaceAll('</script', '<\\/script')}</script></body>`,
);
await mkdir('delivery', { recursive: true });
await writeFile('delivery/HealNest-Preview.html', html);
console.log('Created standalone, offline preview. Appointment submission is disabled.');
