import React, { useState } from 'react';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { crmEnabled, submitLead } from '../../lib/leadsService';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Newsletter sign-up. There is no mailing-list service, so the address is passed to the IGO team through the site's existing enquiry channel. */
const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!v) { setError('Please enter your email address.'); return; }
    if (!EMAIL_RE.test(v)) { setError('Please enter a valid email address, like name@example.com.'); return; }
    setError(''); setState('sending');
    try {
      const r = await submitLead({ crm_source: 'newsletter', form_name: 'Blog newsletter signup', enquiry_type: 'Newsletter Request', type: 'contact', name: 'Blog newsletter request', phone: '', email: v, intent: 'Blog updates', notes: '[BLOG NEWSLETTER] Please send agricultural insights and IGO Agri Estate updates.' });
      setState(r.success || !crmEnabled ? 'done' : 'error');
    } catch { setState('error'); }
  };

  return (
    <section aria-labelledby="newsletter-heading" className="bg-[#FAF6EA] py-16 md:py-20">
      <div className="container-pro">
        <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#0f4d24] via-[#124B3B] to-[#0b3a2c] px-6 py-12 text-white shadow-[0_30px_60px_-30px_rgba(15,77,36,0.7)] sm:px-12 md:py-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-[#4fa863]/10" aria-hidden="true" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10"><Mail size={22} aria-hidden="true" /></span>
              <h2 id="newsletter-heading" className="mt-5 text-3xl font-bold normal-case leading-tight tracking-tight sm:text-4xl" style={{ fontFamily: '"DM Serif Display","Playfair Display",Georgia,serif' }}>Grow Your Knowledge With Us</h2>
              <p className="mt-3 max-w-md text-base leading-relaxed text-white/80">Get the latest agricultural insights, investment guides, and IGO Agri Estate project updates.</p>
            </div>
            <div>
              {state === 'done' ? (
                <div role="status" className="flex items-start gap-3 rounded-2xl bg-white/10 p-5">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-[#9bd68a]" size={22} aria-hidden="true" />
                  <p className="text-[0.95rem] leading-relaxed">Thank you. Your email has been shared with the IGO Agri Estate team, who will be in touch with updates and guides.</p>
                </div>
              ) : (
                <form onSubmit={submit} noValidate>
                  <label htmlFor="nl-email" className="sr-only">Email address</label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input id="nl-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                      placeholder="Your email address" aria-invalid={!!error} aria-describedby={error ? 'nl-error' : undefined}
                      className="min-h-[52px] w-full flex-1 rounded-full border border-white/20 bg-white px-6 text-base normal-case text-[#10231D] placeholder:text-[#7a8c86] focus:outline-none focus:ring-4 focus:ring-[#9bd68a]/60" />
                    <button type="submit" disabled={state === 'sending'} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#e4f27a] px-8 text-base font-bold normal-case tracking-normal text-[#0f4d24] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#eef78f] hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 disabled:opacity-70">
                      {state === 'sending' ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" />Sending</> : 'Subscribe'}
                    </button>
                  </div>
                  {error && <p id="nl-error" role="alert" className="mt-3 text-sm text-[#ffd6d0]">{error}</p>}
                  {state === 'error' && <p role="alert" className="mt-3 text-sm text-[#ffd6d0]">We could not send that just now. Please try again in a moment.</p>}
                  <p className="mt-3 text-xs text-white/60">We use your email only to share agricultural insights and IGO Agri Estate news.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
