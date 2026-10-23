import { isSupabaseConfigured, supabase } from './supabaseClient';

export const RESUME_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const RESUME_EXTENSIONS = ['pdf', 'doc', 'docx'] as const;
export const RESUME_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export interface CareerApplication {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  about: string;
}

export type CareerErrors = Partial<Record<keyof CareerApplication | 'resume', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Returns an error message for the resume file, or '' when it is acceptable. */
export const validateResume = (file: File | null): string => {
  if (!file) return '';
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!(RESUME_EXTENSIONS as readonly string[]).includes(ext)) return 'Please upload a PDF, DOC or DOCX file.';
  if (file.type && !RESUME_MIME_TYPES.includes(file.type)) return 'Please upload a PDF, DOC or DOCX file.';
  if (file.size === 0) return 'This file is empty. Please choose another file.';
  if (file.size > RESUME_MAX_BYTES) return 'The file is larger than 5 MB. Please upload a smaller file.';
  return '';
};

export const validateApplication = (d: CareerApplication, file: File | null): CareerErrors => {
  const e: CareerErrors = {};
  if (d.fullName.trim().length < 2) e.fullName = 'Please enter your full name.';
  if (!EMAIL_RE.test(d.email.trim())) e.email = 'Please enter a valid email address.';
  const digits = d.phone.replace(/[\s()+-]/g, '');
  if (!/^\d{10,15}$/.test(digits)) e.phone = 'Please enter a valid phone number (10 to 15 digits).';
  if (d.position.trim().length < 2) e.position = 'Please tell us which position you are applying for.';
  if (d.about.trim().length < 20) e.about = 'Please tell us a little more about yourself (at least 20 characters).';
  const r = validateResume(file);
  if (r) e.resume = r;
  return e;
};

const withTimeout = <T,>(p: PromiseLike<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    Promise.resolve(p).then(
      (v) => { clearTimeout(t); resolve(v); },
      (err) => { clearTimeout(t); reject(err); },
    );
  });

/**
 * Saves the application. The resume goes to the PRIVATE "resumes" storage bucket
 * (no public URL is ever created) and the record goes to the "career_applications"
 * table. Resolves only when the record has actually been saved; throws otherwise.
 * See database/careers_setup.sql for the required table, bucket and policies.
 */
export const submitCareerApplication = async (d: CareerApplication, file: File | null): Promise<void> => {
  if (!isSupabaseConfigured) throw new Error('not-configured');
  const clean = validateApplication(d, file);
  if (Object.keys(clean).length) throw new Error('invalid');

  let resumePath: string | null = null;
  if (file) {
    const ext = (file.name.split('.').pop() || 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '');
    resumePath = `${crypto.randomUUID()}/resume.${ext}`;
    const up = await withTimeout(
      supabase.storage.from('resumes').upload(resumePath, file, { contentType: file.type || undefined, upsert: false }),
      30000,
    );
    if (up.error) throw new Error('upload-failed');
  }

  const row = {
    full_name: d.fullName.trim(),
    email: d.email.trim().toLowerCase(),
    phone: d.phone.trim(),
    position: d.position.trim(),
    experience: d.experience || null,
    about: d.about.trim(),
    resume_path: resumePath,
  };
  const ins = await withTimeout(supabase.from('career_applications').insert([row]), 20000);
  if (ins.error) throw new Error('save-failed');
};
