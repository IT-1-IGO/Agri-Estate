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
}


export const submitLead = async (leadData: LeadData) => {
  const payload: any = { ...leadData, created_at: new Date().toISOString() };
  
  if (!isSupabaseConfigured) {
    addLocalLead(leadData, []);
    return { success: true, mocked: true };
  }

  // Try direct insert via REST for speed and reliability
  const { data, error } = await directPostgREST('leads', 'POST', payload);

  if (error) {
    console.warn('Direct lead submission failed, trying fallback:', error.message);
    
    // If it's a schema mismatch (missing column), try moving everything to notes
    const isSchemaError = error.message?.toLowerCase().includes('column') || 
                          error.message?.toLowerCase().includes('find') ||
                          error.message?.toLowerCase().includes('timeout');

    if (isSchemaError) {
      const simplifiedPayload: any = {
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        created_at: new Date().toISOString(),
        notes: `${leadData.notes || ''}\n[RECOVERY-DATA]: ${JSON.stringify(leadData)}`.trim()
      };
      
      const retry = await directPostgREST('leads', 'POST', simplifiedPayload);
      if (!retry.error) return { success: true, data: retry.data };
    }

    addLocalLead(leadData, []);
    return { success: false, error: error.message || 'Saved locally (Cloud Timeout)' };
  }

  return { success: true, data };
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
