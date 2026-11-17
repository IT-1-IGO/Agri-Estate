import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Apple, Calendar, Clock, Cpu, Droplets, Landmark, Leaf, MapPin, Recycle, Search, Sprout, Tractor, User, Wheat, X } from 'lucide-react';
import SEO from '../components/SEO';
import BlogCard from '../components/blog/BlogCard';
import NewsletterSection from '../components/blog/NewsletterSection';
import { BLOG_CATEGORIES, BlogPost, formatDate, getAllPosts, readingTime } from '../data/blogPosts';
import { BLOG_SYNC_EVENT, subscribeLocalSync } from '../lib/localSync';

const SERIF = '"DM Serif Display","Playfair Display",Georgia,"Times New Roman",serif';
const EASE = [0.22, 1, 0.36, 1] as const;
const PAGE_SIZE = 6;
const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>> = {
  landmark: Landmark, leaf: Leaf, apple: Apple, wheat: Wheat, sprout: Sprout, droplets: Droplets, recycle: Recycle, cpu: Cpu, tractor: Tractor, 'map-pin': MapPin,
};

/** Real site photographs, captioned only with what the picture shows. */
const PROJECT_PHOTOS = [
  { src: '/images/featured/maduranthagam-aerial.webp', alt: 'Aerial view of agricultural land in the Maduranthagam region', caption: 'Aerial view, Maduranthagam region' },
  { src: '/images/properties/maduranthagam-parcel-1.webp', alt: 'Maduranthagam agricultural land, Parcel 1', caption: 'Maduranthagam Agricultural Land: Parcel 1' },
  { src: '/images/properties/maduranthagam-parcel-2-sale.webp', alt: 'Maduranthagam agricultural land, Parcel 2, with a land for sale sign', caption: 'Maduranthagam Agricultural Land: Parcel 2' },
];

const scrollToId = (id: string, reduce: boolean) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
};

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, ease: EASE, delay }}>
      {children}
    </motion.div>
  );
};

const SectionHead: React.FC<{ eyebrow: string; title: string; text?: string; id?: string; action?: React.ReactNode }> = ({ eyebrow, title, text, id, action }) => (
  <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div className="max-w-2xl">
      <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#2d6a3e]"><span className="h-px w-8 bg-[#2d6a3e]" aria-hidden="true" />{eyebrow}</p>
      <h2 id={id} className="mt-3 text-[2rem] font-normal normal-case leading-[1.12] tracking-tight text-[#0f4d24] sm:text-4xl" style={{ fontFamily: SERIF }}>{title}</h2>
      {text && <p className="mt-3 text-base leading-relaxed text-[#5f7480]">{text}</p>}
    </div>
    {action}
  </div>
);

const BlogsPage: React.FC = () => {
  const reduce = !!useReducedMotion();
  const [params, setParams] = useSearchParams();
  const [, force] = useState(0);
  useEffect(() => subscribeLocalSync(BLOG_SYNC_EVENT, () => force((n) => n + 1)), []);

  const all: BlogPost[] = getAllPosts();
  const catSlug = params.get('category') || 'all';
  const activeCat = BLOG_CATEGORIES.find((c) => c.slug === catSlug);
  const [query, setQuery] = useState(params.get('q') || '');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const setCategory = (slug: string, scroll = true) => {
    const next = new URLSearchParams(params);
    if (slug === 'all') next.delete('category'); else next.set('category', slug);
    setParams(next, { replace: true }); setVisible(PAGE_SIZE);
    if (scroll) window.setTimeout(() => scrollToId('latest', reduce), 30);
  };

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => all.filter((p) =>
    (!activeCat || p.category === activeCat.name) &&
    (!q || `${p.title} ${p.excerpt} ${p.category} ${p.author}`.toLowerCase().includes(q))), [all, activeCat, q]);

  const featured = all.find((p) => p.featured) || all[0];
  const counts = useMemo(() => Object.fromEntries(BLOG_CATEGORIES.map((c) => [c.name, all.filter((p) => p.category === c.name).length])), [all]);
  const landPosts = all.filter((p) => p.group === 'land');
  const knowledge = all.filter((p) => p.group === 'knowledge');
  const projectPosts = all.filter((p) => p.category === 'IGO Project Updates');

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (query.trim()) next.set('q', query.trim()); else next.delete('q');
    setParams(next, { replace: true }); setVisible(PAGE_SIZE);
    scrollToId('latest', reduce);
  };
  const resetAll = () => { setQuery(''); setParams(new URLSearchParams(), { replace: true }); setVisible(PAGE_SIZE); };

  return (
    <main className="bg-[#FAF6EA] pt-[76px]">
      <SEO
        title="Blog | Agricultural Land & Farming Insights"
        description="Expert guides on agricultural land investment, organic farming, soil health, irrigation and sustainable agriculture from IGO Agri Estate."
        canonical="/blogs"
        keywords="agricultural land investment guide, farmland documents checklist, organic farming techniques, soil testing, drip irrigation, Tamil Nadu fruit crops, IGO Agri Estate blog"
        ogImage="https://www.igoagriestate.com/images/featured/vi-farmland-wide.webp"
        schema={[
          { '@context': 'https://schema.org', '@type': 'Blog', name: 'IGO Agri Estate Blog', url: 'https://www.igoagriestate.com/blogs', description: 'Insights on agricultural land, farming practices and sustainable agriculture.', publisher: { '@type': 'Organization', name: 'IGO Agri Estates', logo: { '@type': 'ImageObject', url: 'https://www.igoagriestate.com/images/logo.png' } } },
          { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.igoagriestate.com/' }, { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.igoagriestate.com/blogs' }] },
        ]}
      />

      {/* 1. Hero */}
      <section aria-labelledby="blog-hero-heading" className="relative isolate overflow-hidden">
        <motion.img
          src="/images/featured/vi-farmland-wide.webp" alt="" aria-hidden="true" fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: EASE }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#062b1c]/90 via-[#0b3a2c]/70 to-[#0b3a2c]/25" aria-hidden="true" />
        <Leaf className="pointer-events-none absolute -bottom-6 right-[6%] hidden -rotate-12 text-white/10 md:block" size={180} strokeWidth={1} aria-hidden="true" />
        <div className="container-pro py-20 sm:py-24 lg:py-28">
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#cfe9bd]"><span className="h-px w-8 bg-[#cfe9bd]" aria-hidden="true" />IGO Agri Estate Journal</p>
            <h1 id="blog-hero-heading" className="mt-4 text-[2.4rem] font-normal normal-case leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]" style={{ fontFamily: SERIF }}>Insights for a Greener Tomorrow</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">Discover expert insights on agricultural land investment, sustainable farming, and modern agricultural practices.</p>
            <form onSubmit={onSearch} role="search" className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search size={18} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#6b7f8c]" aria-hidden="true" />
                <label htmlFor="blog-search" className="sr-only">Search articles</label>
                <input id="blog-search" type="search" value={query} onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE); }} placeholder="Search articles, topics, crops…"
                  className="min-h-[54px] w-full rounded-full border border-white/20 bg-white pl-12 pr-5 text-base normal-case text-[#10231D] placeholder:text-[#7a8c86] focus:outline-none focus:ring-4 focus:ring-[#9bd68a]/60" />
              </div>
              <button type="submit" className="min-h-[54px] rounded-full bg-[#e4f27a] px-8 text-base font-bold normal-case tracking-normal text-[#0f4d24] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#eef78f] hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60">Search</button>
            </form>
            <button type="button" onClick={() => scrollToId('latest', reduce)} className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold normal-case tracking-normal text-white underline-offset-4 hover:underline">
              Explore Articles <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>


      {/* 3. Categories: one photograph per topic */}
      <section aria-labelledby="cats-heading" className="bg-[#EEF1E4] py-14 md:py-20">
        <div className="container-pro">
          <SectionHead eyebrow="Explore" title="Explore Blog Categories" id="cats-heading" text="Choose a topic to see the articles written for it." />
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {BLOG_CATEGORIES.map((c, i) => {
              const Icon = ICONS[c.icon] || Leaf; const n = counts[c.name] || 0; const on = activeCat?.slug === c.slug;
              return (
                <li key={c.slug}>
                  <Reveal delay={(i % 5) * 0.05} className="h-full">
                    <button type="button" onClick={() => setCategory(c.slug)} aria-pressed={on}
                      className={`group flex h-full w-full flex-col overflow-hidden rounded-[22px] border text-left shadow-[0_14px_30px_-24px_rgba(15,77,36,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_44px_-24px_rgba(15,77,36,0.55)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9bd68a] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${on ? 'border-[#0f4d24] bg-[#0f4d24] text-white' : 'border-[#dfe5d0] bg-white text-[#0f4d24]'}`}>
                      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-[#E4EAD8]">
                        <img src={c.image} alt={c.imageAlt} loading="lazy" width={640} height={480} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                        <span className="absolute inset-0 bg-gradient-to-t from-[#062b1c]/55 via-transparent to-transparent" aria-hidden="true" />
                        <span className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#0f4d24] shadow"><Icon size={18} strokeWidth={1.7} aria-hidden={true} /></span>
                      </span>
                      <span className="flex flex-1 flex-col p-4">
                        <span className="text-[1.02rem] font-bold normal-case leading-snug tracking-normal">{c.name}</span>
                        <span className={`mt-1.5 text-[0.85rem] leading-snug ${on ? 'text-white/80' : 'text-[#5f7480]'}`}>{c.description}</span>
                        <span className={`mt-auto pt-3 text-xs font-semibold ${on ? 'text-[#e4f27a]' : 'text-[#2d6a3e]'}`}>{n > 0 ? `${n} article${n > 1 ? 's' : ''}` : 'Coming soon'}</span>
                      </span>
                    </button>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 6. Farming knowledge: tall photo cards */}
      <section aria-labelledby="know-heading" className="py-14 md:py-20">
        <div className="container-pro">
          <SectionHead eyebrow="Expert Guides" title="Farming Knowledge & Expert Guides" id="know-heading" text="Everyday know-how on crops, soil, water and sustainable practices." />
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {knowledge.map((p, i) => (
              <li key={p.slug}>
                <Reveal delay={(i % 4) * 0.05}>
                  <Link to={`/blogs/${p.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-[24px] bg-[#E4EAD8] shadow-[0_18px_40px_-28px_rgba(15,77,36,0.55)]">
                    <img src={p.image} alt={p.imageAlt} loading="lazy" width={600} height={800} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                    <span className="absolute inset-0 bg-gradient-to-t from-[#062b1c]/90 via-[#062b1c]/25 to-transparent" aria-hidden="true" />
                    <span className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#cfe9bd]">{p.category}</span>
                      <span className="mt-1.5 block text-[1.15rem] font-bold normal-case leading-snug tracking-normal">{p.title}</span>
                      <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold opacity-90">{readingTime(p)} <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8. Newsletter */}
      <NewsletterSection />
    </main>
  );
};

export default BlogsPage;
