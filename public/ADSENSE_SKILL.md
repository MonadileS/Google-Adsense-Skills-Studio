---
name: adsense-compliance-architect
description: Complete 2026 Google AdSense Program Policies (28 Enforced Rules), Content Quality & E-E-A-T, Anti-Doorway pSEO Shingle Gate, Inline Technical SVG Diagrams, Deterministic Anti-Fabrication Sensitivity Matrices, Core Web Vitals (CLS <= 0.05, LCP <= 2.5s, INP <= 200ms), IAB TCF v2.2 Consent Mode v2, Hub-and-Spoke Internal Link Graph, and Executable Pre-Build Compiler Gate. Give this skill to any AI coding agent BEFORE building a website.
version: 2026.6.0
---

# Google AdSense Total Compliance Architecture Skill (`SKILL.md`)

> **CRITICAL DIRECTIVE FOR AI CODING AGENTS:**
> You MUST enforce Google AdSense Program Policies, Google Publisher Policies, and the Google Search Essentials Spam Policies (Scaled Content Abuse, Doorway Pages, Site Reputation Abuse, and Thin Affiliate Prevention) from **line one** of code generation. Never build a bare tool, thin directory, or unverified blog and "tack on AdSense scripts later."

---

## 1. Site-Wide Content Inventory & Anti-Truncation Mandate (Prevents 85% of "Low Value Content" Rejections)

### 1.1 Minimum Indexable Route Inventory
Google AdSense evaluates your **entire domain**, not just a single landing page. Before declaring any website ready for AdSense review, you MUST build and populate:
1. **Primary Interactive Utility / Application Route (`/`)**: Accompanied by at least **800+ words** of server-rendered (SSR) methodology, mathematical formulas, an inline `<svg>` architecture diagram, a **Deterministic Formula-Derived Sensitivity Matrix**, and a 5-item FAQ below the interactive canvas.
2. **8 to 10 Full-Length Pillar Guides (`/guides/[slug]`)**: Each guide must contain **800 to 1,200+ words** of original, domain-expert technical prose, comparison tables, worked examples, and cited institutional standards.
3. **Mandatory Trust & Legal Architecture (`/about`, `/contact`, `/privacy`, `/terms`)**: Complete, non-placeholder pages linked in the global footer, including a working `/api/contact` endpoint and an Editorial Corrections Policy.
4. **Crawler & Authorization Endpoints (`/ads.txt`, `/robots.txt`, `/sitemap.xml`, `<meta name="google-adsense-account">`, and custom `/not-found.tsx`)**.

### 1.2 Strict Anti-Truncation & 4-Turn Batching Rule (`ADS-LVC-02`)
- **FORBIDDEN:** Never write comments like `// ... add 8 more articles here`, `// TODO: write remaining guides`, `/* content omitted for brevity */`, or `Lorem ipsum`.
- **FORBIDDEN:** Never create 1 long article and 7 stubbed 80-word articles.
- **4-Turn Execution Protocol:** If generating all 8–10 full-length articles in a single response risks hitting output token limits, execute across **4 structured turns**:
  - **Turn 1:** `scripts/verify-adsense-build.mjs` (`prebuild` gate), core layout with `<meta name="google-adsense-account">`, `CertifiedConsentModeProvider`, `AdUnitSlot`, `ads.txt`, `robots.ts`, `sitemap.ts`, and `/privacy`, `/terms`, `/about`, `/contact` + `/api/contact`.
  - **Turn 2:** Primary interactive utility + Inline `<svg>` Technical Diagram + Deterministic Sensitivity Matrix + 850-word SSR methodology + Schema.org JSON-LD.
  - **Turn 3:** Unabridged Pillar Guides Batch A (Guides 1–4, 900+ words each) + `BreadcrumbList` JSON-LD & Hub-and-Spoke links.
  - **Turn 4:** Unabridged Pillar Guides Batch B (Guides 5–8, 900+ words each) + execute `npm run build` to verify 0 errors.

### 1.3 Anti-Doorway Page & Programmatic SEO (pSEO) Cross-Route Shingle Uniqueness Gate (`ADS-LVC-06`)
- **FORBIDDEN:** Never generate programmatic variable-swapped "Mad-Libs" permutations (e.g., `/convert/usd-to-eur`, `/convert/usd-to-gbp`) using a single boilerplate paragraph template where only variable names change.
- **REQUIRED:** Every dynamic `[slug]` route must address a distinct architectural topic or problem domain and maintain **< 25% 5-gram shingle overlap** with any other route on the domain.

### 1.4 Ban Stock Placeholders (`picsum.photos`) & Require Inline Technical `<svg>` Diagrams (`ADS-IMG-01`)
- **FORBIDDEN:** Never use `picsum.photos`, `placehold.co`, `via.placeholder.com`, or unverified external stock image URLs.
- **REQUIRED:** Embed **deterministic inline `<svg>` technical architecture diagrams, formula charts, or system flowcharts** inside `<figure>` blocks with `<figcaption>` annotations.

### 1.5 Anti-Fabrication Rule: Deterministic Sensitivity Matrices vs. Fake First-Person Lab Claims (`ADS-PRO-04`)
- **FORBIDDEN:** Never invent fictional first-person lab benchmarks, fake empirical testing stories, or imaginary user surveys (e.g., *"In our 14-day benchmark across 40,000 servers..."* or *"We surveyed 10,000 engineers..."*). Google Quality Raters classify fabricated first-person claims as **Deceptive E-E-A-T / Misleading Representation**.
- **REQUIRED:** Ground all original data tables in **Deterministic Formula-Derived Sensitivity Matrices** (computing exact mathematical outputs across 5–10 input permutations) and cite real, verifiable public specifications (e.g., W3C, IETF RFC, IEEE, IRS Publications, Federal Reserve formulas).

### 1.6 Server-Side Rendering (SSR) & `Mediapartners-Google` Visibility (`ADS-TEC-01`)
- The Google AdSense crawler (`Mediapartners-Google`) inspects the initial HTML response and does **not** interact with client-side forms, tabs, or buttons to reveal hidden text.
- **Rule:** Keep page routes as Server Components that render 100% of editorial methodology, tables, and `Article` / `WebApplication` / `BreadcrumbList` / `FAQPage` JSON-LD in the initial HTML payload.

### 1.7 Hub-and-Spoke Internal Link Graph & `BreadcrumbList` Schema (`ADS-TEC-05`)
- Zero orphan routes are allowed. Every pillar guide in `/guides/[slug]` must render a visible `<nav aria-label="Breadcrumb">` trail, inject `BreadcrumbList` JSON-LD, link back to the primary interactive tool on `/`, and link to 3 related sibling guides at the bottom of the article.

---

## 2. Core Web Vitals (CLS <= 0.05, LCP <= 2.5s, INP <= 200ms) & Ad Placement Rules

1. **Non-Blocking Script Loading & INP <= 200ms (`ADS-TEC-07`)**:
   - Place ONLY the tiny synchronous `gtag('consent', 'default', { ..., wait_for_update: 500 })` snippet inside `strategy="beforeInteractive"`.
   - Load external CMP tags (`fundingchoicesmessages.google.com`) and `adsbygoogle.js` with `strategy="afterInteractive"` and `async` so Largest Contentful Paint (LCP) and Interaction to Next Paint (INP <= 200ms) remain in the green zone.
   - Export `other: { 'google-adsense-account': 'ca-pub-XXXXXXXXXXXXXXXX' }` in `app/layout.tsx` metadata so Google verifies domain ownership even before GDPR consent is granted.
2. **CLS Reservation (`ADS-UX-01`)**:
   - Every ad slot MUST be wrapped in a container with explicit minimum dimensions (`min-h-[280px]` for in-article rectangles, `min-h-[90px]` for horizontal banners) so Cumulative Layout Shift (CLS) is `0.00`.
3. **Accidental Click Prevention (`ADS-UX-02` & `ADS-UX-03`)**:
   - Maintain a minimum `24px` (`my-6`) margin and a `1px` border between any `<AdUnitSlot />` and interactive buttons, calculators, sliders, or navigation links.
   - Label ad containers **only** with `"Advertisement"` or `"Sponsored"`—never `"Sponsored Links"`, `"Helpful Resources"`, or `"Support Us"`.
4. **System & Thin-State Ad Kill-Switch (`ADS-UX-02` & `ADS-TEC-04`)**:
   - Never render ad units on `/404`, `/500`, `/login`, `/signup`, `/privacy`, `/terms`, `/contact`, or when dynamic search/filter results contain fewer than 500 words (`isContentReady={false}`).

---

## 3. Privacy, IAB TCF v2.2, Consent Mode v2 & Verified Contact (`ADS-CMP-01` – `ADS-TRUST-01`)

1. **Google Consent Mode v2 Default Denied (`ADS-CMP-01` & `ADS-CMP-02`)**:
   - Initialize `ad_storage`, `ad_user_data`, `ad_personalization`, and `analytics_storage` to `'denied'` (`wait_for_update: 500`) prior to loading `adsbygoogle.js`.
2. **DoubleClick DART Cookie Disclosure (`ADS-CMP-03`)**:
   - Your `/privacy` page must explicitly disclose third-party cookies and link directly to `https://adssettings.google.com` and `https://www.aboutads.info/choices/`.
3. **Ban Dummy Contact Info & Require Editorial Corrections Policy (`ADS-TRUST-01`)**:
   - Never output `@example.com`, `123 Main St`, or dead `e.preventDefault()` no-op forms on `/contact`. Wire `/contact` to a working `/api/contact` endpoint, use a real domain-matched email (`editorial@yourdomain.com`), and include a dated Editorial Verification & Corrections Policy on `/about`.

---

## 4. Executable Pre-Build Compiler Gate (`scripts/verify-adsense-build.mjs` — `ADS-TEC-06`)

Wire `"prebuild": "node scripts/verify-adsense-build.mjs"` in `package.json` so `npm run build` automatically verifies:
- `public/ads.txt`, `app/sitemap.ts`, `app/robots.ts`, `app/not-found.tsx`, and `google-adsense-account` metadata exist.
- Zero `href="#"`, `javascript:void(0)`, `Lorem ipsum`, or `// ... rest of articles` truncation comments exist across `app/`, `components/`, or `lib/`.
- Zero `picsum.photos`, `placehold.co`, `@example.com`, or `123 Main St` placeholders exist.
- Zero fabricated first-person lab claims (`"in our 14-day benchmark"`, `"we surveyed"`) exist in any file.

---

## 5. Off-Code Google Ecosystem Pre-Flight Gate (Human Publisher Actions Before Requesting Review)

1. **Google Search Console Indexing First:** Submit `/sitemap.xml` in Google Search Console and wait until **>= 15–20 URLs show "Page is indexed"** with 2–4 weeks of organic crawl history before clicking "Request Review" in AdSense.
2. **Enable GDPR TCF v2.2 & US State Messages in AdSense Dashboard:** Log into AdSense -> **Privacy & Messaging** -> **European regulations** -> click **Create Message** and **Publish**.
3. **Zero Paid / Bot Warmup Traffic:** Never purchase social, popunder, or arbitrage traffic during review. Apply with 100% organic Search traffic.
