import { copy, clinic, type Language } from '../content';
import { Arrow } from './Icon';
export function Hero({ lang }: { lang: Language }) {
  const t = copy[lang];
  return (
    <section id="home" className="hero">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="small-line" />
          {t.eyebrow}
        </div>
        <h1>{t.hero}</h1>
        <p>{t.intro}</p>
        <div className="hero-actions">
          <a className="button primary" href="#appointment">
            {t.book}
            <Arrow />
          </a>
          <a className="text-link" href="#care">
            {t.explore}
            <Arrow diagonal />
          </a>
        </div>
        <div className="hero-foot">
          <span className="sun-symbol" aria-hidden="true">
            ✳
          </span>
          <span>{t.scroll}</span>
        </div>
      </div>
      <div className="hero-visual">
        <img
          src="/images/treatment.webp"
          alt={
            lang === 'en'
              ? 'Wooden treatment table inside Heal Nest clinic'
              : 'ஹீல் நெஸ்ட் மருத்துவமனையின் சிகிச்சை அறை'
          }
          fetchPriority="high"
          width="740"
          height="970"
        />
        <div className="photo-label">
          <span className="photo-number">01 /</span>
          <div>
            <strong>{t.photoCaption}</strong>
            <span>{t.photoLocation}</span>
          </div>
          <Arrow diagonal />
        </div>
      </div>
      <div className="hero-side-label" aria-hidden="true">
        HEAL NEST · THENI
      </div>
    </section>
  );
}
export function InfoStrip({ lang }: { lang: Language }) {
  const t = copy[lang];
  return (
    <div className="info-strip">
      <div>
        <span className="info-label">{t.weekdays}</span>
        <strong>{t.monHours}</strong>
      </div>
      <div>
        <span className="info-label">{t.sunday}</span>
        <strong>{t.sunHours}</strong>
      </div>
      <a href={clinic.maps} target="_blank" rel="noreferrer">
        <span>
          <span className="info-label">{t.place}</span>
          <strong>{t.directions}</strong>
        </span>
        <Arrow diagonal />
      </a>
    </div>
  );
}
