import React, { useEffect, useMemo, useRef, useState } from 'react';
import SEO from '../components/SEO';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  Heart,
  IndianRupee,
  Mail,
  MapPin,
  Maximize,
  MessageCircle,
  Phone,
  Share2,
  Sprout,
  TrendingUp,
  Map,
  Droplets,
  Zap,
  Truck,
  Warehouse,
  Video,
  LineChart,
  ShieldCheck,
  Plus,
  Minus,
  AlertCircle,
  Download,
  Percent,
  ArrowRight,
  Calculator,
  Handshake,
  Timer,
  FileCheck2,
  Settings,
  Coins,
  Search,
  BarChart3,
  ClipboardCheck,
  Users,
  Building2
} from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import LeadCaptureForm from '../components/LeadCaptureForm';
import AuthRequiredModal from '../components/modals/AuthRequiredModal';
import { useAuth } from '../context/AuthContext';
import { useRecentlyViewed, getRecommendations } from '../hooks/useRecommendations';
import type { Property } from '../types';
import Lightbox from '../components/interactive/Lightbox';

const igoPhone = '+918376883780';
const igoEmail = 'info@igoagritechfarms.com';
const igoWebsite = 'https://www.igoagritechfarms.com/';

const defaultCustomerNeeds = [
  'Land ownership or lease permission',
  'Water and power availability',
  'Estate budget confirmation',
  'Site inspection approval',
];

const defaultIgoSupport = [
  'Estate feasibility review',
  'Crop and layout planning',
  'Vendor and setup coordination',
  'Farm operation guidance',
  'Harvest and market support',
];

const estateFlow = [
  {
    title: '1. Estate Discussion',
    detail: 'Customer shares land size, location, water source, budget, and preferred Agri Estate model.',
  },
  {
    title: '2. Site Feasibility',
    detail: 'IGO reviews soil, water, access, climate, estate suitability, and practical development scope.',
  },
  {
    title: '3. Estate Proposal',
    detail: 'Customer receives estate scope, setup items, estimated cost, crop plan, operation plan, and revenue route.',
  },
  {
    title: '4. Setup & Execution',
    detail: 'After approval, IGO coordinates structure, irrigation, crop setup, training, and farm implementation.',
  },
  {
    title: '5. Operations & Revenue',
    detail: 'Farm output is tracked through crop cycles, harvesting, grading, buyer linkage, and owner updates.',
  },
];

import { trackVisit, updateVisitDuration } from '../lib/trackingService';
import { submitLead } from '../lib/leadsService';

const Band: React.FC<{ c: string; children: React.ReactNode }> = ({ c, children }) => (
  <div
    style={{ backgroundColor: c }}
    className="py-8 lg:py-12 [box-shadow:0_0_0_100vmax_var(--band)] [clip-path:inset(0_-100vmax)]"
    ref={(el) => { if (el) el.style.setProperty('--band', c); }}
  >
    {children}
  </div>
);

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { properties, getProperty, publicProperties } = useProperties();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const [flowStep, setFlowStep] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    const t = window.setInterval(() => setFlowStep((n) => (n + 1) % 5), 2200);
    return () => window.clearInterval(t);
  }, [reduceMotion]);
  const leadRef = useRef<HTMLDivElement>(null);

  // Visitor Tracking
  const tracked = React.useRef<string | null>(null);
  useEffect(() => {
    if (property && tracked.current !== property.id) {
      trackVisit({ id: property.id, title: property.title });
      tracked.current = property.id;
    }
  }, [property]);

  // Engagement Timer
  const [startTime] = useState(Date.now());
  const timerRef = useRef<any>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (property) {
        updateVisitDuration(property.id, 5);
      }
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [property]);

  // Personalization: track recently viewed and get recommendations
  const { addView } = useRecentlyViewed([]);

  // Get location info from property
  const locationName = property?.location?.split(',')?.[0] || 'Unknown Corridor';

  const [rentalInputs, setRentalInputs] = useState({
    monthlyRent: '',
    annualExpenses: '',
    vacancyRate: '10'
  });
  const [rentalResult, setRentalResult] = useState<{grossIncome: number, netIncome: number, yield: number, monthlyCashflow: number} | null>(null);

  useEffect(() => {
    if (!id) return;
    getProperty(id).then((data) => {
      if (data) {
        setProperty(data);
        addView(data.id);
      } else {
        // Property not found or auto-expired
        setProperty(null);
      }
      setLoading(false);
    });
  }, [id, getProperty, addView]);

  const similarEstates = useMemo(() => {
    if (!property || !property.location || !publicProperties.length) return [];
    
    // Use only public (non-expired) properties
    const availableProperties = publicProperties;
    const parts = property.location.split(',');
    if (parts.length === 0) return [];
    
    const locName = parts[0].trim().toLowerCase();
    
    // Find other estates in the same location that are active
    const sameLocation = availableProperties.filter(p =>
      p.location && p.location.toLowerCase().includes(locName) && p.id !== property.id
    );
    return sameLocation.length > 0 ? sameLocation.slice(0, 3) : getRecommendations(availableProperties, property.id).slice(0, 3);
  }, [property, publicProperties]);

  // Back: return to wherever the visitor came from (e.g. the Farm Types section on Home) when this page was
  // opened from inside the site; otherwise (direct link / refresh) go to the Estates listing.
  // If the in-app navigation has not completed shortly after, fall back to a normal page load so the click can never be lost.
  const goBackToEstates = () => {
    const fromPath = window.location.pathname;
    const canGoBack = typeof window.history.state?.idx === 'number' && window.history.state.idx > 0;
    if (canGoBack) navigate(-1); else navigate('/locations');
    window.setTimeout(() => {
      if (window.location.pathname === fromPath) window.location.assign('/locations');
    }, 1500);
  };

  const handleShare = async () => {
    if (!property) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: `IGO ${locationName} Estate: Check out ${property.title}`,
          url: window.location.href,
        });
        setShareStatus('Shared');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus('Link copied');
      }
    } catch {
      setShareStatus('Share cancelled');
    }

    window.setTimeout(() => setShareStatus(''), 1800);
  };

  const enquiryText = property
    ? `Hello IGO, I am interested in the ${property.title} at ${property.location}. Please share full proposal, cost breakdown, site visit process, and next steps.`
    : 'Hello IGO, I am interested in an Agri Estate.';

  const whatsappUrl = `https://wa.me/${igoPhone.replace(/\D/g, '')}?text=${encodeURIComponent(enquiryText)}`;
  
  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setAuthMessage("Please sign in to contact our estate team via WhatsApp.");
      setShowAuthModal(true);
      return;
    }

    // SILENT LEAD CAPTURE: Send request to admin before/while opening WhatsApp
    // This ensures "send the request to admin" happens without "opening this page only"
    try {
      await submitLead({
        type: 'contact',
        name: user.user_metadata?.name || 'Anonymous User',
        phone: user.user_metadata?.phone || 'Captured via WhatsApp click',
        email: user.email || '',
        property_id: property?.id,
        property_title: property?.title,
        notes: `User clicked WhatsApp button for ${property?.title}. Redirecting to WA.`,
        intent: 'WhatsApp Inquiry'
      });
    } catch (err) {
      console.warn('Silent lead capture failed, but proceeding with WhatsApp redirection.');
    }
  };

  const handleDroneTourClick = () => {
    if (!user) {
      setAuthMessage("Please sign in to request a professional drone tour of this estate.");
      setShowAuthModal(true);
      return;
    }
    leadRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Note: We could potentially pass a prop to LeadCaptureForm here if we wanted to pre-select something
  };

  const mailUrl = property
    ? `mailto:${igoEmail}?subject=${encodeURIComponent(`Agri Estate enquiry - ${property.title}`)}&body=${encodeURIComponent(enquiryText)}`
    : `mailto:${igoEmail}`;

  // Compute rental yield
  const calculateRentalYield = () => {
    if (!property || !rentalInputs.monthlyRent) return;
    const monthlyRent = parseFloat(rentalInputs.monthlyRent) || 0;
    const annualExpenses = parseFloat(rentalInputs.annualExpenses) || 0;
    const vacancyRate = parseFloat(rentalInputs.vacancyRate) || 10;

    const grossIncome = monthlyRent * 12;
    const effectiveIncome = grossIncome * (1 - vacancyRate / 100);
    const netIncome = effectiveIncome - annualExpenses;

    // Estimate property value
    const priceMatch = property.price.match(/(\d+(?:\.\d+)?)/);
    const propertyValue = (property.priceValue || (priceMatch ? parseFloat(priceMatch[1]) : 1.0)) * 10000000;

    const rentalYield = propertyValue > 0 ? (netIncome / propertyValue) * 100 : 0;
    const monthlyCashflow = (netIncome / 12);

    setRentalResult({
      grossIncome,
      netIncome,
      yield: rentalYield,
      monthlyCashflow
    });
  };

  useEffect(() => {
    if (property && (property.intention === 'Rent' || property.intention === 'Lease' || property.type?.toLowerCase()?.includes('rent'))) {
      // Auto-calculate with estimated rent based on property value
      const priceValue = property.priceValue || 5;
      const estimatedRent = priceValue * 0.05 * 10000000 / 12; // 0.5% monthly rent
      setRentalInputs(prev => ({
        ...prev,
        monthlyRent: Math.round(estimatedRent).toString()
      }));
    }
  }, [property]);

  useEffect(() => {
    calculateRentalYield();
  }, [rentalInputs, property]);

  const [activeImage, setActiveImage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isHortiHero = property?.id === 'horticulture-project';
  const isOpenHero = property?.id === 'open-cultivation-project';
  const galleryImages = property
    ? (isHortiHero ? ['/images/properties/cat-horticulture-orchids.webp'] : (property.images || [property.image]))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl mb-4">Agri Estate Not Found</h2>
        <button onClick={() => navigate('/listings')} className="btn-primary">Back to Estates</button>
      </div>
    );
  }

  const crops = property.crops || [];
  const setupScope = property.setupScope || [];
  const customerNeeds = property.customerNeeds || defaultCustomerNeeds;
  const igoSupport = property.igoSupport || defaultIgoSupport;

  return (
    <div className="pt-32 pb-24 bg-[#FAF6EF] min-h-screen overflow-x-clip">
      <SEO
        title={`${property.title} — ${property.location} | Agricultural Estate for Sale in India`}
        description={`${property.title} in ${property.location}. ${property.size} estate at ${property.price}. ${property.description?.slice(0, 80) || 'Verified agricultural estate with clear title and managed farming support.'}`.slice(0, 160)}
        canonical={`/properties/${property.id}`}
        ogImage={property.image?.startsWith('http') ? property.image : `https://www.igoagriestate.com${property.image || '/images/hero-bg.png'}`}
        ogType="article"
        keywords={`${property.title}, agricultural land ${property.location}, buy farm ${property.location}, ${property.type || 'agri estate'} India, farmland for sale India, ${property.location} agricultural land`}
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'RealEstateListing',
            name: property.title,
            description: property.description || `${property.title} — verified agricultural estate in ${property.location}`,
            url: `https://www.igoagriestate.com/properties/${property.id}`,
            image: property.image?.startsWith('http') ? property.image : `https://www.igoagriestate.com${property.image}`,
            offers: {
              '@type': 'Offer',
              price: property.price,
              priceCurrency: 'INR',
              availability: property.status === 'Available' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
              seller: { '@type': 'Organization', name: 'IGO Agri Estates', url: 'https://www.igoagriestate.com' }
            },
            address: {
              '@type': 'PostalAddress',
              addressLocality: property.location,
              addressCountry: 'IN'
            }
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.igoagriestate.com/' },
              { '@type': 'ListItem', position: 2, name: 'Estates', item: 'https://www.igoagriestate.com/locations' },
              { '@type': 'ListItem', position: 3, name: property.title, item: `https://www.igoagriestate.com/properties/${property.id}` }
            ]
          }
        ]}
      />
      <div className="container mx-auto px-5 sm:px-8 lg:px-10 box-border">
          <button
            type="button"
            onClick={goBackToEstates}
            className="flex items-center text-text-muted hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Estates
          </button>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className={`relative rounded-[48px] overflow-hidden shadow-2xl aspect-[4/3] bg-primary/5 group${isHortiHero ? ' w-[92%] sm:w-[90%] lg:w-[88%]' : ''}${isOpenHero ? ' w-[94%] sm:w-[92%] lg:w-[90%] mx-auto max-h-[420px] sm:max-h-[520px] lg:max-h-[min(70vh,640px)]' : ''}`}>
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImage}
                  src={galleryImages[activeImage]} 
                  alt={property.title} 
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6 }}
                  onClick={() => setLightboxIndex(activeImage)}
                  className="w-full h-full object-cover cursor-zoom-in" style={isHortiHero ? { objectPosition: '30% 55%' } : undefined} 
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute top-6 left-6 flex gap-2">
                <div className="bg-secondary text-primary px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                  IGO Agri Estate
                </div>
                <div className="bg-white/20 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                  {property.status}
                </div>
              </div>

              {/* Navigation Arrows */}
              {galleryImages.length > 1 && (
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setActiveImage(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                    aria-label="Previous image"
                    className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-secondary hover:text-primary transition-all shadow-2xl"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <button
                    onClick={() => setActiveImage(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                    aria-label="Next image"
                    className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-secondary hover:text-primary transition-all shadow-2xl"
                  >
                    <ArrowRight size={24} />
                  </button>
                </div>
              )}

            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-5 gap-4">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    aria-label={`View image ${idx + 1}`}
                    aria-pressed={activeImage === idx}
                    className={`relative rounded-[24px] overflow-hidden aspect-square border-2 transition-all ${activeImage === idx ? 'border-secondary scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Corner ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
                    {idx === 1 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-black uppercase text-center p-2 leading-tight">Plant Close-up</div>}
                    {idx === 2 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-black uppercase text-center p-2 leading-tight">North View</div>}
                    {idx === 3 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-black uppercase text-center p-2 leading-tight">Entrance</div>}
                    {idx === 4 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-black uppercase text-center p-2 leading-tight">Infrastructure</div>}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-7">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck size={12} />
                    {property.reraNumber ? 'RERA Registered' : 'Title Verified'}
                  </span>
                  {property.reraNumber && (
                    <span className="text-[10px] font-bold text-text-muted">
                      ID: {property.reraNumber}
                    </span>
                  )}
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-primary leading-[0.9] tracking-tighter mb-4">
                  {property.title}
                </h1>
                <p className="text-xl text-text-muted leading-relaxed">
                  {property.description}
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={handleShare} className="p-3 rounded-full border border-black/10 hover:bg-black/5" aria-label="Share estate">
                  <Share2 size={20} />
                </button>
                <button
                  onClick={() => setIsSaved((value) => !value)}
                  className={`p-3 rounded-full border ${isSaved ? 'bg-red-50 border-red-100 text-red-600' : 'border-black/10 hover:bg-black/5'}`}
                  aria-label="Save estate"
                >
                  <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {shareStatus && <p className="text-xs font-bold uppercase tracking-widest text-secondary">{shareStatus}</p>}


            <div className="grid grid-cols-3 gap-4 py-6 border-y border-black/5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Scale</p>
                <p className="font-black text-primary flex items-center gap-2"><Maximize size={16} className="text-secondary" />{property.sizeValue ? `${property.sizeValue} Acres` : property.size}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Quote</p>
                <p className="font-black text-primary flex items-center gap-2"><IndianRupee size={16} className="text-secondary" />{property.priceValue ? `₹${property.priceValue} Cr` : property.price}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Profit View</p>
                <p className="font-black text-primary flex items-center gap-2"><TrendingUp size={16} className="text-secondary" />{property.roiValue ? `${property.roiValue}% CAGR` : property.roi}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noreferrer" 
                onClick={handleWhatsAppClick}
                className="btn-primary px-6 py-4 rounded-2xl flex items-center gap-2"
              >
                <MessageCircle size={18} />
                WhatsApp Estate Team
              </a>
              <button
                onClick={handleDroneTourClick}
                className="bg-white border border-black/10 px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:border-secondary transition-all"
              >
                <Video size={18} className="text-secondary" />
                Request Drone Tour
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('revenue-model')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="bg-white border border-black/10 px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:border-secondary transition-all"
              >
                <LineChart size={18} className="text-secondary" />
                Compare ROI
              </button>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 grid xl:grid-cols-[1fr_420px] gap-x-10 gap-y-0 items-start">
          <main>
            <Band c="#F4F0E2">
            <div className="space-y-8">
              {/* Benefits strip */}
              <section aria-label="Why IGO" className="rounded-[32px] bg-gradient-to-br from-[#0f4d24] to-[#14602d] px-5 py-7 text-white shadow-xl sm:px-8">
                <ul className="grid grid-cols-2 gap-y-6 md:grid-cols-4">
                  {[
                    { Icon: Handshake, a: 'Fair &', b: 'Transparent Valuation' },
                    { Icon: Timer, a: 'Quick &', b: 'Hassle-Free Process' },
                    { Icon: FileCheck2, a: 'Legal &', b: 'Secure Transfer' },
                    { Icon: Sprout, a: 'Purpose-Driven', b: 'Land Development' },
                  ].map(({ Icon, a, b }, i) => (
                    <li key={a} className={`flex flex-col items-center gap-2 px-3 text-center ${i > 0 ? 'md:border-l md:border-white/15' : ''}`}>
                      <Icon size={30} strokeWidth={1.6} className="text-[#f3d03e]" aria-hidden="true" />
                      <span className="text-sm font-semibold leading-snug text-white/95">{a}<br />{b}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Revenue model */}
              <section id="revenue-model" className="scroll-mt-32 overflow-hidden rounded-[36px] border border-[#e3ddc6] bg-[#FBF8EE] shadow-xl">
                <div className="grid md:grid-cols-[0.9fr_1.1fr]">
                  <div className="p-7 sm:p-9">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-secondary">Revenue Model</p>
                    <h2 className="mt-3 text-3xl font-black leading-tight text-primary sm:text-4xl">How This Can Create Value</h2>
                    <p className="mt-4 text-base leading-relaxed text-text-muted">{property.revenueModel}</p>
                  </div>
                  <div className="relative min-h-[260px]">
                    <img src={galleryImages[0]} alt={`${property.title} landscape`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    <span className="absolute inset-0 bg-gradient-to-r from-[#FBF8EE] via-[#FBF8EE]/30 to-transparent" aria-hidden="true" />
                    <div className="absolute inset-x-3 bottom-4 flex items-end justify-center gap-2 sm:gap-4">
                      {[
                        { Icon: Sprout, t: 'Land Acquisition', up: 0 },
                        { Icon: Settings, t: 'Development & Infrastructure', up: 18 },
                        { Icon: Coins, t: 'Operational Revenue', up: 36 },
                      ].map(({ Icon, t, up }) => (
                        <div key={t} style={{ marginBottom: up }} className="flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full border border-white/70 bg-[#fbf8ee]/95 p-2 text-center shadow-lg sm:h-[120px] sm:w-[120px]">
                          <Icon size={26} strokeWidth={1.6} className="text-[#1f7a35]" aria-hidden="true" />
                          <span className="mt-1 text-[11px] font-bold leading-tight text-primary sm:text-xs">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Development process */}
              <section className="rounded-[36px] border border-[#e3ddc6] bg-[#FBF8EE] p-7 shadow-xl sm:p-9">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Estate Development Process</p>
                <h2 className="mt-2 text-3xl font-black text-primary sm:text-4xl">From Enquiry to Revenue</h2>
                <ol className="relative mt-8 grid gap-7 md:grid-cols-5 md:gap-3">
                  <motion.span
                    className="pointer-events-none absolute left-[10%] right-[10%] top-[28px] hidden h-[2px] origin-left rounded-full bg-gradient-to-r from-[#2a8a3a]/30 via-[#2a8a3a] to-[#2a8a3a]/30 md:block"
                    aria-hidden="true"
                    initial={reduceMotion ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                  {!reduceMotion && (
                    <span className="pointer-events-none absolute left-[10%] right-[10%] top-[28px] hidden md:block" aria-hidden="true">
                      <motion.span
                        className="absolute -top-[5px] h-3 w-3 -translate-x-1/2 rounded-full bg-[#9bd68a] shadow-[0_0_14px_5px_rgba(74,168,61,0.55)]"
                        animate={{ left: ['0%', '100%'] }}
                        transition={{ duration: 4.4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.8 }}
                      />
                    </span>
                  )}
                  {estateFlow.map((step, i) => {
                    const Icon = [MessageCircle, Search, FileText, Settings, BarChart3][i] || FileText;
                    return (
                      <motion.li
                        key={step.title}
                        className="group relative flex cursor-default flex-col items-center rounded-3xl p-3 text-center transition-colors duration-300 hover:bg-white/80 hover:shadow-[0_18px_36px_-26px_rgba(15,77,36,0.5)]"
                        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: reduceMotion ? 0 : 0.2 + i * 0.18 }}
                        whileHover={reduceMotion ? undefined : { y: -6 }}
                      >
                        <motion.span
                          className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#2a8a3a] shadow-md transition-[box-shadow,background-color,color,transform] duration-500 group-hover:bg-[#1f7a35] ${!reduceMotion && flowStep === i ? 'scale-110 bg-[#1f7a35] text-white shadow-[0_0_0_6px_rgba(42,138,58,0.18),0_12px_24px_-10px_rgba(31,122,53,0.6)]' : 'bg-white text-[#1f7a35]'} group-hover:text-white group-hover:text-white group-hover:shadow-[0_0_0_6px_rgba(42,138,58,0.18),0_12px_24px_-10px_rgba(31,122,53,0.6)]`}
                          initial={reduceMotion ? false : { scale: 0.4 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 15, delay: reduceMotion ? 0 : 0.3 + i * 0.18 }}
                        >
                          {!reduceMotion && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#2a8a3a]/20 [animation-duration:2.8s] [animation-iteration-count:2] [animation-delay:1s]" aria-hidden="true" />}
                          <Icon size={24} strokeWidth={1.7} className="transition-transform duration-500 group-hover:rotate-[12deg] group-hover:scale-110" aria-hidden="true" />
                        </motion.span>
                        <h3 className={`mt-3 text-sm font-bold transition-colors duration-500 group-hover:text-[#1f7a35] ${!reduceMotion && flowStep === i ? 'text-[#1f7a35]' : 'text-primary'}`}>{step.title}</h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{step.detail}</p>
                      </motion.li>
                    );
                  })}
                </ol>
              </section>

              {/* Keep ready + IGO support */}
              <section className="overflow-hidden rounded-[36px] border border-[#e3ddc6] bg-[#FBF8EE] shadow-xl">
                <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
                  <div className="relative min-h-[220px] lg:min-h-full">
                    <img src={galleryImages[1] || galleryImages[0]} alt={`${property.title} farm view`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    <span className="absolute inset-0 hidden bg-gradient-to-r from-transparent via-transparent to-[#FBF8EE] lg:block" aria-hidden="true" />
                  </div>
                  <div className="grid gap-8 p-7 sm:p-9 md:grid-cols-2 md:gap-0">
                    <div className="md:pr-7">
                      <h2 className="flex items-start gap-3 text-2xl font-black leading-tight text-primary"><ClipboardCheck size={30} className="mt-0.5 shrink-0 text-[#1f7a35]" aria-hidden="true" />What Customer Should Keep Ready?</h2>
                      <ul className="mt-5 divide-y divide-[#e3ddc6]">
                        {customerNeeds.map((item: string) => (
                          <li key={item} className="flex items-start gap-3 py-3 text-sm font-medium text-primary"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#2a8a3a]" aria-hidden="true" />{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="md:border-l md:border-[#e3ddc6] md:pl-7">
                      <h2 className="flex items-center gap-3 text-2xl font-black text-primary"><Users size={30} className="shrink-0 text-[#1f7a35]" aria-hidden="true" />IGO Support</h2>
                      <ul className="mt-5 divide-y divide-[#e3ddc6]">
                        {igoSupport.map((item: string) => (
                          <li key={item} className="flex items-start gap-3 py-3 text-sm font-medium text-primary"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#2a8a3a]" aria-hidden="true" />{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Logistics */}
              <section className="rounded-[30px] border border-[#e3ddc6] bg-white/80 p-6 shadow-xl sm:p-8">
                <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr]">
                  <h2 className="flex items-center gap-4 text-2xl font-black leading-tight text-primary"><MapPin size={40} strokeWidth={1.5} className="shrink-0 text-[#1f7a35]" aria-hidden="true" />Logistics &amp;<br className="hidden lg:block" /> Connectivity</h2>
                  <ul className="grid grid-cols-2 gap-y-5 md:grid-cols-4">
                    {[
                      { label: 'Nearest Highway', value: property.infrastructure?.highwayDistance || '2-5 km', Icon: Truck },
                      { label: 'Primary Market', value: property.infrastructure?.marketDistance || '10-15 km', Icon: Warehouse },
                      { label: 'Cold Storage', value: property.infrastructure?.coldStorageDistance || 'Within 20 km', Icon: Warehouse },
                      { label: 'Power Supply', value: property.infrastructure?.powerAvailability || '3-Phase Agri', Icon: Zap },
                    ].map(({ label, value, Icon }, i) => (
                      <li key={label} className={`flex flex-col items-center gap-1.5 px-2 text-center ${i > 0 ? 'md:border-l md:border-[#e3ddc6]' : ''}`}>
                        <Icon size={24} strokeWidth={1.6} className="text-[#1f7a35]" aria-hidden="true" />
                        <span className="text-xs font-bold text-primary">{label}</span>
                        <span className="rounded-full bg-[#dcf0b8] px-3 py-1 text-xs font-bold text-primary">{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Address */}
              <section className="rounded-[30px] border border-[#e3ddc6] bg-[#FBF8EE] p-7 shadow-xl sm:p-9">
                <h2 className="flex items-center gap-3 text-2xl font-black text-primary"><MapPin size={28} className="text-[#1f7a35]" aria-hidden="true" />Official IGO Address Details</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-[#e3ddc6] bg-white p-5">
                    <p className="mb-2 flex items-center gap-2 text-sm font-bold text-primary"><Building2 size={18} className="text-[#2a8a3a]" aria-hidden="true" />Registered / Main Office</p>
                    <p className="text-sm font-medium leading-relaxed text-text-muted">{property.projectAddress}</p>
                  </div>
                  <div className="rounded-3xl border border-[#e3ddc6] bg-white p-5">
                    <p className="mb-2 flex items-center gap-2 text-sm font-bold text-primary"><MapPin size={18} className="text-[#2a8a3a]" aria-hidden="true" />Estate Support Office</p>
                    <p className="text-sm font-medium leading-relaxed text-text-muted">{property.projectOffice}</p>
                  </div>
                </div>
                {property.latitude != null && property.longitude != null && (
                  <a
                    href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-secondary transition-colors hover:text-primary"
                  >
                    <MapPin size={16} />
                    View Estate Location on Map ({property.latitude.toFixed(4)}, {property.longitude.toFixed(4)})
                  </a>
                )}
              </section>
            </div>
            </Band>

            
            <Band c="#F1DFD6">
            <section className="grid gap-8">
              <div className="bg-white rounded-[40px] p-8 border border-black/5 shadow-xl">
                <div className="flex items-center gap-3 text-secondary font-black uppercase tracking-widest text-xs mb-3">
                  <Droplets size={18} />
                  Soil Health Audit
                </div>
                <h2 className="text-3xl font-bold mb-6">Soil Composition</h2>
                {property.soilData ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'pH Level', value: property.soilData.ph, color: 'text-green-600' },
                      { label: 'Nitrogen', value: property.soilData.nitrogen, color: 'text-blue-600' },
                      { label: 'Phosphorus', value: property.soilData.phosphorus, color: 'text-purple-600' },
                      { label: 'Potassium', value: property.soilData.potassium, color: 'text-orange-600' },
                      { label: 'Organic Carbon', value: property.soilData.organicCarbon, color: 'text-brown-600' }
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-black/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{item.label}</p>
                        <p className={`text-lg font-black ${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-black/10">
                    <p className="text-sm text-text-muted">Detailed soil audit data available on request.</p>
                    <button className="mt-4 text-xs font-bold text-secondary uppercase tracking-widest border-b border-secondary">Download Sample Report</button>
                  </div>
                )}
              </div>
            </section>
            </Band>

            {/* PROFITABILITY & IGO PROJECT EXPLANATION */}
            <Band c="#DDECE5">
            <section className="bg-gradient-to-br from-primary to-primary-light rounded-[32px] p-6 md:p-8 text-white shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 text-secondary font-black uppercase tracking-widest text-xs mb-2">
                  <TrendingUp size={16} />
                  Investment Roadmap
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-3 leading-tight tracking-tight">Why Choose IGO Managed Farms?</h2>
                <p className="text-white/70 text-sm md:text-base mb-6 max-w-3xl">
                  IGO Agri Estate doesn't just sell land; we build high-yielding agricultural assets. Our turnkey "Managed Farm" model ensures your land generates profit while you stay stress-free.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      title: 'Scientific Setup',
                      desc: 'Soil health audit, NPK balancing, and climate-sync crop selection for maximum yield.',
                      icon: Sprout
                    },
                    {
                      title: 'Zero Maintenance',
                      desc: 'IGO handles labor, irrigation, weeding, and security. You receive monthly health reports.',
                      icon: CheckCircle2
                    },
                    {
                      title: 'Market Linkage',
                      desc: 'Direct buy-back or premium B2B linkage with retail chains ensuring guaranteed revenue.',
                      icon: Truck
                    },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/15 transition-all">
                      <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center mb-3 shadow-lg">
                        <item.icon size={20} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold mb-1">{item.title}</h3>
                      <p className="text-white/60 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            </Band>

          </main>

          <aside ref={leadRef} className="space-y-8 py-8 xl:py-12 xl:sticky xl:top-20">
            <LeadCaptureForm propertyTitle={property.title} propertyId={property.id} />

            {property.availableUnits && property.totalUnits && (
              <div className="bg-white border border-black/5 p-8 rounded-[40px] shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-black uppercase tracking-widest text-secondary">Inventory Status</p>
                  <p className="text-xs font-bold text-primary">{property.availableUnits} of {property.totalUnits} Units Left</p>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-secondary transition-all duration-1000" 
                    style={{ width: `${(property.availableUnits / property.totalUnits) * 100}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-text-muted italic">Selling fast. Last booking received 4 hours ago.</p>
              </div>
            )}

            <div className="bg-primary border border-black/5 p-8 rounded-[40px] shadow-xl text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Download size={20} className="text-secondary" />
                </div>
                <h4 className="text-xl font-bold">Project Brochure</h4>
              </div>
              <p className="text-white/60 text-sm mb-6">Get the detailed estate map, crop cycle, and complete financial projection in PDF.</p>
              <button className="w-full bg-secondary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-all">
                Download Now
              </button>
            </div>
          </aside>
        </div>

        {/* Rental Yield Calculator - for Rent/Lease properties */}
        {property && (property.intention === 'Rent' || property.intention === 'Lease' || property.type?.toLowerCase()?.includes('rent') || property.type?.toLowerCase()?.includes('lease')) && (
          <section className="mt-12">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-[40px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Calculator size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Rental Calculator</p>
                    <h2 className="text-2xl font-bold">Estimate Your Rental Yield</h2>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-10">
                  {/* Inputs */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="pd-monthly-rent" className="text-xs font-bold uppercase tracking-wider opacity-70">Monthly Expected Rent</label>
                      <div className="relative">
                        <IndianRupee size={20} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-50" />
                        <input
                          id="pd-monthly-rent"
                          type="number"
                          value={rentalInputs.monthlyRent}
                          onChange={(e) => setRentalInputs(prev => ({ ...prev, monthlyRent: e.target.value }))}
                          placeholder="e.g. 50000"
                          className="w-full bg-white/10 border border-white/20 rounded-2xl pl-14 pr-6 py-5 text-white placeholder-white/50 text-lg font-bold outline-none focus:ring-2 focus:ring-white/30 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="pd-annual-expenses" className="text-xs font-bold uppercase tracking-wider opacity-70">Annual Expenses</label>
                        <div className="relative">
                          <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
                          <input
                            id="pd-annual-expenses"
                            type="number"
                            value={rentalInputs.annualExpenses}
                            onChange={(e) => setRentalInputs(prev => ({ ...prev, annualExpenses: e.target.value }))}
                            placeholder="e.g. 10000"
                            className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-4 text-white placeholder-white/50 font-bold outline-none focus:ring-2 focus:ring-white/30"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="pd-vacancy-rate" className="text-xs font-bold uppercase tracking-wider opacity-70">Vacancy Rate %</label>
                        <div className="relative">
                          <Percent size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
                          <input
                            id="pd-vacancy-rate"
                            type="number"
                            value={rentalInputs.vacancyRate}
                            onChange={(e) => setRentalInputs(prev => ({ ...prev, vacancyRate: e.target.value }))}
                            placeholder="10"
                            className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-4 text-white placeholder-white/50 font-bold outline-none focus:ring-2 focus:ring-white/30"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="bg-black/20 rounded-[32px] p-8 border border-white/10">
                    <h3 className="text-lg font-bold mb-6 pb-4 border-b border-white/10">Projected Returns</h3>

                    <div className="space-y-5">
                      <div className="flex justify-between items-center">
                        <span className="opacity-70 text-sm">Gross Annual Income</span>
                        <span className="font-black text-lg">₹{rentalResult?.grossIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="opacity-70 text-sm">Net Annual Income</span>
                        <span className="font-black text-lg text-secondary">₹{rentalResult?.netIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="opacity-70 text-sm">Monthly Cashflow</span>
                        <span className={`font-black text-lg ${(rentalResult?.monthlyCashflow || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ₹{(rentalResult?.monthlyCashflow || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="h-px bg-white/10 my-4"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold uppercase tracking-wider">Net Yield</span>
                        <span className="text-3xl font-black text-secondary">{rentalResult?.yield.toFixed(2) || '0.00'}%</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10">
                      <p className="text-[10px] opacity-60 leading-relaxed">
                        Based on {property?.size} estate at ₹{property?.price}. Actual returns depend on occupancy, maintenance costs, and market conditions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/5 p-3 xl:hidden">
        <div className="container flex items-center gap-3">
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noreferrer" 
            onClick={handleWhatsAppClick}
            className="flex-1 bg-primary text-white py-3 rounded-2xl font-bold text-sm text-center"
          >
            WhatsApp
          </a>
          <a href={`tel:${igoPhone}`} className="flex-1 bg-gray-100 text-primary py-3 rounded-2xl font-bold text-sm text-center">
            Call
          </a>
          <button 
            onClick={() => {
              if (!user) {
                setAuthMessage("Please sign in to send an enquiry about this estate.");
                setShowAuthModal(true);
              } else {
                leadRef.current?.scrollIntoView({ behavior: 'smooth' });
              }
            }} 
            className="flex-1 bg-secondary text-white py-3 rounded-2xl font-bold text-sm"
          >
            Enquiry
          </button>
        </div>
      </div>

      <Lightbox images={galleryImages} index={lightboxIndex} onIndexChange={setLightboxIndex} alt={property.title} />

      <AuthRequiredModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        message={authMessage}
      />
    </div>
  );
};

export default PropertyDetails;
