export type PolicyCategory =
  | 'low_value_content'
  | 'ad_placement_ux'
  | 'trust_privacy_cmp'
  | 'prohibited_content'
  | 'traffic_integrity'
  | 'technical_crawlability';

export type PolicySeverity =
  | 'critical_rejection'
  | 'ad_limitation'
  | 'revenue_impact';

export interface AdSensePolicyRule {
  id: string;
  code: string;
  title: string;
  category: PolicyCategory;
  severity: PolicySeverity;
  officialSource: string;
  updatedRelease: string;
  rejectionSymptom: string;
  whyItFails: string;
  aiBuilderDirective: string;
  automatedCheckSummary: string;
  badCodeExample: string;
  goodCodeExample: string;
  aiFixPrompt: string;
  defaultEnabled: boolean;
}

export interface AuditPresetScenario {
  id: string;
  name: string;
  subtitle: string;
  expectedOutcome: string;
  archetype: 'web_app_tool' | 'editorial_blog' | 'directory_data' | 'saas_landing';
  htmlOrContent: string;
}

export const POLICY_CATEGORIES: Record<
  PolicyCategory,
  {
    label: string;
    shortLabel: string;
    description: string;
    rejectionShare: string;
  }
> = {
  low_value_content: {
    label: 'Low-Value Content, Anti-Stub Protocol & Deterministic Data Moat',
    shortLabel: 'Low-Value & E-E-A-T',
    description:
      'Prevents the #1 rejection cause: LLM token-truncated 100-word array stubs, thin utility calculators lacking deterministic sensitivity matrices, unedited AI text, and missing E-E-A-T credentials.',
    rejectionShare: '68% of Initial Rejections',
  },
  ad_placement_ux: {
    label: 'Ad Placement, Zero CLS, LCP/INP Vitals & Better Ads',
    shortLabel: 'Placement, CLS & CWV',
    description:
      'Prevents layout shifts (CLS), main-thread script blocking (LCP/INP), accidental click proximity traps near buttons/menus, deceptive ad headings, and above-the-fold crowding.',
    rejectionShare: '14% of Policy Warnings',
  },
  trust_privacy_cmp: {
    label: 'Mandatory Trust Pages, Certified TCF v2.2 CMP & ads.txt',
    shortLabel: 'Trust, TCF v2.2 & ads.txt',
    description:
      'Enforces Google-Certified IAB TCF v2.2 CMP (Funding Choices) + Consent Mode v2 (4 signals), DoubleClick DART cookie privacy disclosures, and verified About/Contact/Terms routes.',
    rejectionShare: '9% of Rejections',
  },
  prohibited_content: {
    label: 'Prohibited Content, YMYL & Anti-Fake-Claim Guardrails',
    shortLabel: 'Prohibited & YMYL',
    description:
      'Blocks monetization on pirated/copyrighted media, unverified YMYL medical/financial guarantees, deceptive first-person AI lab fabrications, and unmoderated UGC spam.',
    rejectionShare: '4% of Rejections',
  },
  traffic_integrity: {
    label: 'Invalid Traffic (IVT) & Click Integrity',
    shortLabel: 'Traffic Integrity',
    description:
      'Eliminates self-click risk during development, incentivized ad viewing ("support us by clicking"), auto-refreshing ad timers, and bot/iframe traffic triggers.',
    rejectionShare: '3% of Account Bans',
  },
  technical_crawlability: {
    label: 'Sitemap, Internal Link Graph, Breadcrumbs & Pre-Build CI Gate',
    shortLabel: 'Sitemap, Links & CI Gate',
    description:
      'Enforces executable pre-build compliance scripts, Hub-and-Spoke internal linking, BreadcrumbList JSON-LD, dynamic XML sitemaps, SSG static params, and ad-free 404 screens.',
    rejectionShare: '2% of Rejections',
  },
};

export const ADSENSE_POLICY_RULES: AdSensePolicyRule[] = [
  // ============================================================================
  // 1. LOW-VALUE CONTENT, ANTI-TRUNCATION & DETERMINISTIC DATA MOAT
  // ============================================================================
  {
    id: 'lvc-standalone-tool-depth',
    code: 'ADS-LVC-01',
    title: 'Interactive Tools & Calculators Must Include 800+ Words of Original Guide Content',
    category: 'low_value_content',
    severity: 'critical_rejection',
    officialSource: 'Google Publisher Policies — Minimum Content Requirements & Webmaster Quality Guidelines',
    updatedRelease: '2026 Core Quality Enforcement',
    rejectionSymptom: 'Rejected for "Low value content" or "Site does not comply with Google policies" on web apps, converters, calculators, and generators.',
    whyItFails:
      'AdSense crawlers evaluate rendered text depth and original publisher value. A single-screen calculator, unit converter, JSON formatter, or AI generator with only UI labels (<150 words) is classified as a "thin utility / doorway page" and automatically rejected.',
    aiBuilderDirective:
      'NEVER build a standalone tool, calculator, converter, or dashboard route with only form inputs. Every interactive tool page MUST include a structured below-the-fold editorial architecture containing at least 800–1,000 words of original content: (1) How the Formula/Tool Works with mathematical or technical methodology, (2) Deterministic Multi-Scenario Sensitivity Matrices, (3) Edge Cases & Interpretation Guide, and (4) 4–6 Domain-Specific FAQs.',
    automatedCheckSummary: 'Verifies >= 600 rendered words, >= 3 semantic H2/H3 sections, and worked examples below any interactive form/tool.',
    badCodeExample: `// REJECTED: Thin Utility Page ("Low Value Content")
export default function MortgageCalculator() {
  return (
    <main className="p-6">
      <h1>Mortgage Calculator</h1>
      <CalculatorWidget />
      <AdSenseBanner slot="1234567890" />
    </main>
  );
}`,
    goodCodeExample: `// COMPLIANT: Tool + Deep Methodology + Deterministic Matrix + E-E-A-T Byline
export default function MortgageCalculatorPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">
      <header>
        <h1>Amortization & Fixed-Rate Mortgage Calculator</h1>
        <p className="text-sm text-zinc-400">Reviewed by Certified Financial Analyst · Updated October 2026</p>
      </header>
      <CalculatorWidget />
      <article className="prose prose-invert max-w-none space-y-8">
        <h2>1. Mathematical Amortization Formula & Methodology</h2>
        <p>Monthly principal and interest payments are calculated using standard compound amortization...</p>
        <h2>2. Deterministic Loan Sensitivity Matrix: 15-Year vs. 30-Year Fixed</h2>
        <table>{/* Formula-derived numerical sensitivity comparison table */}</table>
        <h2>3. Frequently Asked Questions on Escrow, PMI & Early Payoff</h2>
        {/* 800+ words of original, high-utility domain documentation */}
      </article>
      <CompliantAdSlot slotId="1234567890" minHeight={280} />
    </main>
  );
}`,
    aiFixPrompt:
      'Expand this interactive tool page to pass Google AdSense Low-Value Content review: retain the interactive component above the fold, and add a comprehensive 800+ word semantic <article> section below containing (1) Technical Methodology & Formula Breakdown, (2) A Deterministic Sensitivity Comparison Table, (3) Step-by-Step Worked Examples, and (4) 5 Detailed Domain FAQs.',
    defaultEnabled: true,
  },
  {
    id: 'lvc-anti-truncation-multi-turn-protocol',
    code: 'ADS-LVC-02',
    title: 'Anti-Truncation Multi-Turn Protocol: Ban 100-Word LLM Array Stubs & Comments',
    category: 'low_value_content',
    severity: 'critical_rejection',
    officialSource: 'Google Search Essentials — Thin Content & Scaled Stub Pages (LLM Output Limit Mitigation)',
    updatedRelease: '2026 AI Builder Anti-Truncation Standard',
    rejectionSymptom: 'Site looks complete on the homepage grid, but gets rejected for "Low value content" because individual article/guide URLs only contain 80–150 words.',
    whyItFails:
      'Because LLMs have a single-turn output token ceiling (8k–16k tokens), when asked to build a site with 15 articles at once, the AI secretly cheats by creating a single `posts.ts` array where each article body is a 100-word summary or contains `// ... rest of article content`. Google crawls those stub URLs and rejects the entire domain.',
    aiBuilderDirective:
      'STRICT ANTI-TRUNCATION INVARIANT: NEVER store multiple articles as short 100-word summaries inside a single array file to save output tokens, and NEVER write truncation comments (`// ... more content`, `/* rest of article */`). Instead, use a Phased Multi-File Architecture: store each guide in its own dedicated module (`content/guides/<slug>.ts` or `.mdx`) and generate at most 2–3 complete, unabridged 1,000+ word guides per turn until the content library is fully populated.',
    automatedCheckSummary: 'Scans code for truncated comments ("// ... more", "rest of content") and detects array objects with short <150-word content strings.',
    badCodeExample: `// REJECTED (HOW LLMS SECRETLY CHEAT TOKEN LIMITS):
export const GUIDES = [
  { slug: 'guide-1', title: 'Database Indexing', content: 'Indexing speeds up queries. Use B-trees for equality checks.' },
  { slug: 'guide-2', title: 'Query Caching', content: 'Caching stores results in memory. // ... add more content here later' }
];`,
    goodCodeExample: `// COMPLIANT: Dedicated per-article content modules generated without truncation
// File: content/guides/postgresql-btree-vs-gin-indexing.ts
export const guidePostgresIndexing = {
  slug: 'postgresql-btree-vs-gin-indexing',
  title: 'PostgreSQL B-Tree vs. GIN Indexing: IOPS Scaling & Memory Overhead',
  wordCount: 1140,
  publishedAt: '2026-10-12',
  relatedSlugs: ['postgresql-connection-pooling', 'vacuum-autovacuum-tuning'],
  sections: [ /* Complete multi-paragraph prose, zero truncation comments */ ]
};`,
    aiFixPrompt:
      'Eliminate all short array-stub articles and truncation comments. Split each article/guide into its own dedicated content module and write the full, unabridged 1,000+ word technical prose, worked examples, and sensitivity tables for each route.',
    defaultEnabled: true,
  },
  {
    id: 'lvc-original-data-moat-anti-commodity',
    code: 'ADS-LVC-03',
    title: 'Anti-Commodity "Original Data Moat": Deterministic Sensitivity Matrices & Official Specs',
    category: 'low_value_content',
    severity: 'critical_rejection',
    officialSource: 'Google Quality Rater Guidelines — Information Gain & Valuable Inventory (No Original Value Added)',
    updatedRelease: '2026 Information Gain Enforcement',
    rejectionSymptom: 'Rejected for "Low value content" even when a calculator or article has 800+ words of textbook explanation.',
    whyItFails:
      'Google rejects generic calculators, converters, and tutorials ("commodity web utilities") if they only repeat textbook formulas already found on 50,000 other websites with zero "Information Gain".',
    aiBuilderDirective:
      'Every tool and guide MUST provide verifiable "Information Gain" (an Original Data Moat) without fabricating fake lab claims: (1) Compute and render a Deterministic Mathematical Sensitivity Matrix (e.g., evaluating the page\'s exact formula across 4–6 input tiers side-by-side in an HTML `<table>`), (2) Reference official, publicly verifiable specification constants (e.g., IEEE, W3C, IRS, Federal Reserve, PostgreSQL official docs), and (3) Include worked multi-scenario comparisons.',
    automatedCheckSummary: 'Checks for structured comparison <table> elements, deterministic sensitivity matrices, and multi-scenario analysis blocks.',
    badCodeExample: `// REJECTED COMMODITY TOOL: Single input + generic textbook definition
<div>
  <input placeholder="Enter watts" />
  <p>Kilowatt-hours equal watts multiplied by hours divided by 1,000.</p>
</div>`,
    goodCodeExample: `// COMPLIANT DATA MOAT: Deterministic Formula-Derived Sensitivity Matrix + Official Constants
<section className="space-y-8">
  <MultiApplianceLoadComparator />
  <h2>Deterministic Load & Duty-Cycle Cost Matrix (0.12 to 0.36 $/kWh Tiers)</h2>
  <table>
    <thead>
      <tr><th>Continuous Load (W)</th><th>25% Duty (kWh/mo)</th><th>100% Duty (kWh/mo)</th><th>Monthly Cost @ $0.18/kWh</th></tr>
    </thead>
    <tbody>{/* 100% mathematically verifiable formula outputs across tiers */}</tbody>
  </table>
</section>`,
    aiFixPrompt:
      'Upgrade this page from a generic commodity tool into a high-Information-Gain resource by embedding a deterministic formula-derived sensitivity matrix <table> and verified specification references.',
    defaultEnabled: true,
  },
  {
    id: 'lvc-minimum-indexable-articles',
    code: 'ADS-LVC-04',
    title: 'Minimum 15–25 Substantive, Interlinked Indexable Pages Before AdSense Submission',
    category: 'low_value_content',
    severity: 'critical_rejection',
    officialSource: 'Google Search Essentials — Site-Wide Topical Authority & Inventory Depth',
    updatedRelease: '2026 Site Authority Baseline',
    rejectionSymptom: 'Rejected for "Low value content" or "Valuable Inventory: Not enough content" on newly launched single-page web apps.',
    whyItFails:
      'Single-page applications (SPAs) with only 1–3 routes fail site-wide inventory sufficiency checks. AdSense requires a cohesive topical hub of indexable URLs (guides, documentation, glossary, case studies) to establish contextual ad relevance.',
    aiBuilderDirective:
      'When architecting a new website or web app intended for AdSense, NEVER build a single-route SPA. Always scaffold a complete Content & Knowledge Architecture alongside the core app: an indexable `/guides` or `/resources` hub with distinct, deep articles, a `/glossary` or `/methodology` reference page, and contextual internal links connecting every tool to its related guides.',
    automatedCheckSummary: 'Checks for internal navigation links to dedicated content hubs (/guides, /docs, /methodology, /articles) and multi-section depth.',
    badCodeExample: `// REJECTED: Single-route SPA with no indexable topical depth
<nav>
  <a href="/">Home Tool</a>
</nav>`,
    goodCodeExample: `// COMPLIANT: Multi-route topical architecture with indexable guides & methodology
<nav aria-label="Primary Navigation">
  <a href="/">Analyzer Workbench</a>
  <a href="/guides">Implementation Guides</a>
  <a href="/methodology">Technical Methodology</a>
  <a href="/benchmarks">Reference Matrices</a>
  <a href="/about">About & Editorial Policy</a>
</nav>`,
    aiFixPrompt:
      'Architect a multi-page topical content structure for this application including indexable routes for /guides, /methodology, and /benchmarks so Google Mediapartners-Google can crawl substantive contextual inventory.',
    defaultEnabled: true,
  },
  {
    id: 'lvc-eeat-authorship-signals',
    code: 'ADS-LVC-05',
    title: 'Explicit E-E-A-T Authorship, Credentials, Dates & Editorial Attribution',
    category: 'low_value_content',
    severity: 'critical_rejection',
    officialSource: 'Google Search Quality Rater Guidelines — E-E-A-T (Experience, Expertise, Authoritativeness, Trust)',
    updatedRelease: '2026 Helpful Content & E-E-A-T Update',
    rejectionSymptom: 'Rejected for "Low value content" on blogs, YMYL (finance/health/tech) guides, or AI-generated articles lacking human accountability.',
    whyItFails:
      'Anonymous content without publication timestamps, author biographies, fact-checking methodology, or primary source citations is flagged as mass-produced AI slop.',
    aiBuilderDirective:
      'Every content page, guide, or documentation view MUST include visible E-E-A-T metadata: (1) Author name, role, and domain credentials, (2) Published and Last Reviewed ISO dates (`<time dateTime="...">`), (3) An Author Bio / Editorial Methodology callout box, and (4) Schema.org `Article` or `TechArticle` JSON-LD structured data.',
    automatedCheckSummary: 'Inspects DOM for <time> tags, author attribution strings, JSON-LD structured data, and editorial review metadata.',
    badCodeExample: `// REJECTED: Anonymous, undated article header
<h1>How to Optimize Cloud SQL Costs</h1>
<p>Cloud databases can be expensive. Here are some tips...</p>`,
    goodCodeExample: `// COMPLIANT: Explicit E-E-A-T attribution + Schema.org JSON-LD
<header className="border-b border-zinc-800 pb-6">
  <h1>Cloud SQL Cost Optimization: Reference Tiers & Query Tuning</h1>
  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-3">
    <span>By Elena Vance, Principal Database Architect</span>
    <span>·</span>
    <time dateTime="2026-10-15">Updated October 15, 2026</time>
    <span>·</span>
    <span>Verified against PostgreSQL 17 documentation</span>
  </div>
</header>`,
    aiFixPrompt:
      'Add explicit E-E-A-T authorship signals to this page: include an author attribution header with credentials, semantic <time dateTime="..."> publication/review timestamps, an author biography footer block, and Schema.org Article JSON-LD.',
    defaultEnabled: true,
  },
  {
    id: 'lvc-anti-ai-slop-originality',
    code: 'ADS-LVC-06',
    title: 'Ban Unedited AI Fluff, Scraped Rewrites & Programmatic Keyword-Stuffed Stubs',
    category: 'low_value_content',
    severity: 'critical_rejection',
    officialSource: 'Google Spam Policies — Scaled Content Abuse & Scraped Content',
    updatedRelease: 'March 2024–2026 Scaled Content Abuse Policy',
    rejectionSymptom: 'Rejected for "Scaled content abuse", "Scraped content", or "Low value content".',
    whyItFails:
      'Pages containing generic filler openings ("In today\'s fast-paced digital landscape..."), repetitive programmatic city/keyword templates with 90% identical text, or zero original data tables/insights fail automated originality classifiers.',
    aiBuilderDirective:
      'NEVER generate generic filler introductions ("In today\'s world", "Delve into", "Comprehensive guide to..."), placeholder text ("Lorem ipsum", "Coming soon"), or repetitive programmatic template pages. Every page must lead immediately with concrete domain formulas, verifiable specification constants, and actionable workflows.',
    automatedCheckSummary: 'Scans text for AI cliché phrases, placeholder strings ("lorem ipsum", "todo", "coming soon"), and measures lexical diversity.',
    badCodeExample: `// REJECTED: Generic AI filler & placeholder stubs
<p>In today's fast-paced digital world, understanding SEO is more important than ever. Let's delve into the intricacies of web optimization. More details coming soon!</p>`,
    goodCodeExample: `// COMPLIANT: Direct, verifiable technical prose grounded in official specs
<p>Reducing Time to First Byte (TTFB) below 180ms on edge-cached routes requires separating dynamic personalization headers from static document responses via RFC 5861 stale-while-revalidate cache-control directives.</p>`,
    aiFixPrompt:
      'Rewrite any generic AI filler phrases or placeholder text on this page into concrete, specification-grounded technical prose with deterministic tables and actionable steps.',
    defaultEnabled: true,
  },

  // ============================================================================
  // 2. AD PLACEMENT, ZERO CLS, LCP/INP VITALS & BETTER ADS STANDARDS
  // ============================================================================
  {
    id: 'ux-cls-reserved-containers',
    code: 'ADS-UX-01',
    title: 'Zero Cumulative Layout Shift (CLS): Reserve Explicit Min-Height on All Ad Containers',
    category: 'ad_placement_ux',
    severity: 'critical_rejection',
    officialSource: 'Google Core Web Vitals (CLS <= 0.1) & AdSense Ad Placement Policies',
    updatedRelease: '2026 Core Web Vitals & Accidental Click Enforcement',
    rejectionSymptom: 'Policy violation for "Encouraging accidental clicks" and failing Core Web Vitals (CLS > 0.25).',
    whyItFails:
      'When an asynchronous AdSense `<ins class="adsbygoogle">` unit loads without a reserved `min-height` wrapper, it pushes page content down just as the user attempts to tap a link or paragraph—causing an accidental ad click that triggers Invalid Traffic penalties.',
    aiBuilderDirective:
      'EVERY ad container MUST be wrapped in a parent `<div className="min-h-[280px] flex items-center justify-center my-8">` (or explicit height matching the largest responsive ad size for that breakpoint) so asynchronous ad injection causes 0.00 CLS.',
    automatedCheckSummary: 'Checks all <ins class="adsbygoogle"> or ad slot containers to verify explicit min-height / min-h-[...] CSS reservation.',
    badCodeExample: `// VIOLATION: Unreserved ad slot causes content jump & accidental clicks
<div>
  <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client="ca-pub-xxx" />
</div>`,
    goodCodeExample: `// COMPLIANT: Reserved min-height container prevents layout shift (CLS = 0)
<aside aria-label="Advertisement" className="my-8 py-4 border-y border-zinc-800/80 bg-zinc-950">
  <div className="text-[11px] text-zinc-400 text-center mb-2">Advertisement</div>
  <div className="min-h-[280px] w-full flex items-center justify-center overflow-hidden">
    <ins
      className="adsbygoogle"
      style={{ display: 'block', minWidth: '300px', width: '100%', minHeight: '250px' }}
      data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
      data-ad-slot="1234567890"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  </div>
</aside>`,
    aiFixPrompt:
      'Wrap all AdSense <ins class="adsbygoogle"> elements in a dedicated CLS-safe container with explicit min-h-[280px] reservation, clear visual borders, and an allowed "Advertisement" disclosure label.',
    defaultEnabled: true,
  },
  {
    id: 'ux-accidental-click-proximity',
    code: 'ADS-UX-02',
    title: 'Minimum 150px Safety Buffer Between Ads and Interactive Controls / Navigation',
    category: 'ad_placement_ux',
    severity: 'critical_rejection',
    officialSource: 'Google AdSense Ad Placement Policies — Accidental Clicks & Unnatural Attention',
    updatedRelease: '2026 Click Integrity Standard',
    rejectionSymptom: 'Account warning or ad serving disabled for "Encouraging accidental clicks" or "Ads placed near interactive elements".',
    whyItFails:
      'Placing ads immediately adjacent to primary action buttons ("Calculate", "Download", "Next Page"), dropdown menus, pagination controls, or interactive game canvases causes high invalid click-through rates (CTR) from fat-finger taps.',
    aiBuilderDirective:
      'NEVER place an ad slot inside an interactive form card, directly beneath a primary CTA button, adjacent to pagination links, or next to a dropdown menu without at least `my-8` (32px–64px minimum margin, ideally separated by a distinct text section or `150px` visual buffer).',
    automatedCheckSummary: 'Detects ad containers placed directly adjacent to <button>, <form>, or download controls without structural separation.',
    badCodeExample: `// VIOLATION: Ad placed directly between form input and Calculate button
<form>
  <input type="number" placeholder="Enter amount" />
  <ins className="adsbygoogle" style={{ display: 'block' }} />
  <button type="submit">Calculate Now</button>
</form>`,
    goodCodeExample: `// COMPLIANT: Interactive form is completely isolated from ad slots
<section className="p-6 border border-zinc-800 rounded-lg">
  <form className="space-y-4">
    <input type="number" placeholder="Enter amount" />
    <button type="submit">Calculate Now</button>
  </form>
</section>
<section className="my-10">
  <h2>Understanding Your Calculation Results</h2>
  <p>Detailed analysis of how the output is derived...</p>
</section>
<CompliantAdSlot slotId="1234567890" />`,
    aiFixPrompt:
      'Move all ad slots out of interactive forms, toolbars, and button clusters. Ensure at least one substantive editorial section separates interactive buttons from any advertisement container.',
    defaultEnabled: true,
  },
  {
    id: 'ux-allowed-ad-labels-only',
    code: 'ADS-UX-03',
    title: 'Strict Ad Labeling: Only "Advertisements" or "Sponsored Links" Are Permitted',
    category: 'ad_placement_ux',
    severity: 'critical_rejection',
    officialSource: 'Google AdSense Ad Placement Policies — Labeling Ads',
    updatedRelease: '2026 Publisher Policy',
    rejectionSymptom: 'Policy violation for "Misleading ad headers" or "Encouraging clicks".',
    whyItFails:
      'Publishers frequently label ad containers with phrases like "Recommended Resources", "Helpful Links", "Partner Offers", or "Support Our Site". Google strictly forbids ANY label above an AdSense unit other than "Advertisements" or "Sponsored Links".',
    aiBuilderDirective:
      'If an ad container includes a text label, the label MUST read ONLY `"Advertisement"`, `"Advertisements"`, or `"Sponsored Links"`. NEVER use labels such as "Recommended for You", "Helpful Resources", "Featured Partners", or "Support Us".',
    automatedCheckSummary: 'Scans text immediately preceding ad units for forbidden misleading labels ("Recommended", "Helpful Links", "Support us", etc.).',
    badCodeExample: `// VIOLATION: Misleading label above AdSense unit
<div className="ad-box">
  <span className="text-xs">Helpful Partner Resources — Click to Support Us!</span>
  <ins className="adsbygoogle" />
</div>`,
    goodCodeExample: `// COMPLIANT: Only "Advertisement" or "Sponsored Links" allowed
<aside aria-label="Advertisement" className="my-8">
  <p className="text-[11px] text-zinc-400 text-center mb-1.5">Advertisement</p>
  <ins className="adsbygoogle" />
</aside>`,
    aiFixPrompt:
      'Replace any custom heading or text near ad slots with the strictly permitted label "Advertisement" or "Sponsored Links".',
    defaultEnabled: true,
  },
  {
    id: 'ux-better-ads-above-fold-density',
    code: 'ADS-UX-04',
    title: 'Coalition for Better Ads: Max 30% Viewport Ad Density & No Above-the-Fold Ad Crowding',
    category: 'ad_placement_ux',
    severity: 'ad_limitation',
    officialSource: 'Coalition for Better Ads Standards & Google Page Layout Algorithm',
    updatedRelease: '2026 Better Ads Experience Report',
    rejectionSymptom: 'Failing Better Ads Experience Report; ad serving restricted due to "More ads than publisher-provided content".',
    whyItFails:
      'Placing large display banners above the page H1 title, stacking two ad units back-to-back on mobile, or allowing ads to occupy >30% of vertical content height violates the Better Ads Standard.',
    aiBuilderDirective:
      'NEVER place an ad unit above the primary `<h1>` headline or hero tool in the initial viewport. Limit manual ad slots to at most 1 slot per 450–600 words of original prose, and never stack two ad units consecutively.',
    automatedCheckSummary: 'Calculates ratio of ad units to total word count (requires >= 350 words per ad slot) and checks if an ad appears before <h1>.',
    badCodeExample: `// VIOLATION: Ad placed above H1 + stacked double ad units
<main>
  <ins className="adsbygoogle" />
  <ins className="adsbygoogle" />
  <h1>Page Title</h1>
</main>`,
    goodCodeExample: `// COMPLIANT: Content-first above the fold; ads paced every 500+ words
<main>
  <h1>Page Title</h1>
  <p>Substantive introductory analysis and interactive tool...</p>
  <CompliantAdSlot slotId="1234567890" />
</main>`,
    aiFixPrompt:
      'Ensure no ad units appear before the primary <h1> and initial content block, remove any back-to-back stacked ad units, and maintain at least 450 words of original content per ad slot.',
    defaultEnabled: true,
  },
  {
    id: 'ux-no-ads-on-non-content-screens',
    code: 'ADS-UX-05',
    title: 'Zero Ad Units on 404 Error, Login, Registration, Checkout, or Empty Search Pages',
    category: 'ad_placement_ux',
    severity: 'critical_rejection',
    officialSource: 'Google Publisher Policies — No-Content & Functional Pages',
    updatedRelease: '2026 Inventory Quality Rule',
    rejectionSymptom: 'Policy violation: "Google-served ads on screens without publisher-content".',
    whyItFails:
      'When Auto Ads or global layout wrappers inject AdSense tags onto `/login`, `/signup`, `/404`, `/thank-you`, empty search results, or loading screens, Google flags the site for serving ads on pages with zero publisher content.',
    aiBuilderDirective:
      'NEVER mount `<AdSense />` scripts or ad slots on `/404`, `/not-found`, `/login`, `/register`, `/settings`, `/privacy`, `/contact`, or any dynamic search/filter view when `results.length === 0`.',
    automatedCheckSummary: 'Checks for conditional ad rendering guards when displaying empty states, authentication forms, or error screens.',
    badCodeExample: `// VIOLATION: Global layout injects ads even on 404 and empty search states
export default function SearchResults({ items }) {
  return (
    <div>
      {items.length === 0 ? <p>No results found.</p> : <List items={items} />}
      <AdSenseBanner />
    </div>
  );
}`,
    goodCodeExample: `// COMPLIANT: Conditional content-sufficiency gate before rendering any ad slot
export default function SearchResults({ items, wordCount }) {
  const canServeAds = items.length >= 3 && wordCount >= 500;
  return (
    <div>
      {items.length === 0 ? <EmptyStateGuide /> : <List items={items} />}
      {canServeAds && <CompliantAdSlot slotId="1234567890" />}
    </div>
  );
}`,
    aiFixPrompt:
      'Add a content-sufficiency guard around all ad components so ads are strictly suppressed on 404, login, legal, loading, or zero-result filter states.',
    defaultEnabled: true,
  },
  {
    id: 'ux-cwv-lcp-inp-script-strategy',
    code: 'ADS-UX-06',
    title: 'Core Web Vitals (LCP <= 2.5s, INP <= 200ms): Non-Blocking afterInteractive Ad & CMP Scripts',
    category: 'ad_placement_ux',
    severity: 'revenue_impact',
    officialSource: 'Google Search Essentials — Core Web Vitals (LCP, INP, CLS) & Page Experience',
    updatedRelease: '2026 INP & LCP Performance Standard',
    rejectionSymptom: 'Pages fail Google Search Console Core Web Vitals (LCP > 3.5s, INP > 300ms), stalling organic indexing and AdSense review.',
    whyItFails:
      'Loading heavy external scripts (`adsbygoogle.js` and `fundingchoicesmessages.google.com`) with synchronous/blocking tags or `strategy="beforeInteractive"` blocks main-thread hydration and delays Largest Contentful Paint (LCP).',
    aiBuilderDirective:
      'Keep ONLY the tiny 10-line inline `gtag("consent", "default", { ..., wait_for_update: 500 })` snippet in `strategy="beforeInteractive"`. Load external CMP scripts (`fundingchoicesmessages.google.com`) and `adsbygoogle.js` with `strategy="afterInteractive"` and `async` so first paint and Interaction to Next Paint (INP) remain under 200ms.',
    automatedCheckSummary: 'Verifies non-blocking async / afterInteractive loading on external ad and CMP scripts.',
    badCodeExample: `// VIOLATION: Blocking beforeInteractive external scripts degrade mobile LCP & INP
<Script strategy="beforeInteractive" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" />`,
    goodCodeExample: `// COMPLIANT: Inline default consent first; external CMP & AdSense deferred to afterInteractive
<Script id="consent-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: consentDefaultSnippet }} />
<Script id="funding-choices" strategy="afterInteractive" async src="https://fundingchoicesmessages.google.com/i/pub-xxx?ers=1" />
<Script id="adsense-js" strategy="afterInteractive" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxx" crossOrigin="anonymous" />`,
    aiFixPrompt:
      'Optimize third-party script loading for Core Web Vitals (LCP & INP): keep only the inline Consent Mode v2 default initialization in beforeInteractive and load external CMP and AdSense scripts with strategy="afterInteractive" and async.',
    defaultEnabled: true,
  },

  // ============================================================================
  // 3. MANDATORY TRUST PAGES, CERTIFIED TCF V2.2 CMP & ADS.TXT
  // ============================================================================
  {
    id: 'trust-consent-mode-v2',
    code: 'ADS-CMP-01',
    title: 'Google Consent Mode v2 (4 Signals) Default Initialization Before Any Tag Loads',
    category: 'trust_privacy_cmp',
    severity: 'critical_rejection',
    officialSource: 'Google EU User Consent Policy & Consent Mode v2 Technical Specification',
    updatedRelease: '2024–2026 EEA/UK/CH Enforcement',
    rejectionSymptom: 'Ad personalization and measurement disabled in EEA/UK; missing consent signal diagnostics in Google Tag Manager / AdSense.',
    whyItFails:
      'Loading AdSense scripts without initializing default consent states (`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` set to `denied` by default prior to script execution) violates Consent Mode v2.',
    aiBuilderDirective:
      'Always initialize Google Consent Mode v2 in `<head>` (`strategy="beforeInteractive"`) BEFORE any AdSense or Google Tag script loads, defaulting `ad_storage`, `ad_user_data`, `ad_personalization`, and `analytics_storage` to `"denied"` with `wait_for_update: 500` and `ads_data_redaction: true`.',
    automatedCheckSummary: 'Verifies presence of all 4 Consent Mode v2 parameters (ad_storage, ad_user_data, ad_personalization, analytics_storage).',
    badCodeExample: `// VIOLATION: Loading AdSense directly with no Consent Mode v2 initialization
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxx" crossOrigin="anonymous"></script>`,
    goodCodeExample: `// COMPLIANT: Consent Mode v2 Default State before AdSense tag loads
<script dangerouslySetInnerHTML={{ __html: \`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'wait_for_update': 500
  });
  gtag('set', 'ads_data_redaction', true);
\` }} />`,
    aiFixPrompt:
      'Implement Google Consent Mode v2 initialization in the document head setting ad_storage, ad_user_data, ad_personalization, and analytics_storage to denied by default.',
    defaultEnabled: true,
  },
  {
    id: 'trust-certified-tcf-v22-cmp',
    code: 'ADS-CMP-02',
    title: 'Google-Certified IAB TCF v2.2 CMP Integration (Ban DIY Non-TCF Cookie Banners)',
    category: 'trust_privacy_cmp',
    severity: 'critical_rejection',
    officialSource: 'Google EU User Consent Policy — Certified CMP & IAB TCF v2.2 Requirement',
    updatedRelease: '2026 Certified CMP Mandate',
    rejectionSymptom: '"CMP not certified" error in AdSense Privacy & Messaging; zero ads served to EEA/UK visitors despite having a custom React cookie banner.',
    whyItFails:
      'A homemade React cookie banner—even if it calls `gtag("consent", "update", ...)`—does NOT generate a cryptographic IAB TCF v2.2 `tcString` signed by a registered Google-Certified CMP ID. Google blocks ad serving in the EEA/UK unless a certified TCF v2.2 CMP (such as Google Funding Choices / AdSense Privacy & Messaging, Cookiebot, or Iubenda) is loaded.',
    aiBuilderDirective:
      'NEVER rely solely on a custom-coded React state banner for EEA/UK traffic. Always integrate the official **Google AdSense Privacy & Messaging (Funding Choices) TCF v2.2 tag** (`https://fundingchoicesmessages.google.com/i/pub-XXXXXXXXXXXXXXXX?ers=1`) or a Google-Certified IAB TCF v2.2 CMP script, and wire a footer button calling `googlefc.callbackQueue.push(googlefc.showRevocationMessage)` so users can revoke TCF v2.2 consent at any time.',
    automatedCheckSummary: 'Checks for Google Funding Choices (fundingchoicesmessages.google.com / googlefc) or IAB TCF v2.2 (__tcfapi) integration.',
    badCodeExample: `// VIOLATION FOR EEA/UK TRAFFIC: Homemade non-TCF banner without Certified CMP ID
const [accepted, setAccepted] = useState(false);`,
    goodCodeExample: `// COMPLIANT: Official Google-Certified CMP (Funding Choices / TCF v2.2) + Revocation API
<Script
  id="google-funding-choices-cmp"
  strategy="afterInteractive"
  async
  src="https://fundingchoicesmessages.google.com/i/pub-0000000000000000?ers=1"
/>`,
    aiFixPrompt:
      'Integrate Google AdSense Privacy & Messaging (Funding Choices IAB TCF v2.2 certified CMP script) alongside Consent Mode v2, and wire the official googlefc.showRevocationMessage() trigger in the global footer.',
    defaultEnabled: true,
  },
  {
    id: 'trust-privacy-policy-dart-disclosure',
    code: 'ADS-CMP-03',
    title: 'AdSense-Specific Privacy Policy (DoubleClick DART Cookie & Opt-Out Links)',
    category: 'trust_privacy_cmp',
    severity: 'critical_rejection',
    officialSource: 'Google AdSense Program Policies — Privacy Disclosures Required',
    updatedRelease: '2026 Required Content & Privacy Policy Mandate',
    rejectionSymptom: 'Rejected for "Site does not comply with Google policies" due to generic or missing Privacy Policy disclosures.',
    whyItFails:
      'A generic template Privacy Policy that merely says "We use cookies" fails AdSense review. Google explicitly mandates disclosing that (1) third-party vendors, including Google, use cookies to serve ads based on a user\'s prior visits, and (2) users may opt out of personalized advertising by visiting Google Ads Settings (`https://myadcenter.google.com/` or `https://www.aboutads.info`).',
    aiBuilderDirective:
      'Every website MUST have a dedicated `/privacy` route linked in the global footer that explicitly contains the mandatory Google AdSense third-party cookie disclosure, DoubleClick DART cookie explanation, CCPA "Do Not Sell or Share My Personal Information" rights, GDPR legal basis disclosures, and clickable links to `https://policies.google.com/technologies/partner-sites` and `https://myadcenter.google.com/`.',
    automatedCheckSummary: 'Checks for /privacy link and verifies disclosure of Google third-party advertising cookies and opt-out URLs.',
    badCodeExample: `// VIOLATION: Generic 2-sentence privacy notice with no Google AdSense disclosure
<p>We respect your privacy and use cookies to improve your experience.</p>`,
    goodCodeExample: `// COMPLIANT: Mandatory Google AdSense & Third-Party Cookie Disclosure
<section>
  <h2>Advertising & Google AdSense Cookies</h2>
  <p>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites. Users may opt out of personalized advertising by visiting <a href="https://myadcenter.google.com/">Google Ads Settings</a> or <a href="https://www.aboutads.info/choices/">www.aboutads.info</a>.</p>
</section>`,
    aiFixPrompt:
      'Add a complete AdSense-compliant Privacy Policy disclosure section detailing Google third-party advertising cookies, partner data usage, and direct opt-out links to Google Ads Settings and aboutads.info.',
    defaultEnabled: true,
  },
  {
    id: 'trust-about-contact-terms-routes',
    code: 'ADS-CMP-04',
    title: 'Mandatory Accessible Trust Routes: /about, /contact, /privacy, and /terms',
    category: 'trust_privacy_cmp',
    severity: 'critical_rejection',
    officialSource: 'Google Search Quality Rater Guidelines — Website Transparency & Trustworthiness',
    updatedRelease: '2026 Trust & Transparency Baseline',
    rejectionSymptom: 'Rejected for "Low value content" or lack of publisher transparency.',
    whyItFails:
      'Sites that omit a real `/about` page (explaining who runs the site, editorial mission, and credentials), a functional `/contact` page (with a direct support email and working contact form), or `/terms` fail basic publisher verification.',
    aiBuilderDirective:
      'Always build and link 4 mandatory trust pages in the global footer of every page: `/about`, `/contact`, `/privacy`, and `/terms`. Never leave these links pointing to `href="#"`.',
    automatedCheckSummary: 'Inspects global navigation and footer for working links to /about, /contact, /privacy, and /terms (no href="#").',
    badCodeExample: `// VIOLATION: Dead placeholder footer links
<footer>
  <a href="#">Privacy</a>
  <a href="#">Terms</a>
</footer>`,
    goodCodeExample: `// COMPLIANT: Real, accessible routes with full publisher transparency
<footer className="border-t border-zinc-800 py-8">
  <nav aria-label="Legal and Trust Navigation" className="flex flex-wrap gap-6 text-xs text-zinc-400">
    <a href="/about">About & Editorial Policy</a>
    <a href="/contact">Contact Us</a>
    <a href="/privacy">Privacy Policy</a>
    <a href="/terms">Terms of Service</a>
    <a href="/ads.txt">ads.txt</a>
  </nav>
</footer>`,
    aiFixPrompt:
      'Replace any placeholder or missing footer links with complete, accessible routes for /about, /contact, /privacy, and /terms containing real publisher transparency details.',
    defaultEnabled: true,
  },
  {
    id: 'trust-ads-txt-verification',
    code: 'ADS-CMP-05',
    title: 'Root-Level /ads.txt Authorized Digital Sellers Record & Seller.json Alignment',
    category: 'trust_privacy_cmp',
    severity: 'revenue_impact',
    officialSource: 'IAB Tech Lab ads.txt Specification & Google AdSense Earnings at Risk Alert',
    updatedRelease: '2026 Authorized Seller Requirement',
    rejectionSymptom: '"Earnings at risk — You need to fix some ads.txt file issues to avoid severe impact to your revenue."',
    whyItFails:
      'Missing `/public/ads.txt` or formatting errors (wrong publisher ID format, trailing spaces, or redirect loops) prevents programmatic bidders from purchasing ad inventory.',
    aiBuilderDirective:
      'Always create `/public/ads.txt` containing the exact IAB syntax: `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`.',
    automatedCheckSummary: 'Validates syntax of ads.txt declarations against google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0.',
    badCodeExample: `# INVALID ads.txt syntax (wrong prefix & missing certification authority ID)
google.com, ca-pub-1234567890123456, DIRECT`,
    goodCodeExample: `# VALID IAB Tech Lab ads.txt record for Google AdSense (16-digit pub ID, no "ca-" prefix)
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0`,
    aiFixPrompt:
      'Generate a valid root-level /public/ads.txt file using the exact format: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0 (removing any "ca-" prefix).',
    defaultEnabled: true,
  },

  // ============================================================================
  // 4. PROHIBITED CONTENT, YMYL & ANTI-FAKE-CLAIM GUARDRAILS
  // ============================================================================
  {
    id: 'prohibited-copyright-streaming-downloads',
    code: 'ADS-PRO-01',
    title: 'Zero Copyright Infringement, Video/Audio Rippers, APK Mods, or Warez Links',
    category: 'prohibited_content',
    severity: 'critical_rejection',
    officialSource: 'Google Publisher Policies — Copyrighted Material & Enabling Dishonest Behavior',
    updatedRelease: '2026 DMCA & Piracy Zero-Tolerance Policy',
    rejectionSymptom: 'Immediate rejection or permanent account ban for "Copyrighted material" or "Enabling dishonest behavior".',
    whyItFails:
      'Web apps built as YouTube/TikTok MP3/MP4 downloaders, APK mod repositories, torrent indexers, streaming link aggregators, or bypass/keygen tools violate Google Publisher Policies.',
    aiBuilderDirective:
      'NEVER build or include features that download, rip, or scrape third-party streaming media (YouTube, TikTok, Instagram, Spotify downloaders), distribute cracked/modded APKs, or bypass paywalls/DRM. Restrict media utilities strictly to user-owned local file uploads.',
    automatedCheckSummary: 'Scans page copy and code for prohibited media-ripping, warez, keygen, cracked APK, and unauthorized download keywords.',
    badCodeExample: `// BANNED BY ADSENSE: Third-party video/audio downloader utility
<h1>Free YouTube to MP3 & TikTok Video Downloader</h1>`,
    goodCodeExample: `// COMPLIANT: Local client-side audio waveform analyzer for user-owned files
<h1>Browser-Based WAV & Podcast Loudness Analyzer (ITU-R BS.1770-4 LUFS)</h1>`,
    aiFixPrompt:
      'Remove all references or functionality related to downloading third-party copyrighted media, modded apps, or DRM bypass, and reframe the utility around processing user-created local files.',
    defaultEnabled: true,
  },
  {
    id: 'prohibited-ymyl-medical-financial-claims',
    code: 'ADS-PRO-02',
    title: 'YMYL Safety & Unverified Financial/Medical Claims Disclaimers',
    category: 'prohibited_content',
    severity: 'critical_rejection',
    officialSource: 'Google Publisher Policies — Dangerous/Derogatory & Misleading Representation',
    updatedRelease: '2026 YMYL Quality & Safety Mandate',
    rejectionSymptom: 'Rejected for "Low value content" or "Unreliable and harmful claims" on finance, crypto, tax, or health tools.',
    whyItFails:
      'Sites offering financial calculators, investment projections, or health estimators that promise guaranteed returns, omit clear educational disclaimers, or lack authoritative citations are rejected under heightened YMYL scrutiny.',
    aiBuilderDirective:
      'Whenever building a website or tool in a YMYL domain (finance, taxes, loans, crypto, fitness, nutrition, medical, legal), ALWAYS include: (1) A prominent Educational Disclaimer stating the tool does not constitute professional medical, legal, or financial advice, (2) Primary citations to official institutional sources (IRS, SEC, NIH, WHO, IEEE), and (3) Zero "guaranteed profit" language.',
    automatedCheckSummary: 'Detects YMYL topics (finance/health/legal) and verifies presence of an explicit educational disclaimer and institutional citations.',
    badCodeExample: `// VIOLATION: Sensationalist financial claim with zero YMYL disclaimer
<h1>Guaranteed 300% Crypto ROI Calculator — Beat the Market Today!</h1>`,
    goodCodeExample: `// COMPLIANT: Objective financial modeling tool with explicit YMYL disclaimer
<h1>Compound Annual Growth Rate (CAGR) & Standard Deviation Modeler</h1>
<p className="text-xs text-zinc-400">Educational Disclaimer: This model computes mathematical compound growth and volatility for educational analysis only and does not constitute investment or tax advice.</p>`,
    aiFixPrompt:
      'Remove any exaggerated or guaranteed outcome claims, add a visible YMYL Educational & Fiduciary Disclaimer, and cite authoritative institutional sources.',
    defaultEnabled: true,
  },
  {
    id: 'prohibited-ugc-moderation-guardrails',
    code: 'ADS-PRO-03',
    title: 'User-Generated Content (UGC) Moderation & Ad Suppression on Unmoderated Feeds',
    category: 'prohibited_content',
    severity: 'ad_limitation',
    officialSource: 'Google Publisher Policies — Responsibility for User-Generated Content',
    updatedRelease: '2026 UGC Compliance Standard',
    rejectionSymptom: 'Page-level policy violations caused by unmoderated comments, forum posts, or AI prompt galleries.',
    whyItFails:
      'Publishers are 100% liable for all content on any page displaying AdSense code—including user comments, public AI prompt outputs, and community posts.',
    aiBuilderDirective:
      'If an application features user comments or shared AI outputs: require pre-moderation approval before public indexing, add `rel="ugc nofollow"` to all user links, and provide a visible "Report Content" button.',
    automatedCheckSummary: 'Checks user comment/forum links for rel="ugc nofollow" and moderation/report affordances.',
    badCodeExample: `// VIOLATION: Raw unmoderated user HTML/links rendered alongside AdSense
<div dangerouslySetInnerHTML={{ __html: userComment.rawHtml }} />`,
    goodCodeExample: `// COMPLIANT: Sanitized, moderated UGC with rel="ugc nofollow" and Report action
<article className="p-4 border border-zinc-800 rounded">
  <p>{sanitizeText(userComment.approvedBody)}</p>
  <button onClick={() => reportComment(userComment.id)} className="text-xs text-zinc-400">Report Policy Violation</button>
</article>`,
    aiFixPrompt:
      'Ensure all user-generated content blocks enforce pre-moderation, sanitize HTML, apply rel="ugc nofollow" to outbound links, and include a visible Report Content control.',
    defaultEnabled: true,
  },
  {
    id: 'prohibited-fake-first-person-lab-claims',
    code: 'ADS-PRO-04',
    title: 'Ban Fabricated First-Person Lab Experiments & Synthetic Survey Claims (Deceptive E-E-A-T)',
    category: 'prohibited_content',
    severity: 'critical_rejection',
    officialSource: 'Google Publisher Policies — Misleading Representation & Deceptive E-E-A-T Claims',
    updatedRelease: '2026 Anti-Fabrication Quality Rater Rule',
    rejectionSymptom: 'Human review rejection for "Misleading representation" or "Unreliable claims" when AI invents fake first-person testing stories.',
    whyItFails:
      'When told to write "empirical benchmarks", unguided LLMs frequently hallucinate fake first-person lab stories ("In our 14-day benchmark across 40,000 production servers, we measured..."). Human reviewers immediately spot that an indie site did not run a 40,000-server lab study and reject the site for deceptive representation.',
    aiBuilderDirective:
      'NEVER fabricate first-person empirical experiments, fake laboratory tests ("we tested 50,000 requests"), or invented survey statistics. Ground all tables and benchmarks in (1) Deterministic Mathematical Formulas (calculating exact numerical outputs across input parameters) or (2) Explicitly cited public documentation and standards (e.g., PostgreSQL 17 official documentation, RFC specifications, or Federal Reserve FRED series).',
    automatedCheckSummary: 'Scans text for fabricated first-person lab claims ("in our 14-day benchmark", "we tested 40,000", "we surveyed").',
    badCodeExample: `// VIOLATION (DECEPTIVE FIRST-PERSON AI FABRICATION):
<p>In our 14-day benchmark across 40,000 production servers in our lab, we found that setting pool size to 36 reduced latency by 62%.</p>`,
    goodCodeExample: `// COMPLIANT (DETERMINISTIC FORMULA MODEL + OFFICIAL SPECIFICATION CITATION):
<p>Applying the Universal Scalability Law (Gunther, 2007) and PostgreSQL 17 connection overhead parameters (~7.5 MB resident memory per backend process), the deterministic queueing matrix below models throughput across 16-vCPU instances:</p>`,
    aiFixPrompt:
      'Remove any fabricated first-person laboratory or survey claims ("we tested X servers", "in our 14-day study") and reframe all benchmark tables as deterministic mathematical models or cited official specification benchmarks.',
    defaultEnabled: true,
  },

  // ============================================================================
  // 5. INVALID TRAFFIC (IVT) & CLICK INTEGRITY
  // ============================================================================
  {
    id: 'ivt-dev-staging-test-mode',
    code: 'ADS-IVT-01',
    title: 'Mandatory Development Test Mode & Zero Live Ads on Localhost / Preview URLs',
    category: 'traffic_integrity',
    severity: 'critical_rejection',
    officialSource: 'Google AdSense Invalid Traffic Policies — Clicking Your Own Ads & Unverified Domains',
    updatedRelease: '2026 Invalid Traffic Prevention',
    rejectionSymptom: 'Ad serving limited ("Ad serving on your account is currently being limited due to invalid traffic concerns") or permanent account termination.',
    whyItFails:
      'Rendering live production AdSense units during local development (`localhost`), CI automated E2E testing, or staging preview URLs causes repeated developer impressions and accidental self-clicks.',
    aiBuilderDirective:
      'NEVER render live AdSense `<ins class="adsbygoogle">` production requests when `process.env.NODE_ENV !== "production"` or when `window.location.hostname` does not match the verified production domain.',
    automatedCheckSummary: 'Checks ad components for environment gating (NODE_ENV === "production") or data-adtest="on" safety attributes.',
    badCodeExample: `// VIOLATION: Fires live AdSense requests on localhost and Playwright test runs
useEffect(() => {
  (window.adsbygoogle = window.adsbygoogle || []).push({});
}, []);`,
    goodCodeExample: `// COMPLIANT: Strict production hostname & NODE_ENV guard prevents dev self-clicks
const isProductionDomain =
  process.env.NODE_ENV === 'production' &&
  typeof window !== 'undefined' &&
  window.location.hostname === 'yourdomain.com';`,
    aiFixPrompt:
      'Add a strict production environment and hostname check around the AdSense script push so live ad impressions never fire on localhost or preview deployments.',
    defaultEnabled: true,
  },
  {
    id: 'ivt-no-auto-refresh-or-incentivized-clicks',
    code: 'ADS-IVT-02',
    title: 'Ban Auto-Refreshing Ad Timers, SPA Route Push Loops & Incentivized Click Copy',
    category: 'traffic_integrity',
    severity: 'critical_rejection',
    officialSource: 'Google AdSense Program Policies — Encouraging Clicks & Auto-Refreshing Ads',
    updatedRelease: '2026 Traffic Quality Standard',
    rejectionSymptom: 'Immediate account suspension for "Invalid Traffic" or "Encouraging users to click ads".',
    whyItFails:
      'Calling `(adsbygoogle = window.adsbygoogle || []).push({})` inside a `setInterval` timer or asking users to "Click an ad to support our free tool" is strictly forbidden.',
    aiBuilderDirective:
      'NEVER call `adsbygoogle.push({})` inside a `setInterval` or on un-navigated React state updates (track pushed `<ins>` nodes via `data-adsbygoogle-status`). NEVER write copy asking users to click ads or support sponsors.',
    automatedCheckSummary: 'Scans code for setInterval ad refreshes, unprotected adsbygoogle.push calls, and incentivized click phrases.',
    badCodeExample: `// BANNED: Auto-refreshing ad timer + incentivized click copy
setInterval(() => { (window.adsbygoogle = window.adsbygoogle || []).push({}); }, 30000);`,
    goodCodeExample: `// COMPLIANT: Single idempotent mount guard using useRef + zero click solicitation
if (adRef.current && !adRef.current.getAttribute('data-adsbygoogle-status')) {
  (window.adsbygoogle = window.adsbygoogle || []).push({});
}`,
    aiFixPrompt:
      'Remove any timer-based ad refreshes or user solicitation copy ("support us by clicking"), and guard adsbygoogle.push({}) with a data-adsbygoogle-status attribute check.',
    defaultEnabled: true,
  },

  // ============================================================================
  // 6. TECHNICAL SEO, SITEMAP, INTERNAL LINK GRAPH & PRE-BUILD CI GATE
  // ============================================================================
  {
    id: 'tech-ssr-crawlability-mediapartners',
    code: 'ADS-TEC-01',
    title: 'Server-Rendered HTML Content & Unblocked Mediapartners-Google Crawler Access',
    category: 'technical_crawlability',
    severity: 'critical_rejection',
    officialSource: 'Google AdSense Crawler Access & Site Down/Unavailable Policy',
    updatedRelease: '2026 Crawler & Rendering Standard',
    rejectionSymptom: 'Rejected for "Site down or unavailable" or "Low value content" because the crawler saw an empty `<div id="root"></div>`.',
    whyItFails:
      'When a web app relies exclusively on client-side `useEffect` fetches or blocks `Mediapartners-Google` / `Googlebot` in `robots.txt`, the AdSense review crawler sees a blank loading spinner and rejects the application.',
    aiBuilderDirective:
      'Ensure all primary editorial content, tool documentation, headings, and trust pages are Server-Side Rendered (SSR) or Statically Generated (SSG) in the initial HTML payload. Configure `/robots.txt` to explicitly allow `User-agent: Mediapartners-Google` and `User-agent: Googlebot`.',
    automatedCheckSummary: 'Checks for SSR semantic HTML presence, absence of noindex meta tags on public pages, and robots.txt Mediapartners-Google allowance.',
    badCodeExample: `# VIOLATION: Blocking AdSense crawler in robots.txt
User-agent: *
Disallow: /`,
    goodCodeExample: `# COMPLIANT: Explicit Mediapartners-Google & Googlebot access in robots.txt
User-agent: Mediapartners-Google
Allow: /

User-agent: Googlebot
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml`,
    aiFixPrompt:
      'Remove any noindex meta directives on public routes, ensure core article and documentation prose is server-rendered in the initial HTML response, and configure robots.txt to allow Mediapartners-Google.',
    defaultEnabled: true,
  },
  {
    id: 'tech-zero-dead-links-or-stubs',
    code: 'ADS-TEC-02',
    title: 'Zero Broken Links (href="#"), Empty Category Stubs, or "Under Construction" Sections',
    category: 'technical_crawlability',
    severity: 'critical_rejection',
    officialSource: 'Google AdSense Program Policies — Behavioural & Navigational Integrity',
    updatedRelease: '2026 Site Completeness Standard',
    rejectionSymptom: 'Rejected for "Site under construction" or "Difficult site navigation".',
    whyItFails:
      'AI coding tools frequently scaffold navigation menus, social icons, or footer links with `href="#"` or `javascript:void(0)`. A single dead navigation link during review can trigger an automatic rejection.',
    aiBuilderDirective:
      'NEVER output `<a href="#">`, `href=""`, `javascript:void(0)`, or links to unimplemented routes anywhere in the DOM. Use `<button type="button">` for client-side actions.',
    automatedCheckSummary: 'Scans all <a> anchor tags for href="#", empty hrefs, javascript:void(0), and "under construction" / "coming soon" text.',
    badCodeExample: `// VIOLATION: Dead anchor links and coming-soon placeholders
<a href="#">Blog (Coming Soon)</a>`,
    goodCodeExample: `// COMPLIANT: Every <a> link resolves to a real, complete route
<a href="/guides">Engineering Guides</a>`,
    aiFixPrompt:
      'Audit all <a> tags across the page: replace any href="#" or javascript:void(0) triggers with semantic <button type="button"> elements or complete destination routes.',
    defaultEnabled: true,
  },
  {
    id: 'tech-dynamic-sitemap-ssg-canonicals',
    code: 'ADS-TEC-03',
    title: 'Mandatory Dynamic XML Sitemap (app/sitemap.ts), generateStaticParams & Canonical Metadata',
    category: 'technical_crawlability',
    severity: 'critical_rejection',
    officialSource: 'Google Search Essentials — Crawl Discovery, Canonicalization & Doorway Prevention',
    updatedRelease: '2026 Next.js / SSR Indexing Mandate',
    rejectionSymptom: 'Google only crawls the homepage `/` and rejects the site for "Valuable Inventory: Not enough content" or "Duplicate Metadata".',
    whyItFails:
      'If dynamic routes (`/guides/[slug]`, `/tools/[slug]`) do not export `generateStaticParams()`, unique `generateMetadata()` with `alternates.canonical`, and a programmatic `app/sitemap.ts`, crawlers fail to discover deep content routes.',
    aiBuilderDirective:
      'ALWAYS implement: (1) `app/sitemap.ts` dynamically enumerating every public tool, guide, and trust route, (2) `generateStaticParams()` on all dynamic `[slug]` routes, and (3) `generateMetadata()` setting a unique `<title>`, `<meta name="description">`, and self-referencing `alternates.canonical`.',
    automatedCheckSummary: 'Checks for canonical URL metadata, unique title/description generation, and sitemap discovery.',
    badCodeExample: `// VIOLATION: Dynamic route with no generateStaticParams and no canonical
export default function GuidePage({ params }) { return <div>{params.slug}</div>; }`,
    goodCodeExample: `// COMPLIANT: Pre-rendered SSG route with unique title, description & self-referencing canonical
export async function generateStaticParams() {
  return ALL_GUIDES.map((g) => ({ slug: g.slug }));
}`,
    aiFixPrompt:
      'Add app/sitemap.ts enumerating all routes, and implement generateStaticParams() and generateMetadata() with unique titles, descriptions, and canonical URLs on every route.',
    defaultEnabled: true,
  },
  {
    id: 'tech-custom-404-ad-isolation',
    code: 'ADS-TEC-04',
    title: 'Ad-Free Custom 404 Route (app/not-found.tsx) & Error Boundary Isolation',
    category: 'technical_crawlability',
    severity: 'critical_rejection',
    officialSource: 'Google Publisher Policies — No Ads on Error or Non-Content Screens',
    updatedRelease: '2026 Error Screen Isolation Rule',
    rejectionSymptom: 'Policy violation: "Google-served ads on screens without publisher-content" triggered when a crawler tests a non-existent URL.',
    whyItFails:
      'During AdSense review, Google crawlers deliberately probe non-existent URLs on your domain to see how your site handles 404 states. If your root layout renders an ad banner on the 404 screen, the review fails.',
    aiBuilderDirective:
      'Always create a dedicated `app/not-found.tsx` that sets `data-adsense-suppress="true"`, suppresses all ad units, and provides helpful links to your top published guides and tools.',
    automatedCheckSummary: 'Verifies that error/404 templates suppress ad slots and include recovery links to main content hubs.',
    badCodeExample: `// VIOLATION: Default 404 inherits layout ad banners
export default function NotFound() { return <h1>404 - Page Not Found</h1>; }`,
    goodCodeExample: `// COMPLIANT: Ad-free 404 page with helpful indexable content recovery links
export default function NotFound() {
  return <main data-adsense-suppress="true"><h1>404 — Resource Not Found</h1></main>;
}`,
    aiFixPrompt:
      'Create an explicit app/not-found.tsx component that sets data-adsense-suppress="true" and provides direct navigation links to published guides and tools.',
    defaultEnabled: true,
  },
  {
    id: 'tech-hub-spoke-internal-linking-breadcrumbs',
    code: 'ADS-TEC-05',
    title: 'Hub-and-Spoke Contextual Internal Link Graph & BreadcrumbList JSON-LD (Anti-Orphan Rule)',
    category: 'technical_crawlability',
    severity: 'critical_rejection',
    officialSource: 'Google Search Essentials — Internal Linking Architecture & Structured Data',
    updatedRelease: '2026 Search Console Indexing Mandate',
    rejectionSymptom: '15 of 20 pages sit in Google Search Console as "Crawled - currently not indexed", causing AdSense to reject the site for "Not enough content".',
    whyItFails:
      'Listing 20 pages in `sitemap.xml` is not enough for indexing. If guide pages are only linked from a single index list and lack contextual cross-links and `BreadcrumbList` schema, Google treats them as low-priority leaf pages and refuses to index them.',
    aiBuilderDirective:
      'Enforce a strict **Hub-and-Spoke Internal Link Graph**: (1) Every interactive tool page MUST link contextually to at least 3 related deep-dive guides, (2) Every guide page MUST link back to its parent interactive tool AND to at least 2 related sibling guides (`relatedSlugs`), and (3) Every page MUST render visible `<nav aria-label="Breadcrumb">` breadcrumbs paired with Schema.org `BreadcrumbList` JSON-LD.',
    automatedCheckSummary: 'Checks for <nav aria-label="Breadcrumb">, BreadcrumbList JSON-LD, and contextual internal links to /guides/ and /tools/ routes.',
    badCodeExample: `// VIOLATION: Isolated orphan article with zero breadcrumb schema or sibling guide links
<article><h1>Guide Title</h1><p> Isolated text with no internal links...</p></article>`,
    goodCodeExample: `// COMPLIANT: Visible Breadcrumb nav + BreadcrumbList JSON-LD + Related Guides Mesh
<nav aria-label="Breadcrumb" className="text-xs text-zinc-400">
  <a href="/">Home</a> › <a href="/guides">Engineering Guides</a> › <span>PostgreSQL Pool Sizing</span>
</nav>
<section aria-label="Related Technical Guides">
  <h2>Related Architecture Guides & Interactive Models</h2>
  <a href="/calculators/pgbouncer-memory">PgBouncer Memory Overhead Calculator</a>
  <a href="/guides/postgres-autovacuum-iops">Autovacuum IOPS Tuning Guide</a>
</section>`,
    aiFixPrompt:
      'Add a visible <nav aria-label="Breadcrumb"> header, Schema.org BreadcrumbList JSON-LD, and a Contextual Related Guides & Tools internal linking section to prevent orphan pages in Google Search Console.',
    defaultEnabled: true,
  },
  {
    id: 'tech-prebuild-ci-verification-gate',
    code: 'ADS-TEC-06',
    title: 'Executable Pre-Build AdSense Compiler Gate (scripts/verify-adsense-build.mjs)',
    category: 'technical_crawlability',
    severity: 'critical_rejection',
    officialSource: 'Automated CI/CD Compliance Invariant — Preventing LLM Context Drift',
    updatedRelease: '2026 Self-Healing Build Gate',
    rejectionSymptom: 'AI follows rules in Turn 1, but by Turn 4 forgets and commits a 350-word stub or a dead href="#" link.',
    whyItFails:
      'LLMs treat markdown instructions (`SKILL.md`, `.cursorrules`) as soft guidance that can degrade over long multi-turn conversations. However, LLMs obey terminal build errors 100% of the time.',
    aiBuilderDirective:
      'Always create `scripts/verify-adsense-build.mjs` and wire it into `package.json` (`"prebuild": "node scripts/verify-adsense-build.mjs"`). The script must scan all routes and content files before `next build`, exiting with `process.exit(1)` if any guide has `< 800` words, if any `<a href="#">` or truncation comment exists, or if `/public/ads.txt`, `app/sitemap.ts`, `app/not-found.tsx`, or `/privacy` is missing.',
    automatedCheckSummary: 'Verifies automated build-time enforcement of word floors, link integrity, and required files.',
    badCodeExample: `// fragile: relying purely on LLM memory across 5 turns with no build-time assertion
"scripts": { "build": "next build" }`,
    goodCodeExample: `// AIRTIGHT: Hard prebuild Node.js gate forces the AI to fix any violation before build succeeds
"scripts": {
  "prebuild": "node scripts/verify-adsense-build.mjs",
  "build": "next build"
}`,
    aiFixPrompt:
      'Create scripts/verify-adsense-build.mjs and wire it to the prebuild script in package.json so npm run build fails automatically if any route violates AdSense word depth, link integrity, or trust file requirements.',
    defaultEnabled: true,
  },
  {
    id: 'lvc-anti-doorway-pseo-uniqueness',
    code: 'ADS-LVC-06',
    title: 'Anti-Doorway Page & Programmatic SEO (pSEO) Cross-Route Shingle Uniqueness Gate',
    category: 'low_value_content',
    severity: 'critical_rejection',
    officialSource: 'Google Search Essentials — Doorway Abuse & Scaled Content Abuse Policy',
    updatedRelease: '2026 Anti-pSEO Doorway Filter',
    rejectionSymptom: 'Rejected for "Valuable Inventory: Scaled Content Abuse" or "Doorway Pages" despite 800+ words per route.',
    whyItFails:
      'When asked to create 15–25 SSG routes, AI agents frequently generate programmatic "Mad-Libs" permutations (e.g., `/convert/usd-to-eur`, `/convert/usd-to-gbp`) using a single boilerplate paragraph template where 85%+ of the 5-gram text shingles are identical and only variable names (`${unitA}`, `${unitB}`) change.',
    aiBuilderDirective:
      'NEVER generate programmatic variable-swapped Mad-Libs routes where multiple URLs share the same prose template with substituted keywords. Every dynamic route (`[slug]`) MUST address a distinct architectural topic or problem domain and maintain `< 25%` 5-gram shingle overlap with any other route on the domain.',
    automatedCheckSummary: 'Detects variable-swapped Mad-Libs template strings (${unitA} to ${unitB}) and repetitive cross-route boilerplate.',
    badCodeExample: `// VIOLATION (DOORWAY / MAD-LIBS pSEO ABUSE):
const text = \`How to convert \${fromUnit} to \${toUnit}: Converting \${fromUnit} to \${toUnit} is essential for engineers working with \${fromUnit} systems...\`;`,
    goodCodeExample: `// COMPLIANT: Distinct, domain-specific articles with < 25% shingle overlap across slugs
// Slug 1: /guides/pgbouncer-transaction-pooling-internals
// Slug 2: /guides/postgresql-wal-checkpoint-io-tuning`,
    aiFixPrompt:
      'Eliminate variable-swapped programmatic SEO templates and ensure every dynamic route covers a distinct subject with at least 75% unique prose.',
    defaultEnabled: true,
  },
  {
    id: 'img-no-stock-placeholders-inline-svg',
    code: 'ADS-IMG-01',
    title: 'Ban Stock Placeholder URLs (picsum.photos / placehold.co) & Require Inline Technical SVG Diagrams',
    category: 'low_value_content',
    severity: 'critical_rejection',
    officialSource: 'Google Search Quality Rater Guidelines — Original Visual Information Gain & Completeness',
    updatedRelease: '2026 Visual Authenticity Mandate',
    rejectionSymptom: 'Human reviewer flags site as an "Auto-generated template / Under construction" after spotting random stock photos or broken image links.',
    whyItFails:
      'LLMs routinely insert `picsum.photos`, `placehold.co`, `via.placeholder.com`, or hallucinated `unsplash.com` URLs that return HTTP 404. Random stock photos on a technical or financial site immediately signal an uncurated AI template to human AdSense reviewers.',
    aiBuilderDirective:
      'NEVER use `picsum.photos`, `placehold.co`, `via.placeholder.com`, or unverified external image URLs in articles or tools. Instead, embed **deterministic inline `<svg>` technical architecture diagrams, formula charts, or system flowcharts** with `<figcaption>` explanations inside your articles to provide visual Information Gain with zero 404 or copyright risk.',
    automatedCheckSummary: 'Scans HTML for picsum.photos, placehold.co, via.placeholder.com, and verifies presence of accessible inline <svg> or <figure> diagrams.',
    badCodeExample: `// VIOLATION: Generic AI placeholder image URL that screams "auto-generated template"
<img src="https://picsum.photos/800/400" alt="Article banner" />`,
    goodCodeExample: `// COMPLIANT: Deterministic inline <svg> architecture diagram inside <figure>
<figure className="my-6 p-4 border border-zinc-800 rounded-lg bg-zinc-950">
  <svg viewBox="0 0 600 140" role="img" aria-label="PgBouncer Connection Multiplexing Architecture">
    <rect x="10" y="35" width="150" height="70" rx="6" fill="#18181b" stroke="#3f3f46" />
    <text x="85" y="75" textAnchor="middle" fill="#e4e4e7" fontSize="12">1,000 App Workers</text>
  </svg>
  <figcaption className="text-xs text-zinc-400 mt-2">Figure 1: Transaction pooling multiplexes 1,000 stateless workers onto 36 PostgreSQL backends.</figcaption>
</figure>`,
    aiFixPrompt:
      'Remove all picsum.photos, placehold.co, or random stock image URLs and replace them with semantic <figure> blocks containing inline <svg> technical diagrams and <figcaption> annotations.',
    defaultEnabled: true,
  },
  {
    id: 'trust-functional-contact-editorial-policy',
    code: 'ADS-TRUST-01',
    title: 'Ban Dummy Contact Forms & example.com Emails; Require Working Contact Handler & Corrections Policy',
    category: 'trust_privacy_cmp',
    severity: 'critical_rejection',
    officialSource: 'Google Search Quality Rater Guidelines — Publisher Accountability & Contact Verification',
    updatedRelease: '2026 Publisher Verification Gate',
    rejectionSymptom: 'Human review rejection for "Unverified publisher / Misleading representation" due to dead contact forms or fake contact@example.com emails.',
    whyItFails:
      'To satisfy `/contact` requirements quickly, AI agents often write `<form onSubmit={(e) => e.preventDefault()}>` that discards user input, or output `support@example.com`, `123 Main Street`, or `yourdomain.com`. Human reviewers inspect `/contact` and `/about` on every new domain.',
    aiBuilderDirective:
      'NEVER output `@example.com`, `123 Main St`, `yourdomain.com`, or dead no-op `<form>` tags on `/contact`. Always wire `/contact` to a validated `/api/contact` POST handler, provide a real domain-matched email (`editorial@<domain>`), and publish a formal **Editorial Verification & Corrections Policy** explaining how errors are reviewed and updated.',
    automatedCheckSummary: 'Scans for @example.com, 123 Main St, dead e.preventDefault() no-op forms, and checks for domain-matched contact details.',
    badCodeExample: `// VIOLATION: Fake contact email and dead no-op form
<p>Email us at support@example.com or 123 Main St</p>
<form onSubmit={(e) => e.preventDefault()}><button>Send</button></form>`,
    goodCodeExample: `// COMPLIANT: Domain-matched contact address, SLA disclosure, and wired API submission
<p>Editorial & Technical Support: <a href="mailto:support@infrabench.dev">support@infrabench.dev</a> (24–48h response SLA)</p>`,
    aiFixPrompt:
      'Replace any @example.com emails, dummy physical addresses, or no-op forms with a functional /api/contact endpoint, domain-matched contact address, and an Editorial Corrections Policy.',
    defaultEnabled: true,
  },
  {
    id: 'tech-cwv-inp-and-adsense-meta-tag',
    code: 'ADS-TEC-07',
    title: 'Core Web Vitals INP <= 200ms Main-Thread Yielding & <meta name="google-adsense-account"> Verification',
    category: 'technical_crawlability',
    severity: 'revenue_impact',
    officialSource: 'Google Core Web Vitals (INP Specification) & AdSense Site Ownership Verification',
    updatedRelease: '2026 CWV INP & Meta Verification Standard',
    rejectionSymptom: '"Couldn\'t verify your site" in AdSense console or failed Mobile Core Web Vitals (INP > 200ms) suppressing ad viewability.',
    whyItFails:
      'Omitting `<meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX">` causes AdSense site ownership verification to fail if script tags are deferred by consent managers. Additionally, running heavy synchronous calculations inside React `onChange` handlers blocks the main thread and pushes Interaction to Next Paint (INP) above 200ms.',
    aiBuilderDirective:
      'Always inject `<meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX" />` (via Next.js `metadata.other["google-adsense-account"]` in `app/layout.tsx`) so Google can verify domain ownership even before GDPR consent is granted. Keep INP `<= 200ms` by wrapping expensive calculator updates in React `startTransition` or debounced handlers.',
    automatedCheckSummary: 'Verifies presence of <meta name="google-adsense-account" content="ca-pub-..."> and non-blocking script strategies.',
    badCodeExample: `// VIOLATION: Missing google-adsense-account meta verification when scripts are gated behind GDPR consent
export const metadata = { title: 'My App' };`,
    goodCodeExample: `// COMPLIANT: Always verifiable via metadata.other["google-adsense-account"]
export const metadata: Metadata = {
  title: 'InfraBench Studio',
  other: {
    'google-adsense-account': 'ca-pub-0000000000000000',
  },
};`,
    aiFixPrompt:
      'Add <meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX" /> to the head/metadata of app/layout.tsx and ensure interactive calculations do not block the main thread (INP <= 200ms).',
    defaultEnabled: true,
  },
];

export const AUDIT_PRESET_SCENARIOS: AuditPresetScenario[] = [
  {
    id: 'rejected-thin-ai-tool',
    name: 'Scenario 1: Rejected AI Web Tool (LLM Array Stub + Click Trap +picsum.photos + example.com)',
    subtitle: 'Typical indie app built by an unguided AI: <120 words, truncated array stub comments, picsum.photos placeholder, ad wedged inside form, dead footer links, support@example.com.',
    expectedOutcome: 'Critical Rejection Risk (10 Violations)',
    archetype: 'web_app_tool',
    htmlOrContent: `<header>
  <h1>Free AI Video & YouTube MP3 Converter</h1>
  <nav>
    <a href="/">Home</a>
    <a href="#">Blog (Coming Soon)</a>
    <a href="#">Privacy</a>
    <a href="javascript:void(0)">Terms</a>
  </nav>
</header>
<script>
  // LLM Token Laziness Stub:
  const guides = [
    { slug: 'guide-1', title: 'How to convert', content: 'Short 20 word summary. // ... more content here' }
  ];
</script>
<main>
  <img src="https://picsum.photos/800/400" alt="Random stock placeholder" />
  <p>In today's fast-paced digital world, converting videos is more important than ever! Paste any link below to rip audio instantly.</p>
  <form>
    <input type="text" placeholder="Paste YouTube URL..." />
    <div class="ad-container">
      <span>Helpful Partner Links - Click a sponsor below to support our free servers!</span>
      <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1234567890123456" data-ad-slot="9988776655"></ins>
    </div>
    <button type="submit">Download MP3 Now</button>
  </form>
  <p>More tools under construction. Contact us at support@example.com or 123 Main St. Stay tuned!</p>
</main>`,
  },
  {
    id: 'missing-cmp-and-eeat',
    name: 'Scenario 2: Deceptive Finance Blog (Fake Lab Claims + Missing TCF v2.2 + Stacked Ads)',
    subtitle: 'Uses fabricated first-person lab claims ("In our 14-day benchmark across 40,000 servers"), unverified financial guarantees, omits TCF v2.2 CMP, and stacks ads above H1.',
    expectedOutcome: 'High Rejection Risk (8 Violations)',
    archetype: 'editorial_blog',
    htmlOrContent: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"></script>
<div class="top-banner">
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1234567890123456" data-ad-slot="11111"></ins>
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1234567890123456" data-ad-slot="22222"></ins>
</div>
<main>
  <h1>Guaranteed 25% Monthly Options Trading Strategy for 2026</h1>
  <p>In today's dynamic financial landscape, everyone wants guaranteed passive income. Let's delve into how you can double your portfolio every quarter with zero risk using weekly options spreads.</p>
  <p>In our 14-day benchmark across 40,000 live brokerage accounts in our proprietary lab, we surveyed 10,000 traders and proved our strategy guarantees consistent returns regardless of market direction.</p>
  <p>First, open a margin brokerage account and allocate 50% of your capital to short-dated calls. Second, roll positions every Friday afternoon. More detailed backtests coming soon.</p>
</main>
<footer>
  <a href="/privacy">Privacy Policy</a>
</footer>`,
  },
  {
    id: 'compliant-production-webapp',
    name: 'Scenario 3: 100% Bulletproof Production Web App (All 28 Mandates + Inline SVG + Meta Ownership)',
    subtitle: 'Built with AdSenseGuard v4: Certified TCF v2.2 + Consent Mode v2, google-adsense-account meta verification, inline technical <svg> diagram, BreadcrumbList JSON-LD, Hub-and-Spoke Links, and Deterministic Formula Matrix.',
    expectedOutcome: 'AdSense Ready (0 Violations · 100% Score)',
    archetype: 'web_app_tool',
    htmlOrContent: `<meta name="google-adsense-account" content="ca-pub-0000000000000000" />
<link rel="canonical" href="https://infrabench.dev/calculators/postgresql-pool-sizing" />
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'wait_for_update': 500
  });
  window.__tcfapi = window.__tcfapi || function() {};
</script>
<script async src="https://fundingchoicesmessages.google.com/i/pub-0000000000000000?ers=1"></script>
<script type="application/ld+json">
[
  {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "PostgreSQL Connection Pool Sizing & Latency Calculator",
    "author": { "@type": "Person", "name": "Marcus Chen, Principal Systems Engineer" },
    "datePublished": "2026-09-12",
    "dateModified": "2026-10-24"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://infrabench.dev/" },
      { "@type": "ListItem", "position": 2, "name": "Calculators", "item": "https://infrabench.dev/calculators" },
      { "@type": "ListItem", "position": 3, "name": "PostgreSQL Pool Sizing", "item": "https://infrabench.dev/calculators/postgresql-pool-sizing" }
    ]
  }
]
</script>
<header>
  <a href="/">InfraBench Studio</a>
  <nav aria-label="Primary Navigation">
    <a href="/calculators">Calculators</a>
    <a href="/guides">Engineering Guides</a>
    <a href="/methodology">Methodology</a>
    <a href="/sitemap.xml">Sitemap</a>
    <a href="/about">About Us</a>
    <a href="/contact">Contact</a>
  </nav>
</header>
<main>
  <nav aria-label="Breadcrumb">
    <a href="/">Home</a> › <a href="/calculators">Calculators</a> › <span>PostgreSQL Connection Pool Sizing</span>
  </nav>
  <article>
    <header>
      <h1>PostgreSQL Connection Pool Sizing, PgBouncer Queueing & IOPS Calculator</h1>
      <div>Reviewed by Marcus Chen, Principal Systems Engineer · <time datetime="2026-10-24">Updated October 24, 2026</time> · Grounded in PostgreSQL 17 Documentation & Universal Scalability Law</div>
    </header>
    <section aria-label="Interactive Calculator">
      <h2>Interactive Pool Sizing & Multi-Scenario Wait-Queue Estimator</h2>
      <p>Configure your vCPU count, storage IOPS spindle factor, and average transaction duration below to compute optimal max_connections and transaction pool sizes across baseline and burst scenarios.</p>
      <div class="calculator-controls">
        <label>vCPU Cores: 16</label>
        <label>Average Transaction Duration: 4.2 ms</label>
        <button type="button">Recalculate Pool Topology</button>
      </div>
    </section>

    <figure class="my-6 p-4 border border-zinc-800 rounded-lg bg-zinc-950">
      <svg viewBox="0 0 680 140" role="img" aria-label="PgBouncer Transaction Multiplexing Topology Diagram">
        <rect x="12" y="30" width="180" height="80" rx="6" fill="#09090b" stroke="#3f3f46" />
        <text x="102" y="75" text-anchor="middle" fill="#e4e4e7" font-size="12">1,200 Serverless Workers</text>
        <rect x="250" y="30" width="180" height="80" rx="6" fill="#09090b" stroke="#10b981" />
        <text x="340" y="75" text-anchor="middle" fill="#6ee7b7" font-size="12">PgBouncer Pool (34 Active)</text>
        <rect x="488" y="30" width="180" height="80" rx="6" fill="#09090b" stroke="#3f3f46" />
        <text x="578" y="75" text-anchor="middle" fill="#e4e4e7" font-size="12">PostgreSQL 17 Primary (16 vCPU)</text>
      </svg>
      <figcaption>Figure 1: Deterministic transaction-level multiplexing architecture preventing OS context-switch thrashing.</figcaption>
    </figure>

    <section>
      <h2>1. Mathematical Formula for Optimal Database Connection Pools</h2>
      <p>Database performance degrades nonlinearly when active backend processes exceed available CPU cores and disk I/O concurrency channels. Modern PostgreSQL deployments follow the Universal Scalability Law (USL) formulated by Dr. Neil Gunther and documented in the official PostgreSQL Wiki on Number of Database Connections. Rather than setting max_connections to 500 or 1000 directly on the primary instance, optimal throughput occurs when active server connections satisfy the deterministic formula: Connections = (Core Count * 2) + Effective Spindle Factor. On NVMe SSD cloud block storage where random I/O wait is minimal, a 16-vCPU instance achieves peak transactions per second (TPS) between 32 and 40 active server backends. Exceeding this threshold introduces OS kernel context-switching overhead, L1/L2 CPU cache invalidation, and LWLock contention on shared buffers.</p>
      <p>When serverless functions or microservice containers scale horizontally to hundreds of instances, placing a transaction-level connection pooler such as PgBouncer or Supavisor between application workers and PostgreSQL multiplexes thousands of client sockets onto a fixed, contention-free pool of 36 physical database backends.</p>
    </section>

    <aside aria-label="Advertisement" class="my-10 py-4 border-y border-zinc-800">
      <div class="text-xs text-zinc-400 text-center">Advertisement</div>
      <div class="min-h-[280px] flex items-center justify-center" style="min-height: 280px;">
        <ins class="adsbygoogle" style="display:block; min-height:250px;" data-ad-client="ca-pub-0000000000000000" data-ad-slot="1234567890" data-adtest="on"></ins>
      </div>
    </aside>

    <section>
      <h2>2. Deterministic Mathematical Sensitivity Matrix Across vCPU Tiers (Original Data Moat)</h2>
      <p>Using the PostgreSQL connection sizing equation Connections = (2 * vCPU) + Spindle_Factor and assuming 7.5 MB resident memory per backend process (per PostgreSQL 17 resource consumption documentation), the deterministic sensitivity matrix below compares optimal pool sizes and memory footprints across standard cloud instance sizes:</p>
      <table>
        <thead>
          <tr><th>Instance Tier (vCPU)</th><th>NVMe Spindle Factor</th><th>Optimal Active Pool (default_pool_size)</th><th>Reserve Pool</th><th>Backend RAM Overhead</th></tr>
        </thead>
        <tbody>
          <tr><td>4 vCPU (db.m7g.xlarge)</td><td>1.0 (NVMe SSD)</td><td>9 Connections</td><td>3 Connections</td><td>90.0 MB</td></tr>
          <tr><td>8 vCPU (db.m7g.2xlarge)</td><td>1.0 (NVMe SSD)</td><td>17 Connections</td><td>4 Connections</td><td>157.5 MB</td></tr>
          <tr><td>16 vCPU (db.m7g.4xlarge)</td><td>2.0 (RAID-0 NVMe)</td><td>34 Connections</td><td>5 Connections</td><td>292.5 MB</td></tr>
          <tr><td>32 vCPU (db.m7g.8xlarge)</td><td>2.0 (RAID-0 NVMe)</td><td>66 Connections</td><td>8 Connections</td><td>555.0 MB</td></tr>
          <tr><td>64 vCPU (db.m7g.16xlarge)</td><td>4.0 (Provisioned IOPS)</td><td>132 Connections</td><td>12 Connections</td><td>1,080.0 MB</td></tr>
        </tbody>
      </table>
      <p>By constraining active backend processes to the deterministic values in Column 3 and queueing excess client sockets in PgBouncer transaction mode, memory overhead remains predictable while eliminating OS scheduler thrashing.</p>
    </section>

    <section>
      <h2>3. Step-by-Step Implementation & Reserve Pool Tuning</h2>
      <p>When deploying PgBouncer in transaction mode, prepared statements require explicit protocol support (available natively in PgBouncer 1.21+ via max_prepared_statements). Set pool_mode = transaction, configure default_pool_size to match your calculated core multiplier, and allocate a reserve_pool_size of 5 connections with a reserve_pool_timeout of 3 seconds to absorb sudden traffic spikes without dropping client requests. Monitor cl_waiting and sv_active metrics continuously to verify that queueing latency remains below 2 milliseconds during peak load windows.</p>
    </section>

    <section>
      <h2>4. Frequently Asked Questions (FAQ)</h2>
      <h3>Why does increasing max_connections slow down PostgreSQL?</h3>
      <p>Each PostgreSQL backend connection is an independent OS process consuming roughly 5MB to 10MB of RAM plus shared memory lock table slots. High process counts force the Linux scheduler to spend more CPU cycles switching contexts and contending for spinlocks than executing SQL queries.</p>
      <h3>When should I use session pooling instead of transaction pooling?</h3>
      <p>Use session mode only if your application relies on session-scoped features such as advisory locks, LISTEN/NOTIFY channels, or temporary tables that persist across multiple transactions.</p>
      <p>Educational Disclaimer: Calculations model deterministic queueing equations and official PostgreSQL 17 specification constants for educational architecture planning. Validate parameters in staging before modifying production clusters.</p>
    </section>

    <section aria-label="Related Technical Guides">
      <h2>5. Related Infrastructure Guides & Interactive Calculators (Hub-and-Spoke Links)</h2>
      <ul>
        <li><a href="/guides/pgbouncer-transaction-vs-session-pooling">PgBouncer Transaction vs. Session Mode Protocol Deep-Dive</a></li>
        <li><a href="/guides/postgresql-shared-buffers-wal-tuning">PostgreSQL 17 shared_buffers & WAL Checkpoint Tuning Guide</a></li>
        <li><a href="/guides/linux-hugepages-database-memory">Configuring Linux Transparent HugePages for High-IOPS Databases</a></li>
        <li><a href="/calculators/cloud-sql-iops-estimator">Cloud Block Storage IOPS & Throughput Estimator</a></li>
      </ul>
    </section>
  </article>
</main>
<footer>
  <nav aria-label="Trust and Legal Links">
    <a href="/about">About Us & Editorial Corrections Policy</a>
    <a href="/contact">Contact Support (support@infrabench.dev)</a>
    <a href="/privacy">Privacy Policy (Includes Google AdSense & DoubleClick DART Cookie Disclosures)</a>
    <a href="/terms">Terms of Service</a>
    <a href="/ads.txt">ads.txt</a>
    <a href="/sitemap.xml">XML Sitemap</a>
  </nav>
  <p>Third-party vendors, including Google, use cookies to serve ads based on prior visits. Users may opt out of personalized advertising at https://myadcenter.google.com/ or https://www.aboutads.info/.</p>
</footer>`,
  },
];

