import { BLOGS_KEY, getLocalBlogs } from '../lib/localSync';

/**
 * Blog content.
 * The articles below are general educational content written for this site (not project announcements).
 * Posts added in the admin panel (Dashboard → Blogs) are merged in automatically, so the admin keeps working.
 */
export interface ArticleSection { heading: string; paragraphs: string[]; list?: string[]; tip?: string }
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string; // ISO yyyy-mm-dd
  image: string;
  imageAlt: string;
  intro: string;
  sections: ArticleSection[];
  takeaways: string[];
  featured?: boolean;
  group?: 'land' | 'knowledge';
  fromAdmin?: boolean;
}

export interface BlogCategory { name: string; slug: string; description: string; icon: string; image: string; imageAlt: string }
export const BLOG_CATEGORIES: BlogCategory[] = [
  { name: 'Land Investment', slug: 'land-investment', icon: 'landmark', description: 'Understanding farmland, documents and long-term considerations.', image: '/images/properties/maduranthagam-parcel-1-v2.jpg', imageAlt: 'Farmland at sunset with fields and hills' },
  { name: 'Organic Farming', slug: 'organic-farming', icon: 'leaf', description: 'Natural inputs, composting and chemical-free practices.', image: '/images/properties/open-cultivation.png', imageAlt: 'Rows of vegetable crops in an open field' },
  { name: 'Horticulture', slug: 'horticulture', icon: 'apple', description: 'Fruit, vegetable and plantation crops for Tamil Nadu.', image: '/images/properties/proj-horticulture.webp', imageAlt: 'Mango trees laden with fruit in an orchard' },
  { name: 'Crop Cultivation', slug: 'crop-cultivation', icon: 'wheat', description: 'Choosing crops and looking after them through the season.', image: '/images/properties/paddy-field.png', imageAlt: 'Paddy field with palm trees' },
  { name: 'Soil Health', slug: 'soil-health', icon: 'sprout', description: 'Soil testing, nutrients and keeping land productive.', image: '/images/services/soil-npk.webp', imageAlt: 'Hand holding soil with test tubes in a crop field' },
  { name: 'Irrigation & Water Management', slug: 'irrigation-water-management', icon: 'droplets', description: 'Drip, sprinkler and smarter use of every litre.', image: '/images/blog/irrigation.png', imageAlt: 'Drip irrigation line under fruit trees' },
  { name: 'Sustainable Agriculture', slug: 'sustainable-agriculture', icon: 'recycle', description: 'Farming that protects land and water for the future.', image: '/images/properties/cat-agroforestry.webp', imageAlt: 'Agroforestry rows of trees with ground cover' },
  { name: 'Agricultural Technology', slug: 'agricultural-technology', icon: 'cpu', description: 'Sensors, data and tools that support farm decisions.', image: '/images/services/soil-climate.webp', imageAlt: 'Drone flying over crop fields' },
  { name: 'Land Development', slug: 'land-development', icon: 'tractor', description: 'From raw land to a farm that is ready to plant.', image: '/images/featured/farm-development.webp', imageAlt: 'Engineer reviewing farm land development' },
  { name: 'IGO Project Updates', slug: 'igo-project-updates', icon: 'map-pin', description: 'News and site updates from IGO Agri Estate.', image: '/images/featured/maduranthagam-aerial.webp', imageAlt: 'Aerial view of Maduranthagam agricultural land' },
];

const AUTHOR = 'IGO Agri Estate Editorial Team';

export const BLOG_POSTS: BlogPost[] = [
  /* ---------------- Land investment insights ---------------- */
  {
    slug: 'benefits-of-agricultural-land-investment',
    title: 'The Benefits of Agricultural Land Investment',
    excerpt: 'Why many buyers look at farmland as a long-term asset, and the practical points to weigh before deciding.',
    category: 'Land Investment', author: AUTHOR, date: '2026-11-10', group: 'land', featured: true,
    image: '/images/featured/aerial-farmland-16x9.webp', imageAlt: 'Aerial view of farmland with marked plots',
    intro: 'Farmland is a physical asset that can be used, developed or simply held. Buyers are drawn to it for different reasons, and the right choice depends on your goals, budget and time horizon.',
    sections: [
      { heading: 'A tangible asset with real uses', paragraphs: ['Unlike many financial products, agricultural land is something you can visit, measure and put to work. It can be cultivated, leased to farmers, developed into a managed farm project or held for the long term.', 'Because land is limited and usable farmland near towns and roads is in demand, many owners treat it as one part of a diversified portfolio rather than a short-term trade.'] },
      { heading: 'Flexibility in how you use it', paragraphs: ['Owners can choose a hands-on role, appoint a manager or work with a developer who plans and sets up the farm. Each route has different costs, effort and risks.'], list: ['Cultivate it yourself or through a farm manager', 'Lease it to a local farmer', 'Develop it as a managed farm project', 'Hold it while you plan the next step'] },
      { heading: 'What to weigh honestly', paragraphs: ['Land is not a guaranteed profit. Prices depend on location, access, water, soil, documentation and the wider market, and they can stay flat for years. Selling land also takes time compared with listed investments.', 'Farm income varies with weather, crop prices and management. Treat any promised return with caution and ask for the assumptions behind it.'], tip: 'Decide your purpose first (income, use, or long-term holding). It shapes the land you should look for.' },
    ],
    takeaways: ['Farmland is a physical, usable asset, not a guaranteed return.', 'Location, water, soil and clean documents matter more than size alone.', 'Match the way you will use the land to your time, budget and goals.'],
  },
  {
    slug: 'how-to-choose-the-right-agricultural-land',
    title: 'How to Choose the Right Agricultural Land',
    excerpt: 'A practical checklist covering access, water, soil, boundaries and the neighbourhood around a plot.',
    category: 'Land Investment', author: AUTHOR, date: '2026-11-08', group: 'land',
    image: '/images/featured/agricultural-land.webp', imageAlt: 'Open agricultural land under a clear sky',
    intro: 'Two plots of the same size can behave very differently. Visiting the land and checking a few fundamentals can save you from expensive surprises later.',
    sections: [
      { heading: 'Start with access and surroundings', paragraphs: ['Check how you will reach the land in every season. A good all-weather road, nearby power and a reachable town for labour and inputs make daily farming easier.', 'Look at neighbouring land use too. Healthy farms nearby, a stable water source and clear boundaries are usually positive signs.'] },
      { heading: 'Water and soil come next', paragraphs: ['Water decides what you can grow. Ask about borewells, canals, ponds and rainfall, and how water levels behave in summer.', 'Soil should be tested before you commit. Texture, depth, drainage and nutrient status all influence crop choice and cost.'], list: ['Water source and its reliability in dry months', 'Soil type, depth and drainage', 'Slope and flood or waterlogging history', 'Distance to markets and processing points'] },
      { heading: 'Verify before you pay', paragraphs: ['Confirm the seller\'s ownership and the land\'s documents with a qualified lawyer, and walk the boundaries with the survey sketch in hand.'], tip: 'Visit at least twice, once after rain and once in a dry spell, to see how the land really behaves.' },
    ],
    takeaways: ['Check access, water and soil before price.', 'Visit in different seasons if you can.', 'Have documents and boundaries verified professionally.'],
  },
  {
    slug: 'documents-to-check-before-buying-farmland',
    title: 'Important Documents to Check Before Buying Farmland',
    excerpt: 'The core records buyers usually review, and why a legal check matters before any payment.',
    category: 'Land Investment', author: AUTHOR, date: '2026-11-06', group: 'land',
    image: '/images/featured/farm-development.webp', imageAlt: 'Farm land under development with marked boundaries',
    intro: 'Clear paperwork is the foundation of a safe land purchase. The exact documents differ by state and district, so always confirm the list with a local lawyer or the relevant revenue office.',
    sections: [
      { heading: 'Ownership and title records', paragraphs: ['You will normally want to see the sale deed or earlier deeds that show how the seller became the owner, along with revenue records that name the owner and describe the land.'], list: ['Sale deed and earlier title deeds', 'Patta / chitta and adangal (or the equivalent in your state)', 'Survey number and Field Measurement Book (FMB) sketch', 'Property tax or land revenue receipts'] },
      { heading: 'Encumbrances and legal history', paragraphs: ['An Encumbrance Certificate shows registered transactions and charges on the land over a period of years. Check it for loans, mortgages or earlier sales.', 'Ask whether there are any disputes, court cases, or co-owners whose consent is required.'] },
      { heading: 'Land use and approvals', paragraphs: ['Confirm the land\'s classification and what it may be used for. If you plan any change of use, check the rules and approvals that apply before you buy.'], tip: 'Do not pay a large advance until a lawyer has reviewed the documents.' },
    ],
    takeaways: ['Verify the chain of ownership, not just the latest deed.', 'Check encumbrances, co-owners and any pending disputes.', 'Confirm land classification before planning any use.'],
  },
  {
    slug: 'understanding-land-development',
    title: 'Understanding Land Development for Farming',
    excerpt: 'What it takes to turn raw land into a farm that is ready for crops: clearing, water, access and soil preparation.',
    category: 'Land Development', author: AUTHOR, date: '2026-11-04', group: 'land',
    image: '/images/blog/drone-audit.png', imageAlt: 'Drone survey over farmland for land planning',
    intro: 'Developing land is more than buying it. A good plan sequences the work so that water, access and soil are ready before the first crop goes in.',
    sections: [
      { heading: 'Survey and planning', paragraphs: ['Development starts with a boundary survey and a layout: where roads, water sources, storage and planting blocks will sit. Drone or topographic surveys help you see slope and drainage.'] },
      { heading: 'Basic infrastructure', paragraphs: ['Typical early works include fencing, internal tracks, a reliable water source and power connection, and a simple store or shed.'], list: ['Boundary fencing and gates', 'Internal roads and drainage', 'Water source, storage and distribution', 'Power, shed and storage'] },
      { heading: 'Preparing the soil', paragraphs: ['Soil testing guides the amendments. Land may need levelling, organic matter, and correction of pH or nutrient gaps before planting.', 'Staging the work season by season keeps costs under control.'], tip: 'Build water and access first. Everything else depends on them.' },
    ],
    takeaways: ['Plan the whole layout before spending on parts of it.', 'Water, access and soil come before planting.', 'Stage the work to manage cost and risk.'],
  },
  {
    slug: 'long-term-agricultural-investment-considerations',
    title: 'Long-Term Agricultural Investment: What to Consider',
    excerpt: 'Time horizon, liquidity, costs and management: the questions that shape a sound farmland plan.',
    category: 'Land Investment', author: AUTHOR, date: '2026-11-02', group: 'land',
    image: '/images/featured/maduranthagam-aerial.webp', imageAlt: 'Aerial view of agricultural land in the Maduranthagam region',
    intro: 'Farmland rewards patience, and it asks for realistic planning. These considerations help you decide whether and how to hold agricultural land over many years.',
    sections: [
      { heading: 'Time horizon and liquidity', paragraphs: ['Land is not quickly sold. Plan on holding for several years, and keep other savings available for emergencies so you are never forced to sell at a bad time.'] },
      { heading: 'Running costs and management', paragraphs: ['Even unused land has costs: taxes, boundary upkeep, security and periodic inspection. Farming adds inputs, labour and water costs.', 'Decide early who will manage the land and how you will monitor them.'], list: ['Annual taxes and upkeep', 'Labour, inputs and water', 'Insurance where available', 'A manager or developer you trust'] },
      { heading: 'Avoid unrealistic promises', paragraphs: ['Be cautious of anyone who guarantees returns or appreciation. Ask for written terms, references and the assumptions behind any projection.'], tip: 'Write down your goal and your worst acceptable outcome before buying.' },
    ],
    takeaways: ['Plan for a multi-year holding period.', 'Budget for ongoing costs, not only the purchase.', 'Treat guaranteed returns as a warning sign.'],
  },
  {
    slug: 'things-to-know-before-purchasing-agricultural-property',
    title: 'Things to Know Before Purchasing Agricultural Property',
    excerpt: 'A step-by-step sequence for a safer purchase, from first site visit to registration.',
    category: 'Land Investment', author: AUTHOR, date: '2026-10-30', group: 'land',
    image: '/images/featured/offer-buy-land.webp', imageAlt: 'Buyer reviewing agricultural land purchase',
    intro: 'A careful process protects you. Follow the steps in order and do not skip verification because a deal looks attractive.',
    sections: [
      { heading: 'Before you commit', paragraphs: ['Define your budget including registration, legal and development costs. Shortlist land that fits your goal, and visit it in person.'] },
      { heading: 'Verification steps', paragraphs: ['Verify identity and ownership, review documents with a lawyer, and confirm boundaries on the ground.'], list: ['Site visit and boundary walk', 'Document and title review', 'Encumbrance and dispute check', 'Soil and water check', 'Written agreement with clear terms'] },
      { heading: 'Completing the purchase', paragraphs: ['Pay through traceable banking channels, register the sale deed at the sub-registrar office, and update revenue records in your name.'], tip: 'Keep copies of every document and receipt together in one file.' },
    ],
    takeaways: ['Verify first, pay later.', 'Use banking channels and register the deed.', 'Update revenue records after purchase.'],
  },

  /* ---------------- Farming knowledge ---------------- */
  {
    slug: 'best-fruit-crops-to-grow-in-tamil-nadu',
    title: 'Best Fruit Crops to Grow in Tamil Nadu',
    excerpt: 'Mango, guava, banana, papaya and other fruit crops that suit Tamil Nadu\'s climate, and how to choose among them.',
    category: 'Horticulture', author: AUTHOR, date: '2026-10-28', group: 'knowledge',
    image: '/images/featured/mango-plantation-hd.webp', imageAlt: 'Mango plantation with rows of fruiting trees',
    intro: 'Tamil Nadu\'s warm climate supports a wide range of fruit crops. The best choice depends on your water, soil, market access and how long you can wait for the first harvest.',
    sections: [
      { heading: 'Crops that commonly do well', paragraphs: ['Mango, guava, banana, papaya, sapota (chikoo), pomegranate, lime and coconut are widely grown across the state. Each has its own water needs, spacing and time to first fruit.'], list: ['Quick returns: banana and papaya', 'Medium term: guava, lime, pomegranate', 'Long term: mango, sapota, coconut'] },
      { heading: 'Match the crop to the land', paragraphs: ['Check soil depth and drainage, and the reliability of water in summer. Select varieties recommended for your district, and buy planting material from reliable nurseries.'] },
      { heading: 'Think about the market', paragraphs: ['Consider distance to buyers, cold storage and processing options. Mixed planting can spread risk and give income earlier while slower trees mature.'], tip: 'Ask your local horticulture office or agricultural university for varieties suited to your district.' },
    ],
    takeaways: ['Choose crops by water, soil and market, not trend.', 'Balance quick-return and long-term crops.', 'Use reliable, district-recommended planting material.'],
  },
  {
    slug: 'organic-farming-techniques',
    title: 'Organic Farming Techniques That Work',
    excerpt: 'Compost, green manure, crop rotation and natural pest management for healthier, chemical-free farming.',
    category: 'Organic Farming', author: AUTHOR, date: '2026-10-26', group: 'knowledge',
    image: '/images/featured/organic-farmland-hd.webp', imageAlt: 'Organic farmland with healthy green crops',
    intro: 'Organic farming builds soil health through natural inputs and good management. It takes planning, but the core practices are simple.',
    sections: [
      { heading: 'Feed the soil', paragraphs: ['Compost, vermicompost and farmyard manure add organic matter and support soil life. Green manure crops such as sunhemp or dhaincha are grown and ploughed in to add nutrients.'] },
      { heading: 'Rotate and diversify', paragraphs: ['Rotating crops breaks pest and disease cycles and balances nutrient use. Including legumes helps restore nitrogen.'], list: ['Compost and vermicompost', 'Green manure crops', 'Crop rotation and intercropping', 'Mulching to hold moisture and suppress weeds'] },
      { heading: 'Manage pests naturally', paragraphs: ['Use resistant varieties, field hygiene, traps and neem-based or biological controls. Certification schemes have specific rules and conversion periods, so check requirements before you market produce as organic.'], tip: 'Start with a small plot and expand as you learn what works on your soil.' },
    ],
    takeaways: ['Healthy soil is the foundation of organic farming.', 'Rotation and diversity reduce pest pressure.', 'Check certification rules before selling as organic.'],
  },
  {
    slug: 'importance-of-soil-testing',
    title: 'The Importance of Soil Testing',
    excerpt: 'How a simple soil test guides fertiliser use, saves money and protects your crop.',
    category: 'Soil Health', author: AUTHOR, date: '2026-10-24', group: 'knowledge',
    image: '/images/featured/knowledge-seedling.webp', imageAlt: 'Young seedling growing in healthy soil',
    intro: 'A soil test tells you what your land has and what it lacks. It replaces guesswork with data and helps you spend on inputs that actually help.',
    sections: [
      { heading: 'What a test measures', paragraphs: ['A standard test reports pH, electrical conductivity (salinity), organic carbon and the main nutrients: nitrogen, phosphorus and potassium. Many labs also test micronutrients such as zinc and iron.'] },
      { heading: 'How to take a good sample', paragraphs: ['Collect soil from several spots across the field, from the root zone depth, and mix them into one representative sample. Avoid sampling near bunds, manure heaps or wet patches.'], list: ['Take 8–10 spots in a zig-zag pattern', 'Sample at the correct depth for your crop', 'Mix well and send about half a kilo', 'Label the field and the crop planned'] },
      { heading: 'Use the results', paragraphs: ['Use the report to plan fertiliser and organic amendments, and to correct acidity or salinity. Retest every few seasons to track change.'], tip: 'Government and university soil testing labs offer low-cost testing in many districts.' },
    ],
    takeaways: ['Test before you buy inputs.', 'Sample correctly, or the result misleads.', 'Retest regularly to track progress.'],
  },
  {
    slug: 'modern-irrigation-methods',
    title: 'Modern Irrigation Methods Explained',
    excerpt: 'Drip, sprinkler and fertigation systems compared, with notes on when each one fits.',
    category: 'Irrigation & Water Management', author: AUTHOR, date: '2026-10-22', group: 'knowledge',
    image: '/images/blog/irrigation.png', imageAlt: 'Irrigation system watering crop rows',
    intro: 'Efficient irrigation delivers water where the crop needs it and wastes less. The right system depends on the crop, soil and budget.',
    sections: [
      { heading: 'Drip irrigation', paragraphs: ['Drip systems deliver water slowly at the root zone through emitters. They suit orchards, vegetables and row crops, and can reduce water use and weed growth compared with flood irrigation.'] },
      { heading: 'Sprinkler and other systems', paragraphs: ['Sprinklers spray water like rainfall and suit many field crops and uneven land. Surface methods like furrow irrigation are cheaper but less efficient.'], list: ['Drip: orchards, vegetables, high-value crops', 'Sprinkler: field crops, uneven land', 'Furrow or flood: low cost, higher water use', 'Fertigation: nutrients delivered through drip lines'] },
      { heading: 'Plan and maintain', paragraphs: ['Filters, pressure and regular flushing keep systems working. Check government schemes that may support micro-irrigation costs in your area.'], tip: 'Match emitter spacing and flow to your crop and soil, not to a generic design.' },
    ],
    takeaways: ['Drip saves water for orchards and vegetables.', 'Choose the system to suit crop, soil and budget.', 'Maintenance decides long-term performance.'],
  },
  {
    slug: 'sustainable-farming-practices',
    title: 'Sustainable Farming Practices for the Long Run',
    excerpt: 'Protect soil, water and biodiversity while keeping the farm productive.',
    category: 'Sustainable Agriculture', author: AUTHOR, date: '2026-10-20', group: 'knowledge',
    image: '/images/featured/plantation-farm.webp', imageAlt: 'Plantation farm with trees and ground cover',
    intro: 'Sustainable farming looks after the resources that production depends on, so the land stays productive for the next season and the next generation.',
    sections: [
      { heading: 'Protect the soil', paragraphs: ['Keep the ground covered with crops, residue or mulch. Reduce unnecessary tillage and add organic matter to build structure and moisture retention.'] },
      { heading: 'Use water wisely', paragraphs: ['Capture rainwater, use efficient irrigation and match watering to crop stage. Farm ponds and bunds help recharge groundwater.'], list: ['Cover crops and mulching', 'Rainwater harvesting and farm ponds', 'Integrated pest management', 'Trees and hedgerows for biodiversity'] },
      { heading: 'Plan for resilience', paragraphs: ['Diversified cropping and agroforestry spread risk from weather and prices, and can add income from more than one source.'], tip: 'Small steps each season add up, so pick one practice to improve this year.' },
    ],
    takeaways: ['Cover and feed the soil.', 'Treat water as a limited resource.', 'Diversify to spread risk.'],
  },
  {
    slug: 'crop-selection-and-maintenance',
    title: 'Crop Selection and Maintenance: A Seasonal Guide',
    excerpt: 'How to choose crops for your land and keep them healthy from planting to harvest.',
    category: 'Crop Cultivation', author: AUTHOR, date: '2026-10-18', group: 'knowledge',
    image: '/images/featured/horticulture-farm.webp', imageAlt: 'Horticulture farm with well-kept crop rows',
    intro: 'Good crop choice and steady maintenance matter more than any single input. Plan around your soil, water and the season.',
    sections: [
      { heading: 'Choosing what to grow', paragraphs: ['Start from the land: soil, water and climate. Then look at labour, markets and the crop\'s time to harvest. Prefer varieties recommended for your district.'] },
      { heading: 'Maintenance through the season', paragraphs: ['Regular weeding, timely irrigation, balanced nutrition and scouting for pests keep crops on track. Record what you do and what you spend.'], list: ['Prepare soil and plant at the right time', 'Irrigate by crop stage, not by habit', 'Weed early and mulch where practical', 'Scout weekly for pests and disease'] },
      { heading: 'Harvest and after', paragraphs: ['Harvest at the right maturity, handle produce carefully and plan transport and sale before the crop is ready.'], tip: 'Keep a simple farm diary. It shows what to repeat and what to change next season.' },
    ],
    takeaways: ['Let soil, water and market lead your choice.', 'Scout regularly and act early.', 'Plan harvest and sale in advance.'],
  },
  {
    slug: 'water-management-techniques',
    title: 'Water Management Techniques for Farms',
    excerpt: 'Rainwater harvesting, storage and scheduling to keep your farm supplied through dry months.',
    category: 'Irrigation & Water Management', author: AUTHOR, date: '2026-10-16', group: 'knowledge',
    image: '/images/categories/protected.webp', imageAlt: 'Protected cultivation structure with controlled watering',
    intro: 'Reliable water makes farming predictable. A mix of capture, storage and efficient use protects you from dry spells.',
    sections: [
      { heading: 'Capture and store', paragraphs: ['Farm ponds, check dams, bunds and recharge pits collect runoff and help raise groundwater. Storage tanks smooth out supply for irrigation.'] },
      { heading: 'Use it efficiently', paragraphs: ['Schedule irrigation by crop stage and soil moisture, and use mulch to reduce evaporation. Fix leaks and keep filters clean.'], list: ['Rainwater harvesting and recharge pits', 'Farm ponds and storage tanks', 'Mulching to cut evaporation', 'Soil-moisture based scheduling'] },
      { heading: 'Know your water', paragraphs: ['Test water quality for salinity and hardness, and track borewell levels across the year so you can plan crops that fit the supply.'], tip: 'Record borewell depth and yield each summer. It is the best guide for crop planning.' },
    ],
    takeaways: ['Capture rain, store it, and use it carefully.', 'Mulch and schedule to cut waste.', 'Track water quality and levels yearly.'],
  },
  {
    slug: 'technology-for-smarter-farm-decisions',
    title: 'Technology for Smarter Farm Decisions',
    excerpt: 'Soil sensors, weather data and drone surveys: where tools genuinely help and where simple records are enough.',
    category: 'Agricultural Technology', author: AUTHOR, date: '2026-10-14', group: 'knowledge',
    image: '/images/featured/greenhouse-farm-hd.webp', imageAlt: 'Greenhouse farm using modern monitoring technology',
    intro: 'Farm technology is most useful when it answers a specific question, such as when to irrigate or where a field is struggling.',
    sections: [
      { heading: 'Useful tools', paragraphs: ['Soil-moisture sensors, local weather forecasts and drone imagery can reveal problems early and reduce guesswork.'], list: ['Soil-moisture sensors for irrigation timing', 'Weather forecasts for spraying and harvest', 'Drone surveys for layout and crop stress', 'Mobile apps for records and advisories'] },
      { heading: 'Start simple', paragraphs: ['Good records, regular scouting and soil tests give most of the benefit at low cost. Add technology where it solves a clear problem.'], tip: 'Ask what decision a tool will change before you buy it.' },
    ],
    takeaways: ['Use technology to answer specific questions.', 'Records and soil tests come first.', 'Adopt tools gradually.'],
  },
];

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const wordCount = (p: BlogPost) =>
  [p.intro, ...p.sections.flatMap((s) => [...s.paragraphs, ...(s.list || []), s.tip || ''])].join(' ').split(/\s+/).filter(Boolean).length;
export const readingTime = (p: BlogPost): string => `${Math.max(2, Math.round(wordCount(p) / 200))} min read`;

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Articles written in the admin panel. The two placeholder posts that ship as admin defaults are not shown. */
const adminPosts = (): BlogPost[] => {
  let stored = false;
  try { stored = localStorage.getItem(BLOGS_KEY) !== null; } catch { /* ignore */ }
  if (!stored) return [];
  return getLocalBlogs().map((b) => {
    const paragraphs = (b.content || '').split(/\n{1,}/).map((x) => x.trim()).filter(Boolean);
    const d = new Date(b.date);
    return {
      slug: `${slugify(b.title) || 'article'}-${b.id}`,
      title: b.title, excerpt: paragraphs[0] ? paragraphs[0].slice(0, 160) : b.title,
      category: b.category || 'IGO Project Updates', author: b.author || 'IGO Agri Estate',
      date: Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10),
      image: b.image || '/images/featured/agricultural-land.webp', imageAlt: b.title,
      intro: paragraphs[0] || '', sections: paragraphs.length > 1 ? [{ heading: 'Details', paragraphs: paragraphs.slice(1) }] : [],
      takeaways: [], fromAdmin: true,
    } as BlogPost;
  });
};

export const getAllPosts = (): BlogPost[] =>
  [...BLOG_POSTS, ...adminPosts()].sort((a, b) => b.date.localeCompare(a.date));
export const getPost = (slug: string): BlogPost | undefined => getAllPosts().find((p) => p.slug === slug);
