# Washly — Laundry Pickup & Delivery (Montréal)

Marketing + booking website for Washly. Fresh, folded and back in 24 hours. 🧺💚

## Run it

No build step — just open `index.html` in a browser, or serve it locally:

```
python -m http.server 4173
```

then visit http://localhost:4173

## Brand assets (`assets/`)

- `logo.png` — glossy green "W" logo (navbar, footer, favicon)
- `mascot.png` — Washy the robot, thumbs-up with shirt (trust section "Quality checked!")
- `step-order.png` / `step-pickup.png` / `step-clean.png` / `step-deliver.png` — mascot step art (How It Works + hero)
- `laundry-bag.png` — branded laundry bag (pricing cards)

## Real business details (from the Washly MTL app site)

- Support: (263) 384-1103 · (438) 220-1924 · support@washlymtl.com — 7/7, 9AM–9PM
- B2B: partnerships@washlymtl.com
- One-time: Standard bag ≈20 lbs $28 · Large bag ≈30 lbs $33 · +$4.99 extended delivery (30+ min away)
- Plans: Basic 3 bags $65/mo · Popular 4 bags $79/mo · Premium 5 bags $89/mo (up to 45% savings)
- Wash & fold only — no dry cleaning, leather/suede, or heavily soiled items
- App Store: https://apps.apple.com/ca/app/washly-mtl/id6761146858

## Structure

- `index.html` — all sections (hero, how it works, services, pricing, trust, reviews, coverage, B2B, app download, FAQ, contact)
- `css/styles.css` — brand system (colors, Fredoka + Nunito fonts, animations, responsive)
- `js/app.js` — bubbles, scroll reveals, 3D tilt cards, counters, testimonial slider, FAQ

## Notes

- Marketing site only — no ordering/booking. All CTAs point to the Washly MTL app (App Store) or the download section.
- B2B quotes go through partnerships@washlymtl.com (prefilled email template on the "Get a quote" button).
- Respects `prefers-reduced-motion` for accessibility.
