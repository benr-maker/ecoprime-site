# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS/JS site for **EcoPrime Lawn Care** — a quiet, zero-emission electric lawn service in Cypress/Katy/West Houston, TX. Deployed to Cloudflare Pages. Backend logic runs as Cloudflare Pages Functions (JavaScript).

## Development

**Local preview (static pages only):**
```bash
python3 -m http.server 8080
# Open http://localhost:8080
```
The `/api/*` routes require the Cloudflare Pages Functions runtime. To test those locally, use the Wrangler CLI:
```bash
npx wrangler pages dev . --compatibility-date=2024-09-23
```

**Deployment:** Push to GitHub → Cloudflare Pages auto-deploys. Settings: Framework = None, Build command = (blank), Output directory = `/`.

## Customer Quote & Payment Flow

The core interactive flow works like this:

```
index.html (form)
  → POST /api/quote          (returns price)
  → estimate.html            (shows price, Accept / Decline)
  → payment.html             (Stripe card or PayPal)
  → POST /api/create-payment-intent  (Stripe)
  → POST /api/create-paypal-order    (PayPal)
  → POST /api/capture-paypal-order   (PayPal, after approval)
  → thank-you.html           (booking confirmed)
```

- `assets/js/quote.js` — intercepts `[data-quote-form]` submit, calls `/api/quote`, redirects to `estimate.html` with URL params (`name`, `address`, `price`).
- `estimate.html` / `payment.html` / `thank-you.html` — each reads state from `URLSearchParams`; no server-side sessions.
- `assets/js/payment.js` — initializes Stripe PaymentElement and PayPal Buttons on `payment.html`.

## Backend Functions (`functions/api/`)

Each file is a Cloudflare Pages Function. Handler export must be named `onRequestPost`.

| File | Purpose |
|---|---|
| `quote.js` | Address → price. Currently returns `$45.00` (dummy). Replace `getQuotePrice()` with real parcel/satellite API when ready. |
| `create-payment-intent.js` | Creates a Stripe PaymentIntent; returns `clientSecret`. Needs `STRIPE_SECRET_KEY` env var. |
| `create-paypal-order.js` | Creates a PayPal order; returns `orderID`. Needs `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET`. |
| `capture-paypal-order.js` | Captures an approved PayPal order. Same env vars as above. |

## Environment Variables (set in Cloudflare Pages dashboard)

| Variable | Where used |
|---|---|
| `STRIPE_SECRET_KEY` | `functions/api/create-payment-intent.js` |
| `PAYPAL_CLIENT_ID` | `functions/api/create-paypal-order.js`, `capture-paypal-order.js` |
| `PAYPAL_CLIENT_SECRET` | Same as above |

Two additional values must be hardcoded in the **front-end** files (they are public keys):
- `payment.html` — PayPal SDK `<script src="...?client-id=YOUR_PAYPAL_CLIENT_ID">`
- `assets/js/payment.js` — `Stripe('YOUR_STRIPE_PUBLISHABLE_KEY')` (starts with `pk_`)

## Architecture

Five informational pages (`index.html`, `services.html`, `pricing.html`, `about.html`, `contact.html`) plus three transactional pages (`estimate.html`, `payment.html`, `thank-you.html`). No templating — header/footer HTML is duplicated in every file.

**Assets:**
- `assets/css/styles.css` — sole stylesheet; uses CSS variables for all colors/shadows
- `assets/css/small-styles.css` — unused backup; do not edit
- `assets/js/main.js` — marks active nav link via `data-nav` + `window.location.pathname`
- `assets/js/quote.js` — quote form handler
- `assets/js/payment.js` — Stripe + PayPal init on payment page
- `assets/img/ecoprime_logo_darkgreen.png` — live logo used on all pages

## Key CSS Conventions

Use CSS variables — never hardcode colors:
- Greens: `--green-900`, `--green-800`, `--green-700`, `--green-200`
- Neutrals: `--text`, `--muted`, `--card`, `--border`, `--shadow`, `--sand-50`

Layout classes: `.container`, `.section`, `.grid-3`, `.lead-hero-grid`, `.card`, `.callout`, `.btn`, `.btn-primary`, `.btn-ghost`.

Mobile breakpoint: **860px** — grids collapse to single column.

## Pending Configuration

- `functions/api/quote.js` — replace the `getQuotePrice()` stub with the real pricing API
- `payment.html` — replace `YOUR_PAYPAL_CLIENT_ID` in the PayPal SDK `<script>` tag
- `assets/js/payment.js` — replace `YOUR_STRIPE_PUBLISHABLE_KEY`
- Set `STRIPE_SECRET_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` in the Cloudflare Pages environment variables dashboard
- `contact.html` — still routes through FormSubmit.co for general inquiries; replace `YOUR_EMAIL_HERE` before going live
