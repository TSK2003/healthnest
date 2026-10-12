import { copy, type Language } from '../content';
import { Arrow, Leaf } from './Icon';
export function About({ lang }: { lang: Language }) {
  const t = copy[lang];
  return (
    <section id="about" className="section about">
      <div className="about-art">
        <img
          src="/images/identity.webp"
          width="1020"
          height="1020"
          loading="lazy"
          alt={
            lang === 'en'
              ? 'Aadhan’s Heal Nest clinic identity with a tree and meditation motif'
              : 'ஹீல் நெஸ்ட் மருத்துவமனையின் அடையாளச் சின்னம்'
          }
        />
      </div>
      <div className="about-copy">
        <p className="eyebrow">{t.approachLabel}</p>
        <h2>{t.approachTitle}</h2>
        <p>{t.approachText}</p>
        <p>{t.approachText2}</p>
        <a className="text-link" href="#visit">
          {t.approachLink}
          <Arrow diagonal />
        </a>
      </div>
    </section>
  );
}
export function Services({ lang, onSelect }: { lang: Language; onSelect: (s: string) => void }) {
  const t = copy[lang];
  return (
    <section id="care" className="care section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t.servicesLabel}</p>
          <h2>{t.servicesTitle}</h2>
        </div>
        <p>{t.servicesIntro}</p>
      </div>
      <div className="service-list">
        {t.services.map((service, i) => (
          <article className="service" key={i}>
            <div className="service-top">
              <span>0{i + 1}</span>
              <Leaf variant={i} />
            </div>
            <p className="native-label">{service.native}</p>
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <div className="service-bottom">
              <span>{service.tag}</span>
              <a
                href="#appointment"
                onClick={() => onSelect(['siddha', 'ayurveda', 'varma'][i])}
                aria-label={`${t.serviceAction} ${service.name}`}
              >
                <Arrow diagonal />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
export function Gallery({ lang }: { lang: Language }) {
  const t = copy[lang];
  return (
    <section id="clinic" className="section gallery">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t.galleryLabel}</p>
          <h2>{t.galleryTitle}</h2>
        </div>
        <p>{t.galleryIntro}</p>
      </div>
      <div className="gallery-grid">
        <figure>
          <div className="gallery-image treatment">
            <img
              src="/images/treatment.webp"
              alt={t.room1}
              width="740"
              height="970"
              loading="lazy"
            />
          </div>
          <figcaption>
            <div>
              <h3>{t.room1}</h3>
              <p>{t.room1sub}</p>
            </div>
            <span>01</span>
          </figcaption>
        </figure>
        <figure>
          <div className="gallery-image consultation">
            <img
              src="/images/consultation.webp"
              alt={t.room2}
              width="1455"
              height="976"
              loading="lazy"
            />
          </div>
          <figcaption>
            <div>
              <h3>{t.room2}</h3>
              <p>{t.room2sub}</p>
            </div>
            <span>02</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
export function FAQ({ lang }: { lang: Language }) {
  const t = copy[lang];
  return (
    <section className="section faq">
      <div>
        <p className="eyebrow">{t.faqLabel}</p>
        <h2>{t.faqTitle}</h2>
      </div>
      <div className="faq-list">
        {t.faqs.map((faq, i) => (
          <details key={i}>
            <summary>
              {faq.q}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
