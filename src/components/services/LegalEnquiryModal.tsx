import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { submitLead } from '../../lib/leadsService';

export type LegalEnquiryMode = 'consultation' | 'verify' | 'request' | 'valuation-expert' | 'valuation-request' | 'tax-consult' | 'tax-advisor';

const COPY: Record<LegalEnquiryMode, { title: string; sub: string; cta: string }> = {
  consultation: { title: 'Get Legal Consultation', sub: 'Tell us about your land and our legal experts will call you back.', cta: 'Request Consultation' },
  verify: { title: 'Verify Your Property', sub: 'Share the property details and we will start the legal verification.', cta: 'Submit for Verification' },
  'valuation-expert': { title: 'Talk to Valuation Expert', sub: 'Share your details and a valuation expert will call you back.', cta: 'Request a Call Back' },
  'valuation-request': { title: 'Request Professional Valuation', sub: 'Get expert analysis for your land investment.', cta: 'Request a Valuation' },
  'tax-consult': { title: 'Request a Consultation', sub: 'Share your details and our team will contact you about your land tax planning.', cta: 'Request Consultation' },
  'tax-advisor': { title: 'Talk to a Tax Advisor', sub: 'Speak with our team to understand your options before your next property decision.', cta: 'Request a Call Back' },
  request: { title: 'Request a Consultation', sub: 'Consult with our legal experts for hassle-free land transactions.', cta: 'Request Consultation' },
};

const LegalEnquiryModal: React.FC<{ mode: LegalEnquiryMode | null; onClose: () => void }> = ({ mode, onClose }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', property: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!mode) return;
    setDone(false); setErrors({});
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [mode, onClose]);

  if (!mode) return null;
  const c = COPY[mode];
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (form.name.trim().length < 2) er.name = 'Please enter your name.';
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/[\s-]/g, '').replace(/^(\+91|91)/, ''))) er.phone = 'Enter a valid 10-digit mobile number.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email address.';
    if (mode === 'verify' && form.property.trim().length < 3) er.property = 'Enter the survey number or location.';
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      await submitLead({
        type: 'contact',
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        property_title: form.property.trim() || undefined,
        intent: c.title,
        notes: `${mode.startsWith('valuation') ? 'Land Valuation' : mode.startsWith('tax') ? 'Tax Planning' : 'Legal Services'} enquiry: ${c.title}\nProperty: ${form.property || '-'}\n${form.message}`.trim(),
      });
    } catch { /* the lead service already falls back to local storage */ }
    setBusy(false);
    setDone(true);
  };

  const input = (err?: string) =>
    `w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-[#1f6b3a]/30 ${err ? 'border-red-400' : 'border-slate-300 focus:border-[#1f6b3a]'}`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-label={c.title} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-[#fbf6e9] p-6 shadow-2xl sm:p-8">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-full p-1.5 text-slate-600 hover:bg-black/5"><X size={20} /></button>
        {done ? (
          <div className="py-6 text-center">
            <CheckCircle2 size={52} className="mx-auto text-[#2e9b3f]" />
            <h3 className="mt-4 text-2xl font-bold normal-case text-[#0f3d28]">Thank you!</h3>
            <p className="mt-2 text-sm text-slate-700">Your request has been received. Our legal team will contact you shortly.</p>
            <button onClick={onClose} className="mt-6 rounded-full bg-[#0f3d28] px-6 py-2.5 text-sm font-bold text-white">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-3.5">
            <h3 className="pr-8 text-2xl font-bold normal-case leading-tight text-[#0f3d28]" style={{ fontFamily: '"DM Serif Display","Playfair Display",Georgia,serif' }}>{c.title}</h3>
            <p className="text-sm text-slate-600">{c.sub}</p>
            <div>
              <input className={input(errors.name)} placeholder="Full name *" value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <input className={input(errors.phone)} placeholder="Mobile number *" inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>
            <div>
              <input className={input(errors.email)} placeholder="Email (optional)" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
            {mode === 'verify' && (
              <div>
                <input className={input(errors.property)} placeholder="Survey number / property location *" value={form.property} onChange={(e) => set('property', e.target.value)} />
                {errors.property && <p className="mt-1 text-xs text-red-600">{errors.property}</p>}
              </div>
            )}
            <textarea className={input()} rows={3} placeholder="Message (optional)" value={form.message} onChange={(e) => set('message', e.target.value)} />
            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0f3d28] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#165235] disabled:opacity-70">
              {busy && <Loader2 size={16} className="animate-spin" />} {busy ? 'Submitting…' : c.cta}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LegalEnquiryModal;
