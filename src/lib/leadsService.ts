import { isSupabaseConfigured, supabase, directPostgREST } from './supabaseClient';
import { addLocalLead, getLocalLeads, saveLocalLeads } from './localSync';

export interface LeadData {
  id?: string;
  created_at?: string;
  name: string;
  phone: string;
  email?: string;
  type: 'visit' | 'offer' | 'callback' | 'requirement' | 'contact';
  property_id?: string;
  property_title?: string;
  offer_amount?: number;
  preferred_date?: string;
  preferred_time?: string;
  asset_category?: string;
  preferred_state?: string;
  investment_size?: string;
  location?: string;
  budget?: string;
  size?: string;
  intent?: string;
  notes?: string;
  landType?: string;
  waterSource?: string;
  powerAccess?: string;
  estateCategory?: string;
  customTime?: string;
  // CRM routing (all optional; sensible defaults are derived when omitted)
  crm_source?: 'buy_land' | 'sell_land' | 'contact' | 'property' | 'consultation' | 'project' | 'callback' | 'popup' | 'services' | 'requirement' | 'newsletter';
  form_name?: string;
  enquiry_type?: string;
  address?: string;
  project?: string;
  extra?: Record<string, string | number | undefined>;
}


const CRM_API = ((import.meta as any).env?.VITE_API_URL as string | undefined)?.replace(/\/$/, '');
/** True when the website is connected to the admin CRM. Then every form waits for the CRM to confirm the save. */
export const crmEnabled = !!CRM_API;

export interface SubmitResult { success: boolean; code?: string; duplicate?: boolean; error?: string; mocked?: boolean; data?: unknown }

type CrmSource = 'buy_land' | 'sell_land' | 'contact' | 'property' | 'consultation' | 'project' | 'callback' | 'popup' | 'services' | 'requirement' | 'newsletter';
const sourceOf = (l: LeadData): CrmSource => {
  if (l.crm_source) return l.crm_source;
  if (/sell/i.test(l.intent || '') || (l.notes || '').includes('[SELL LAND')) return 'sell_land';
  if (l.type === 'visit' || l.type === 'offer') return 'property';
  if (l.type === 'requirement') return 'buy_land';
  if (l.type === 'callback') return 'callback';
  return 'contact';
};

const FRIENDLY = 'We could not save your enquiry just now. Please check your connection and try again.';

/** Sends one enquiry to the CRM and resolves only when the server has stored it (or failed). */
const postToCrm = async (l: LeadData): Promise<SubmitResult> => {
  const extra: Record<string, string | number | undefined> = {
    'Request type': l.type, Intent: l.intent, 'Offer amount': l.offer_amount, 'Preferred date': l.preferred_date, 'Preferred time': l.preferred_time || l.customTime,
    'Land type': l.landType, 'Water source': l.waterSource, 'Power access': l.powerAccess, 'Estate category': l.estateCategory, 'Asset category': l.asset_category,
    'Land size': l.size, 'Investment size': l.investment_size, 'Preferred state': l.preferred_state, 'Property reference': l.property_id && !/^\d+$/.test(String(l.property_id)) ? String(l.property_id) : undefined,
    ...(l.extra || {}),
  };
  const body = {
    source: sourceOf(l), enquiry_type: l.enquiry_type, form_name: l.form_name, website_page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    name: l.name, phone: l.phone || undefined, email: l.email || undefined, message: l.notes || undefined,
    property_id: l.property_id && /^\d+$/.test(String(l.property_id)) ? Number(l.property_id) : undefined, property_title: l.property_title,
    budget: l.budget || l.investment_size, location: l.location, address: l.address, interested_project: l.project,
    preferred_area: l.size, preferred_location: l.preferred_state || l.location, extra,
  };
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 20000);
  try {
    const res = await fetch(`${CRM_API}/api/public/enquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { success: true, code: data.code, duplicate: !!data.duplicate };
    if (res.status === 422) return { success: false, error: Object.values<string>(data.fields || {})[0] || data.error || 'Please check the details you entered.' };
    if (res.status === 429) return { success: false, error: 'Too many requests. Please wait a few minutes and try again.' };
    return { success: false, error: FRIENDLY };
  } catch { return { success: false, error: FRIENDLY }; } finally { clearTimeout(timer); }
};

const inflight = new Map<string, Promise<SubmitResult>>();

const legacySave = async (leadData: LeadData): Promise<SubmitResult> => {
  const payload: any = { ...leadData, created_at: new Date().toISOString() };
  delete payload.crm_source; delete payload.form_name; delete payload.enquiry_type; delete payload.extra; delete payload.project; delete payload.address;
  if (!isSupabaseConfigured) {
    addLocalLead(leadData, []);
    return { success: true, mocked: true };
  }
  const { data, error } = await directPostgREST('leads', 'POST', payload);
  if (error) {
    console.warn('Direct lead submission failed, trying fallback:', error.message);
    const isSchemaError = error.message?.toLowerCase().includes('column') || error.message?.toLowerCase().includes('find') || error.message?.toLowerCase().includes('timeout');
    if (isSchemaError) {
      const simplifiedPayload: any = { name: leadData.name, phone: leadData.phone, email: leadData.email, created_at: new Date().toISOString(), notes: `${leadData.notes || ''}\n[RECOVERY-DATA]: ${JSON.stringify(leadData)}`.trim() };
      const retry = await directPostgREST('leads', 'POST', simplifiedPayload);
      if (!retry.error) return { success: true, data: retry.data };
    }
    addLocalLead(leadData, []);
    return { success: false, error: error.message || 'Saved locally (Cloud Timeout)' };
  }
  return { success: true, data };
};

/**
 * Saves a website enquiry. With the CRM connected, success means the CRM stored it (the result carries its enquiry ID); a failure is returned
 * so the form can show an error and let the customer retry. Identical submissions that are still in flight share one request (double-click safe).
 */
export const submitLead = async (leadData: LeadData): Promise<SubmitResult> => {
  if (!CRM_API) return legacySave(leadData);
  const key = [leadData.name, leadData.phone, leadData.email, leadData.form_name, leadData.type].join('|').toLowerCase();
  const running = inflight.get(key); if (running) return running;
  const job = (async () => {
    const r = await postToCrm(leadData);
    if (r.success) void legacySave(leadData).catch(() => { /* older admin screens only; never affects the customer */ });
    return r;
  })();
  inflight.set(key, job);
  try { return await job; } finally { inflight.delete(key); }
};

export const fetchLeads = async (): Promise<LeadData[]> => {
  try {
    if (!isSupabaseConfigured) {
      const liveLeads = getLocalLeads([]);
      saveLocalLeads(liveLeads);
      return liveLeads;
    }
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.warn('Leads fetch failed, using local live leads:', err.message);
    const liveLeads = getLocalLeads([]);
    saveLocalLeads(liveLeads);
    return liveLeads;
  }
};
