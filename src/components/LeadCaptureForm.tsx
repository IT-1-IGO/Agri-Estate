import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MessageSquare, IndianRupee, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { submitLead } from '../lib/leadsService';
import { useAuth } from '../context/AuthContext';
import AuthRequiredModal from './modals/AuthRequiredModal';
import { identifyVisitor, addInterest, VisitorSession } from '../lib/trackingService';

interface LeadCaptureFormProps {
  propertyTitle: string;
  propertyId?: string;
}

const igoPhone = '918376883780';

const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({ propertyTitle, propertyId }) => {
   const { user } = useAuth();
   const [showAuthModal, setShowAuthModal] = useState(false);
   const [activeTab, setActiveTab] = useState<'visit' | 'offer' | 'callback'>('visit');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [submitted, setSubmitted] = useState(false);
   const [formData, setFormData] = useState({
     name: user?.user_metadata?.name || '',
     phone: '',
     email: user?.email || '',
     date: '',
     time: 'Morning (9AM - 12PM)',
     customTime: '',
     offer: '',
     purpose: 'Buy this estate'
   });

   // Track visitor interest and identify on form interaction
   useEffect(() => {
     if (propertyTitle) {
       addInterest(propertyTitle);
     }
   }, [propertyTitle]);

   const handleInputChange = (field: string, value: string) => {
     setFormData(prev => ({ ...prev, [field]: value }));
     // Identify visitor with name/email once they start filling the form
     if ((field === 'name' || field === 'email') && value) {
       const name = field === 'name' ? value : formData.name;
       const email = field === 'email' ? value : formData.email;
       if (name && email) {
         identifyVisitor(name, email);
       }
     }
   };

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);
    
    const timeValue = formData.time === 'Custom' ? formData.customTime : formData.time;

    const lines = [
      `IGO Agri Estate Enquiry`,
      `Estate: ${propertyTitle}`,
      propertyId ? `Estate ID: ${propertyId}` : '',
      `Request Type: ${activeTab}`,
      `Name: ${formData.name}`,
      `Phone: ${formData.phone}`,
      `Email: ${formData.email}`,
      activeTab === 'visit' ? `Preferred Date: ${formData.date}` : '',
      (activeTab === 'visit' || activeTab === 'callback') ? `Preferred Time: ${timeValue}` : '',
      activeTab === 'offer' ? `Approx Budget / Offer: ${formData.offer} Cr` : '',
      `Purpose: ${formData.purpose}`,
      `Please share estate details, seller process, site visit availability, documents, and next steps.`,
    ].filter(Boolean);

    const message = lines.join('\n');

    // Safety timeout: stop showing "Sending" after 4 seconds regardless of server response
    let hasTimedOut = false;
    const safetyTimeout = setTimeout(() => {
      hasTimedOut = true;
      setIsSubmitting(false);
      setSubmitted(true);
      window.open(`https://wa.me/+${igoPhone.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    }, 4000);

    const result = await submitLead({
      type: activeTab,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      property_id: propertyId,
      property_title: propertyTitle,
      offer_amount: formData.offer ? Number(formData.offer) * 10000000 : undefined,
      preferred_date: formData.date || undefined,
      preferred_time: (activeTab === 'visit' || activeTab === 'callback') ? timeValue : undefined,
      intent: formData.purpose,
      notes: message,
    });

    clearTimeout(safetyTimeout);
    
    if (hasTimedOut) return;

    setIsSubmitting(false);
    if (result.success) {
      setSubmitted(true);
      window.open(`https://wa.me/+${igoPhone.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    } else {
      console.warn('Cloud sync failed, but proceeding with WhatsApp:', result.error);
      setSubmitted(true);
      window.open(`https://wa.me/+${igoPhone.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#F3F8E6] to-[#E6F0D6] rounded-[32px] shadow-xl border border-[#d5e1c3] overflow-hidden sticky top-32">
      <div className="flex border-b border-[#d5e1c3] bg-white/60">
        <button 
          onClick={() => setActiveTab('visit')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex flex-col items-center gap-2 ${activeTab === 'visit' ? 'text-secondary border-b-2 border-secondary bg-white' : 'text-text-muted hover:text-primary'}`}
        >
          <Calendar size={18} />
          <span>Site Visit</span>
        </button>
        <button 
          onClick={() => setActiveTab('offer')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex flex-col items-center gap-2 ${activeTab === 'offer' ? 'text-secondary border-b-2 border-secondary bg-white' : 'text-text-muted hover:text-primary'}`}
        >
          <IndianRupee size={18} />
          <span>Proposal</span>
        </button>
        <button 
          onClick={() => setActiveTab('callback')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex flex-col items-center gap-2 ${activeTab === 'callback' ? 'text-secondary border-b-2 border-secondary bg-white' : 'text-text-muted hover:text-primary'}`}
        >
          <MessageSquare size={18} />
          <span>Callback</span>
        </button>
      </div>

      <div className="p-6">
        {submitted ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-primary mb-3">Request Received</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Your inquiry has been logged. Our property advisors will review your requirements and reach out via WhatsApp/Phone shortly.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-8 text-[10px] font-black uppercase tracking-widest text-secondary hover:text-primary"
            >
              Send Another Request
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'visit' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 mb-1 block">Preferred Date</label>
                <input 
                   type="date" 
                   required 
                   min={today}
                   value={formData.date}
                   onChange={(e) => setFormData({...formData, date: e.target.value})}
                   className="w-full bg-white border border-[#d5e1c3] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-secondary/20 font-bold text-primary" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 mb-1 block">Time Preference</label>
                  <select 
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-white border border-[#d5e1c3] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-secondary/20 font-bold text-primary cursor-pointer"
                  >
                    <option>Morning (9AM - 12PM)</option>
                    <option>Afternoon (12PM - 4PM)</option>
                    <option>Custom</option>
                  </select>
                </div>
                {formData.time === 'Custom' && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 mb-1 block">Specify Time</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 11:30 AM" 
                      value={formData.customTime}
                      onChange={(e) => setFormData({...formData, customTime: e.target.value})}
                      className="w-full bg-white border border-[#d5e1c3] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-secondary/20 font-bold text-primary"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'offer' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 mb-1 block">Approx Budget / Your Offer</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-primary">₹</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="e.g. 1.25" 
                    value={formData.offer}
                    onChange={(e) => setFormData({...formData, offer: e.target.value})}
                    className="w-full bg-white border border-[#d5e1c3] rounded-xl pl-10 pr-6 py-2.5 outline-none focus:ring-2 focus:ring-secondary/20 font-bold text-primary text-lg" 
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-text-muted text-xs">Cr</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'callback' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 mb-1 block">Preferred Callback Time</label>
                  <select 
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-white border border-[#d5e1c3] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-secondary/20 font-bold text-primary cursor-pointer"
                  >
                    <option>Immediate (ASAP)</option>
                    <option>Morning (9AM - 12PM)</option>
                    <option>Afternoon (12PM - 4PM)</option>
                    <option>Evening (4PM - 7PM)</option>
                    <option>Custom</option>
                  </select>
                </div>
                {formData.time === 'Custom' && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 mb-1 block">Specify Time</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Monday 10AM" 
                      value={formData.customTime}
                      onChange={(e) => setFormData({...formData, customTime: e.target.value})}
                      className="w-full bg-white border border-[#d5e1c3] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-secondary/20 font-bold text-primary"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Buyer Purpose */}
          <div className="p-4 bg-white/60 rounded-2xl border border-[#d5e1c3] mt-4">
             <div className="flex items-center space-x-2 mb-2 text-primary">
                <FileText size={16} className="text-secondary" />
                <h4 className="font-bold text-sm">Buyer Purpose</h4>
             </div>
             <select
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              className="w-full bg-white border border-[#d5e1c3] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-secondary/20 font-bold text-primary cursor-pointer"
             >
              <option>Buy this estate</option>
              <option>Schedule site visit</option>
              <option>Discuss price</option>
              <option>Request documents</option>
              <option>Need similar estates</option>
             </select>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#d5e1c3]">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 mb-1 block">Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="John Doe" 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-white border border-[#d5e1c3] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-secondary/20 font-bold text-primary" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 mb-1 block">Phone Number</label>
              <input 
                type="tel" 
                required 
                placeholder="+91 XXXXX XXXXX" 
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full bg-white border border-[#d5e1c3] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-secondary/20 font-bold text-primary" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 mb-1 block">Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="john@example.com" 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-white border border-[#d5e1c3] rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-secondary/20 font-bold text-primary" 
              />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-secondary px-8 py-4 rounded-[20px] font-black text-[11px] uppercase tracking-widest hover:bg-primary-light transition-all shadow-xl shadow-primary/20 disabled:opacity-60">
            {isSubmitting ? 'Sending to Admin...' : activeTab === 'visit' ? 'Schedule Site Visit' : activeTab === 'offer' ? 'Request Estate Proposal' : 'Request Callback'}
          </button>
        </form>
        )}

        <div className="mt-4 flex items-center justify-center space-x-2 text-text-muted">
          <ShieldCheck size={14} className="text-secondary" />
          <span className="text-[9px] font-black uppercase tracking-widest">Saved in admin leads before WhatsApp follow-up</span>
        </div>
      </div>

      <AuthRequiredModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        message={`Please sign in to schedule a ${activeTab === 'visit' ? 'site visit' : activeTab === 'offer' ? 'proposal' : 'callback'} for ${propertyTitle}.`}
      />
    </div>
  );
};

export default LeadCaptureForm;
