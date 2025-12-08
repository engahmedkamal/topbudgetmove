# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TopBudgetMove is a static marketing website for a flat-rate long distance moving company. The site offers a $7,000 flat rate for full truck service anywhere in the continental US over 500 miles.

## Tech Stack

- **Static HTML/CSS/JS** - No build system, no frameworks
- **Hosting**: GitHub Pages (via CNAME)
- **Forms**: Web3Forms API for contact form submission
- **Analytics**: Google Analytics (G-47T6LJGVJ3)
- **Fonts**: Google Fonts (Poppins)

## Development

This is a static site with no build process. To develop:
1. Open HTML files directly in browser, or
2. Use any local server (e.g., `python -m http.server 8000`)

## Architecture

### File Structure
```
/                    # Homepage and root pages
├── services/        # Service landing pages (SEO)
├── routes/          # Location-based route pages (SEO)
├── blog/            # Blog articles
├── css/styles.css   # All styles in single file
└── js/
    ├── main.js      # Navigation, form handling, FAQ accordion
    └── validation.js # Form validation (Validator object)
```

### JavaScript Architecture
- `validation.js` exports global `Validator` object with US phone validation, email validation, and form field validation
- `main.js` handles: mobile navigation, quote form submission via Web3Forms, FAQ accordion, smooth scrolling
- Form submissions go to Web3Forms API (key in main.js:106)

### CSS Architecture
- Single stylesheet with CSS custom properties in `:root`
- Color scheme: primary navy (#1a2b5f), secondary coral (#f5734a)
- Mobile-first responsive breakpoints at 768px and 480px

### SEO Structure
- All pages include Google Analytics tag
- Schema.org JSON-LD markup on key pages (MovingCompany, FAQPage, Article)
- sitemap.xml and robots.txt at root
- Canonical URLs on all pages

## Key Business Details (for content)
- Email: info@topbudgetmove.com
- Flat rate: $7,000 for 26-foot truck (2,000 cu ft), 500+ miles
- Licensed & Insured with FMCSA
