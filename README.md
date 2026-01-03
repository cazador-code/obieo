# Obieo — SEO & AEO for Home Service Businesses

A Next.js website for Obieo, a solo SEO/AEO agency targeting home service business owners.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Fonts:** DM Sans (body) + Outfit (headings) via next/font
- **Deployment:** Vercel-ready

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx        # Root layout with fonts & metadata
│   ├── page.tsx          # Homepage (main conversion page)
│   ├── globals.css       # Global styles & Tailwind config
│   ├── services/
│   │   └── page.tsx      # Services page (Sprint & Retainer)
│   ├── about/
│   │   └── page.tsx      # About page (Hunter's story)
│   └── contact/
│       └── page.tsx      # Contact page (Calendly + form)
├── components/
│   ├── Header.tsx        # Navigation header
│   └── Footer.tsx        # Site footer
```

## Placeholders to Replace

Before going live, replace these placeholders:

- [ ] **Calendly URL** — In `/contact/page.tsx`, replace the Calendly placeholder with your actual embed code
- [ ] **Phone Number** — Search for `555-123-4567` and replace with your real number
- [ ] **Email** — Search for `hunter@obieo.com` and replace if needed
- [ ] **Contact Form** — Connect the form in `/contact/page.tsx` to Formspree, Netlify Forms, or similar

## Design System

### Colors

- **Cream** (backgrounds): `#fdfcfa`, `#f9f7f3`, `#f0ece4`
- **Slate** (text/dark sections): `#151921` through `#f8f9fb`
- **Terracotta** (accent): `#d97650` (primary), `#c4613c` (hover)

### Typography

- **Headings:** Outfit (variable weight)
- **Body:** DM Sans

## Deployment

This site is ready for Vercel deployment:

```bash
# Via Vercel CLI
vercel

# Or connect your GitHub repo to Vercel for automatic deployments
```

## Future Enhancements

- [ ] Dark mode toggle
- [ ] Form submission integration (Formspree)
- [ ] Case study/testimonials section
- [ ] Blog functionality
- [ ] Subtle scroll animations (Framer Motion)

---

Built by [Hunter Lapeyre](https://obieo.com)
