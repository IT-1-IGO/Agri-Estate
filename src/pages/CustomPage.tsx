import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { getDoc, resolveMedia, useCollection, subscribeCms } from '../admin/store';
import type { CmsItem } from '../admin/store';
import { CustomSection, customDocName } from '../cms/custom';

const SERIF = '"DM Serif Display","Playfair Display",Georgia,"Times New Roman",serif';
const DARK = '#063D30', MUTED = '#4F6A66';

const Btn: React.FC<{ label?: string; link?: string; light?: boolean }> = ({ label, link, light }) => {
  if (!label) return null;
  const cls = `mt-6 inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold normal-case tracking-normal transition ${light ? 'border border-white/80 text-white hover:bg-white hover:text-[#063D30]' : 'bg-[#063D30] text-white hover:bg-[#24593A]'}`;
  return /^https?:/i.test(link || '') ? <a href={link} className={cls}>{label}</a> : <Link to={link || '/'} className={cls}>{label}</Link>;
};

const CustomPage: React.FC = () => {
  const { slug } = useParams();
  const [sp] = useSearchParams();
  const preview = sp.has('cms_preview');
  const { items } = useCollection<CmsItem>('customPages', []);
  const [, tick] = React.useState(0);
  React.useEffect(() => subscribeCms(() => tick((n) => n + 1)), []);
  const page = items.find((p) => p.slug === slug && (preview || p.status === 'published'));
  if (!page) {
    return <main className="flex min-h-[60vh] items-center justify-center bg-[#E4EEDC] px-6 pt-[76px]"><div className="text-center"><h1 className="text-3xl" style={{ fontFamily: SERIF, color: DARK }}>Page not found</h1><Link to="/" className="mt-4 inline-block text-[#24593A] underline">Back to home</Link></div></main>;
  }
  const d = getDoc(customDocName(page.id));
  const values = (preview && Object.keys(d.draft || {}).length ? d.draft : d.published) as { sections?: CustomSection[] };
  const sections = (values.sections || []).filter((s) => !s.hidden);
  return (
    <main className="min-h-screen bg-[#E4EEDC] pb-16 pt-[76px]">
      <SEO title={String(page.seoTitle || page.name)} description={String(page.seoDescription || page.name)} canonical={`/p/${page.slug}`} noIndex={preview} />
      {preview && <p className="bg-[#FFF1D6] px-4 py-2 text-center text-sm text-[#8A5A00]">Preview — this is the draft and is not public yet.</p>}
      {sections.length === 0 && <p className="px-6 py-20 text-center" style={{ color: MUTED }}>This page has no content yet.</p>}
      {sections.map((s) => {
        const img = resolveMedia(s.image);
        if (s.type === 'hero') return (
          <section key={s.id} className="relative isolate overflow-hidden bg-[#2B5A34] text-white">
            {img && <img src={img} alt={s.alt || ''} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />}
            <div className="mx-auto w-full max-w-[1480px] px-5 py-16 sm:px-6 md:py-24 lg:px-10"><div className="max-w-2xl">
              <h1 className="text-[2rem] font-normal normal-case leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.7rem]" style={{ fontFamily: SERIF }}>{s.heading}</h1>
              {s.subheading && <p className="mt-4 text-[15px] leading-7 text-white/90">{s.subheading}</p>}
              <Btn label={s.buttonLabel} link={s.buttonLink} light /></div></div>
          </section>);
        if (s.type === 'cards') return (
          <section key={s.id} className="mx-auto w-full max-w-[1480px] px-5 pt-12 sm:px-6 lg:px-10">
            <h2 className="text-[1.7rem] font-normal normal-case leading-tight tracking-tight sm:text-4xl" style={{ fontFamily: SERIF, color: DARK }}>{s.heading}</h2>
            {s.subheading && <p className="mt-3 max-w-xl text-[15px] leading-7" style={{ color: MUTED }}>{s.subheading}</p>}
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {(s.cards || []).map((c) => (
                <article key={c.id} className="flex flex-col overflow-hidden rounded-[22px] border border-white/70 bg-[#F1F7EC] p-3 shadow-[0_16px_36px_-26px_rgba(6,61,48,0.45)]">
                  {resolveMedia(c.image) && <img src={resolveMedia(c.image)} alt={c.alt || ''} loading="lazy" className="aspect-[16/8] w-full rounded-[14px] object-cover" />}
                  <div className="px-2 pb-2 pt-4"><h3 className="text-[16px] font-semibold normal-case leading-snug tracking-normal" style={{ color: DARK }}>{c.title}</h3><p className="mt-1.5 text-[13.5px] leading-6" style={{ color: MUTED }}>{c.text}</p></div>
                </article>))}
            </div>
          </section>);
        if (s.type === 'cta') return (
          <section key={s.id} className="mx-auto w-full max-w-[1480px] px-5 pt-12 sm:px-6 lg:px-10">
            <div className="rounded-[28px] bg-[#063D30] px-6 py-10 text-white sm:px-10"><h2 className="text-[1.5rem] font-normal normal-case leading-snug tracking-normal sm:text-[1.8rem]" style={{ fontFamily: SERIF }}>{s.heading}</h2>
              {s.body && <p className="mt-3 max-w-2xl text-[15px] leading-7 text-white/85">{s.body}</p>}<Btn label={s.buttonLabel} link={s.buttonLink} light /></div>
          </section>);
        return (
          <section key={s.id} className="mx-auto w-full max-w-[1480px] px-5 pt-12 sm:px-6 lg:px-10">
            <div className={`grid gap-8 ${s.type === 'imageText' && img ? 'md:grid-cols-2 md:items-center' : ''}`}>
              <div><h2 className="text-[1.7rem] font-normal normal-case leading-tight tracking-tight sm:text-4xl" style={{ fontFamily: SERIF, color: DARK }}>{s.heading}</h2>
                {s.body && <p className="mt-3 whitespace-pre-line text-[15px] leading-7" style={{ color: MUTED }}>{s.body}</p>}<Btn label={s.buttonLabel} link={s.buttonLink} /></div>
              {s.type === 'imageText' && img && <img src={img} alt={s.alt || ''} loading="lazy" className="w-full rounded-[22px] object-cover" />}
            </div>
          </section>);
      })}
    </main>
  );
};
export default CustomPage;
