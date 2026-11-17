import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, Check, ChevronRight, Clock, Lightbulb, Link2, MessageCircle, User } from 'lucide-react';
import SEO from '../components/SEO';
import BlogCard from '../components/blog/BlogCard';
import NewsletterSection from '../components/blog/NewsletterSection';
import { BLOG_CATEGORIES, formatDate, getAllPosts, getPost, readingTime } from '../data/blogPosts';

const SERIF = '"DM Serif Display","Playfair Display",Georgia,"Times New Roman",serif';
const SITE = 'https://www.igoagriestate.com';

/** A relevant second photograph per topic, shown inside the article. */
const INLINE_IMAGE: Record<string, { src: string; alt: string }> = {
  'Land Investment': { src: '/images/categories/agricultural-land.webp', alt: 'Agricultural land ready for cultivation' },
  'Land Development': { src: '/images/featured/farm-development.webp', alt: 'Farm land being prepared for cultivation' },
  'Organic Farming': { src: '/images/categories/microgreens.webp', alt: 'Fresh green crops grown with natural methods' },
  Horticulture: { src: '/images/categories/horticulture.webp', alt: 'Horticulture crops growing in rows' },
  'Crop Cultivation': { src: '/images/categories/plantation.webp', alt: 'Cultivated crops in a plantation' },
  'Soil Health': { src: '/images/categories/microgreens.webp', alt: 'Healthy young plants growing in fertile soil' },
  'Irrigation & Water Management': { src: '/images/categories/hydroponic.webp', alt: 'Crops grown with efficient water use' },
  'Sustainable Agriculture': { src: '/images/categories/plantation.webp', alt: 'Sustainable plantation with ground cover' },
  'Agricultural Technology': { src: '/images/categories/protected.webp', alt: 'Protected cultivation structure' },
};

const idOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const BlogDetail: React.FC = () => {
  const { slug = '' } = useParams();
  const post = getPost(slug);
  const [active, setActive] = useState('');
  const [copied, setCopied] = useState(false);
  const url = `${SITE}/blogs/${slug}`;

  const toc = useMemo(() => (post ? post.sections.map((s) => ({ id: idOf(s.heading), label: s.heading })) : []), [post]);
  const related = useMemo(() => {
    if (!post) return [];
    const others = getAllPosts().filter((p) => p.slug !== post.slug);
    return [...others.filter((p) => p.category === post.category), ...others.filter((p) => p.category !== post.category)].slice(0, 3);
  }, [post]);

  useEffect(() => {
    if (!post || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-20% 0px -65% 0px' });
    toc.forEach((t) => { const el = document.getElementById(t.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [post, toc]);

  if (!post) {
    return (
      <main className="bg-[#FAF6EA] pb-24 pt-[76px]">
        <SEO title="Article not found" description="This article could not be found." canonical={`/blogs/${slug}`} noIndex />
        <div className="container-pro py-24 text-center">
          <h1 className="text-3xl text-[#0f4d24]" style={{ fontFamily: SERIF }}>We couldn’t find that article</h1>
          <p className="mt-3 text-[#5f7480]">It may have been moved or removed.</p>
          <Link to="/blogs" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0f4d24] px-7 py-3.5 text-[15px] font-semibold normal-case tracking-normal text-white hover:bg-[#0b3a2c]"><ArrowLeft size={16} aria-hidden="true" />Back to all articles</Link>
        </div>
      </main>
    );
  }

  const cat = BLOG_CATEGORIES.find((c) => c.name === post.category);
  const inline = INLINE_IMAGE[post.category];
  const shareText = encodeURIComponent(`${post.title} | IGO Agri Estate`);
  const shareUrl = encodeURIComponent(url);
  const copy = async () => { try { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ } };
  const go = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); };
  const absImg = post.image.startsWith('http') ? post.image : `${SITE}${post.image}`;

  const share = (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Share this article">
      <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E4EAD8] text-[#0f4d24] transition-colors hover:bg-[#0f4d24] hover:text-white"><MessageCircle size={18} aria-hidden="true" /></a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E4EAD8] text-[#0f4d24] transition-colors hover:bg-[#0f4d24] hover:text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E4EAD8] text-[#0f4d24] transition-colors hover:bg-[#0f4d24] hover:text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
      </a>
      <button type="button" onClick={copy} aria-label="Copy link" className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#E4EAD8] px-4 text-sm font-semibold normal-case tracking-normal text-[#0f4d24] transition-colors hover:bg-[#0f4d24] hover:text-white">{copied ? <><Check size={16} aria-hidden="true" />Copied</> : <><Link2 size={16} aria-hidden="true" />Copy link</>}</button>
    </div>
  );

  return (
    <main className="bg-[#FAF6EA] pb-0 pt-[76px]">
      <SEO
        title={post.title}
        description={post.excerpt}
        canonical={`/blogs/${post.slug}`}
        ogImage={absImg}
        ogType="article"
        keywords={`${post.category}, ${post.title}, IGO Agri Estate`}
        schema={[
          { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.excerpt, image: absImg, datePublished: post.date, dateModified: post.date, author: { '@type': 'Organization', name: post.author }, publisher: { '@type': 'Organization', name: 'IGO Agri Estates', logo: { '@type': 'ImageObject', url: `${SITE}/images/logo.png` } }, mainEntityOfPage: url },
          { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` }, { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blogs` }, { '@type': 'ListItem', position: 3, name: post.title, item: url }] },
        ]}
      />

      <article>
        <header className="bg-gradient-to-b from-[#EEF1E4] to-[#FAF6EA]">
          <div className="container-pro pb-8 pt-8 md:pt-12">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-[#5f7480]">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li><Link to="/" className="hover:text-[#0f4d24] hover:underline">Home</Link></li>
                <li aria-hidden="true"><ChevronRight size={14} /></li>
                <li><Link to="/blogs" className="hover:text-[#0f4d24] hover:underline">Blog</Link></li>
                <li aria-hidden="true"><ChevronRight size={14} /></li>
                <li className="max-w-[60vw] truncate font-semibold text-[#0f4d24]" aria-current="page">{post.title}</li>
              </ol>
            </nav>
            <div className="max-w-3xl">
              <Link to={cat ? `/blogs?category=${cat.slug}` : '/blogs'} className="inline-block rounded-full border border-[#2d6a3e]/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-[#2d6a3e] transition-colors hover:bg-[#2d6a3e] hover:text-white">{post.category}</Link>
              <h1 className="mt-4 text-[2.1rem] font-normal normal-case leading-[1.12] tracking-tight text-[#0f4d24] sm:text-5xl" style={{ fontFamily: SERIF }}>{post.title}</h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#5f7480]">
                <span className="inline-flex items-center gap-1.5"><User size={15} aria-hidden="true" />{post.author}</span>
                <span className="inline-flex items-center gap-1.5"><Calendar size={15} aria-hidden="true" /><time dateTime={post.date}>{formatDate(post.date)}</time></span>
                <span className="inline-flex items-center gap-1.5"><Clock size={15} aria-hidden="true" />{readingTime(post)}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="container-pro">
          <figure className="overflow-hidden rounded-[26px] bg-[#E4EAD8] shadow-[0_26px_60px_-34px_rgba(15,77,36,0.5)]">
            <img src={post.image} alt={post.imageAlt} width={1280} height={720} fetchPriority="high" className="aspect-[16/8] w-full object-cover" />
          </figure>

          <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,720px)_280px] lg:justify-center lg:gap-16 lg:py-16">
            <div className="min-w-0">
              {post.intro && <p className="text-[1.15rem] leading-[1.8] text-[#274a3d] sm:text-[1.25rem]">{post.intro}</p>}

              {/* Mobile table of contents */}
              {toc.length > 1 && (
                <nav aria-label="Table of contents" className="mt-8 rounded-2xl border border-[#dfe5d0] bg-white p-5 lg:hidden">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2d6a3e]">In this article</p>
                  <ol className="mt-3 flex flex-col gap-2 text-[0.95rem]">{toc.map((t) => <li key={t.id}><a href={`#${t.id}`} onClick={go(t.id)} className="text-[#0f4d24] hover:underline">{t.label}</a></li>)}</ol>
                </nav>
              )}

              {post.sections.map((s, i) => (
                <section key={s.heading} aria-labelledby={idOf(s.heading)} className="mt-10">
                  <h2 id={idOf(s.heading)} className="scroll-mt-28 text-[1.6rem] font-normal normal-case leading-tight tracking-tight text-[#0f4d24] sm:text-[1.9rem]" style={{ fontFamily: SERIF }}>{s.heading}</h2>
                  {s.paragraphs.map((p, j) => <p key={j} className="mt-4 text-[1.05rem] leading-[1.85] text-[#33424a]">{p}</p>)}
                  {s.list && <ul className="mt-5 grid gap-2.5">{s.list.map((li) => <li key={li} className="flex items-start gap-3 text-[1.02rem] leading-relaxed text-[#33424a]"><Check size={18} className="mt-1 shrink-0 text-[#2a8a3a]" aria-hidden="true" />{li}</li>)}</ul>}
                  {s.tip && <aside className="mt-6 flex gap-3 rounded-2xl border border-[#d9e5c2] bg-[#F1F6E4] p-5"><Lightbulb size={22} className="mt-0.5 shrink-0 text-[#2a8a3a]" aria-hidden="true" /><p className="text-[0.98rem] leading-relaxed text-[#274a3d]"><strong className="font-bold">Tip: </strong>{s.tip}</p></aside>}
                  {i === 0 && inline && (
                    <figure className="mt-8 overflow-hidden rounded-2xl">
                      <img src={inline.src} alt={inline.alt} loading="lazy" width={1024} height={576} className="aspect-[16/9] w-full object-cover" />
                      <figcaption className="mt-2 text-sm text-[#6b7f8c]">{inline.alt}</figcaption>
                    </figure>
                  )}
                </section>
              ))}

              {post.takeaways.length > 0 && (
                <section aria-labelledby="takeaways-heading" className="mt-12 rounded-[24px] bg-[#0f4d24] p-7 text-white sm:p-9">
                  <h2 id="takeaways-heading" className="text-[1.5rem] font-normal normal-case tracking-tight" style={{ fontFamily: SERIF }}>Key Takeaways</h2>
                  <ul className="mt-4 grid gap-3">{post.takeaways.map((t) => <li key={t} className="flex items-start gap-3 text-[1rem] leading-relaxed text-white/90"><Check size={18} className="mt-1 shrink-0 text-[#e4f27a]" aria-hidden="true" />{t}</li>)}</ul>
                </section>
              )}

              {!post.fromAdmin && <p className="mt-8 text-sm leading-relaxed text-[#6b7f8c]">This article is general information for readers. It is not legal, financial or agronomic advice. Always confirm documents and local rules with a qualified professional and your local authorities.</p>}

              <div className="mt-8 flex flex-col gap-3 border-t border-[#e6dfc7] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-semibold text-[#0f4d24]">Share this article</span>
                {share}
              </div>

              {/* Enquiry CTA */}
              <div className="mt-10 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#F4F7EA] to-[#E5EDD4] p-7 shadow-sm sm:p-9">
                <h2 className="text-[1.6rem] font-normal normal-case leading-tight tracking-tight text-[#0f4d24]" style={{ fontFamily: SERIF }}>Looking at agricultural land?</h2>
                <p className="mt-2 text-[#4f6a66]">Talk to the IGO Agri Estate team about verified land, farm project models and site visits.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to="/contact" className="group/btn inline-flex items-center gap-2 rounded-full bg-[#0f4d24] px-6 py-3 text-[15px] font-semibold normal-case tracking-normal text-white transition-all hover:-translate-y-0.5 hover:bg-[#0b3a2c]">Enquire Now <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" aria-hidden="true" /></Link>
                  <Link to="/projects" className="inline-flex items-center gap-2 rounded-full border border-[#0f4d24]/30 px-6 py-3 text-[15px] font-semibold normal-case tracking-normal text-[#0f4d24] transition-colors hover:bg-white">Explore Our Projects</Link>
                </div>
              </div>
            </div>

            {/* Sticky table of contents (desktop) */}
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                {toc.length > 1 && (
                  <nav aria-label="Table of contents" className="rounded-2xl border border-[#dfe5d0] bg-white p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2d6a3e]">In this article</p>
                    <ol className="mt-3 flex flex-col gap-1 border-l border-[#dfe5d0]">
                      {toc.map((t) => (
                        <li key={t.id}><a href={`#${t.id}`} onClick={go(t.id)} aria-current={active === t.id ? 'true' : undefined} className={`-ml-px block border-l-2 py-1.5 pl-4 text-[0.92rem] leading-snug transition-colors ${active === t.id ? 'border-[#2a8a3a] font-semibold text-[#0f4d24]' : 'border-transparent text-[#5f7480] hover:text-[#0f4d24]'}`}>{t.label}</a></li>
                      ))}
                    </ol>
                  </nav>
                )}
                <div className="mt-5 rounded-2xl border border-[#dfe5d0] bg-white p-5"><p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#2d6a3e]">Share</p>{share}</div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="bg-[#EEF1E4] py-14 md:py-16">
          <div className="container-pro">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 id="related-heading" className="text-[1.8rem] font-normal normal-case leading-tight tracking-tight text-[#0f4d24] sm:text-3xl" style={{ fontFamily: SERIF }}>Related Articles</h2>
              <Link to="/blogs" className="inline-flex items-center gap-1.5 text-sm font-semibold normal-case tracking-normal text-[#0f4d24] hover:underline">All articles <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
            <ul className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{related.map((p) => <li key={p.slug}><BlogCard post={p} /></li>)}</ul>
          </div>
        </section>
      )}

      <NewsletterSection />
    </main>
  );
};

export default BlogDetail;
