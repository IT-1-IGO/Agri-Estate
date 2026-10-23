# IGO Agri Estates: Revamp Implementation Plan

## Business framing
IGO Agri Estates is the land arm of **IGO Group of Companies Pvt Ltd**. It has two lines of business:
1. **Direct land deals**: IGO buys land from clients and sells land to buyers.
2. **Project land**: land sold together with projects run with the **IGO Agri Tech** brand.

The site is a lead and trust engine for these two lines. It is not an open self-serve marketplace.

## Phase 1: Interactive imagery (in progress)
Replace passive images with interactive ones. This is the first slice because it changes how the site feels without touching data or routing.

| # | Component | Behaviour | Applied to |
|---|---|---|---|
| 1 | `TiltImage` | 3D pointer tilt, parallax zoom and glare; respects `prefers-reduced-motion` | Explore Lands cards, Featured Projects cards, estate cards |
| 2 | `Lightbox` | Click to open full screen; prev/next, keyboard (Esc, arrows), click-to-zoom | Estate detail main image and thumbnails |
| 3 | `PanImage` | Drag or swipe to pan a wide image, auto-drift when idle, zoom buttons | Replaces the hover-zoom "VR tour" modal |
| 4 | `HotspotImage` | Pulsing pins that open short info cards | "Land to Fully Developed Farm" section |

Done when: each component works with mouse, touch and keyboard, falls back to a plain image if motion is reduced, and the build and type-check pass.

## Phase 2: Information architecture and messaging (mostly done)
- [x] Home: two clear paths, **Sell Your Land to IGO** and **Buy Land / Projects** (`SellBuyPaths`).
- [x] New **Sell Land** page (`/sell-land`): process steps and a valuation-request form that saves a lead.
- [x] New **IGO Agri Tech Projects** page (`/projects`): built from the estates that have a project URL.
- [x] `/post-property` now redirects to `/sell-land`; navbar has Sell Land, Buy Land and Projects.
- [ ] Remove the card-payment reservation form (`ReservationModal`).
- [ ] Show the IGO Group logo in the navbar and footer.

## Phase 3: Visual system
- Design tokens (green and warm-neutral palette, type scale, spacing) in one place.
- Apply to Navbar, Hero, cards, forms and footer. Add IGO Group and Agri Tech brand links.
- Remove the `.bak` files and dead styles.

## Phase 4: Trust and conversion
- Testimonials and completed-deal proof with `AggregateRating` schema.
- Site-visit booking and WhatsApp enquiry as the main calls to action.
- Legal-verification checklist on every estate page.

## Phase 5: Real features replacing mocks
- Real map (Leaflet or Mapbox) using the existing `latitude` and `longitude` data.
- Estate comparison page.
- Real 360° panoramas once source photos exist (Phase 1's `PanImage` is the viewer).
- Decide on one data source: Supabase only, or documented offline mode.

## Risks and open items
- Brand guidelines (logo, colors, fonts) for IGO Group and IGO Agri Tech are not yet supplied.
- Only one image per estate exists today, so galleries and panoramas need more photos to show their full value.
- `.env.example` contains live Supabase credentials. Rotate or replace them with placeholders.
