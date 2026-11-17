import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, User } from 'lucide-react';
import { BlogPost, formatDate, readingTime } from '../../data/blogPosts';

/** Standard article card: fixed 16:10 image, category label, title, excerpt, meta and a Read More link. */
const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => (
  <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-[#e6dfc7] bg-white shadow-[0_14px_34px_-26px_rgba(15,77,36,0.45)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_26px_50px_-26px_rgba(15,77,36,0.5)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
    <Link to={`/blogs/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-[#E4EAD8]" aria-label={post.title} tabIndex={-1}>
      <img src={post.image} alt={post.imageAlt} loading="lazy" width={800} height={500} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0f4d24] shadow-sm">{post.category}</span>
    </Link>
    <div className="flex flex-1 flex-col p-6">
      <h3 className="text-[1.2rem] font-bold normal-case leading-snug tracking-normal text-[#0f4d24]">
        <Link to={`/blogs/${post.slug}`} className="transition-colors hover:text-[#2a8a3a] focus-visible:outline-none focus-visible:underline">{post.title}</Link>
      </h3>
      <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-[#5f7480]">{post.excerpt}</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6b7f8c]">
        <span className="inline-flex items-center gap-1.5"><User size={13} aria-hidden="true" />{post.author}</span>
        <span className="inline-flex items-center gap-1.5"><Calendar size={13} aria-hidden="true" /><time dateTime={post.date}>{formatDate(post.date)}</time></span>
        <span className="inline-flex items-center gap-1.5"><Clock size={13} aria-hidden="true" />{readingTime(post)}</span>
      </div>
      <Link to={`/blogs/${post.slug}`} className="mt-5 inline-flex items-center gap-2 self-start text-sm font-bold normal-case tracking-normal text-[#0f4d24] transition-colors hover:text-[#2a8a3a]">
        Read More <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </Link>
    </div>
  </article>
);

export default BlogCard;
