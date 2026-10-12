import { useState } from 'react';
import { copy, clinic, type Language } from '../content';
import { Arrow } from './Icon';
export function Header({ lang, onLanguage }: { lang: Language; onLanguage: () => void }) {
  const [open, setOpen] = useState(false);
  const t = copy[lang];
  const links = ['about', 'care', 'clinic', 'visit'];
  return (
    <>
      <a className="skip-link" href="#main">
        {t.skip}
      </a>
      <div className="topbar">
        <span>{t.place}</span>
        <span>{t.eyebrow}</span>
        <a href={`tel:+91${clinic.phone}`}>{clinic.phoneDisplay}</a>
      </div>
      <header className="header">
        <a className="brand" href="#home" aria-label="Heal Nest home">
          <span className="brand-name">
            heal nest<span className="brand-dot">.</span>
          </span>
          <span className="brand-sub">{t.tagline}</span>
        </a>
        <nav
          className={open ? 'nav is-open' : 'nav'}
          aria-label={lang === 'en' ? 'Main navigation' : 'முக்கிய வழிசெலுத்தல்'}
        >
          {t.nav.map((label, i) => (
            <a key={links[i]} href={`#${links[i]}`} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button className="language" onClick={onLanguage} aria-label={t.language}>
            {lang === 'en' ? 'தமிழ்' : 'English'}
            <span aria-hidden="true">↔</span>
          </button>
          <a className="header-book" href="#appointment">
            {t.book}
            <Arrow />
          </a>
          <button
            type="button"
            aria-label={open ? t.close : t.menu}
            aria-expanded={open}
            className="menu-button"
            onClick={() => setOpen(!open)}
          >
            {open ? '×' : '☰'}
          </button>
        </div>
      </header>
    </>
  );
}
