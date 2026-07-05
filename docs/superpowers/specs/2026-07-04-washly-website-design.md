# Washly Website — Design Spec (2026-07-04)

## Goal
Marketing + booking website for **Washly**, a laundry pickup & delivery service in Montreal with 24-hour turnaround. Must feel premium, safe/trustworthy, vibrant, and playful (glossy green "W" logo + green robot mascot).

## Approach
Static site: `index.html` + `css/styles.css` + `js/app.js`. No frameworks, no build step. Google Fonts via CDN. All animation done with CSS + vanilla JS (IntersectionObserver, requestAnimationFrame).

## Brand System
- **Primary greens:** `#d9f542` (glow yellow-green), `#8ee000` (lime), `#4caf32` (leaf), `#1f7a1f` (deep)
- **Ink/dark:** `#08130a` / `#0d2211` for dark sections
- **Accents:** bubble blue `#4fc3f7`, soft mint `#eefbe7` backgrounds, white cards
- **Fonts:** Fredoka (700–600 display), Nunito (body)
- **Motifs:** bubbles, gloss highlights, rounded 3D shapes, soft glows

## Page Structure
1. Sticky glass navbar (logo, links, "Schedule Pickup" CTA)
2. Hero — big headline, 24h promise, mascot, floating animated bubbles, dual CTAs, trust badges
3. Marquee trust strip
4. How It Works — 3 steps (Book → We Pick Up → Fresh in 24h)
5. Services — bento grid with 3D tilt cards (Wash & Fold, Dry Cleaning, Bedding, Express)
6. Stats counters (orders, rating, turnaround)
7. Why Washly — trust/safety (insured, tracked, eco-certified, hypoallergenic)
8. Pricing — 3 tiers
9. Testimonials slider
10. Montreal coverage areas
11. Booking form (name, address, phone, date, service)
12. FAQ accordion
13. Footer

## Assets
User's logo/mascot images go in `assets/logo.png` and `assets/mascot.png`.
Site ships with inline SVG fallbacks (glossy W badge, robot mascot) via `onerror` swap so it looks complete without them.

## Out of Scope
Backend/payments — the booking form shows a success state client-side only.
