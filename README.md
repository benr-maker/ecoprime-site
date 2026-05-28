# EcoPrime Lawn Care Website (Static)

This is a simple, fast, multi-page **static** website for **EcoPrime Lawn Care**.

- Phone: 281-624-6514
- Pages: Home, Services, Pricing, About, Contact, Thank You
- No backend required

## Quick start (preview locally)

### Option A: Use Python (already on most Macs)
From inside this folder:

```bash
python3 -m http.server 8080
```

Then open:
http://localhost:8080

### Option B: Just double-click `index.html`
This also works, but some browsers behave better when served through a local server.

## Replace the placeholder logo

Current logo is a placeholder SVG:

`assets/img/ecoprime-logo.svg`

Replace it with your real logo:
- preferred: `assets/img/ecoprime-logo.svg` (SVG)
- or: `assets/img/ecoprime-logo.png` (PNG)

If you use PNG, update the image path in the HTML files:
search for:
`assets/img/ecoprime-logo.svg`
and replace with:
`assets/img/ecoprime-logo.png`

## Contact form
The contact form is wired to FormSubmit (a simple third-party form handler).
Edit `contact.html` and replace:

`https://formsubmit.co/YOUR_EMAIL_HERE`

with your email. The first time you use it, they typically send a confirmation email.

Later, you can swap this to:
- Cloudflare Pages Functions
- Cloudflare Workers
- a CRM (Jobber, Housecall Pro, etc.)

## Deploy to Cloudflare Pages (high level)
1. Create a GitHub repo and push this folder.
2. In Cloudflare Dashboard → Pages → Create project → connect the GitHub repo.
3. Build settings:
   - Framework: None
   - Build command: (blank)
   - Output directory: /

See `deploy_github.sh` for a guided setup script.
