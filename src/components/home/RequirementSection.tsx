import React, { useState } from 'react';
import { CheckCircle2, Loader2, MapPin, Sprout, Landmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { submitLead } from '../../lib/leadsService';

const LAND_ONLY = 'Land only (no project)';
const NOT_SURE = 'Not sure yet, advise me';

const PROJECTS = [
  'Polyhouse', 'Hydroponic', 'Vertical farming', 'Open cultivation', 'Horticulture',
  'Goat farming', 'Mushroom', 'Microgreens', 'Nursery', 'Floriculture',
  'Rooftop farming', 'Landscaping', 'Joint venture',
];

const field = 'w-full rounded-xl border border-black/15 bg-white px-4 py-3.5 text-[15px] text-[#0f4d24] outline-none transition focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/25';
const label = 'mb-1.5 block text-sm font-medium text-[#0f4d24]';

const RequirementSection: React.FC = () => {
  const { user } = useAuth();
  const [wants, setWants] = useState<'land' | 'project'>('project');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const get = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null)?.value?.trim() || '';
    const name = get('name') || (user?.user_metadata?.name as string) || '';
    const phone = get('phone') || (user?.user_metadata?.phone as string) || '';
    const email = get('email') || user?.email || '';
    const project = wants === 'land' ? LAND_ONLY : get('project') || NOT_SURE;

    setStatus('sending');
    try {
      const result = await submitLead({
        type: 'requirement',
        name,
        phone,
        email: email || undefined,
        asset_category: project,
        preferred_state: get('location') || undefined,
        size: get('acres') || undefined,
        budget: get('budget') || undefined,
        intent: wants === 'land' ? 'Buy land only' : 'Buy land with IGO Agri Tech project',
        notes: get('notes') || undefined,
      });
      if (result.success) {
        import('../../lib/trackingService').then((ts) => ts.identifyVisitor(name, email));
        setStatus('done');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="bg-[#F2F3F0] py-20 lg:py-28" aria-labelledby="requirement-heading">
      <div className="container-pro grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 items-start">
        <div className="lg:sticky lg:top-32">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1B5E20]">Tell us what you need</p>
          <h2 id="requirement-heading" className="mt-3 text-4xl md:text-5xl font-bold text-[#0f4d24] leading-[1.05] tracking-[-0.02em] normal-case [text-wrap:balance]">
            Can't find the right land or project?
          </h2>
          <p className="mt-5 max-w-md text-lg text-slate-600 leading-relaxed [text-wrap:pretty]">
            Share what you are looking for. Choose land only, or land with any IGO Agri Tech project, and the IGO team will come back to you.
          </p>
          <ul className="mt-8 space-y-4 text-slate-700">
            <li className="flex items-start gap-3"><Landmark className="mt-0.5 shrink-0 text-[#1B5E20]" size={20} /> Land only, if you already have your own plan</li>
            <li className="flex items-start gap-3"><Sprout className="mt-0.5 shrink-0 text-[#1B5E20]" size={20} /> Land with any of our farm projects, set up by IGO Agri Tech</li>
            <li className="flex items-start gap-3"><MapPin className="mt-0.5 shrink-0 text-[#1B5E20]" size={20} /> Tell us your preferred location and size</li>
          </ul>
        </div>

        <div className="rounded-[28px] bg-[#E8EBE6] p-6 sm:p-9 shadow-[0_30px_70px_-34px_rgba(15,77,36,0.55)]">
          {status === 'done' ? (
            <div role="status" className="flex items-start gap-3 rounded-2xl bg-[#eaf4e6] p-6 text-[#0f4d24]">
              <CheckCircle2 className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Thank you, your requirement is with the IGO team.</p>
                <p className="mt-1 text-sm">We will contact you soon. <button type="button" onClick={() => setStatus('idle')} className="font-semibold underline">Send another</button></p>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <fieldset>
                <legend className={label}>What are you looking for?</legend>
                <div role="radiogroup" className="grid grid-cols-2 gap-2 rounded-full bg-[#04210f]/[0.07] p-1">
                  {([['project', 'Land with a project'], ['land', 'Land only']] as const).map(([v, t]) => (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={wants === v}
                      onClick={() => setWants(v)}
                      className={`rounded-full py-2.5 text-sm font-semibold normal-case tracking-normal transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B5E20] ${wants === v ? 'bg-[#1B5E20] text-white shadow-md' : 'text-[#0f4d24] hover:bg-white/60'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>

              {wants === 'project' && (
                <div>
                  <label htmlFor="req-project" className={label}>Project type</label>
                  <select id="req-project" name="project" defaultValue={NOT_SURE} className={field}>
                    <option>{NOT_SURE}</option>
                    {PROJECTS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              )}

              {!user && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="req-name" className={label}>Full name</label>
                    <input id="req-name" name="name" required autoComplete="name" className={field} />
                  </div>
                  <div>
                    <label htmlFor="req-phone" className={label}>Phone</label>
                    <input id="req-phone" name="phone" type="tel" required autoComplete="tel" placeholder="+91" className={field} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="req-email" className={label}>Email (optional)</label>
                    <input id="req-email" name="email" type="email" autoComplete="email" className={field} />
                  </div>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="req-location" className={label}>Preferred location</label>
                  <input id="req-location" name="location" placeholder="e.g. Maduranthagam" className={field} />
                </div>
                <div>
                  <label htmlFor="req-acres" className={label}>Land size (acres)</label>
                  <input id="req-acres" name="acres" inputMode="decimal" placeholder="e.g. 2" className={field} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="req-budget" className={label}>Budget (optional)</label>
                  <input id="req-budget" name="budget" placeholder="e.g. 50 lakhs" className={field} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="req-notes" className={label}>Anything else (optional)</label>
                  <textarea id="req-notes" name="notes" rows={3} className={field} />
                </div>
              </div>

              {status === 'error' && <p role="alert" className="text-red-700">We couldn't send that. Please try again or call +91 73977 89803.</p>}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#144a18] hover:shadow-lg active:scale-[0.98] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B5E20]"
              >
                {status === 'sending' && <Loader2 className="animate-spin" size={18} />} Submit requirement
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default RequirementSection;
