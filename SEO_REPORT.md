# SEO Report – IGO Agri Estates (generated 2026-11-19)

## Scope
Public routes inspected: 21 static + 9 project pages + 2 land parcels + 14 blog articles = 46 URLs (all in sitemap.xml). Private/auth pages (login, signup, profile, dashboard, seller-dashboard, admin) are excluded.

## Findings and status
| Area | Status |
|---|---|
| Titles / descriptions | Present on all public pages via `<SEO>`; 2 weak titles fixed (/leadership, /services). Home title/description set in App.tsx. |
| H1 | One H1 per public page (home H1 in Hero.tsx). OK |
| Alt text | 0 images missing alt; 16 intentionally empty (decorative, aria-hidden). OK |
| Canonical | Set per page via SEO component, base https://www.igoagriestate.com |
| sitemap.xml | Rebuilt: 46 real URLs; removed non-existent/redirect URLs |
| robots.txt | Fixed allow list; admin/private routes disallowed; CSS/JS/images not blocked |
| llms.txt | Fixed /blog -> /blogs; added Projects, Sell Land, FAQ |
| site.webmanifest | Was referenced but missing; added |
| 404 | Unknown URLs now render with noindex (SPA still returns HTTP 200 – soft-404 limitation) |
| Structured data | Organization/RealEstateAgent/WebSite/FAQ in index.html; RealEstateListing (property), BlogPosting (blog), Breadcrumb/FAQ on several pages. No changes needed |
| Image compression | 10 large JPEGs recompressed (~2.8 MB saved); others already WebP/<700 KB |
| GA4 / Search Console | NOT found in code. Needs your GA4 Measurement ID (G-XXXX) and GSC verification (HTML tag or DNS). Not added – no credentials invented |
| Performance | gzip, long-term cache for /assets, 30d for images/video, hero video + poster compressed (earlier work) |
| HTTPS | Let's Encrypt via Dokploy/Traefik |

## Keyword map (from existing site content; no claims invented)
| Page | Primary | Secondary / long-tail |
|---|---|---|
| / | managed agricultural land India | buy farmland India, farmland investment, agri estate |
| /locations, /listings | agricultural land for sale Maduranthagam | farmland near Chennai, Maduranthagam agri land |
| /projects | agri land with farm projects | polyhouse, hydroponic, horticulture, vertical farming, mushroom, nursery projects |
| /sell-land | sell agricultural land to IGO | direct land purchase, free site visit |
| /post-requirement | post farmland requirement | find agricultural land |
| /valuation | agricultural land valuation India | farmland value calculator |
| /tax-optimizer | agricultural land tax India | capital gains on farmland |
| /services | farm AMC services | land buyback |
| /services/legal | agricultural land legal verification | title verification India |
| /services/soil | soil testing for agricultural land | soil intelligence |
| /ai-services | AI agricultural land services | farm analytics |
| /about, /leadership, /careers, /contact, /faq | IGO Agri Estates (brand) | company, team, jobs, contact, FAQs |
| /blogs, /knowledge-hub | agricultural land investment guide | organic farming, irrigation, soil health |

## Remaining / manual actions
1. Provide GA4 ID and Search Console verification; submit sitemap.xml.
2. Social share image is 1024x1024 but declared 1200x630 – supply a 1200x630 image.
3. SPA: metadata is JS-rendered; prerendering would be needed for non-Google crawlers.
4. About.tsx and AboutPage.tsx both exist with identical titles (only one is routed).
5. ~70 non-decorative images lack width/height attrs (CLS); left unchanged to avoid layout edits.
6. Add noindex to /profile and /seller-dashboard (currently only robots-blocked).

## Files changed
public/sitemap.xml, robots.txt, llms.txt, site.webmanifest (new); src/pages/Leadership.tsx, Services.tsx (titles); src/App.tsx (404 noindex only); 10 JPEGs in public/images/services; SEO_REPORT.md (new). No auth, API, payment or business logic touched.
