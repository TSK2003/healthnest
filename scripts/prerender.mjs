import { build } from 'esbuild';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
await mkdir('.build-tmp', { recursive: true });
try {
  await build({
    entryPoints: ['apps/web/src/App.tsx'],
    outfile: '.build-tmp/app.cjs',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    jsx: 'automatic',
    define: {
      'import.meta.env': '{}',
    },
  });
  const React = require('react');
  const { renderToString } = require('react-dom/server');
  const App = require('../.build-tmp/app.cjs').default;
  const markup = renderToString(React.createElement(App));
  const file = 'apps/web/dist/index.html';
  const html = await readFile(file, 'utf8');
  await writeFile(
    file,
    html.replace('<div id="root"></div>', `<div id="root">${markup}</div><!--app-end-->`),
  );
  console.log('Prerendered English homepage for first paint and search indexing.');
} finally {
  await rm('.build-tmp', { recursive: true, force: true });
}
