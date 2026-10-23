import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Info,
  Lightbulb,
  Loader2,
  Sprout,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react';
import SEO from '../components/SEO';
import { usePublishedCollection, usePublishedDoc, resolveMedia, type CmsItem } from '../admin/store';
import { CATEGORY_SEED, WHY_SEED } from '../data/siteContent';
import {
  submitCareerApplication,
  validateApplication,
  validateResume,
  type CareerApplication,
  type CareerErrors,
} from '../lib/careersService';

const SERIF = '"DM Serif Display","Playfair Display",Georgia,"Times New Roman",serif';
const DARK = '#063D30';
const MID = '#24593A';
const MUTED = '#4F6A66';

const img = (n: string) => `/images/careers/${n}.webp`;

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
};

const WHY_ICONS = [Sprout, GraduationCap, Users, Lightbulb];


const GROWTH = [
  { Icon: TrendingUp, title: 'Career Progression', text: 'Build your experience and develop the skills needed to take on greater responsibilities.' },
  { Icon: GraduationCap, title: 'Continuous Learning', text: 'Develop practical knowledge of land management, agriculture and project operations.' },
  { Icon: Users, title: 'Team Collaboration', text: 'Learn from colleagues across business, technical and operational teams.' },
  { Icon: BookOpen, title: 'Real-World Exposure', text: 'Gain hands-on experience through site visits, planning activities and project work.' },
];

const EXPERIENCE = ['Freshers', '1-3 years', '4-7 years', '8+ years'] as const;

const EMPTY: CareerApplication = { fullName: '', email: '', phone: '', position: '', experience: '', about: '' };

const Eyebrow: React.FC<{ children: React.ReactNode; light?: boolean }> = ({ children, light }) => (
  <p className="text-[11px] font-semibold uppercase tracking-[0.28em]" style={{ color: light ? 'rgba(255,255,255,0.85)' : DARK }}>
    {children}
  </p>
);

const fieldBase =
  'mt-1.5 w-full rounded-lg border bg-white/80 px-3.5 py-2.5 text-sm text-[#123C37] outline-none transition placeholder:text-[#8A9A96] focus:border-[#24593A] focus:ring-2 focus:ring-[#24593A]/25';

const FieldError: React.FC<{ id: string; msg?: string }> = ({ id, msg }) =>
  msg ? (
    <p id={id} role="alert" className="mt-1 flex items-start gap-1 text-xs text-[#B42318]">
      <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
      {msg}
    </p>
  ) : null;

const Careers: React.FC = () => {
  // Content below can be edited in the admin panel; until then it equals the built-in text.
  const doc = usePublishedDoc('careers') as Record<string, string | undefined>;
  const whyCards = usePublishedCollection('careers.why', WHY_SEED);
  const categories = usePublishedCollection('careers.categories', CATEGORY_SEED);
  const openings = usePublishedCollection<CmsItem>('careers.openings', []);
  const [form, setForm] = useState<CareerApplication>(EMPTY);
  const [honey, setHoney] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<CareerErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle');
  const [failMsg, setFailMsg] = useState('');
  const sending = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = (k: keyof CareerApplication) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    const msg = validateResume(f);
    if (msg) {
      setFile(null);
      setErrors((x) => ({ ...x, resume: msg }));
      e.target.value = '';
      return;
    }
    setFile(f);
    setErrors((x) => ({ ...x, resume: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending.current || status === 'done') return; // prevent duplicate submissions
    if (honey) return; // bots fill the hidden field
    const found = validateApplication(form, file);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = (['fullName', 'email', 'phone', 'position', 'about', 'resume'] as const).find((k) => found[k]);
      if (first) document.getElementById(`career-${first}`)?.focus();
      return;
    }
    sending.current = true;
    setStatus('sending');
    setFailMsg('');
    try {
      await submitCareerApplication(form, file);
      setStatus('done');
      setForm(EMPTY);
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      setFailMsg(
        code === 'not-configured'
          ? 'Applications are not available right now. Please try again later or contact us directly.'
          : code === 'upload-failed'
            ? 'We could not upload your resume. Please check the file (PDF, DOC or DOCX, up to 5 MB) and try again.'
            : 'We could not save your application. Nothing was submitted, so please try again in a moment.',
      );
      setStatus('failed');
    } finally {
      sending.current = false;
    }
  };

  const invalid = (k: keyof CareerErrors) => (errors[k] ? 'border-[#B42318]' : 'border-[#C9D9C3]');

  return (
    <main className="min-h-screen bg-[#E4EEDC] pb-16 pt-[76px]">
      <SEO
        title="Careers | Join IGO Agri Estate"
        description="Build your career in agricultural land development and investment. Explore career categories at IGO Agri Estate and submit your resume."
        canonical="/careers"
      />

      {/* 1. Hero */}
      <section className="relative isolate overflow-hidden bg-[#2B5A34]" aria-labelledby="careers-heading">
        <img
          src={resolveMedia(doc.heroImage, img('hero'))}
          alt="IGO Agri Estate team standing in a green farm field"
          className="absolute inset-y-0 right-0 -z-10 hidden h-full w-[68%] object-cover object-[center_30%] md:block"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,#2B5A34_0%,#2B5A34_32%,rgba(43,90,52,0.78)_48%,rgba(43,90,52,0.1)_75%,transparent_100%)] md:block" />
        <div className="mx-auto w-full max-w-[1480px] px-5 py-12 sm:px-6 md:py-20 lg:px-10">
          <div className="max-w-[520px] text-white">
            <Eyebrow light>Grow with purpose · Build with vision</Eyebrow>
            <h1
              id="careers-heading"
              className="mt-4 text-[2rem] font-normal normal-case leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.7rem]"
              style={{ fontFamily: SERIF }}
            >
              {doc.heroTitle || <>Build Your Career.<br className="hidden sm:block" /> Shape the Future of Agriculture.</>}
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-white/90">
              {doc.heroText || 'Join IGO Agri Estate and be part of a team transforming agricultural land development and investment opportunities into a sustainable future.'}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => scrollToId('career-opportunities')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/80 px-6 py-2.5 text-sm font-semibold normal-case tracking-normal text-white transition hover:bg-white hover:text-[#063D30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Explore Opportunities <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollToId('career-apply')}
                className="inline-flex items-center justify-center rounded-full border border-white/80 px-6 py-2.5 text-sm font-semibold normal-case tracking-normal text-white transition hover:bg-white hover:text-[#063D30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Submit Your Resume
              </button>
            </div>
          </div>
        </div>
        <img src={resolveMedia(doc.heroImage, img('hero'))} alt="" aria-hidden="true" className="h-48 w-full object-cover object-[center_30%] md:hidden" />
      </section>

      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-12 px-5 pt-12 sm:px-6 md:gap-16 md:pt-14 lg:px-10">
        {/* 2. Why join us */}
        <section aria-labelledby="why-heading">
          <Eyebrow>Why join us</Eyebrow>
          <h2 id="why-heading" className="mt-2 text-[1.7rem] font-normal normal-case leading-tight tracking-tight sm:text-4xl" style={{ fontFamily: SERIF, color: DARK }}>
            {doc.whyTitle || 'A Career That Creates Real Impact'}
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-7" style={{ color: MUTED }}>
            Build your skills, work with passionate professionals and contribute to agricultural land development and investment opportunities.
          </p>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyCards.map((c, wi) => { const Icon = WHY_ICONS[wi % WHY_ICONS.length]; const { image, alt, title, text } = c as Record<string, string>; return (
              <article key={title} className="flex flex-col overflow-hidden rounded-[22px] border border-white/70 bg-[#F1F7EC] p-3 shadow-[0_16px_36px_-26px_rgba(6,61,48,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_-26px_rgba(6,61,48,0.5)]">
                <img src={resolveMedia(image)} alt={alt} loading="lazy" className="aspect-[16/8] w-full rounded-[14px] object-cover" />
                <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                  <Icon size={22} strokeWidth={1.6} style={{ color: MID }} aria-hidden="true" />
                  <h3 className="mt-2 text-[16px] font-semibold normal-case leading-snug tracking-normal" style={{ color: DARK }}>{title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-6" style={{ color: MUTED }}>{text}</p>
                </div>
              </article>
            ); })}
          </div>
        </section>

        {/* 3. Explore career opportunities */}
        <section id="career-opportunities" aria-labelledby="explore-heading" className="scroll-mt-28">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_2fr] lg:gap-10">
            <div>
              <Eyebrow>Find your place</Eyebrow>
              <h2 id="explore-heading" className="mt-2 text-[1.7rem] font-normal normal-case leading-tight tracking-tight sm:text-4xl" style={{ fontFamily: SERIF, color: DARK }}>
                {doc.categoriesTitle || 'Explore Career Opportunities'}
              </h2>
              <p className="mt-3 text-[15px] leading-7" style={{ color: MUTED }}>
                Whether you are passionate about agriculture, land development, business or technology, discover opportunities to contribute your skills and grow with us.
              </p>
            </div>
            <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {categories.map((c) => (
                <li key={String(c.id)} className="flex gap-4">
                  <img src={resolveMedia(c.image)} alt={String(c.alt || '')} loading="lazy" className="h-[88px] w-[88px] shrink-0 rounded-xl object-cover shadow-sm" />
                  <div>
                    <h3 className="text-[15px] font-semibold normal-case leading-snug tracking-normal" style={{ color: DARK }}>{String(c.title)}</h3>
                    <p className="mt-1 text-[13px] leading-5" style={{ color: MUTED }}>{String(c.text)}</p>
                    <p className="mt-1 text-[13px] leading-5" style={{ color: MUTED }}>
                      <span className="font-medium" style={{ color: DARK }}>Potential roles:</span> {String(c.roles || '')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-7 flex items-start gap-2 text-xs leading-5" style={{ color: MUTED }}>
            <Info size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
            Note: These are career categories, not confirmed vacancies. Specific openings are shown only when verified by IGO Agri Estate.
          </p>
        </section>

        {/* Current openings (shown only when published in the admin panel) */}
        {openings.length > 0 && (
          <section id="career-current-openings" aria-labelledby="openings-heading" className="scroll-mt-28">
            <Eyebrow>Open positions</Eyebrow>
            <h2 id="openings-heading" className="mt-2 text-[1.7rem] font-normal normal-case leading-tight tracking-tight sm:text-4xl" style={{ fontFamily: SERIF, color: DARK }}>{doc.openingsTitle || 'Current Openings'}</h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {openings.map((o) => (
                <li key={String(o.id)} className="flex flex-col rounded-[22px] border border-white/70 bg-[#F1F7EC] p-5 shadow-[0_16px_36px_-26px_rgba(6,61,48,0.45)]">
                  <h3 className="text-[16px] font-semibold normal-case leading-snug tracking-normal" style={{ color: DARK }}>{String(o.title)}</h3>
                  <p className="mt-1 text-[13px]" style={{ color: MUTED }}>{[o.department, o.location, o.type, o.experience].filter(Boolean).map(String).join(' · ')}</p>
                  <p className="mt-2 whitespace-pre-line text-[13.5px] leading-6" style={{ color: MUTED }}>{String(o.description || '')}</p>
                  <button type="button" onClick={() => { setForm((f) => ({ ...f, position: String(o.title) })); scrollToId('career-apply'); }}
                    className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#063D30] px-5 py-2 text-sm font-semibold normal-case tracking-normal text-white transition hover:bg-[#24593A]">
                    Apply now <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 4. Growth + application */}
        <section id="career-apply" aria-labelledby="growth-heading" className="grid scroll-mt-28 gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
          <div>
            <Eyebrow>Your future starts here</Eyebrow>
            <h2 id="growth-heading" className="mt-2 text-[1.7rem] font-normal normal-case leading-tight tracking-tight sm:text-4xl" style={{ fontFamily: SERIF, color: DARK }}>
              More Than a Job. A Path to Growth.
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-7" style={{ color: MUTED }}>
              At IGO Agri Estate, we aim to create an environment where people can strengthen their expertise, take on new responsibilities and build meaningful careers.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {GROWTH.map(({ Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-white/70 bg-[#F1F7EC] p-5 shadow-[0_14px_30px_-26px_rgba(6,61,48,0.5)]">
                  <div className="flex items-center gap-3">
                    <Icon size={26} strokeWidth={1.5} style={{ color: MID }} aria-hidden="true" />
                    <h3 className="text-[15px] font-semibold normal-case tracking-normal" style={{ color: DARK }}>{title}</h3>
                  </div>
                  <p className="mt-2 text-[13px] leading-5" style={{ color: MUTED }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            aria-labelledby="apply-heading"
            className="relative overflow-hidden rounded-[24px] border border-white/80 bg-[#F4F9F0] p-6 shadow-[0_22px_46px_-30px_rgba(6,61,48,0.5)] sm:p-7"
          >
            <Sprout aria-hidden="true" size={84} strokeWidth={1} className="pointer-events-none absolute right-5 top-3 text-[#C2D9BC]" />
            <Eyebrow>Take the next step</Eyebrow>
            <h2 id="apply-heading" className="mt-1.5 text-[1.5rem] font-normal normal-case leading-tight tracking-tight sm:text-[1.8rem]" style={{ fontFamily: SERIF, color: DARK }}>
              Ready to Grow With Us?
            </h2>
            <p className="mt-2 max-w-md text-[13.5px] leading-6" style={{ color: MUTED }}>
              We would love to hear from you. Tell us about your experience, interests and the kind of impact you want to make.
            </p>

            {status === 'done' ? (
              <div role="status" className="mt-6 rounded-xl border border-[#9CC59A] bg-white/80 p-5 text-[#123C37]">
                <p className="flex items-center gap-2 font-semibold"><CheckCircle2 size={20} className="text-[#2F7D5B]" aria-hidden="true" /> Application received</p>
                <p className="mt-2 text-sm leading-6">Thank you for applying to IGO Agri Estate. Our team will review your details and get in touch if there is a suitable opportunity.</p>
              </div>
            ) : (
              <>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="career-fullName" className="text-xs font-semibold text-[#123C37]">Full Name <span className="text-[#B42318]" aria-hidden="true">*</span></label>
                    <input id="career-fullName" name="fullName" type="text" autoComplete="name" required maxLength={120} value={form.fullName} onChange={set('fullName')} placeholder="Enter your full name" aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? 'err-fullName' : undefined} className={`${fieldBase} ${invalid('fullName')}`} />
                    <FieldError id="err-fullName" msg={errors.fullName} />
                  </div>
                  <div>
                    <label htmlFor="career-email" className="text-xs font-semibold text-[#123C37]">Email Address <span className="text-[#B42318]" aria-hidden="true">*</span></label>
                    <input id="career-email" name="email" type="email" autoComplete="email" required maxLength={200} value={form.email} onChange={set('email')} placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'err-email' : undefined} className={`${fieldBase} ${invalid('email')}`} />
                    <FieldError id="err-email" msg={errors.email} />
                  </div>
                  <div>
                    <label htmlFor="career-phone" className="text-xs font-semibold text-[#123C37]">Phone Number <span className="text-[#B42318]" aria-hidden="true">*</span></label>
                    <input id="career-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={25} value={form.phone} onChange={set('phone')} placeholder="Enter your contact number" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'err-phone' : undefined} className={`${fieldBase} ${invalid('phone')}`} />
                    <FieldError id="err-phone" msg={errors.phone} />
                  </div>
                  <div>
                    <label htmlFor="career-position" className="text-xs font-semibold text-[#123C37]">Position Applying For <span className="text-[#B42318]" aria-hidden="true">*</span></label>
                    <input id="career-position" name="position" type="text" required maxLength={160} value={form.position} onChange={set('position')} placeholder="Enter the role you're interested in" aria-invalid={!!errors.position} aria-describedby={errors.position ? 'err-position' : undefined} className={`${fieldBase} ${invalid('position')}`} />
                    <FieldError id="err-position" msg={errors.position} />
                  </div>
                </div>

                <fieldset className="mt-4">
                  <legend className="text-xs font-semibold text-[#123C37]">Experience Level</legend>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                    {EXPERIENCE.map((x) => (
                      <label key={x} className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-[#4F6A66]">
                        <input type="radio" name="experience" value={x} checked={form.experience === x} onChange={set('experience')} className="h-4 w-4 accent-[#24593A]" />
                        {x}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="mt-4">
                  <label htmlFor="career-about" className="text-xs font-semibold text-[#123C37]">Tell Us About Yourself <span className="text-[#B42318]" aria-hidden="true">*</span></label>
                  <textarea id="career-about" name="about" rows={4} required maxLength={4000} value={form.about} onChange={set('about')} placeholder="Share your skills, qualifications and relevant experience" aria-invalid={!!errors.about} aria-describedby={errors.about ? 'err-about' : undefined} className={`${fieldBase} resize-y ${invalid('about')}`} />
                  <FieldError id="err-about" msg={errors.about} />
                </div>

                <div className="mt-4">
                  <label htmlFor="career-resume" className="text-xs font-semibold text-[#123C37]">Resume (PDF, DOC or DOCX, up to 5 MB)</label>
                  <div className={`mt-1.5 flex items-center gap-3 rounded-lg border bg-white/80 px-3 py-2 ${invalid('resume')}`}>
                    <Upload size={16} className="shrink-0 text-[#24593A]" aria-hidden="true" />
                    <input
                      ref={fileInput}
                      id="career-resume"
                      name="resume"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={onFile}
                      aria-invalid={!!errors.resume}
                      aria-describedby={errors.resume ? 'err-resume' : undefined}
                      className="w-full min-w-0 text-[13px] text-[#4F6A66] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#24593A] file:px-3.5 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                    />
                  </div>
                  <FieldError id="err-resume" msg={errors.resume} />
                </div>

                {/* honeypot: hidden from people, filled by bots */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>Leave this field empty<input type="text" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} /></label>
                </div>

                <div aria-live="polite">
                  {status === 'failed' && (
                    <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-[#F0B7B1] bg-[#FDECEA] px-3.5 py-2.5 text-[13px] text-[#8A1C12]">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {failMsg}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#24593A] px-6 py-3 text-sm font-semibold normal-case tracking-normal text-white transition hover:bg-[#1c4a2f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24593A] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === 'sending' ? (<><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Submitting…</>) : (<>Prepare My Application <ArrowRight size={16} aria-hidden="true" /></>)}
                </button>
                <p className="mt-3 text-[11px] leading-4 text-[#6B7A76]">Your details are used only to review your application. Resumes are stored privately.</p>
              </>
            )}
          </form>
        </section>

        {/* 5. Culture */}
        <section aria-labelledby="culture-heading" className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-10">
          <div>
            <Eyebrow>Life at IGO Agri Estate</Eyebrow>
            <h2 id="culture-heading" className="mt-2 text-[1.7rem] font-normal normal-case leading-tight tracking-tight sm:text-4xl" style={{ fontFamily: SERIF, color: DARK }}>
              A Team Driven by Land, Growth and Possibility
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-7" style={{ color: MUTED }}>
              We believe that meaningful progress comes from people who share ideas, work together and take pride in what they build. At IGO Agri Estate, our goal is to bring together passionate individuals who want to contribute to responsible land development and the future of agricultural investment.
            </p>
            <h3 className="mt-5 text-lg font-semibold normal-case tracking-normal" style={{ fontFamily: SERIF, color: DARK }}>Bring Your Ideas. Build Something Meaningful.</h3>
            <p className="mt-2 max-w-xl text-[14px] leading-6" style={{ color: MUTED }}>
              Whether you are starting your career or bringing years of professional experience, we welcome people who are ready to learn, collaborate and make a difference.
            </p>
            <p className="mt-4 text-[1.35rem] italic" style={{ fontFamily: SERIF, color: MID }}>Your next opportunity could start here.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <img src={img('culture-main')} alt="Colleagues planning together in a green farm field" loading="lazy" className="col-span-2 aspect-[16/9] w-full rounded-2xl object-cover shadow-md sm:col-span-1 sm:row-span-2 sm:aspect-auto sm:h-full" />
            <img src={img('culture-a')} alt="Site engineer inspecting agricultural land" loading="lazy" className="aspect-[16/10] w-full rounded-2xl object-cover shadow-md" />
            <img src={img('culture-b')} alt="Team members collaborating in the office" loading="lazy" className="aspect-[16/10] w-full rounded-2xl object-cover shadow-md" />
          </div>
        </section>

        {/* 6. CTA banner */}
        <section aria-labelledby="careers-cta-heading" className="relative isolate overflow-hidden rounded-[26px] bg-[#0B3B2D]">
          <img src={img('c4')} alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20" />
          <div className="flex flex-col gap-6 px-6 py-9 sm:px-10 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-5">
              <Sprout size={40} strokeWidth={1.3} className="mt-1 hidden shrink-0 text-white sm:block" aria-hidden="true" />
              <div>
                <h2 id="careers-cta-heading" className="text-[1.35rem] font-normal normal-case leading-snug tracking-normal text-white sm:text-[1.6rem]" style={{ fontFamily: SERIF }}>
                  Let&rsquo;s Build the Future of Agri Estate Together.
                </h2>
                <p className="mt-2 max-w-xl text-[14px] leading-6 text-white/85">
                  Discover a career where your skills, ideas and ambitions can help shape tomorrow&rsquo;s agricultural landscape.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => scrollToId('career-opportunities')}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#2F7A4E] px-6 py-3 text-sm font-semibold normal-case tracking-normal text-white transition hover:bg-[#3A8D5A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Explore Career Opportunities <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Careers;
