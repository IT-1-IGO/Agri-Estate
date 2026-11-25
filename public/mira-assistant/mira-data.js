/*
 * Mira \u2013 all text for the IGO Agri Estates assistant.
 * Every answer below uses only facts already published on this website.
 * The page each answer comes from is noted in the "source" comment above it.
 * To edit an answer: change the "a" text. To add a question: copy an item and give it a new id.
 */
window.MIRA_DATA = {
  config: {
    siteName: "IGO Agri Estates",
    // Chosen by the site owner: main contact line +91 73977 89803 (shown on /contact and in the footer).
    whatsappNumber: "917397789803",
    whatsappMessage: "Hello IGO Agri Estates, I'd like to know more.",
    suggestionsCollapsed: 6
  },

  messages: {
    welcome: "Hello! I'm Mira, your IGO Agri Estates assistant. Welcome! I can help you explore our agricultural land and services, find the right information and connect with our team. What would you like to know today?",
    fallback: "I'm sorry, I don't have verified information about that at the moment. Please contact the IGO Agri Estates team, and they will be happy to assist you.",
    introEyebrow: "Virtual assistant",
    introHeading: "Meet Mira \u2013 Your IGO Agri Estates Assistant",
    introText: "Explore IGO Agri Estates, discover our agricultural land and services, and get instant answers through Mira, your AI-powered virtual assistant.",
    subtitle: "Your IGO Agri Estates Assistant",
    alsoAsk: "You can also ask",
    showAll: "Show all {n} questions",
    showLess: "Show fewer questions",
    placeholder: "Type your question\u2026",
    emptyError: "Please type a question first\u2026",
    tooltip: "Chat with Mira",
    whatsappBar: "Chat on WhatsApp \u2014 instant reply"
  },

  // Only real pages of this website (each route exists in src/App.tsx).
  links: {
    about:       { label: "About Us",         href: "/about" },
    leadership:  { label: "Leadership",       href: "/leadership" },
    buy:         { label: "Buy Land",         href: "/listings" },
    locations:   { label: "Estates by Location", href: "/locations" },
    projects:    { label: "Farm Projects",    href: "/projects" },
    sell:        { label: "Sell Your Land",   href: "/sell-land" },
    requirement: { label: "Post Your Requirement", href: "/post-requirement" },
    legal:       { label: "Legal Services",   href: "/services/legal" },
    soil:        { label: "Soil Testing",     href: "/services/soil" },
    valuation:   { label: "Land Valuation",   href: "/valuation" },
    tax:         { label: "Tax Optimizer",    href: "/tax-optimizer" },
    faq:         { label: "FAQ",              href: "/faq" },
    contact:     { label: "Contact Us",       href: "/contact" },
    call:        { label: "Call +91 73977 89803", href: "tel:+917397789803" },
    email:       { label: "Email bd2@igogroups.com", href: "mailto:bd2@igogroups.com" },
    whatsapp:    { label: "WhatsApp", whatsapp: true }
  },

  qa: [
    {
      id: "what-is", category: "About",
      q: "What is IGO Agri Estates?",
      // source: /about (page description) and the site footer
      a: "IGO Agri Estates is the land arm of IGO Group of Companies. We buy and sell agricultural land directly and offer land with IGO Agri Estate farm projects. Every step comes with legal checks and scientific farm planning.",
      links: ["about", "buy"],
      keywords: ["who are you", "company", "igo agri estates", "about igo", "about your company", "tell me about igo"]
    },
    {
      id: "igo-group", category: "About",
      q: "Is IGO Agri Estates part of IGO Group?",
      // source: /about (page description)
      a: "Yes. IGO Agri Estates is the land arm of IGO Group of Companies. You can read more about the company and its leaders on our About and Leadership pages.",
      links: ["about", "leadership"],
      keywords: ["igo group", "igo groups", "parent", "group of companies", "part of", "sister"]
    },
    {
      id: "land-types", category: "Buying land",
      q: "What types of agricultural land do you offer?",
      // source: /faq
      a: "We offer agricultural land directly from IGO, starting with Maduranthagam, along with land developed with IGO Agri Estate projects such as polyhouse, hydroponic and horticulture. Every listing comes with verified documentation, clear boundaries and transparent pricing.",
      links: ["buy", "projects"],
      keywords: ["types of land", "type of land", "kinds of land", "what land", "available land", "listings", "maduranthagam", "agricultural land", "farmland", "plots"]
    },
    {
      id: "how-buy", category: "Buying land",
      q: "How can I buy land through IGO?",
      // source: /faq ("What is the process to start a farm project")
      a: "It starts with a free consultation to understand your goals. We then shortlist verified land, arrange a site visit and complete the documentation. You can browse our listings or post your requirement, and our team will help you from there.",
      links: ["buy", "requirement"],
      keywords: ["buy", "purchase", "process", "how to buy", "invest", "investment", "start", "steps", "consultation"]
    },
    {
      id: "projects", category: "Farm projects",
      q: "What farm projects do you offer?",
      // source: /projects (page description)
      a: "You can buy verified land together with an IGO Agri Estate project, such as polyhouse, hydroponic, horticulture, mushroom, microgreens and more. See all current projects on our Projects page.",
      links: ["projects"],
      keywords: ["project", "projects", "polyhouse", "hydroponic", "horticulture", "mushroom", "microgreens", "greenhouse", "farm project"]
    },
    {
      id: "farm-development", category: "Farm projects",
      q: "Do you help with farm development and management?",
      // source: /faq
      a: "Yes. Our team supports the full journey, from land preparation, soil testing and levelling to irrigation, fencing, greenhouse setup, plantation, farm sheds, storage and roads. We also offer ongoing farm management support, so owners who can't be on site every day still get a productive farm.",
      links: ["projects", "contact"],
      keywords: ["development", "infrastructure", "irrigation", "fencing", "plantation", "managed", "management", "maintenance", "farm as a service", "after purchase", "support after"]
    },
    {
      id: "sell", category: "Selling land",
      q: "Can I sell my land to IGO?",
      // source: /sell-land
      a: "Yes. We buy both agricultural land and general land for the right value. Share your land details, our team visits the site, our legal team reviews the title, and you receive a transparent market-based offer. Registration is completed and payment is made directly to you.",
      links: ["sell"],
      keywords: ["sell", "selling", "sell my land", "offer for my land", "buy my land", "general land", "non agricultural"]
    },
    {
      id: "site-visit", category: "Buying land",
      q: "How can I schedule a site visit?",
      // source: /faq
      a: "You can request a site visit through the Contact page, by calling +91 73977 89803, or by emailing bd2@igogroups.com. Our team will confirm a convenient date and accompany you to the property.",
      links: ["contact", "call", "whatsapp"],
      keywords: ["site visit", "visit", "see the land", "schedule", "tour", "inspect"]
    },
    {
      id: "titles", category: "Legal & services",
      q: "Are the land titles verified?",
      // source: /faq
      a: "Yes. Every property goes through legal verification of title, encumbrance and land-use status before it is listed, and we share the documentation with you openly.",
      links: ["legal", "buy"],
      keywords: ["title", "titles", "verified", "documents", "clear title", "encumbrance", "safe", "genuine", "legal check"]
    },
    {
      id: "legal-services", category: "Legal & services",
      q: "What legal services do you offer?",
      // source: /services/legal
      a: "Our legal support covers title verification, patta and chitta verification, encumbrance certificate (EC) analysis, parent document verification, survey and boundary verification, land classification and registration assistance.",
      links: ["legal"],
      keywords: ["legal", "lawyer", "patta", "chitta", "ec", "encumbrance certificate", "registration", "due diligence", "parent document", "survey"]
    },
    {
      id: "soil", category: "Legal & services",
      q: "Do you offer soil and water testing?",
      // source: /services and /services/soil
      a: "Yes. Our soil services include soil sampling, NPK audits, nutrient analysis and fertilizer recommendations, along with water viability and borewell yield testing.",
      links: ["soil"],
      keywords: ["soil", "soil test", "testing", "npk", "nutrient", "fertilizer", "water", "borewell"]
    },
    {
      id: "tools", category: "Legal & services",
      q: "Can I estimate my land's value or tax?",
      // source: /valuation and /tax-optimizer (pages on this site)
      a: "Yes. Our Land Valuation tool helps you estimate land or estate value, and our Tax Optimizer helps with agricultural land tax planning. For exact figures on a specific property, please talk to our team.",
      links: ["valuation", "tax"],
      keywords: ["value", "valuation", "price of my land", "worth", "tax", "calculator", "estimate"]
    },
    {
      id: "locations", category: "Buying land",
      q: "Which locations do you operate in?",
      // source: /faq
      a: "We serve buyers and investors across Tamil Nadu, Karnataka, Maharashtra, Andhra Pradesh and Telangana, with a growing network of regional partners across India.",
      links: ["locations", "buy"],
      keywords: ["locations", "which locations", "where do you operate", "which states", "states", "tamil nadu", "karnataka", "maharashtra", "andhra", "telangana", "areas", "regions"]
    },
    {
      id: "nri", category: "Buying land",
      q: "Can NRIs invest in agricultural land through you?",
      // source: /faq
      a: "Eligibility for agricultural land depends on Indian regulations and the state concerned. Our advisors explain the rules that apply to your situation and can guide you on suitable structures.",
      links: ["contact", "whatsapp"],
      keywords: ["nri", "nris", "can nri", "nri buy", "nri invest", "abroad", "overseas", "foreign", "non resident"]
    },
    {
      id: "subsidies", category: "Farm projects",
      q: "Are government subsidies available?",
      // source: /faq
      a: "Many agricultural activities qualify for central and state schemes, such as support for drip irrigation, greenhouses and horticulture. Our advisors guide you on the schemes that may apply and help with the application. Eligibility depends on the scheme and your location.",
      links: ["faq", "contact"],
      keywords: ["subsidy", "subsidies", "government", "scheme", "schemes", "financial assistance", "grant"]
    },
    {
      id: "contact", category: "Contact",
      q: "How can I contact you?",
      // source: /contact and the site footer
      a: "You can call +91 73977 89803, 73977 89804 or 73977 89805, or email bd2@igogroups.com. You can also message us on WhatsApp.",
      links: ["call", "email", "whatsapp", "contact"],
      keywords: ["contact", "phone", "call", "number", "email", "mail", "talk", "reach", "support", "help", "human", "agent", "advisor"]
    },
    {
      id: "office", category: "Contact",
      q: "Where is your office?",
      // source: /contact and the site footer
      a: "Our head office is at No. 17, Kovalan Street, 2nd Main Road, Uthandi Kanathur, Chennai \u2013 600119, Tamil Nadu, India.",
      links: ["contact", "call"],
      keywords: ["office", "address", "where are you located", "where is your office", "location of office", "chennai", "uthandi", "kanathur", "head office", "visit office"]
    },
    {
      id: "enquiry", category: "Contact",
      q: "How can I submit an enquiry?",
      // source: /contact and /post-requirement
      a: "You can fill in the form on our Contact page, or post your land requirement and our team will get back to you. For a quicker reply, call +91 73977 89803 or message us on WhatsApp.",
      links: ["contact", "requirement", "whatsapp"],
      keywords: ["enquiry", "enquire", "inquiry", "inquire", "form", "requirement", "callback", "call back", "request"]
    }
  ]
};
