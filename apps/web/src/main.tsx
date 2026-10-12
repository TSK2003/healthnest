import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
const root = document.getElementById('root')!;
const preview = Boolean(
  (window as Window & { __HEALNEST_PREVIEW__?: boolean }).__HEALNEST_PREVIEW__,
);
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
if (root.hasChildNodes() && !preview) hydrateRoot(root, app);
else createRoot(root).render(app);
