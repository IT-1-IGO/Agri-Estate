import type { CmsItem } from '../admin/store';

// Starting content for the admin panel. Mirrors what the public pages already show.
export const LEGAL_SEED: CmsItem[] = [
  {
    "id": "legal-0",
    "title": "Land Title Verification",
    "text": "We conduct thorough verification of land ownership records, survey documents, encumbrances and legal history to help you make informed investment decisions and reduce the risk of property disputes.",
    "image": "/images/services/legal-title-records.webp",
    "alt": "Land records document with a pen on a desk overlooking green farmland",
    "features": [
      "Owner Due Diligence | Verify ownership details and identify potential discrepancies.",
      "Survey Record Check | Review survey numbers, patta and relevant land records.",
      "Legal History Review | Check available records for encumbrances and potential disputes."
    ],
    "status": "published",
    "order": 0
  },
  {
    "id": "legal-1",
    "title": "Land Use & Conversion",
    "text": "Get expert guidance on land-use classification, conversion requirements and applicable approvals for agricultural, commercial and estate development projects. We help you understand the regulatory process and prepare the necessary documentation.",
    "image": "/images/services/legal-land-use.webp",
    "alt": "Aerial view of farmland plots with a map pin and boundary lines",
    "features": [
      "Land-Use Classification | Understand permitted and restricted land uses.",
      "Conversion Process Guidance | Get assistance with documentation and application procedures.",
      "Government Approval Assistance | Guidance on applicable permissions and regulatory requirements."
    ],
    "status": "published",
    "order": 1
  },
  {
    "id": "legal-2",
    "title": "Estate Documentation",
    "text": "We help prepare and organize essential property documents, agreements and sale deeds to support transparent transactions and simplify the documentation process from start to finish.",
    "image": "/images/services/legal-sale-deed.webp",
    "alt": "Sale deed document with a pen and a small model house",
    "features": [
      "Sale & Purchase Agreements | Support for preparing transaction-related documents.",
      "Title Deeds | Organize ownership and property transfer records.",
      "Legal Documentation Support | Assistance with supporting documents and paperwork."
    ],
    "status": "published",
    "order": 2
  },
  {
    "id": "legal-3",
    "title": "Boundary & Dispute Support",
    "text": "We assist with land boundary clarification, survey discrepancies and coordination with relevant professionals to help address land-related disputes effectively. Our goal is to promote clarity, transparency and confidence in your property decisions.",
    "image": "/images/services/legal-boundary-survey.webp",
    "alt": "Surveying instrument on a tripod in a field with boundary markings",
    "features": [
      "Boundary Verification | Help clarify property boundaries and survey details.",
      "Survey Coordination | Coordinate with appropriate surveying professionals when required.",
      "Dispute Resolution Assistance | Support the process of addressing land-related discrepancies."
    ],
    "status": "published",
    "order": 3
  }
];

export const SOIL_SEED: CmsItem[] = [
  {
    "id": "soil-0",
    "title": "NPK Audits",
    "text": "Detailed Nitrogen, Phosphorus, and Potassium profiling to assess soil fertility and recommend the right nutrient plan for better yields.",
    "image": "/images/services/soil-npk.webp",
    "alt": "Gloved hand holding soil beside sample vials and a soil test kit in a green field",
    "features": [
      "Soil Sampling | Collect and analyze representative soil samples.",
      "Nutrient Analysis | Measure NPK and other essential soil nutrients.",
      "Fertilizer Recommendation | Get customized nutrient plans for improved productivity."
    ],
    "status": "published",
    "order": 0
  },
  {
    "id": "soil-1",
    "title": "Water Viability",
    "text": "Borewell yield testing and watershed mapping to assess reliable water availability and sustainable water usage for your land.",
    "image": "/images/services/soil-water.webp",
    "alt": "Water flowing from a borewell outlet in a rural agricultural landscape",
    "features": [
      "Borewell Yield Testing | Measure water discharge and quality.",
      "Watershed Mapping | Identify water flow and recharge zones.",
      "Water Availability Report | Assess water resources for sustainable agricultural planning."
    ],
    "status": "published",
    "order": 1
  },
  {
    "id": "soil-2",
    "title": "Climate Mapping",
    "text": "Micro-climate analysis for high-yield horticulture. Understand temperature, rainfall, humidity, and local conditions to plan crops and maximize productivity.",
    "image": "/images/services/soil-climate.webp",
    "alt": "Drone flying over crop rows in an agricultural field under a clear sky",
    "features": [
      "Weather Patterns | Analyze temperature, rainfall, and humidity.",
      "Micro-climate Data | Assess local environmental conditions for each crop.",
      "Crop Suitability | Recommend suitable crops based on climate and land conditions."
    ],
    "status": "published",
    "order": 2
  }
];

export const WHY_SEED: CmsItem[] = [
  {
    "id": "why-0",
    "image": "/images/careers/c1.webp",
    "alt": "Land assessment team member discussing plans in a farm field",
    "title": "Meaningful Work",
    "text": "Contribute to land assessment, farm planning and development projects that create long-term value for customers and communities.",
    "status": "published",
    "order": 0
  },
  {
    "id": "why-1",
    "image": "/images/careers/c2.webp",
    "alt": "Site engineer reviewing a tablet beside a greenhouse and crop rows",
    "title": "Learn Through Experience",
    "text": "Gain practical exposure to land evaluation, agricultural planning, site visits and project coordination.",
    "status": "published",
    "order": 1
  },
  {
    "id": "why-2",
    "image": "/images/careers/c3.webp",
    "alt": "Colleagues working together in an office overlooking farmland",
    "title": "Grow With a Collaborative Team",
    "text": "Work alongside professionals in sales, operations, engineering, marketing and customer relations.",
    "status": "published",
    "order": 2
  },
  {
    "id": "why-3",
    "image": "/images/careers/c4.webp",
    "alt": "Green agricultural valley with crop rows and hills",
    "title": "Innovation in Agriculture",
    "text": "Explore modern approaches to agricultural land assessment, farm infrastructure and sustainable development.",
    "status": "published",
    "order": 3
  }
];

export const CATEGORY_SEED: CmsItem[] = [
  {
    "id": "cat-0",
    "image": "/images/careers/t1.webp",
    "alt": "Agriculture team member with a tablet in the field",
    "title": "Agriculture & Land Assessment",
    "text": "Soil analysis, land evaluation, crop suitability, water availability and agricultural feasibility.",
    "roles": "Agriculture Executive, Agronomist, Land Survey Coordinator",
    "status": "published",
    "order": 0
  },
  {
    "id": "cat-1",
    "image": "/images/careers/t3.webp",
    "alt": "Professionals reviewing land records together",
    "title": "Legal Documentation & Land Records",
    "text": "Documentation preparation, title verification support, record management and transaction assistance.",
    "roles": "Documentation Executive, Land Records Coordinator",
    "status": "published",
    "order": 1
  },
  {
    "id": "cat-2",
    "image": "/images/careers/t2.webp",
    "alt": "Greenhouse and irrigated crop rows",
    "title": "Land Development & Project Operations",
    "text": "Site inspections, infrastructure planning, project execution and development coordination.",
    "roles": "Project Coordinator, Site Supervisor, Civil Engineer",
    "status": "published",
    "order": 2
  },
  {
    "id": "cat-3",
    "image": "/images/careers/t5.webp",
    "alt": "Team member working on a laptop",
    "title": "Marketing & Digital Media",
    "text": "Brand communication, digital campaigns, social media content creation and lead generation.",
    "roles": "Digital Marketing Executive, Content Creator, Marketing Manager",
    "status": "published",
    "order": 3
  },
  {
    "id": "cat-4",
    "image": "/images/careers/t6.webp",
    "alt": "Sales colleagues meeting a customer in a field",
    "title": "Sales & Business Development",
    "text": "Customer consultations, property presentations, lead management and investment enquiries.",
    "roles": "Sales Executive, Business Development Executive, Relationship Manager",
    "status": "published",
    "order": 4
  },
  {
    "id": "cat-5",
    "image": "/images/careers/t4.webp",
    "alt": "Customer support team member using a phone",
    "title": "Customer Experience & Administration",
    "text": "Customer support, site-visit coordination, enquiry follow-up and daily business operations.",
    "roles": "Customer Relationship Executive, Site Visit Coordinator, Operations Executive",
    "status": "published",
    "order": 5
  }
];

export const NAV_SEED: CmsItem[] = [
  {
    "id": "nav-0",
    "label": "Home",
    "to": "/",
    "status": "published",
    "order": 0
  },
  {
    "id": "nav-1",
    "label": "Sell Land",
    "to": "/sell-land",
    "status": "published",
    "order": 1
  },
  {
    "id": "nav-2",
    "label": "Buy Land",
    "to": "/listings",
    "status": "published",
    "order": 2
  },
  {
    "id": "nav-3",
    "label": "Projects",
    "to": "/projects",
    "status": "published",
    "order": 3
  },
  {
    "id": "nav-4",
    "label": "About Us",
    "to": "/about",
    "status": "published",
    "order": 4
  },
  {
    "id": "nav-5",
    "label": "Services",
    "to": "/services",
    "status": "published",
    "order": 5
  },
  {
    "id": "nav-6",
    "label": "Leadership",
    "to": "/leadership",
    "status": "published",
    "order": 6
  },
  {
    "id": "nav-7",
    "label": "FAQ",
    "to": "/faq",
    "status": "published",
    "order": 7
  },
  {
    "id": "nav-8",
    "label": "Careers",
    "to": "/careers",
    "status": "published",
    "order": 8
  },
  {
    "id": "nav-9",
    "label": "Contact Us",
    "to": "/contact",
    "status": "published",
    "order": 9
  }
];

export const PAGES_SEED: CmsItem[] = [
  {
    "id": "page-0",
    "name": "Home",
    "path": "/",
    "seoTitle": "",
    "seoDescription": "",
    "status": "published",
    "order": 0
  },
  {
    "id": "page-1",
    "name": "Sell Land",
    "path": "/sell-land",
    "seoTitle": "",
    "seoDescription": "",
    "status": "published",
    "order": 1
  },
  {
    "id": "page-2",
    "name": "Buy Land",
    "path": "/listings",
    "seoTitle": "",
    "seoDescription": "",
    "status": "published",
    "order": 2
  },
  {
    "id": "page-3",
    "name": "Projects",
    "path": "/projects",
    "seoTitle": "",
    "seoDescription": "",
    "status": "published",
    "order": 3
  },
  {
    "id": "page-4",
    "name": "About Us",
    "path": "/about",
    "seoTitle": "",
    "seoDescription": "",
    "status": "published",
    "order": 4
  },
  {
    "id": "page-5",
    "name": "Services",
    "path": "/services",
    "seoTitle": "",
    "seoDescription": "",
    "status": "published",
    "order": 5
  },
  {
    "id": "page-6",
    "name": "Leadership",
    "path": "/leadership",
    "seoTitle": "",
    "seoDescription": "",
    "status": "published",
    "order": 6
  },
  {
    "id": "page-7",
    "name": "FAQ",
    "path": "/faq",
    "seoTitle": "",
    "seoDescription": "",
    "status": "published",
    "order": 7
  },
  {
    "id": "page-8",
    "name": "Careers",
    "path": "/careers",
    "seoTitle": "",
    "seoDescription": "",
    "status": "published",
    "order": 8
  },
  {
    "id": "page-9",
    "name": "Contact Us",
    "path": "/contact",
    "seoTitle": "",
    "seoDescription": "",
    "status": "published",
    "order": 9
  },
  {
    "id": "page-10",
    "name": "AI Estate Valuator",
    "path": "/valuation",
    "seoTitle": "",
    "seoDescription": "",
    "status": "published",
    "order": 10
  },
  {
    "id": "page-11",
    "name": "Tax Optimizer",
    "path": "/tax-optimizer",
    "seoTitle": "",
    "seoDescription": "",
    "status": "published",
    "order": 11
  },
  {
    "id": "page-12",
    "name": "Blogs",
    "path": "/blogs",
    "seoTitle": "",
    "seoDescription": "",
    "status": "published",
    "order": 12
  },
  {
    "id": "page-13",
    "name": "Knowledge Hub",
    "path": "/knowledge-hub",
    "seoTitle": "",
    "seoDescription": "",
    "status": "published",
    "order": 13
  },
  {
    "id": "page-14",
    "name": "Privacy & Policy",
    "path": "/policy",
    "seoTitle": "",
    "seoDescription": "",
    "status": "published",
    "order": 14
  },
  {
    "id": "page-15",
    "name": "Post Requirement",
    "path": "/post-requirement",
    "seoTitle": "",
    "seoDescription": "",
    "status": "published",
    "order": 15
  }
];
