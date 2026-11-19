export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'time' | 'datetime' | 'select' | 'bool' | 'lookup' | 'email' | 'tel';
export interface Field { name: string; label: string; type?: FieldType; options?: string[]; lookup?: 'users' | 'properties' | 'landowners' | 'buyers' | 'roles' | 'customers' | 'leads' | 'parcels' | 'proposals'; required?: boolean; wide?: boolean; filterBy?: string; fill?: Record<string, string>; lockOnEdit?: boolean; }
export interface Col { key: string; label: string; badge?: boolean; money?: boolean; date?: boolean; get?: (r: any) => string; }
export interface Filter { name: string; label: string; options?: string[]; lookup?: 'users'; optionsFrom?: string }
export interface RowQuick { label: string; perm: string; when: (r: any) => boolean; patch: Record<string, any>; tone?: 'danger' }
export interface Resource { key: string; path: string; module: string; title: string; singular: string; cols: Col[]; fields: Field[]; filters?: Filter[]; dateFilter?: boolean; sorts?: { value: string; label: string; sort: string; order: 'asc' | 'desc' }[]; enquiryActions?: boolean; perm: { create: string; edit: string; delete: string; export?: string }; detail?: boolean; detailKind?: 'enquiry' | 'customer' | 'lead' | 'proposal' | 'booking'; rowQuick?: RowQuick[]; }

const AREA = ['acres', 'cents', 'sqft'];
const SOURCES = ['manual', 'buy_land', 'sell_land', 'contact', 'property', 'consultation', 'project', 'callback', 'popup', 'services', 'requirement', 'newsletter'];
const ENQ = ['new', 'assigned', 'contacted', 'followup_pending', 'interested', 'site_visit_scheduled', 'negotiation', 'converted', 'closed', 'not_interested'];
const P = (m: string, x = true) => ({ create: `${m}.create`, edit: `${m}.edit`, delete: `${m}.delete`, ...(x ? { export: `${m}.export` } : {}) });

export const RESOURCES: Record<string, Resource> = {
  properties: {
    key: 'properties', path: '/properties', module: 'properties', title: 'All Properties', singular: 'Property', perm: { ...P('properties'), }, filters: [{ name: 'status', label: 'Status', options: ['available', 'reserved', 'sold'] }],
    cols: [{ key: 'code', label: 'ID' }, { key: 'name', label: 'Property' }, { key: 'type', label: 'Type' }, { key: 'district', label: 'District' }, { key: 'total_area', label: 'Area' }, { key: 'price', label: 'Price (₹)', money: true }, { key: 'status', label: 'Status', badge: true }, { key: 'published', label: 'Website', badge: true }],
    fields: [
      { name: 'name', label: 'Property name', required: true }, { name: 'type', label: 'Property type', required: true, options: ['Agricultural Land', 'Farm Land', 'Plantation', 'Dry Land', 'Wet Land', 'Orchard', 'Villa Plot', 'Other'], type: 'select' },
      { name: 'state', label: 'State' }, { name: 'district', label: 'District', required: true }, { name: 'taluk', label: 'Taluk' }, { name: 'village', label: 'Village' },
      { name: 'survey_number', label: 'Survey number' }, { name: 'total_area', label: 'Total land area', type: 'number', required: true }, { name: 'area_unit', label: 'Area unit', type: 'select', options: AREA },
      { name: 'price', label: 'Price (₹)', type: 'number' }, { name: 'price_per_acre', label: 'Price per acre (₹)', type: 'number' },
      { name: 'landowner_id', label: 'Landowner', type: 'lookup', lookup: 'landowners' }, { name: 'assigned_to', label: 'Assigned employee', type: 'lookup', lookup: 'users' },
      { name: 'status', label: 'Status', type: 'select', options: ['available', 'reserved', 'sold'] }, { name: 'map_url', label: 'Google Maps link' }, { name: 'video_url', label: 'Video link' },
      { name: 'address', label: 'Full address', type: 'textarea', wide: true }, { name: 'description', label: 'Description', type: 'textarea', wide: true }, { name: 'features', label: 'Features (one per line)', type: 'textarea', wide: true },
      { name: 'featured', label: 'Featured', type: 'bool' }, { name: 'website_visible', label: 'Visible on website', type: 'bool' }, { name: 'published', label: 'Published (live)', type: 'bool' },
    ],
  },
  parcels: {
    key: 'parcels', path: '/parcels', module: 'parcels', title: 'Land Parcels', singular: 'Parcel', perm: P('parcels'), filters: [{ name: 'status', label: 'Status', options: ['available', 'reserved', 'sold'] }],
    cols: [{ key: 'code', label: 'ID' }, { key: 'property_name', label: 'Property' }, { key: 'parcel_number', label: 'Parcel no.' }, { key: 'survey_number', label: 'Survey no.' }, { key: 'area', label: 'Area' }, { key: 'price', label: 'Price (₹)', money: true }, { key: 'status', label: 'Status', badge: true }],
    fields: [{ name: 'property_id', label: 'Property', type: 'lookup', lookup: 'properties', required: true }, { name: 'parcel_number', label: 'Parcel number', required: true }, { name: 'survey_number', label: 'Survey number' },
      { name: 'area', label: 'Area', type: 'number', required: true }, { name: 'area_unit', label: 'Area unit', type: 'select', options: AREA }, { name: 'price', label: 'Price (₹)', type: 'number' }, { name: 'status', label: 'Status', type: 'select', options: ['available', 'reserved', 'sold'] },
      { name: 'description', label: 'Description', type: 'textarea', wide: true }, { name: 'boundary_details', label: 'Boundary details', type: 'textarea', wide: true }],
  },
  landowners: {
    key: 'landowners', path: '/landowners', module: 'landowners', title: 'Landowners', singular: 'Landowner', perm: P('landowners'),
    filters: [{ name: 'verification_status', label: 'Verification', options: ['new', 'documents_pending', 'under_verification', 'verified', 'rejected'] }],
    cols: [{ key: 'code', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'phone', label: 'Phone' }, { key: 'district', label: 'District' }, { key: 'total_area', label: 'Land area' }, { key: 'expected_price', label: 'Expected price (₹)', money: true }, { key: 'verification_status', label: 'Verification', badge: true }],
    fields: [{ name: 'name', label: 'Full name', required: true }, { name: 'phone', label: 'Phone number', type: 'tel', required: true }, { name: 'email', label: 'Email', type: 'email' }, { name: 'district', label: 'District' }, { name: 'taluk', label: 'Taluk' }, { name: 'village', label: 'Village' },
      { name: 'survey_number', label: 'Survey number' }, { name: 'total_area', label: 'Land area', type: 'number' }, { name: 'area_unit', label: 'Area unit', type: 'select', options: AREA }, { name: 'expected_price', label: 'Expected selling price (₹)', type: 'number' },
      { name: 'assigned_to', label: 'Assigned executive', type: 'lookup', lookup: 'users' }, { name: 'verification_status', label: 'Verification status', type: 'select', options: ['new', 'documents_pending', 'under_verification', 'verified', 'rejected'] },
      { name: 'address', label: 'Address', type: 'textarea', wide: true }, { name: 'description', label: 'Land description', type: 'textarea', wide: true }, { name: 'remarks', label: 'Remarks', type: 'textarea', wide: true }],
  },
  buyers: {
    key: 'buyers', path: '/buyers', module: 'buyers', title: 'Buyers', singular: 'Buyer', perm: P('buyers'), filters: [{ name: 'status', label: 'Status', options: ['new', 'contacted', 'interested', 'site_visit_scheduled', 'negotiation', 'converted', 'not_interested'] }],
    cols: [{ key: 'code', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'phone', label: 'Phone' }, { key: 'preferred_location', label: 'Preferred location' }, { key: 'max_budget', label: 'Max budget (₹)', money: true }, { key: 'status', label: 'Status', badge: true }],
    fields: [{ name: 'name', label: 'Buyer name', required: true }, { name: 'phone', label: 'Phone number', type: 'tel', required: true }, { name: 'email', label: 'Email', type: 'email' }, { name: 'preferred_location', label: 'Preferred location' },
      { name: 'property_id', label: 'Interested property', type: 'lookup', lookup: 'properties' }, { name: 'land_type', label: 'Preferred land type' }, { name: 'required_area', label: 'Required area', type: 'number' },
      { name: 'min_budget', label: 'Minimum budget (₹)', type: 'number' }, { name: 'max_budget', label: 'Maximum budget (₹)', type: 'number' }, { name: 'purpose', label: 'Purpose of purchase' },
      { name: 'contact_method', label: 'Preferred contact', type: 'select', options: ['phone', 'whatsapp', 'email', 'in_person'] }, { name: 'assigned_to', label: 'Assigned employee', type: 'lookup', lookup: 'users' },
      { name: 'status', label: 'Status', type: 'select', options: ['new', 'contacted', 'interested', 'site_visit_scheduled', 'negotiation', 'converted', 'not_interested'] },
      { name: 'address', label: 'Address', type: 'textarea', wide: true }, { name: 'remarks', label: 'Remarks', type: 'textarea', wide: true }],
  },
  enquiries: {
    key: 'enquiries', path: '/enquiries', module: 'enquiries', title: 'Enquiry Management', singular: 'Enquiry', perm: { ...P('enquiries') }, detail: true, dateFilter: true, enquiryActions: true,
    sorts: [{ value: 'latest', label: 'Latest enquiry first', sort: 'created_at', order: 'desc' }, { value: 'oldest', label: 'Oldest first', sort: 'created_at', order: 'asc' }, { value: 'name', label: 'Customer name (A–Z)', sort: 'name', order: 'asc' }, { value: 'followup', label: 'Next follow-up', sort: 'next_followup_at', order: 'asc' }],
    filters: [{ name: 'enquiry_type', label: 'All types', optionsFrom: 'enquiry_types' }, { name: 'source', label: 'All sources', options: SOURCES }, { name: 'status', label: 'All statuses', options: ENQ }, { name: 'assigned_to', label: 'All employees', lookup: 'users' }, { name: 'priority', label: 'All priorities', options: ['low', 'medium', 'high'] }],
    cols: [{ key: 'code', label: 'Enquiry ID' }, { key: 'name', label: 'Customer' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'enquiry_type', label: 'Type', get: (r) => r.enquiry_type || String(r.source || '').replace(/_/g, ' ') }, { key: 'source', label: 'Source' },
      { key: 'property_title', label: 'Property / Project', get: (r) => r.property_name || r.property_title || r.interested_project || '' }, { key: 'created_at', label: 'Submitted', date: true }, { key: 'assigned_name', label: 'Assigned to' },
      { key: 'priority', label: 'Priority', badge: true }, { key: 'status', label: 'Status', badge: true }, { key: 'next_followup_at', label: 'Next follow-up', date: true }],
    fields: [{ name: 'name', label: 'Customer name', required: true }, { name: 'phone', label: 'Phone number', type: 'tel', required: true }, { name: 'email', label: 'Email', type: 'email' }, { name: 'location', label: 'Location' }, { name: 'address', label: 'Address', type: 'textarea', wide: true },
      { name: 'enquiry_type', label: 'Enquiry type' }, { name: 'source', label: 'Source', type: 'select', options: SOURCES }, { name: 'form_name', label: 'Form name' }, { name: 'website_page', label: 'Website page' },
      { name: 'property_id', label: 'Interested property', type: 'lookup', lookup: 'properties' }, { name: 'interested_project', label: 'Interested project' }, { name: 'budget', label: 'Preferred budget' }, { name: 'preferred_area', label: 'Preferred land area' }, { name: 'preferred_location', label: 'Preferred location' },
      { name: 'assigned_to', label: 'Assigned executive', type: 'lookup', lookup: 'users' }, { name: 'manager_id', label: 'Assigned manager', type: 'lookup', lookup: 'users' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'] }, { name: 'status', label: 'Status', type: 'select', options: ENQ }, { name: 'next_followup_at', label: 'Next follow-up', type: 'datetime' },
      { name: 'message', label: 'Customer message', type: 'textarea', wide: true }, { name: 'internal_remarks', label: 'Internal remarks', type: 'textarea', wide: true }, { name: 'conversion_notes', label: 'Conversion notes', type: 'textarea', wide: true }],
  },
  siteVisits: {
    key: 'siteVisits', path: '/site-visits', module: 'site_visits', title: 'Site Visits', singular: 'Site visit', perm: P('site_visits'), filters: [{ name: 'status', label: 'Status', options: ['scheduled', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show'] }],
    cols: [{ key: 'code', label: 'ID' }, { key: 'visit_date', label: 'Date' }, { key: 'visit_time', label: 'Time' }, { key: 'buyer_name', label: 'Buyer' }, { key: 'buyer_phone', label: 'Phone' }, { key: 'property_name', label: 'Property' }, { key: 'assigned_name', label: 'Assigned to' }, { key: 'status', label: 'Status', badge: true }],
    fields: [{ name: 'buyer_name', label: 'Buyer name', required: true }, { name: 'buyer_phone', label: 'Buyer phone', type: 'tel', required: true }, { name: 'property_id', label: 'Property', type: 'lookup', lookup: 'properties' },
      { name: 'visit_date', label: 'Visit date', type: 'date', required: true }, { name: 'visit_time', label: 'Visit time', type: 'time' }, { name: 'assigned_to', label: 'Assigned employee', type: 'lookup', lookup: 'users' },
      { name: 'status', label: 'Status', type: 'select', options: ['scheduled', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show'] }, { name: 'meeting_location', label: 'Meeting location' }, { name: 'followup_date', label: 'Follow-up date', type: 'date' },
      { name: 'feedback', label: 'Visit feedback', type: 'textarea', wide: true }, { name: 'remarks', label: 'Remarks', type: 'textarea', wide: true }],
  },
};

const LEAD_STATUS = ['new', 'contacted', 'qualified', 'site_visit_scheduled', 'negotiation', 'won', 'lost'];
const ERP: Record<string, Resource> = {
  customers: {
    key: 'customers', path: '/customers', module: 'customers', title: 'Customers', singular: 'Customer', perm: P('customers'), detail: true, detailKind: 'customer',
    filters: [{ name: 'customer_type', label: 'Type', options: ['buyer', 'seller', 'investor', 'other'] }],
    cols: [{ key: 'code', label: 'ID' }, { key: 'name', label: 'Customer' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'customer_type', label: 'Type', badge: true }, { key: 'enquiry_count', label: 'Enquiries' }, { key: 'lead_count', label: 'Leads' }, { key: 'booking_count', label: 'Bookings' }, { key: 'created_at', label: 'Added', date: true }],
    fields: [{ name: 'name', label: 'Full name', required: true }, { name: 'phone', label: 'Phone number', type: 'tel' }, { name: 'email', label: 'Email', type: 'email' }, { name: 'customer_type', label: 'Customer type', type: 'select', options: ['buyer', 'seller', 'investor', 'other'] },
      { name: 'address', label: 'Address', wide: true }, { name: 'remarks', label: 'Internal remarks', type: 'textarea', wide: true }],
  },
  leads: {
    key: 'leads', path: '/leads', module: 'leads', title: 'Lead Management', singular: 'Lead', perm: P('leads'), detail: true, detailKind: 'lead', dateFilter: true,
    filters: [{ name: 'status', label: 'Status', options: LEAD_STATUS }, { name: 'lead_type', label: 'Type', options: ['buyer', 'seller'] }, { name: 'priority', label: 'Priority', options: ['low', 'medium', 'high'] }, { name: 'assigned_to', label: 'Executive', lookup: 'users' }],
    cols: [{ key: 'code', label: 'Lead ID' }, { key: 'name', label: 'Customer' }, { key: 'phone', label: 'Phone' }, { key: 'lead_type', label: 'Type', badge: true }, { key: 'property_name', label: 'Property' }, { key: 'budget', label: 'Budget', money: true }, { key: 'priority', label: 'Priority', badge: true }, { key: 'assigned_name', label: 'Executive' }, { key: 'next_followup_date', label: 'Next follow-up' }, { key: 'status', label: 'Status', badge: true }],
    fields: [{ name: 'name', label: 'Customer name', required: true }, { name: 'phone', label: 'Phone', type: 'tel' }, { name: 'email', label: 'Email', type: 'email' }, { name: 'lead_type', label: 'Lead type', type: 'select', options: ['buyer', 'seller'] },
      { name: 'property_id', label: 'Interested property', type: 'lookup', lookup: 'properties' }, { name: 'budget', label: 'Budget (₹)', type: 'number' }, { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'] },
      { name: 'assigned_to', label: 'Assigned executive', type: 'lookup', lookup: 'users' }, { name: 'next_followup_date', label: 'Next follow-up date', type: 'date' }, { name: 'status', label: 'Status', type: 'select', options: LEAD_STATUS },
      { name: 'lost_reason', label: 'Lost reason (required when Lost)', wide: true }, { name: 'notes', label: 'Notes', type: 'textarea', wide: true }],
  },
  proposals: {
    key: 'proposals', path: '/proposals', module: 'proposals', title: 'Proposals', singular: 'Proposal', perm: P('proposals'), detail: true, detailKind: 'proposal',
    filters: [{ name: 'approval_status', label: 'Approval', options: ['draft', 'pending', 'approved', 'rejected'] }],
    cols: [{ key: 'code', label: 'Proposal ID' }, { key: 'customer_name', label: 'Customer' }, { key: 'property_name', label: 'Property / parcel', get: (r) => [r.property_name, r.parcel_number && `Parcel ${r.parcel_number}`].filter(Boolean).join(' · ') }, { key: 'quoted_price', label: 'Quoted', money: true }, { key: 'negotiated_price', label: 'Negotiated', money: true }, { key: 'advance_amount', label: 'Advance', money: true },
      { key: 'valid_until', label: 'Valid until', get: (r) => (r.valid_until ? String(r.valid_until).slice(0, 10) + (Number(r.expired) ? ' (expired)' : '') : '') }, { key: 'approval_status', label: 'Approval', badge: true }],
    rowQuick: [{ label: 'Approve', perm: 'proposals.approve', when: (r) => r.approval_status === 'pending', patch: { approval_status: 'approved' } }, { label: 'Reject', perm: 'proposals.approve', when: (r) => r.approval_status === 'pending', patch: { approval_status: 'rejected' }, tone: 'danger' },
      { label: 'Submit', perm: 'proposals.edit', when: (r) => r.approval_status === 'draft', patch: { approval_status: 'pending' } }],
    fields: [{ name: 'customer_id', label: 'Customer', type: 'lookup', lookup: 'customers', required: true }, { name: 'lead_id', label: 'Lead', type: 'lookup', lookup: 'leads' }, { name: 'property_id', label: 'Property', type: 'lookup', lookup: 'properties' }, { name: 'parcel_id', label: 'Parcel', type: 'lookup', lookup: 'parcels', filterBy: 'property_id' },
      { name: 'quoted_price', label: 'Quoted price (₹)', type: 'number', required: true }, { name: 'negotiated_price', label: 'Negotiated price (₹)', type: 'number' }, { name: 'advance_amount', label: 'Advance amount (₹)', type: 'number' }, { name: 'valid_until', label: 'Proposal valid until', type: 'date' },
      { name: 'approval_status', label: 'Approval status', type: 'select', options: ['draft', 'pending', 'approved', 'rejected'] }, { name: 'document_url', label: 'Proposal document (link)' },
      { name: 'payment_terms', label: 'Payment terms', type: 'textarea', wide: true }, { name: 'remarks', label: 'Remarks', type: 'textarea', wide: true }],
  },
  bookings: {
    key: 'bookings', path: '/bookings', module: 'bookings', title: 'Bookings', singular: 'Booking', perm: P('bookings'), detail: true, detailKind: 'booking', dateFilter: true,
    filters: [{ name: 'status', label: 'Status', options: ['booked', 'confirmed', 'deal_closed', 'cancelled'] }, { name: 'payment_status', label: 'Payment', options: ['pending', 'partial', 'paid'] }],
    cols: [{ key: 'code', label: 'Booking ID' }, { key: 'customer_name', label: 'Customer' }, { key: 'property_name', label: 'Property / parcel', get: (r) => [r.property_name, r.parcel_number && `Parcel ${r.parcel_number}`].filter(Boolean).join(' · ') }, { key: 'booking_date', label: 'Date' }, { key: 'total_amount', label: 'Total', money: true }, { key: 'paid_amount', label: 'Paid', money: true }, { key: 'balance_amount', label: 'Balance', money: true }, { key: 'payment_status', label: 'Payment', badge: true }, { key: 'status', label: 'Status', badge: true }],
    fields: [{ name: 'proposal_id', label: 'From approved proposal (optional)', type: 'lookup', lookup: 'proposals', lockOnEdit: true, fill: { customer_id: 'customer_id', lead_id: 'lead_id', property_id: 'property_id', parcel_id: 'parcel_id', total_amount: 'price', booking_amount: 'advance_amount' } },
      { name: 'customer_id', label: 'Customer', type: 'lookup', lookup: 'customers', required: true, lockOnEdit: true }, { name: 'lead_id', label: 'Lead', type: 'lookup', lookup: 'leads', lockOnEdit: true }, { name: 'property_id', label: 'Property', type: 'lookup', lookup: 'properties', lockOnEdit: true }, { name: 'parcel_id', label: 'Parcel', type: 'lookup', lookup: 'parcels', filterBy: 'property_id', lockOnEdit: true },
      { name: 'booking_date', label: 'Booking date', type: 'date', required: true, lockOnEdit: true }, { name: 'total_amount', label: 'Total amount (₹)', type: 'number', required: true }, { name: 'booking_amount', label: 'Booking amount (₹)', type: 'number' }, { name: 'status', label: 'Status', type: 'select', options: ['booked', 'confirmed', 'deal_closed', 'cancelled'] },
      { name: 'agreement_url', label: 'Agreement document (link)', wide: true }, { name: 'remarks', label: 'Remarks', type: 'textarea', wide: true }],
  },
  tasks: {
    key: 'tasks', path: '/tasks', module: 'tasks', title: 'Tasks', singular: 'Task', perm: P('tasks'),
    filters: [{ name: 'status', label: 'Status', options: ['pending', 'in_progress', 'completed', 'cancelled'] }, { name: 'priority', label: 'Priority', options: ['low', 'medium', 'high'] }, { name: 'assigned_to', label: 'Assigned to', lookup: 'users' }],
    cols: [{ key: 'code', label: 'ID' }, { key: 'title', label: 'Task' }, { key: 'assigned_name', label: 'Assigned to' }, { key: 'customer_name', label: 'Customer / lead', get: (r) => [r.customer_name, r.lead_code].filter(Boolean).join(' · ') }, { key: 'due_date', label: 'Due', get: (r) => (r.due_date ? String(r.due_date).slice(0, 10) + (Number(r.overdue) ? ' ⚠ overdue' : '') : '') }, { key: 'priority', label: 'Priority', badge: true }, { key: 'status', label: 'Status', badge: true }],
    rowQuick: [{ label: 'Done', perm: 'tasks.edit', when: (r) => !['completed', 'cancelled'].includes(r.status), patch: { status: 'completed' } }],
    fields: [{ name: 'title', label: 'Task', required: true, wide: true }, { name: 'description', label: 'Description', type: 'textarea', wide: true }, { name: 'assigned_to', label: 'Assigned to', type: 'lookup', lookup: 'users' }, { name: 'due_date', label: 'Due date', type: 'date' },
      { name: 'customer_id', label: 'Related customer', type: 'lookup', lookup: 'customers' }, { name: 'lead_id', label: 'Related lead', type: 'lookup', lookup: 'leads' }, { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'] }, { name: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'completed', 'cancelled'] }],
  },
};
Object.assign(RESOURCES, ERP);
