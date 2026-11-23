import {
  MapPin, ArrowRight, Zap, TrendingUp, Sprout, ShieldCheck, CheckCircle2,
  LayoutGrid, Newspaper, PlayCircle, Users, Calculator, MessageCircle, Camera
} from 'lucide-react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import React from 'react';
import SEO from './components/SEO';
import type { Property } from './types';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AIAssistant from './components/ai/AIAssistant';
import { AnimatePresence } from 'framer-motion';
import PropertyCard from './components/PropertyCard';
import AboutPage from './pages/AboutPage';
import Contact from './pages/Contact';
import { Suspense, lazy } from 'react';
const Leadership = lazy(() => import('./pages/Leadership'));
const Faq = lazy(() => import('./pages/Faq'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Profile = lazy(() => import('./pages/Profile'));
const Listings = lazy(() => import('./pages/Listings'));
const PostRequirement = lazy(() => import('./pages/PostRequirement'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const ValuationSimulator = lazy(() => import('./pages/ValuationSimulator'));
const TaxOptimizer = lazy(() => import('./pages/TaxOptimizer'));
const AIServices = lazy(() => import('./pages/AIServices'));
const Careers = lazy(() => import('./pages/Careers'));
const Blog = lazy(() => import('./pages/Blog'));
const KnowledgeHub = lazy(() => import('./pages/KnowledgeHub'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const CustomPage = lazy(() => import('./pages/CustomPage'));
const AdminApp = lazy(() => import('./admin/AdminApp'));
const PropertyForm = lazy(() => import('./pages/admin/PropertyForm'));
const InvestorDashboard = lazy(() => import('./pages/dashboard/InvestorDashboard'));
const SellLand = lazy(() => import('./pages/SellLand'));
const Projects = lazy(() => import('./pages/Projects'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const BlogsPage = lazy(() => import('./pages/BlogsPage'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
// import GlobalBackground from './components/3d/GlobalBackground';
const Services = lazy(() => import('./pages/Services'));
const LegalServices = lazy(() => import('./pages/services/LegalServices'));
const SoilIntelligence = lazy(() => import('./pages/services/SoilIntelligence'));
const Policy = lazy(() => import('./pages/Policy'));
const Terms = lazy(() => import('./pages/Terms'));
import PopularLocations from './components/home/PopularLocations';
import VerifiedInvestments from './components/home/VerifiedInvestments';
import KnowledgeHubSection from './components/home/KnowledgeHubSection';
import { submitLead } from './lib/leadsService';
import LiveChatWidget from './components/LiveChatWidget';
import { useProperties } from './hooks/useProperties';
import { useEffect, useMemo, useState } from 'react';
import { getLocalSettings, SETTINGS_SYNC_EVENT, subscribeLocalSync } from './lib/localSync';

const InstagramIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const FacebookIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

const RouteLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const NotFound: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6">
    <SEO title="Page Not Found | IGO Agri Estates" description="The page you are looking for does not exist or has been moved." canonical="/" noIndex />
    <div className="text-center max-w-lg">
      <div className="text-[120px] font-black text-primary/10 leading-none mb-4">404</div>
      <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-4">Page Not Found</h1>
      <p className="text-text-muted mb-10 text-lg font-light leading-relaxed">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-gold px-10 py-4 rounded-[24px] inline-block font-black uppercase tracking-widest text-xs">
        Back to Home
      </Link>
    </div>
  </div>
);

import BrandsMarquee from './components/home/BrandsMarquee';
import SellBuyPaths from './components/home/SellBuyPaths';
import RequirementSection from './components/home/RequirementSection';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { publicProperties } = useProperties();

  // Identify visitor if logged in
  useEffect(() => {
    if (user && user.email) {
      import('./lib/trackingService').then(ts => {
        ts.identifyVisitor(user.user_metadata?.name || user.email || 'Anonymous', user.email || '');
      });
    }
  }, [user]);

  const recentlyAdded = useMemo(() => 
    [...publicProperties]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 3),
    [publicProperties]
  );

  return (
    <main id="home" className="bg-background">
      <SEO
        title="IGO Agri Estates | Buy & Sell Managed Agricultural Land in India"
        description="IGO Agri Estates — India's premium platform to buy, sell, and invest in verified managed agricultural land. Teak plantations, mango orchards, polyhouse farms, and horticulture estates across Tamil Nadu, Karnataka, Maharashtra, Andhra Pradesh & Telangana. Clear titles. Farm-as-a-service support."
        canonical="/"
        keywords="agricultural land for sale India, managed farmland India, farmland investment India, buy agri estate, teak plantation India, mango orchard farm, polyhouse farm India, horticulture estate, managed farmland near Bangalore, farmland near Hyderabad, agricultural land near Pune, farm land near Chennai, managed farm investment Coimbatore, Mahabalipuram farmland, Kanchipuram agri land, IGO agri estates, agricultural land Tamil Nadu, farmland Karnataka, agri land Maharashtra, farm investment Andhra Pradesh, agri investment Telangana, NRI farmland investment India, farm as a service India, 1 acre farm land price India, buy farmland online India"
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': 'https://www.igoagriestate.com/#organization',
            name: 'IGO Agri Estates',
            url: 'https://www.igoagriestate.com',
            logo: 'https://www.igoagriestate.com/images/logo.png',
            contactPoint: { '@type': 'ContactPoint', telephone: '+91-7397789803', contactType: 'customer service' },
            sameAs: ['https://www.facebook.com/share/173LkV9obs/', 'https://www.instagram.com/igofarmlandestates/']
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            url: 'https://www.igoagriestate.com',
            name: 'IGO Agri Estates',
            potentialAction: { '@type': 'SearchAction', target: 'https://www.igoagriestate.com/listings?q={search_term_string}', 'query-input': 'required name=search_term_string' }
          }
        ]}
      />
      <Hero />

        <SellBuyPaths />

        {/* Location Quick Links */}
        <PopularLocations />

        <VerifiedInvestments />

      {/* Agri Estate Categories */}
      <section className="py-16 lg:py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-topo opacity-5 pointer-events-none"></div>
        <div className="container-pro">
          <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-14">
            <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Agri Estate Models</span>
            <h2 className="heading-lg !mb-4 lg:!text-5xl text-white">Land Into <br /><span className="text-secondary not-italic">Farm Income</span></h2>
            <p className="text-base md:text-lg text-white/50 font-light leading-relaxed">
              Estate-format agriculture models designed around real crops, water access, market linkage, and owner reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { title: 'Protected Cultivation', desc: 'Shade net and polyhouse vegetable models for high-value recurring harvests.', img: '/images/properties/cat-protected-cultivation.webp', icon: <Sprout />, filter: 'Protected', location: 'Kanchipuram', id: 'polyhouse-project' },
              { title: 'Horticulture Orchards', desc: 'Fruit plantation estates with drip irrigation, staged harvest, and managed sales potential.', img: '/images/properties/cat-horticulture-orchids.webp', icon: <TrendingUp />, filter: 'Horticulture', location: 'Maduranthagam', id: 'horticulture-project' },
              { title: 'Agroforestry Farms', desc: 'Timber, spice, and intercrop models for long-term land value and farm income.', img: '/images/properties/cat-agroforestry.webp', icon: <Zap />, filter: 'Open Field', location: 'Mahabalipuram', id: 'open-cultivation-project' }
            ].map((cat, i) => (
              <Link
                key={i}
                to={`/properties/${cat.id}`}
                className="group relative h-[420px] lg:h-[460px] rounded-[40px] overflow-hidden cursor-pointer shadow-2xl bg-black block"
              >
                <motion.div whileHover={{ y: -15 }} className="w-full h-full">
                  <img src={cat.img} alt={cat.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white mb-5 border border-white/20 group-hover:bg-secondary group-hover:border-secondary transition-all">
                      {cat.icon}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-3 leading-tight uppercase tracking-tighter">{cat.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed mb-8 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0">{cat.desc}</p>
                    <div className="flex items-center text-white font-bold text-[10px] uppercase tracking-[0.2em] group/btn">
                      View Details <ArrowRight size={18} className="ml-3 group-hover/btn:translate-x-3 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge */}
      <KnowledgeHubSection />

      <div id="mira-intro-slot"></div>
      <RequirementSection />
    </main>
  );
};

import { trackVisit } from './lib/trackingService';
import LiveContent from './cms/LiveContent';

function App() {
  const location = useLocation();

  // Safety net for in-app links: if a click on an internal link has not changed the page after 1.5s
  // (e.g. a lazy page chunk is stuck loading), load the destination normally instead of leaving the click dead.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const from = window.location.pathname + window.location.search;
      const to = url.pathname + url.search;
      if (to === from || url.hash) return;
      window.setTimeout(() => {
        if (window.location.pathname + window.location.search === from) window.location.assign(to);
      }, 1500);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Warm the page chunks users navigate to most, once the browser is idle. Without this, the first click on
  // Back / a nav link waits for the lazy chunk to download and compile while the old page stays on screen,
  // which looks like the click did nothing.
  useEffect(() => {
    const loaders = [
      () => import('./pages/Listings'), () => import('./pages/PropertyDetails'), () => import('./pages/Projects'),
      () => import('./pages/SellLand'), () => import('./pages/Services'), () => import('./pages/Leadership'),
      () => import('./pages/Faq'), () => import('./pages/Careers'),
    ];
    let cancelled = false;
    const timers: number[] = [];
    const start = window.setTimeout(() => {
      loaders.forEach((load, i) => {
        timers.push(window.setTimeout(() => { if (!cancelled) load().catch(() => undefined); }, i * 500));
      });
    }, 1500);
    return () => { cancelled = true; window.clearTimeout(start); timers.forEach((t) => window.clearTimeout(t)); };
  }, []);
  const [settings, setSettings] = useState(getLocalSettings);
  // The new admin panel has its own layout, so hide the public header/footer/widgets there.
  const isPanel = /^\/admin(\/|$)/.test(location.pathname) && !/^\/admin\/(dashboard|new|edit)(\/|$)/.test(location.pathname);

  useEffect(() => {
    // Track page views on route change
    if (!location.search.includes('cms_preview')) trackVisit();
  }, [location.pathname]);

  useEffect(() => {
    return subscribeLocalSync(SETTINGS_SYNC_EVENT, () => setSettings(getLocalSettings()));
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        {/* <GlobalBackground /> */}
        <div className="min-h-screen relative font-sans selection:bg-secondary/30">
          <LiveContent />
          {!isPanel && <Navbar />}
           <AnimatePresence mode="wait">
            <Suspense fallback={<RouteLoader />}>
              <div id="cms-root" style={{ display: 'contents' }}>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/locations" element={<Listings />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              <Route path="/post-requirement" element={<PostRequirement />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/leadership" element={<Leadership />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/valuation" element={<ValuationSimulator />} />
              <Route path="/tax-optimizer" element={<TaxOptimizer />} />
              <Route path="/ai-services" element={<AIServices />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/p/:slug" element={<CustomPage />} />
              <Route path="/post-property" element={<Navigate to="/sell-land" replace />} />
              <Route path="/sell-land" element={<SellLand />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/seller-dashboard" element={<SellerDashboard />} />
              <Route path="/blog" element={<Navigate to="/blogs" replace />} />
              <Route path="/blogs" element={<BlogsPage />} />
              <Route path="/blogs/:slug" element={<BlogDetail />} />
              <Route path="/videos" element={<Navigate to="/" replace />} />
              <Route path="/knowledge-hub" element={<KnowledgeHub />} />
              <Route path="/dashboard" element={<ProtectedRoute><InvestorDashboard /></ProtectedRoute>} />
              <Route path="/admin/*" element={<AdminApp />} />
              <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
              <Route path="/admin/new" element={<AdminProtectedRoute><PropertyForm /></AdminProtectedRoute>} />
              <Route path="/admin/edit/:id" element={<AdminProtectedRoute><PropertyForm /></AdminProtectedRoute>} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/legal" element={<LegalServices />} />
              <Route path="/services/soil" element={<SoilIntelligence />} />
              <Route path="/policy" element={<Policy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
              </div>
            </Suspense>
           </AnimatePresence>

          {!isPanel && settings.enableAI && <AIAssistant />}
          {!isPanel && settings.enableChat && <LiveChatWidget />}

          {/* 26 Verticals Brands Marquee - Home page only */}
          {!isPanel && location.pathname === '/' && <BrandsMarquee />}

          {/* Footer */}
          {!isPanel && <footer className="relative overflow-hidden bg-[#022c22] text-white normal-case tracking-normal">
            <div className="relative z-10 mx-auto w-full max-w-[1660px] px-5 pb-6 pt-12 sm:px-8 md:pt-[60px] lg:px-10 xl:px-14">
              <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] xl:gap-x-16">
                <div className="min-w-0">
                  <Link to="/" aria-label="IGO Agri Estates home" className="inline-flex items-center justify-center rounded-md bg-white p-2 leading-none">
                    <img src="/images/logo.png" alt="IGO Agri Estate" className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16" />
                  </Link>
                  <p className="mt-6 max-w-[380px] text-[15px] leading-7 text-white/70">
                    IGO Agri Estates helps you buy, sell and invest in verified agricultural land across India, with legal checks and scientific farm planning.
                  </p>
                  <div className="mt-6 flex gap-3">
                    {[
                      { icon: FacebookIcon, link: 'https://www.facebook.com/share/173LkV9obs/', label: 'Facebook' },
                      { icon: InstagramIcon, link: 'https://www.instagram.com/igofarmlandestates/?hl=en', label: 'Instagram' }
                    ].map(social => (
                      <a
                        key={social.label}
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        title={social.label}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white hover:text-[#022c22]"
                      >
                        <social.icon size={18} />
                      </a>
                    ))}
                  </div>
                </div>

                <nav aria-label="Explore" className="min-w-0">
                  <h5 className="m-0 text-lg font-extrabold uppercase leading-7 tracking-wide text-white">Explore</h5>
                  <ul className="mt-6 flex flex-col gap-3.5 text-[15px] leading-6 text-white/80">
                    {[
                      ['Home', '/'],
                      ['Buy Land', '/listings'],
                      ['Sell Land', '/sell-land'],
                      ['Projects', '/projects'],
                      ['About Us', '/about'],
                      ['Leadership', '/leadership'],
                      ['FAQ', '/faq'],
                      ['Contact Us', '/contact'],
                    ].map(([label, to]) => (
                      <li key={label}><Link to={to} className="font-normal normal-case tracking-normal transition-colors hover:text-white hover:underline">{label}</Link></li>
                    ))}
                  </ul>
                </nav>

                <nav aria-label="Services and resources" className="min-w-0">
                  <h5 className="m-0 text-lg font-extrabold uppercase leading-7 tracking-wide text-white">Services</h5>
                  <ul className="mt-6 flex flex-col gap-3.5 text-[15px] leading-6 text-white/80">
                    {[
                      ['Legal Services', '/services/legal'],
                      ['Soil Testing', '/services/soil'],
                      ['Land Valuation', '/valuation'],
                      ['Tax Optimizer', '/tax-optimizer'],
                      ['Knowledge Hub', '/knowledge-hub'],
                      ['Blogs', '/blogs'],
                      ['Videos', '/videos'],
                    ].map(([label, to]) => (
                      <li key={label}><Link to={to} className="font-normal normal-case tracking-normal transition-colors hover:text-white hover:underline">{label}</Link></li>
                    ))}
                  </ul>
                </nav>

                <div className="min-w-0">
                  <h5 className="m-0 text-lg font-extrabold uppercase leading-7 tracking-wide text-white">Head Office</h5>
                  <div className="mt-6 flex flex-col gap-3.5 text-[15px] leading-6 text-white/80">
                    <address className="not-italic leading-7">
                      No. 17, Kovalan Street,<br />
                      2nd Main Road, Uthandi Kanathur,<br />
                      Chennai – 600119, Tamil Nadu, India
                    </address>
                    <a href="mailto:bd2@igogroups.com" className="w-fit transition-colors hover:text-white hover:underline">bd2@igogroups.com</a>
                    <a href="tel:+917397789803" className="w-fit transition-colors hover:text-white hover:underline">+91 73977 89803</a>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex flex-row flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/10 pt-6 pr-20 text-sm text-white/70">
                <p>© 2026 IGO Group Units. All rights reserved.</p>
                <div className="flex gap-6">
                  <Link to="/policy" className="transition-colors hover:text-white">Privacy Policy</Link>
                  <Link to="/terms" className="transition-colors hover:text-white">Terms &amp; Conditions</Link>
                </div>
              </div>
            </div>
          </footer>}
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
