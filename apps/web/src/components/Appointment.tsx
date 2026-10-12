import { useEffect, useRef, useState } from 'react';
import { copy, type Language } from '../content';
import { Arrow } from './Icon';
import { saveAppointmentToFirebase } from '../firebase';
export function indiaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
function times(date: string) {
  if (!date) return [];
  const sunday = new Date(`${date}T12:00:00+05:30`).getUTCDay() === 0;
  const out: string[] = [];
  for (let m = (sunday ? 10 : 9) * 60; m < (sunday ? 20 : 21) * 60; m += 30) {
    const v = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    if (new Date(`${date}T${v}:00+05:30`).getTime() > Date.now()) out.push(v);
  }
  return out;
}
export function Appointment({
  lang,
  service,
  setService,
}: {
  lang: Language;
  service: string;
  setService: (s: string) => void;
}) {
  const t = copy[lang];
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<keyof typeof copy.en>('error');
  const [reference, setReference] = useState('');
  const requestId = useRef(crypto.randomUUID());
  const feedback = useRef<HTMLDivElement>(null);
  const lastPayload = useRef('');
  const [bounds, setBounds] = useState({ min: '', max: '' });
  useEffect(() => {
    setBounds({
      min: indiaToday(),
      max: new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(Date.now() + 90 * 86400000)),
    });
  }, []);
  const preview =
    typeof window !== 'undefined' &&
    (window.location.protocol === 'file:' ||
      Boolean((window as Window & { __HEALNEST_PREVIEW__?: boolean }).__HEALNEST_PREVIEW__));
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus('sending');
    const payload = {
      name: String(data.get('name')).trim(),
      phone: String(data.get('phone')).trim().replace(/\s/g, ''),
      email: String(data.get('email') || '').trim() || undefined,
      service,
      date,
      time: data.get('time'),
      consent: data.get('consent') === 'on',
      website: data.get('website') || '',
      language: lang,
    };
    const fingerprint = JSON.stringify(payload);
    if (lastPayload.current && lastPayload.current !== fingerprint)
      requestId.current = crypto.randomUUID();
    lastPayload.current = fingerprint;
    try {
      let refId = '';
      try {
        const fbResult = await saveAppointmentToFirebase({
          ...payload,
          requestId: requestId.current,
        });
        refId = fbResult.reference;
      } catch (fbErr) {
        console.warn('Firebase submission error, trying API endpoint fallback:', fbErr);
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, requestId: requestId.current }),
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) {
          setError(
            response.status === 429
              ? 'wait'
              : response.status === 400
                ? 'invalid'
                : response.status === 503
                  ? 'unavailable'
                  : 'error',
          );
          setStatus('error');
          return;
        }
        const result = await response.json();
        refId = result.reference;
      }
      setReference(refId);
      setStatus('success');
      setTimeout(() => feedback.current?.focus(), 0);
    } catch {
      setError('error');
      setStatus('error');
    }
  }
  return (
    <div id="appointment" className="appointment-card">
      {status === 'success' ? (
        <div ref={feedback} tabIndex={-1} className="success" role="status">
          <span className="success-check">✓</span>
          <h3>{t.successTitle}</h3>
          <p>{t.success}</p>
          <p className="reference">
            {t.reference}: {reference}
          </p>
          <button
            className="button primary"
            onClick={() => {
              setStatus('idle');
              setDate('');
              requestId.current = crypto.randomUUID();
            }}
          >
            {t.again}
            <Arrow />
          </button>
        </div>
      ) : (
        <>
          <h3>{t.formTitle}</h3>
          <p className="form-intro">{t.formIntro}</p>
          {preview && <p className="notice">{t.preview}</p>}
          <form onSubmit={submit}>
            <div className="form-grid">
              <label className="full">
                {t.name}
                <input required name="name" autoComplete="name" minLength={2} maxLength={80} />
              </label>
              <label>
                {t.phone}
                <input
                  required
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  pattern="(\+91)?[6-9][0-9]{9}"
                  title="10-digit Indian mobile number, optionally prefixed with +91"
                  maxLength={13}
                />
              </label>
              <label>
                {t.email} <span>({t.optional})</span>
                <input name="email" type="email" autoComplete="email" maxLength={254} />
              </label>
              <label className="full">
                {t.service}
                <select required value={service} onChange={(e) => setService(e.target.value)}>
                  <option value="">{t.choose}</option>
                  {t.services.map((s, i) => (
                    <option key={i} value={['siddha', 'ayurveda', 'varma'][i]}>
                      {s.name}
                    </option>
                  ))}
                  <option value="unsure">{t.unsure}</option>
                </select>
              </label>
              <label>
                {t.date}
                <input
                  required
                  type="date"
                  name="date"
                  min={bounds.min}
                  max={bounds.max}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label>
                {t.time}
                <select name="time" key={date} required disabled={!date} defaultValue="">
                  <option value="">{date ? t.selectTime : t.selectDate}</option>
                  {times(date).map((time) => (
                    <option key={time} value={time}>
                      {new Intl.DateTimeFormat(lang === 'en' ? 'en-IN' : 'ta-IN', {
                        hour: 'numeric',
                        minute: '2-digit',
                        timeZone: 'Asia/Kolkata',
                      }).format(new Date(`${date}T${time}:00+05:30`))}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="honey" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <label className="consent">
              <input required type="checkbox" name="consent" />
              <span>{t.consent}</span>
            </label>
            {status === 'error' && (
              <p className="form-error" role="alert">
                {String(t[error])}
              </p>
            )}
            <button
              disabled={status === 'sending' || preview}
              className="button primary submit"
              type="submit"
            >
              {status === 'sending' ? t.sending : t.submit}
              <Arrow />
            </button>
            <p className="privacy-hint">{t.privacyHint}</p>
          </form>
        </>
      )}
    </div>
  );
}
