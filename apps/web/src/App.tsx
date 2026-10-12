import { useEffect, useState } from 'react';
import { copy, clinic, type Language } from './content';
import { Header } from './components/Header';
import { Hero, InfoStrip } from './components/Hero';
import { About, Services, Gallery, FAQ } from './components/Sections';
import { Appointment } from './components/Appointment';
import { Arrow } from './components/Icon';
export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [service, setService] = useState('');
  const t = copy[lang];
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title =
      lang === 'en'
        ? 'Heal Nest | Siddha, Ayurveda & Varma Clinic in Theni'
        : 'ஹீல் நெஸ்ட் | சித்தா, ஆயுர்வேதா & வர்மா · தேனி';
  }, [lang]);
  return (
    <>
      <Header lang={lang} onLanguage={() => setLang(lang === 'en' ? 'ta' : 'en')} />
      <main id="main">
        <Hero lang={lang} />
        <InfoStrip lang={lang} />
        <About lang={lang} />
        <Services lang={lang} onSelect={setService} />
        <Gallery lang={lang} />
        <FAQ lang={lang} />
        <section id="visit" className="visit section">
          <div className="visit-copy">
            <p className="eyebrow">{t.visitLabel}</p>
            <h2>{t.visitTitle}</h2>
            <p>{t.visitText}</p>
            <address>{t.address}</address>
            <a className="text-link" href={clinic.maps} target="_blank" rel="noreferrer">
              {t.directions}
              <Arrow diagonal />
            </a>
            <div className="visit-hours">
              <span>{t.weekdays}</span>
              <strong>{t.monHours}</strong>
              <span>{t.sunday}</span>
              <strong>{t.sunHours}</strong>
            </div>
            <a className="visit-phone" href={`tel:+91${clinic.phone}`}>
              {clinic.phoneDisplay}
              <Arrow diagonal />
            </a>
            <a className="text-link" href={clinic.whatsapp} target="_blank" rel="noreferrer">
              {t.whatsapp}
              <Arrow diagonal />
            </a>
          </div>
          <Appointment lang={lang} service={service} setService={setService} />
        </section>
      </main>
      <footer>
        <div className="footer-top">
          <a className="brand" href="#home">
            <span className="brand-name">heal nest.</span>
            <span className="brand-sub">{t.tagline}</span>
          </a>
          <p>{t.footer}</p>
          <a href="#appointment" className="text-link">
            {t.book}
            <Arrow diagonal />
          </a>
        </div>
        <details className="privacy-details">
          <summary>{t.privacy}</summary>
          <p>{t.privacyBody}</p>
        </details>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {t.rights}
          </span>
          <span>THENI, TAMIL NADU</span>
        </div>
      </footer>
      <a
        className="whatsapp"
        href={clinic.whatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label={t.whatsapp}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <path d="M20.5 11.7a8.5 8.5 0 0 1-12.8 7.4L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4.1Z" />
          <path d="M8.2 7.8c-.8 2.9 3 6.6 5.8 7.4 1.1.2 2-1.1 2-1.1l-2.4-1.5-.9.7s-1.9-.8-2.7-2.7l.7-.9-1.4-2.4-1.1.5Z" />
        </svg>
        <span>{lang === 'en' ? 'Let’s talk' : 'பேசலாம்'}</span>
      </a>
    </>
  );
}
