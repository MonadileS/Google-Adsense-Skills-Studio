import { ADSENSE_POLICY_RULES, PolicyCategory } from './adsense-policies';

export type SupportedFramework =
  | 'universal_auto'
  | 'nextjs_app_router'
  | 'react_vite'
  | 'sveltekit_astro'
  | 'python_flask_django'
  | 'universal_html';

export type TemplateStackVariant =
  | 'nextjs'
  | 'react_vite'
  | 'sveltekit'
  | 'python_jinja'
  | 'universal_html';

export interface SkillCompilerConfig {
  siteArchetype: 'calculator_tool' | 'editorial_blog' | 'saas_webapp' | 'directory_database';
  targetGeo: 'global_eea_us' | 'us_only' | 'eea_uk_strict';
  framework: SupportedFramework;
  /** False by default: generates a universal, reusable Fresh-Build skill using centralized siteConfig/.env */
  useProjectOverride: boolean;
  publisherId: string;
  domainName: string;
  authorNameAndCredentials: string;
  enabledCategories: Record<PolicyCategory, boolean>;
  strictClsBudget: boolean;
  enforceZeroAdOnSystemPages: boolean;
  minEditorialWordsOnToolPages: number;
  exportFormat: 'skill_md' | 'cursorrules' | 'claude_md' | 'system_prompt';
}

export interface PlaybookTurn {
  turnNumber: number;
  title: string;
  subtitle: string;
  tokenBudgetNote: string;
  deliverables: string[];
  prompt: string;
}

export interface BoilerplateTemplateItem {
  id: string;
  filename: string;
  filenamesByStack: Record<TemplateStackVariant, string>;
  title: string;
  description: string;
  code: string;
  variants: Record<TemplateStackVariant, string>;
}

export const FRAMEWORK_METADATA: Record<
  SupportedFramework,
  {
    label: string;
    shortBadge: string;
    defaultVariant: TemplateStackVariant;
    architectureRules: string;
  }
> = {
  universal_auto: {
    label: 'Universal Auto-Detect (Any Stack: Next.js, React, SvelteKit, Python, HTML)',
    shortBadge: 'All Stacks',
    defaultVariant: 'nextjs',
    architectureRules: `### Multi-Stack Architecture Auto-Detection (Works Across All Web Frameworks)
Automatically detect the project's target framework from the repository files or user prompt and enforce the matching SSR, routing, and script patterns:
- **Next.js (App Router / \`package.json\` with \`next\`):** Use Server Components by default for 800w+ methodology & articles, \`generateStaticParams()\` + \`app/sitemap.ts\` + \`app/robots.ts\`, and \`next/script\` (\`beforeInteractive\` for inline Consent Mode v2 default-denied, \`afterInteractive\` for external CMP/AdSense scripts).
- **React + Vite / SPA (\`vite.config.ts\`):** Pre-render public tool and guide routes at build time (or use SSR/static HTML injection) so \`Mediapartners-Google\` never sees an empty \`<div id="root"></div>\`. Guard \`adsbygoogle.push({})\` with a \`data-adsbygoogle-status\` attribute check inside \`useEffect\`.
- **SvelteKit / Astro / Nuxt (\`svelte.config.js\` / \`astro.config.mjs\`):** Load guide data in \`+page.server.ts\` (or Astro frontmatter) so 100% of prose and JSON-LD render in initial HTML. Suppress ads on \`+error.svelte\` / \`404.astro\`.
- **Python Flask / Django / FastAPI (\`app.py\` / \`manage.py\`):** Render articles and deterministic sensitivity tables server-side in Jinja2/Django templates extending \`base.html\`. Serve \`/ads.txt\`, \`/robots.txt\`, and \`/sitemap.xml\` as root HTTP 200 endpoints and pass \`suppress_ads=True\` on 404/login views.
- **Vanilla HTML / PHP / Go:** Place Consent Mode v2 inline \`<script>\` in \`<head>\`, wrap every \`<ins class="adsbygoogle">\` in a \`style="min-height:280px"\` container with \`24px\` margins, and include static \`/ads.txt\` and \`/sitemap.xml\`.`,
  },
  nextjs_app_router: {
    label: 'Next.js 15+ (App Router / SSR & SSG)',
    shortBadge: 'Next.js',
    defaultVariant: 'nextjs',
    architectureRules: `### Stack Specifics: Next.js 15+ App Router
- Keep page routes (\`app/page.tsx\`, \`app/guides/[slug]/page.tsx\`) as Server Components so 100% of editorial methodology, tables, and JSON-LD stream in initial SSR HTML.
- Implement \`generateStaticParams()\` and \`generateMetadata()\` (with \`alternates.canonical\` and \`other['google-adsense-account']\`) on all routes.
- Expose \`app/sitemap.ts\`, \`app/robots.ts\`, \`app/not-found.tsx\` (\`data-adsense-suppress="true"\`), and \`/public/ads.txt\`.`,
  },
  react_vite: {
    label: 'React + Vite / Remix / SPA + Pre-Render',
    shortBadge: 'React / Vite',
    defaultVariant: 'react_vite',
    architectureRules: `### Stack Specifics: React + Vite / Remix
- **Critical Crawler Rule:** Pure client-side SPAs that serve an empty \`<div id="root"></div>\` get rejected by \`Mediapartners-Google\`. Always use Vite SSG/pre-rendering (\`vite-plugin-ssr\` / \`vike\` / React Router 7 SSR) or static build-time HTML hydration so crawlers see all 800+ words of prose in initial HTML.
- Use \`useLocation()\` inside \`<AdUnitSlot />\` to unmount ads on \`/login\`, \`/404\`, \`/privacy\`, and re-trigger idempotent \`adsbygoogle.push({})\` safely on route changes.`,
  },
  sveltekit_astro: {
    label: 'SvelteKit / Astro / Nuxt (SSR & Static)',
    shortBadge: 'SvelteKit / Astro',
    defaultVariant: 'sveltekit',
    architectureRules: `### Stack Specifics: SvelteKit / Astro / Nuxt
- Render all 800w+ methodology, deterministic sensitivity matrices, and \`BreadcrumbList\` JSON-LD via server load functions (\`+page.server.ts\` with \`export const prerender = true\`) or Astro static routes.
- Serve \`static/ads.txt\`, \`src/routes/sitemap.xml/+server.ts\`, and suppress ads inside \`src/routes/+error.svelte\`.`,
  },
  python_flask_django: {
    label: 'Python (Django / Flask / FastAPI + Jinja2)',
    shortBadge: 'Python / Jinja2',
    defaultVariant: 'python_jinja',
    architectureRules: `### Stack Specifics: Python (Django / Flask / FastAPI + Jinja2 SSR)
- Render all tool methodology, deterministic formula tables, and Schema.org JSON-LD directly in server-rendered Jinja2 / Django templates (\`templates/base.html\`, \`templates/guide_detail.html\`).
- Create explicit root routes for \`/ads.txt\` (\`mimetype="text/plain"\`), \`/robots.txt\`, and \`/sitemap.xml\` (\`mimetype="application/xml"\`).
- In \`base.html\`, wrap the AdSense & CMP scripts in \`{% if not suppress_ads %}\` and pass \`suppress_ads=True\` in your \`404\`, \`500\`, \`login\`, \`privacy\`, and \`contact\` view handlers.`,
  },
  universal_html: {
    label: 'Universal HTML5 / Vanilla JS / PHP / Go',
    shortBadge: 'HTML5 / JS',
    defaultVariant: 'universal_html',
    architectureRules: `### Stack Specifics: Universal HTML5 / Vanilla JS / Server Templates
- Embed full semantic \`<main>\`, \`<article>\`, \`<figure><svg>...</svg></figure>\`, and \`<table>\` markup directly in the HTML document (minimum 800 words per page).
- Wrap every ad unit in \`<aside aria-label="Advertisement" style="min-height:280px; margin:24px 0;">\` and guard \`adsbygoogle.push({})\` against \`localhost\` and \`404\` pages.`,
  },
};

const ARCHETYPE_INSTRUCTIONS: Record<SkillCompilerConfig['siteArchetype'], string> = {
  calculator_tool: `### Archetype Specifics: Interactive Tool / Calculator / Converter
- **NEVER ship a bare input form.** Every tool page MUST include at least 800+ words of original methodology, mathematical formulas, an inline \`<svg>\` system/formula diagram, real-world worked examples, edge-case explanations, and an interactive FAQ below the tool canvas.
- **Anti-Fabrication Rule (ADS-PRO-04):** NEVER invent fictional first-person lab studies or fake empirical surveys (e.g., "In our 14-day benchmark across 40,000 servers..."). Instead, generate **Deterministic Formula-Derived Sensitivity Matrices** (HTML tables computing exact mathematical outputs across 5–10 input permutations) and cite verifiable institutional standards (e.g., W3C, IETF RFC, IRS Pub, IEEE).
- **Accidental Click Buffer:** Maintain a strict minimum \`24px\` (\`my-6\`) clear margin and a visible structural divider between interactive tool buttons/sliders and any ad slot.`,
  editorial_blog: `### Archetype Specifics: Editorial Publication / Knowledge Portal
- **Anti-Scaled Content Abuse:** Every article must include a verifiable author byline, publication/update timestamp, primary sources or citations, inline \`<svg>\` diagrams, and original synthesis tables—never generic AI-rewritten summaries.
- **Anti-Fabrication Rule (ADS-PRO-04):** NEVER invent fictional first-person field tests or fake surveys. Ground all data comparisons in deterministic mathematical models or cited public specifications.
- **In-Article Ad Pacing:** Insert in-article ad units only after at least 300 words of continuous prose, and maintain at least 350 words between subsequent ad slots.`,
  saas_webapp: `### Archetype Specifics: SaaS Web Application / Dashboard
- **Public Crawlable Value:** Google AdSense crawlers (\`Mediapartners-Google\`) cannot sign in to gated dashboards without custom crawler credentials and still reject sites lacking public textual value. Build a public, unauthenticated Resource Hub / Documentation / Interactive Calculator suite with 8+ deep, indexable pages (800+ words each).
- **Zero Ads in Authenticated Settings/Checkout Flows:** Never mount ad scripts inside login, signup, billing, settings, or empty workspace states.`,
  directory_database: `### Archetype Specifics: Curated Directory / Data Reference
- **Anti-Scraper Mandate:** Raw CSV/API dumps or thin profile cards trigger immediate "Low Value Content" rejection. Every directory entry and category page must feature original comparative analysis, methodology scoring criteria, deterministic comparison matrices, and editorial commentary.
- **Pagination & Empty Filter Guard:** If a search or category filter returns fewer than 3 items or less than 500 words of text, dynamically suppress all ad slots on that view.`,
};

const GEO_INSTRUCTIONS: Record<SkillCompilerConfig['targetGeo'], string> = {
  global_eea_us: `### Regional Privacy & Consent Mandate: Global (EEA + UK + US State Laws)
- **Google-Certified CMP (TCF v2.2):** Implement Google Consent Mode v2 with defaults set to \`denied\` (\`ad_storage\`, \`ad_user_data\`, \`ad_personalization\`, \`analytics_storage\`, \`wait_for_update: 500\`) inside a tiny synchronous inline head script, while loading external CMP and AdSense scripts asynchronously after interactive hydration so LCP and INP stay green.
- **CCPA/CPRA Support:** Include a "Do Not Sell or Share My Personal Information" / "Manage Cookie Preferences" link in the global footer.`,
  eea_uk_strict: `### Regional Privacy & Consent Mandate: Strict EEA & UK GDPR (TCF v2.2 Mandatory)
- **Mandatory IAB TCF v2.2:** Do not load personalized or non-personalized AdSense tags until the Google-certified CMP callback confirms the user's TCF v2.2 string.
- **Persistent Revocation Link:** Include a permanent "Manage Cookie Consent" button in the footer that re-opens the CMP modal.`,
  us_only: `### Regional Privacy & Consent Mandate: US Privacy & AdSense Cookie Disclosure
- **AdSense DoubleClick DART Disclosure:** Explicitly disclose third-party cookies and provide a direct link to \`https://adssettings.google.com\` and \`https://www.aboutads.info/choices/\`.`,
};

function resolveIdentityTokens(config: SkillCompilerConfig) {
  if (config.useProjectOverride) {
    return {
      modeLabel: 'Project-Specific Override Mode (Hardcoded Domain & Publisher Identity)',
      domainToken: config.domainName || 'yourdomain.com',
      pubIdToken: config.publisherId || 'pub-0000000000000000',
      authorToken:
        config.authorNameAndCredentials ||
        'Lead Principal Engineer & Editorial Reviewer',
      emailToken: `editorial@${config.domainName || 'yourdomain.com'}`,
      identityInstructionBlock: `- **Target Domain:** \`https://${config.domainName}\`
- **Publisher ID:** \`${config.publisherId}\`
- **Primary Author & Credentials (E-E-A-T):** \`${config.authorNameAndCredentials}\`
- **Publisher Contact Email:** \`editorial@${config.domainName}\``,
    };
  }

  return {
    modeLabel:
      'Universal Fresh-Build Mode (Dynamic Niche Inference + Centralized siteConfig / .env)',
    domainToken: '${SITE_CONFIG.domain}',
    pubIdToken: '${SITE_CONFIG.adsensePublisherId}',
    authorToken: '${SITE_CONFIG.leadAuthorWithCredentials}',
    emailToken: '${SITE_CONFIG.editorialEmail}',
    identityInstructionBlock: `- **Universal Fresh-Build Identity Rule (Zero Hardcoded Dummy Placeholders):**
  - Do **NOT** hardcode \`example.com\`, \`123 Main St\`, \`John Doe\`, or \`quantmetrics.io\`.
  - Instead, **infer an authentic domain name, brand title, and domain-expert author persona from the user's project prompt**, and centralize all identity & monetization constants inside a single configuration module (\`site.config.ts\` / \`config.py\` / \`.env.example\`):
    - \`NEXT_PUBLIC_SITE_DOMAIN\` (or \`SITE_DOMAIN\`)
    - \`NEXT_PUBLIC_ADSENSE_PUB_ID\` (or \`ADSENSE_PUB_ID\`, format \`pub-XXXXXXXXXXXXXXXX\`)
    - \`NEXT_PUBLIC_AUTHOR_NAME_AND_CREDENTIALS\`
    - \`NEXT_PUBLIC_EDITORIAL_EMAIL\` (\`editorial@<domain>\`)
  - Reference this single config module across \`ads.txt\`, \`sitemap\`, \`robots\`, \`/privacy\`, \`/about\`, \`/contact\`, and Schema.org JSON-LD so the human publisher only updates \`.env\` once when deploying to production!`,
  };
}

export function generateFourTurnPlaybook(config: SkillCompilerConfig): PlaybookTurn[] {
  const idTokens = resolveIdentityTokens(config);
  const fwMeta = FRAMEWORK_METADATA[config.framework];
  const projectLabel = config.useProjectOverride
    ? `${config.domainName} (${config.siteArchetype.replace('_', ' ')})`
    : `a brand-new ${config.siteArchetype.replace('_', ' ')} web application in my chosen niche`;

  return [
    {
      turnNumber: 1,
      title: 'Turn 1: Centralized Site Config, Trust Routes, TCF v2.2 CMP & Pre-Build Compiler Gate',
      subtitle:
        'Establishes the centralized siteConfig/.env, compliance foundation, and stack-agnostic CI verification script first.',
      tokenBudgetNote: '~3,500 output tokens • Zero risk of truncation',
      deliverables: [
        'Centralized siteConfig module + .env.example (single source of truth for Domain, pub-ID, and Author E-E-A-T)',
        'scripts/verify-adsense-build.mjs wired to build pipeline (scans Next.js, React, SvelteKit, Python, or HTML)',
        'ads.txt, robots.txt, XML sitemap, and ad-free custom 404 route',
        'CWV-safe Consent Mode v2 + TCF v2.2 CMP provider & Zero-CLS AdUnitSlot component',
        'Complete /privacy, /terms, /about (with Corrections Policy), and /contact (with API handler)',
      ],
      prompt: `We are building ${projectLabel} using **${fwMeta.label}** under strict 2026 Google AdSense Program Policies.
Follow the attached SKILL.md rules strictly. To prevent output token truncation, we are executing in 4 structured turns.

Execute **TURN 1 ONLY** right now:
1. Create a centralized **Site & Publisher Config module** (\`lib/site-config.ts\` or \`config.py\` + \`.env.example\`) storing the domain, \`pub-XXXXXXXXXXXXXXXX\` ID, lead author name/credentials, and editorial email (${config.useProjectOverride ? `use Domain: ${config.domainName}, Publisher ID: ${config.publisherId}, Author: ${config.authorNameAndCredentials}` : 'infer a fitting brand, domain, and specialist author persona from my project topic and expose them via environment variables'}).
2. Create \`scripts/verify-adsense-build.mjs\` so any build fails if routes have < ${config.minEditorialWordsOnToolPages} words, dead \`href="#"\` links, \`picsum.photos\` / \`@example.com\` placeholders, or truncation comments.
3. Create \`ads.txt\` (\`google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0\`), \`robots.txt\` allowing \`Mediapartners-Google\`, dynamic \`sitemap.xml\`, and an ad-free custom \`404\` page (\`data-adsense-suppress="true"\`).
4. Create the **Consent Mode v2 + Certified TCF v2.2 CMP Provider**, **Zero-CLS AdUnitSlot** (\`min-h-[280px]\` + 24px buffer + route kill-switch), and the 4 complete trust routes (\`/privacy\` with DoubleClick DART disclosure, \`/terms\`, \`/about\` with Editorial Corrections Policy, and \`/contact\` wired to a working \`/api/contact\` handler).

Write complete, unabridged code for Turn 1 files only. Do not create placeholder stubs for the guides yet.`,
    },
    {
      turnNumber: 2,
      title: 'Turn 2: Primary Interactive Workbench + Inline SVG Diagram + Sensitivity Matrix + 850w Methodology',
      subtitle:
        'Builds the flagship interactive utility paired with an inline technical <svg> diagram, deterministic formula matrix, and Schema.org JSON-LD.',
      tokenBudgetNote: '~4,200 output tokens • Full depth on flagship route',
      deliverables: [
        'Primary interactive calculator/tool with non-blocking state updates (INP <= 200ms)',
        'Deterministic Inline <svg> Architecture / Formula Diagram inside <figure> (zero picsum.photos)',
        'Deterministic Formula-Derived Sensitivity Matrix (7-row mathematical permutation table—NO fake lab stories)',
        `${config.minEditorialWordsOnToolPages}+ words of SSR methodology, step-by-step formulas, edge cases, and cited standards`,
        'WebApplication + BreadcrumbList + FAQPage Schema.org JSON-LD + <meta name="google-adsense-account">',
      ],
      prompt: `Turn 1 is complete. Now execute **TURN 2 ONLY** following SKILL.md:

Build the flagship interactive tool and homepage route:
1. Build the complete interactive utility with real-time validation, accessible controls, and main-thread yielding (\`INP <= 200ms\`).
2. Below the interactive tool, write **at least ${config.minEditorialWordsOnToolPages} words of unabridged, server-rendered technical prose** covering:
   - Exact mathematical formulas and variable definitions
   - A **Deterministic Inline \`<svg>\` Technical Diagram** inside a \`<figure>\` + \`<figcaption>\` block illustrating the system or formula (NEVER use \`picsum.photos\` or \`placehold.co\`)
   - A **Deterministic Formula-Derived Sensitivity Matrix** (a 7-row HTML \`<table>\` showing exact calculated outputs across input scenarios—NEVER invent fictional first-person lab studies or fake surveys)
   - Real-world worked examples, edge cases, and official institutional citations (W3C / IETF / IEEE / IRS / NIST)
   - A 5-question FAQ section
3. Inject \`WebApplication\`, \`BreadcrumbList\`, and \`FAQPage\` JSON-LD structured data in the server-rendered HTML so \`Mediapartners-Google\` indexes all content without executing client JS.
4. Mount the CLS-reserved AdUnitSlot ONLY below the methodology section with a \`24px\` structural margin.`,
    },
    {
      turnNumber: 3,
      title: 'Turn 3: Unabridged Pillar Guides Batch A (Guides 1–4) + Hub-and-Spoke Internal Link Graph',
      subtitle:
        'Populates the first 4 deep pillar articles (900+ words each, <25% shingle overlap) with BreadcrumbList JSON-LD and bidirectional internal links.',
      tokenBudgetNote: '~5,500 output tokens • 4 full 900-word articles (~3,600 words prose)',
      deliverables: [
        'Guides Batch A (Guides 1 to 4: minimum 900 words of real prose each—ZERO truncation comments)',
        'Distinct problem domains (< 25% 5-gram shingle overlap across routes — zero Mad-Libs doorway templates)',
        'Deterministic data comparison table, inline <svg> diagram, and cited institutional references in each guide',
        'Guides Hub index (/guides) and dynamic guide route (/guides/[slug]) with static pre-rendering',
        'Visible <nav aria-label="Breadcrumb"> + BreadcrumbList & Article JSON-LD on every guide',
      ],
      prompt: `Turn 2 is complete. Now execute **TURN 3 ONLY** following SKILL.md:

Create the Pillar Guide architecture and write **Guides 1 through 4** in full:
1. Create the Batch A content module containing **4 complete, unabridged technical guides (minimum 900 words of real prose per guide)**.
   - **CRITICAL ANTI-TRUNCATION RULE:** Every single guide must contain 900+ words of real paragraphs, worked mathematical examples, a deterministic sensitivity/comparison table, and cited official standards. NEVER write \`// ... rest of articles\` or summarize!
   - **CRITICAL ANTI-DOORWAY RULE (ADS-LVC-06):** Each guide must cover a distinct architectural topic with \`< 25%\` 5-gram shingle overlap. Never use variable-swapped Mad-Libs templates.
   - **CRITICAL ANTI-FABRICATION RULE (ADS-PRO-04):** Never claim fictional first-person lab benchmarks; use deterministic formula tables and official documentation citations.
2. Create the \`/guides\` Hub index and \`/guides/[slug]\` route with static pre-rendering, visible \`<nav aria-label="Breadcrumb">\`, \`Article\` + \`BreadcrumbList\` JSON-LD, author attribution from \`siteConfig\`, and a "Related Pillar Guides & Interactive Tools" Hub-and-Spoke footer section.`,
    },
    {
      turnNumber: 4,
      title: 'Turn 4: Unabridged Pillar Guides Batch B (Guides 5–8) + Self-Healing Pre-Build Audit',
      subtitle:
        'Completes the 8-article content library, wires all internal links into sitemap.xml, and executes scripts/verify-adsense-build.mjs.',
      tokenBudgetNote: '~5,500 output tokens • 4 full 900-word articles + automated verification',
      deliverables: [
        'Guides Batch B (Guides 5 to 8: minimum 900 words of real prose each—total 8 guides)',
        'Merged 8-guide index wired into /sitemap.xml and the Hub-and-Spoke internal link graph',
        'Execution of node scripts/verify-adsense-build.mjs with self-healing fixes until exit code 0',
      ],
      prompt: `Turn 3 is complete. Now execute **TURN 4 (FINAL TURN)** following SKILL.md:

1. Create the Batch B content module containing **Guides 5 through 8 (minimum 900 words of real, unabridged prose per guide)** with deterministic formula comparison tables, worked examples, and official institutional citations. Zero placeholders or truncation comments!
2. Merge Batch A (Guides 1–4) and Batch B (Guides 5–8) so all 8 guides render in \`/guides\`, \`/guides/[slug]\`, \`/sitemap.xml\`, and the homepage Hub-and-Spoke internal link section.
3. Run \`node scripts/verify-adsense-build.mjs\` (and your project build). If the verifier flags any route under ${config.minEditorialWordsOnToolPages} words, any dead \`href="#"\`, any \`picsum.photos\` / \`@example.com\` placeholder, or any missing trust signal, fix it immediately until the build succeeds with 0 errors.`,
    },
  ];
}

export function compileStandaloneSkill(config: SkillCompilerConfig): string {
  const activePolicies = ADSENSE_POLICY_RULES.filter(
    (p) => config.enabledCategories[p.category]
  );
  const idTokens = resolveIdentityTokens(config);
  const fwMeta = FRAMEWORK_METADATA[config.framework];

  const headerByFormat: Record<SkillCompilerConfig['exportFormat'], string> = {
    skill_md: `---
name: adsense-compliance-architect
description: Universal 2026 Google AdSense Program Policy Skill (${activePolicies.length} Enforced Rules). Works across Next.js, React/Vite, SvelteKit, Astro, Python (Flask/Django/FastAPI), and HTML5. Enforces 800w+ Multi-Page Depth, Anti-Doorway pSEO Uniqueness, Inline SVG Diagrams, Deterministic Anti-Fabrication Matrices, Core Web Vitals (CLS <= 0.05, LCP <= 2.5s, INP <= 200ms), IAB TCF v2.2 Consent Mode v2, and a Self-Healing Pre-Build Compiler Gate.
version: 2026.6.0
---`,
    cursorrules: `# .cursorrules — Universal Google AdSense Compliance Architect (2026 Edition)
# Drop this file in the root of ANY repository (Next.js, React, SvelteKit, Astro, Python Flask/Django, or HTML) so Cursor enforces AdSense readiness from line one.`,
    claude_md: `# CLAUDE.md — Autonomous AdSense Compliance & Multi-Stack Architecture Constitution
# Claude Code must enforce every constraint in this document before creating or modifying routes, templates, components, or ad scripts.`,
    system_prompt: `### SYSTEM PROMPT: GOOGLE ADSENSE MONETIZATION & POLICY ARCHITECT (2026 MULTI-STACK EDITION)
You are a Principal Full-Stack Engineer and Google Publisher Quality Auditor. Every route, template, component, and script you write MUST pass both automated AdSense crawlers (Mediapartners-Google) and human quality raters on the first review.`,
  };

  const policyBlocks = activePolicies
    .map(
      (p) => `### [${p.code}] ${p.title} (${p.severity.toUpperCase()} — ${p.rejectionSymptom})
- **Why Sites Fail:** ${p.whyItFails}
- **AI Engineering Rule:** ${p.aiBuilderDirective}
- **Forbidden Anti-Pattern:** \`${p.badCodeExample.replace(/\n/g, ' ')}\`
- **Compliant Pattern:** \`${p.goodCodeExample.replace(/\n/g, ' ')}\``
    )
    .join('\n\n');

  const titleSuffix = config.useProjectOverride
    ? `(${config.domainName})`
    : `(Universal Fresh-Build Skill — All Web Tech Stacks)`;

  return `${headerByFormat[config.exportFormat]}

# Google AdSense Total Compliance Specification ${titleSuffix}

> **CRITICAL DIRECTIVE FOR AI CODING AGENTS:**
> Over 85% of new websites submitted to Google AdSense are rejected with vague **"Low Value Content"**, **"Site Behavior: Navigation"**, or **"Policy Violation"** notices. You MUST treat AdSense compliance as a **core architectural constraint from the first file you create**, never as an afterthought where you paste \`<script src="adsbygoogle.js">\` onto an unfinished app.

---

## 1. Identity Mode, Tech Stack & Compliance Parameters
- **Configuration Mode:** \`${idTokens.modeLabel}\`
${idTokens.identityInstructionBlock}
- **Application Archetype:** \`${config.siteArchetype}\`
- **Target Tech Stack:** \`${fwMeta.label}\`
- **Minimum Editorial Depth on Utility/Tool Routes:** \`${config.minEditorialWordsOnToolPages} words\`
- **CLS Reservation Budget:** \`${config.strictClsBudget ? 'Strict <= 0.05 (Mandatory min-height containers on all ad slots)' : 'Standard <= 0.10'}\`
- **System Route Ad Kill-Switch:** \`${config.enforceZeroAdOnSystemPages ? 'ENABLED (Zero ads on 404, 500, login, signup, privacy, terms, contact, empty states)' : 'Standard'}\`

${fwMeta.architectureRules}

${ARCHETYPE_INSTRUCTIONS[config.siteArchetype]}

${GEO_INSTRUCTIONS[config.targetGeo]}

---

## 2. Mandatory Multi-Page Content Inventory & Anti-Truncation Contract (CRITICAL)
Google AdSense human reviewers and the \`Mediapartners-Google\` quality classifier evaluate **site-wide topical authority**, not just your homepage. A single-page calculator or a repository with 2–3 short articles will be rejected 100% of the time for **Low Value Content**.

### 2.1 Minimum Indexable Route Inventory
Before considering this application complete, you MUST create and populate:
1. **Centralized Site & Publisher Configuration (\`site.config.ts\` / \`config.py\` + \`.env.example\`):** Single source of truth for \`domain\`, \`adsensePublisherId\`, \`leadAuthorWithCredentials\`, and \`editorialEmail\`.
2. **Primary Interactive Utility / Application Route (\`/\`):** Plus at least **${config.minEditorialWordsOnToolPages} words** of server-rendered methodology, mathematical formulas, an **Inline \`<svg>\` Technical Diagram**, a **Deterministic Formula-Derived Sensitivity Matrix**, and FAQ below the fold.
3. **At Least 8 to 10 Full-Length Pillar Guides (\`/guides/[slug]\`):** Each guide must be **800 to 1,200+ words** of complete, domain-expert technical prose with original HTML comparison tables, step-by-step worked examples, and cited institutional standards.
4. **Complete Trust & Legal Suite (\`/about\`, \`/contact\` + \`/api/contact\`, \`/privacy\`, \`/terms\`):** Fully written, including DoubleClick DART cookie opt-out links and a formal **Editorial Verification & Corrections Policy**.
5. **Crawler Discovery Endpoints (\`/ads.txt\`, \`/robots.txt\`, \`/sitemap.xml\`, \`<meta name="google-adsense-account">\`, and ad-free \`404\` route):** Explicitly allowing \`Mediapartners-Google\` and \`Google-AdSense-Inspection\`.

### 2.2 Strict Anti-Truncation & Token Budget Batching Rule (ADS-LVC-02)
- **NEVER write placeholder comments** such as \`// ... add 8 more articles here\`, \`// TODO: expand content\`, \`/* remaining sections omitted for brevity */\`, or \`Lorem ipsum\`.
- **NEVER generate stub articles** where Article 1 has 800 words and Articles 2–8 have 80 words each.
- **Multi-Turn Batching Protocol:** If generating all 8–10 full-length articles in a single turn risks hitting output token limits, build the site across **4 structured turns**:
  - *Turn 1:* Centralized \`siteConfig\` + \`.env.example\`, pre-build verifier script (\`scripts/verify-adsense-build.mjs\`), core layout with \`<meta name="google-adsense-account">\`, TCF v2.2 Consent Mode v2 provider, \`AdUnitSlot\`, \`ads.txt\`, \`robots.txt\`, \`sitemap.xml\`, and full \`/privacy\`, \`/terms\`, \`/about\`, \`/contact\` routes.
  - *Turn 2:* Primary interactive tool + Inline \`<svg>\` diagram + Deterministic Sensitivity Matrix + ${config.minEditorialWordsOnToolPages}-word SSR methodology + Schema.org JSON-LD.
  - *Turn 3:* Complete, unabridged Pillar Guides Batch A (Guides 1–4, 900+ words each) + Hub-and-Spoke links.
  - *Turn 4:* Complete, unabridged Pillar Guides Batch B (Guides 5–8, 900+ words each) + run \`node scripts/verify-adsense-build.mjs\` to pass the pre-build verifier gate.

### 2.3 Anti-Doorway Page & Programmatic SEO (pSEO) Shingle Uniqueness Gate (ADS-LVC-06)
- **NEVER generate programmatic variable-swapped "Mad-Libs" permutations** (e.g., \`/convert/usd-to-eur\`, \`/convert/usd-to-gbp\`) using a single boilerplate paragraph template where >25% of 5-gram text shingles are identical. Every dynamic route must cover a distinct architectural problem domain.

### 2.4 Ban Stock Placeholders (\`picsum.photos\`) & Require Inline Technical \`<svg>\` Diagrams (ADS-IMG-01)
- **NEVER insert \`picsum.photos\`, \`placehold.co\`, \`via.placeholder.com\`, or random stock photo URLs.** Always embed deterministic inline \`<svg>\` system/formula diagrams inside semantic \`<figure>\` + \`<figcaption>\` blocks.

### 2.5 Anti-Fabrication Rule: Deterministic Matrices vs. Fake First-Person Lab Stories (ADS-PRO-04)
- **NEVER invent fictional first-person empirical studies, fake lab benchmarks, or imaginary user surveys** (e.g., *"In our 14-day benchmark across 40,000 servers..."*). Ground all original data tables in **Deterministic Formula-Derived Sensitivity Matrices** and cite real public institutional standards (W3C, IETF RFC, IRS, IEEE, NIST).

---

## 3. Core Web Vitals (CLS <= 0.05, LCP <= 2.5s, INP <= 200ms) & Ad Slot Architecture
1. **Non-Blocking Script Loading & Ownership Meta Tag (ADS-TEC-07):**
   - Inject \`<meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX" />\` in the document \`<head>\` so Google can verify domain ownership even before GDPR consent is granted.
   - Place ONLY the tiny inline \`gtag('consent', 'default', { ..., wait_for_update: 500 })\` snippet synchronously in \`<head>\`. Load external CMP tags (\`fundingchoicesmessages.google.com\`) and \`adsbygoogle.js\` asynchronously after hydration so LCP and INP (\`<= 200ms\`) stay green.
2. **Mandatory AdUnitSlot Wrapper (ADS-UX-01..05):**
   - Explicit reserved dimensions (\`min-h-[280px]\` / \`min-height: 280px\` for rectangles, \`min-h-[90px]\` for leaderboards) so Cumulative Layout Shift (CLS) is \`0.00\`.
   - Visible, muted \`Advertisement\` disclosure label above the container.
   - Minimum \`24px\` (\`my-6\`) margin and a \`1px\` border separating the ad slot from interactive buttons, calculators, or navigation bars.
   - Automatic suppression on \`/404\`, \`/login\`, \`/register\`, \`/privacy\`, \`/terms\`, \`/contact\`, and when \`isContentReady === false\`.

---

## 4. Stack-Agnostic Pre-Build Compiler Gate (\`scripts/verify-adsense-build.mjs\`)
Wire \`node scripts/verify-adsense-build.mjs\` into your build pipeline (\`package.json\` \`"prebuild"\`, Makefile, or CI workflow). The script automatically detects Next.js, React/Vite, SvelteKit, Python (Flask/Django), or HTML directory structures and exits with code \`1\` if:
- \`ads.txt\`, \`robots\`, \`sitemap\`, or \`404\` handling is missing.
- Any source/template file contains \`href="#"\`, \`javascript:void(0)\`, \`Lorem ipsum\`, or truncation comments (\`// ... rest of articles\`).
- Any file contains \`picsum.photos\`, \`placehold.co\`, \`@example.com\`, \`123 Main St\`, or fabricated lab claims (\`"in our 14-day benchmark"\`).

---

## 5. Off-Code Google Ecosystem Pre-Flight Requirements (Human Publisher Actions)
1. **Google Search Console Sitemap Indexing Gate:** Deploy to production, submit \`/sitemap.xml\` in Google Search Console, and wait until **at least 15–20 URLs show "Page is indexed"** with 2–4 weeks of organic crawl history before clicking "Request Review" in AdSense.
2. **AdSense Dashboard Privacy & Messaging Activation:** Log into Google AdSense -> **Privacy & Messaging** -> **European regulations (GDPR)** & **US state regulations** -> click **Create Message** and **Publish**.
3. **Zero Paid / Bot "Warmup" Traffic:** Never buy social, popunder, or arbitrage traffic during review. Apply with 100% organic Search traffic.

---

## 6. Active 2026 Google AdSense Policy Rules (${activePolicies.length} Enforced Rules)

${policyBlocks}

---

## 7. Mandatory Pre-Submission Definition of Done (15-Gate Self-Audit Checklist)
- [ ] **Gate 1 (Centralized Site Config):** Domain, \`pub-XXXXXXXXXXXXXXXX\`, author credentials, and contact email are centralized in \`siteConfig\` + \`.env.example\` with zero hardcoded dummy strings.
- [ ] **Gate 2 (Pre-Build Verifier Passes):** \`node scripts/verify-adsense-build.mjs\` exits with code \`0\`.
- [ ] **Gate 3 (Multi-Page Authority):** Site contains at least 8–10 complete, unabridged pillar articles (\`800–1,200+\` words each) with zero truncation placeholders.
- [ ] **Gate 4 (Anti-Doorway pSEO Uniqueness):** Every dynamic route maintains \`< 25%\` 5-gram shingle overlap with sibling routes.
- [ ] **Gate 5 (Anti-Fabrication E-E-A-T):** Zero fabricated first-person lab benchmarks; all tables are deterministic formula sensitivity matrices with cited institutional standards.
- [ ] **Gate 6 (Inline Technical SVG Diagrams):** Zero \`picsum.photos\` or \`placehold.co\` URLs; articles embed deterministic inline \`<svg>\` diagrams inside \`<figure>\` blocks.
- [ ] **Gate 7 (SSR Crawler Visibility):** Initial HTML payload contains 100% of editorial methodology and article text without requiring client-side JS state mutations.
- [ ] **Gate 8 (Hub-and-Spoke & Breadcrumbs):** Every route has \`BreadcrumbList\` JSON-LD, visible breadcrumbs, and bidirectional internal links between tools and guides.
- [ ] **Gate 9 (Zero Dead Links):** Zero \`href="#"\`, \`href=""\`, or unimplemented social/footer links exist anywhere in the DOM.
- [ ] **Gate 10 (CLS & INP CWV Budget):** Every ad container reserves explicit \`min-height: 280px\` / \`90px\` dimensions, and interactive calculations keep \`INP <= 200ms\`.
- [ ] **Gate 11 (Accidental Click Buffer):** Every ad unit has \`>= 24px\` spacing from interactive inputs, sliders, and navigation bars.
- [ ] **Gate 12 (System & Thin-State Kill-Switch):** Ad slots automatically unmount on \`/404\`, \`/login\`, \`/privacy\`, \`/terms\`, and empty search/filter results.
- [ ] **Gate 13 (Consent Mode v2 & TCF v2.2):** Default consent states are set to \`denied\` prior to loading \`adsbygoogle.js\`.
- [ ] **Gate 14 (Verified Contact & Editorial Corrections Policy):** \`/contact\` uses a domain-matched email, wires to \`/api/contact\`, and \`/about\` includes an Editorial Corrections Policy.
- [ ] **Gate 15 (Crawler Discovery & Ownership Meta):** \`ads.txt\`, \`robots.txt\` (allowing \`Mediapartners-Google\`), \`sitemap.xml\`, and \`<meta name="google-adsense-account">\` are present and valid.
`;
}

export function generateBoilerplateTemplates(
  config: SkillCompilerConfig
): BoilerplateTemplateItem[] {
  const domainVal = config.useProjectOverride
    ? config.domainName
    : 'process.env.NEXT_PUBLIC_SITE_DOMAIN || "yourdomain.com"';
  const rawDomainLiteral = config.useProjectOverride
    ? config.domainName
    : 'yourdomain.com';
  const pubIdVal = config.useProjectOverride
    ? config.publisherId
    : 'pub-0000000000000000';
  const authorVal = config.useProjectOverride
    ? config.authorNameAndCredentials
    : 'Lead Principal Systems Engineer (Update in .env / siteConfig)';

  const defaultVariant = FRAMEWORK_METADATA[config.framework].defaultVariant;

  const templates: Array<Omit<BoilerplateTemplateItem, 'code' | 'filename'>> = [
    {
      id: 'site-config-env',
      title: 'Centralized Site & Publisher Config (Universal Fresh-Build Single Source of Truth)',
      description:
        'Allows your SKILL.md to work on ANY fresh website build without hardcoding domains or author names. Edit .env once when you buy your domain and get your AdSense pub-ID.',
      filenamesByStack: {
        nextjs: 'lib/site-config.ts',
        react_vite: 'src/config/siteConfig.ts',
        sveltekit: 'src/lib/siteConfig.ts',
        python_jinja: 'config.py',
        universal_html: 'site-config.js',
      },
      variants: {
        nextjs: `// lib/site-config.ts — Single Source of Truth for AdSense, Domain & E-E-A-T Identity
// Companion .env.example:
// NEXT_PUBLIC_SITE_DOMAIN=${rawDomainLiteral}
// NEXT_PUBLIC_ADSENSE_PUB_ID=${pubIdVal}
// NEXT_PUBLIC_AUTHOR_NAME="${authorVal}"

export const SITE_CONFIG = {
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || '${rawDomainLiteral}',
  siteUrl: \`https://\${process.env.NEXT_PUBLIC_SITE_DOMAIN || '${rawDomainLiteral}'}\`,
  adsensePublisherId: process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || '${pubIdVal}',
  adsenseClientAttr: \`ca-\${(process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || '${pubIdVal}').replace(/^ca-/, '')}\`,
  leadAuthorWithCredentials:
    process.env.NEXT_PUBLIC_AUTHOR_NAME || '${authorVal}',
  editorialEmail:
    process.env.NEXT_PUBLIC_EDITORIAL_EMAIL ||
    \`editorial@\${process.env.NEXT_PUBLIC_SITE_DOMAIN || '${rawDomainLiteral}'}\`,
} as const;`,
        react_vite: `// src/config/siteConfig.ts — Vite / React Centralized Publisher Config
// Companion .env.example:
// VITE_SITE_DOMAIN=${rawDomainLiteral}
// VITE_ADSENSE_PUB_ID=${pubIdVal}
// VITE_AUTHOR_NAME="${authorVal}"

export const SITE_CONFIG = {
  domain: import.meta.env.VITE_SITE_DOMAIN || '${rawDomainLiteral}',
  siteUrl: \`https://\${import.meta.env.VITE_SITE_DOMAIN || '${rawDomainLiteral}'}\`,
  adsensePublisherId: import.meta.env.VITE_ADSENSE_PUB_ID || '${pubIdVal}',
  adsenseClientAttr: \`ca-\${(import.meta.env.VITE_ADSENSE_PUB_ID || '${pubIdVal}').replace(/^ca-/, '')}\`,
  leadAuthorWithCredentials:
    import.meta.env.VITE_AUTHOR_NAME || '${authorVal}',
  editorialEmail: \`editorial@\${import.meta.env.VITE_SITE_DOMAIN || '${rawDomainLiteral}'}\`,
} as const;`,
        sveltekit: `// src/lib/siteConfig.ts — SvelteKit / Astro Centralized Publisher Config
import { env } from '$env/dynamic/public';

export const SITE_CONFIG = {
  domain: env.PUBLIC_SITE_DOMAIN || '${rawDomainLiteral}',
  siteUrl: \`https://\${env.PUBLIC_SITE_DOMAIN || '${rawDomainLiteral}'}\`,
  adsensePublisherId: env.PUBLIC_ADSENSE_PUB_ID || '${pubIdVal}',
  adsenseClientAttr: \`ca-\${(env.PUBLIC_ADSENSE_PUB_ID || '${pubIdVal}').replace(/^ca-/, '')}\`,
  leadAuthorWithCredentials: env.PUBLIC_AUTHOR_NAME || '${authorVal}',
  editorialEmail: \`editorial@\${env.PUBLIC_SITE_DOMAIN || '${rawDomainLiteral}'}\`,
} as const;`,
        python_jinja: `# config.py — Python (Flask / Django / FastAPI) Centralized Publisher Config
import os

SITE_CONFIG = {
    "domain": os.getenv("SITE_DOMAIN", "${rawDomainLiteral}"),
    "site_url": f"https://{os.getenv('SITE_DOMAIN', '${rawDomainLiteral}')}",
    "adsense_publisher_id": os.getenv("ADSENSE_PUB_ID", "${pubIdVal}"),
    "adsense_client_attr": f"ca-{os.getenv('ADSENSE_PUB_ID', '${pubIdVal}').removeprefix('ca-')}",
    "lead_author_with_credentials": os.getenv("AUTHOR_NAME", "${authorVal}"),
    "editorial_email": os.getenv(
        "EDITORIAL_EMAIL", f"editorial@{os.getenv('SITE_DOMAIN', '${rawDomainLiteral}')}"
    ),
}`,
        universal_html: `// site-config.js — Universal HTML5 / Vanilla JS Centralized Publisher Config
window.SITE_CONFIG = {
  domain: '${rawDomainLiteral}',
  siteUrl: 'https://${rawDomainLiteral}',
  adsensePublisherId: '${pubIdVal}',
  adsenseClientAttr: 'ca-${pubIdVal.replace(/^ca-/, '')}',
  leadAuthorWithCredentials: '${authorVal}',
  editorialEmail: 'editorial@${rawDomainLiteral}',
};`,
      },
    },
    {
      id: 'ad-unit-slot',
      title: 'CLS-Safe & Policy-Guarded AdUnitSlot Component',
      description:
        'Prevents CLS layout shifts (min-height: 280px), enforces 24px accidental-click margins, blocks ads on 404/login/legal pages, and unmounts on thin/empty states.',
      filenamesByStack: {
        nextjs: 'components/adsense/AdUnitSlot.tsx',
        react_vite: 'src/components/AdUnitSlot.tsx',
        sveltekit: 'src/lib/components/AdUnitSlot.svelte',
        python_jinja: 'templates/partials/ad_unit_slot.html',
        universal_html: 'components/ad-unit-slot.html',
      },
      variants: {
        nextjs: `'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { SITE_CONFIG } from '@/lib/site-config';

const FORBIDDEN_ROUTE_PREFIXES = [
  '/login', '/signin', '/signup', '/register', '/reset-password',
  '/checkout', '/account', '/settings', '/privacy', '/terms',
  '/cookie-policy', '/contact', '/404', '/500',
];

interface AdUnitSlotProps {
  slotId: string;
  format?: 'rectangle' | 'horizontal' | 'vertical';
  isContentReady?: boolean;
  className?: string;
}

export function AdUnitSlot({
  slotId,
  format = 'rectangle',
  isContentReady = true,
  className = '',
}: AdUnitSlotProps) {
  const pathname = usePathname();
  const adRef = useRef<HTMLModElement>(null);

  const isForbiddenRoute = FORBIDDEN_ROUTE_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix)
  );

  useEffect(() => {
    if (isForbiddenRoute || !isContentReady) return;
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') return;
    try {
      if (adRef.current && !adRef.current.getAttribute('data-adsbygoogle-status')) {
        // @ts-expect-error adsbygoogle global injected by script
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense slot initialization error:', err);
    }
  }, [isForbiddenRoute, isContentReady, pathname]);

  if (isForbiddenRoute || !isContentReady) return null;

  const minHeightClass =
    format === 'horizontal' ? 'min-h-[90px]' : format === 'vertical' ? 'min-h-[600px]' : 'min-h-[280px]';

  return (
    <aside
      aria-label="Advertisement"
      className={\`my-6 py-3 px-4 border border-zinc-800/80 rounded-lg bg-zinc-950/60 flex flex-col items-center justify-center \${className}\`}
    >
      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 select-none">
        Advertisement
      </span>
      <div className={\`w-full \${minHeightClass} flex items-center justify-center overflow-hidden\`}>
        <ins
          ref={adRef}
          className="adsbygoogle w-full block"
          data-ad-client={SITE_CONFIG.adsenseClientAttr}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}`,
        react_vite: `import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_CONFIG } from '../config/siteConfig';

const FORBIDDEN_ROUTES = ['/login', '/signup', '/privacy', '/terms', '/contact', '/404'];

export function AdUnitSlot({
  slotId,
  format = 'rectangle',
  isContentReady = true,
}: {
  slotId: string;
  format?: 'rectangle' | 'horizontal' | 'vertical';
  isContentReady?: boolean;
}) {
  const { pathname } = useLocation();
  const adRef = useRef<HTMLModElement>(null);
  const isForbidden = FORBIDDEN_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    if (isForbidden || !isContentReady || window.location.hostname === 'localhost') return;
    try {
      if (adRef.current && !adRef.current.getAttribute('data-adsbygoogle-status')) {
        ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
          (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error(e);
    }
  }, [pathname, isForbidden, isContentReady]);

  if (isForbidden || !isContentReady) return null;

  const minHeight = format === 'horizontal' ? 90 : format === 'vertical' ? 600 : 280;

  return (
    <aside aria-label="Advertisement" className="my-6 py-3 px-4 border border-zinc-800 rounded-lg bg-zinc-950">
      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 text-center mb-2">
        Advertisement
      </div>
      <div style={{ minHeight: \`\${minHeight}px\` }} className="w-full flex items-center justify-center">
        <ins
          ref={adRef}
          className="adsbygoogle w-full block"
          data-ad-client={SITE_CONFIG.adsenseClientAttr}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}`,
        sveltekit: `<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { SITE_CONFIG } from '$lib/siteConfig';

  export let slotId: string;
  export let isContentReady: boolean = true;
  export let minHeight: number = 280;

  let insEl: HTMLElement | null = null;
  const forbidden = ['/login', '/signup', '/privacy', '/terms', '/contact', '/404'];
  $: isForbidden = forbidden.some((p) => $page.url.pathname.startsWith(p));

  onMount(() => {
    if (isForbidden || !isContentReady || window.location.hostname === 'localhost') return;
    if (insEl && !insEl.getAttribute('data-adsbygoogle-status')) {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    }
  });
</script>

{#if !isForbidden && isContentReady}
  <aside aria-label="Advertisement" class="my-6 py-3 px-4 border border-zinc-800 rounded-lg bg-zinc-950">
    <div class="text-[10px] font-mono uppercase tracking-widest text-zinc-500 text-center mb-2">
      Advertisement
    </div>
    <div style="min-height: {minHeight}px;" class="w-full flex items-center justify-center">
      <ins
        bind:this={insEl}
        class="adsbygoogle w-full block"
        data-ad-client={SITE_CONFIG.adsenseClientAttr}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  </aside>
{/if}`,
        python_jinja: `{# templates/partials/ad_unit_slot.html (Flask / Django / FastAPI Jinja2) #}
{# Usage: {% include "partials/ad_unit_slot.html" with context %} #}
{# Automatically suppressed if view sets suppress_ads=True (404, login, privacy, thin search) #}
{% if not suppress_ads and is_content_ready|default(True) %}
<aside aria-label="Advertisement" style="margin: 24px 0; padding: 12px 16px; border: 1px solid #27272a; border-radius: 8px; background: #09090b;">
  <div style="font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; text-align: center; margin-bottom: 8px;">
    Advertisement
  </div>
  <div style="min-height: 280px; width: 100%; display: flex; align-items: center; justify-content: center;">
    <ins class="adsbygoogle"
         style="display:block; width:100%; min-height:250px;"
         data-ad-client="{{ site_config.adsense_client_attr }}"
         data-ad-slot="{{ ad_slot_id|default('1234567890') }}"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
  </div>
  <script>
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      (adsbygoogle = window.adsbygoogle || []).push({});
    }
  </script>
</aside>
{% endif %}`,
        universal_html: `<!-- Zero-CLS AdSense Container with 24px Click Buffer & Localhost IVT Guard -->
<aside aria-label="Advertisement" style="margin: 24px 0; padding: 12px 16px; border: 1px solid #27272a; border-radius: 8px; background: #09090b;">
  <div style="font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; text-align: center; margin-bottom: 8px;">
    Advertisement
  </div>
  <div style="min-height: 280px; width: 100%; display: flex; align-items: center; justify-content: center;">
    <ins class="adsbygoogle"
         style="display:block; width:100%; min-height:250px;"
         data-ad-client="ca-${pubIdVal.replace(/^ca-/, '')}"
         data-ad-slot="1234567890"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
  </div>
  <script>
    if (
      window.location.hostname !== 'localhost' &&
      !document.querySelector('[data-adsense-suppress="true"]')
    ) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  </script>
</aside>`,
      },
    },
    {
      id: 'consent-mode-v2',
      title: 'CWV-Optimized Google Consent Mode v2 + TCF v2.2 Provider',
      description:
        'Protects LCP (<= 2.5s) and INP (<= 200ms) while injecting <meta name="google-adsense-account"> ownership verification.',
      filenamesByStack: {
        nextjs: 'components/adsense/CertifiedConsentModeProvider.tsx',
        react_vite: 'index.html (Head Snippet)',
        sveltekit: 'src/app.html (Head Snippet)',
        python_jinja: 'templates/partials/head_consent_adsense.html',
        universal_html: 'head-consent-mode-v2.html',
      },
      variants: {
        nextjs: `'use client';

import Script from 'next/script';
import React from 'react';
import { SITE_CONFIG } from '@/lib/site-config';

export function CertifiedConsentModeProvider() {
  return (
    <>
      {/* 1. Tiny synchronous inline Consent Mode v2 default-denied state (0ms network block) */}
      <Script id="google-consent-mode-v2-init" strategy="beforeInteractive">
        {\`
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
          gtag('set', 'url_passthrough', true);
        \`}
      </Script>

      {/* 2. Non-blocking Google Funding Choices / Certified TCF v2.2 CMP (protects LCP & INP) */}
      <Script
        id="google-fc-cmp"
        strategy="afterInteractive"
        src={\`https://fundingchoicesmessages.google.com/i/\${SITE_CONFIG.adsensePublisherId}?ers=1\`}
      />

      {/* 3. Non-blocking Google AdSense script tag */}
      <Script
        id="adsense-script"
        strategy="afterInteractive"
        async
        src={\`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=\${SITE_CONFIG.adsenseClientAttr}\`}
        crossOrigin="anonymous"
      />
    </>
  );
}`,
        react_vite: `<!-- Place inside <head> of index.html in React + Vite projects -->
<meta name="google-adsense-account" content="ca-${pubIdVal.replace(/^ca-/, '')}" />
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
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);
</script>
<script async src="https://fundingchoicesmessages.google.com/i/${pubIdVal}?ers=1"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${pubIdVal.replace(/^ca-/, '')}" crossorigin="anonymous"></script>`,
        sveltekit: `<!-- Place inside <head> of src/app.html in SvelteKit / Astro projects -->
<meta name="google-adsense-account" content="ca-${pubIdVal.replace(/^ca-/, '')}" />
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
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);
</script>
<script async src="https://fundingchoicesmessages.google.com/i/${pubIdVal}?ers=1"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${pubIdVal.replace(/^ca-/, '')}" crossorigin="anonymous"></script>`,
        python_jinja: `{# templates/partials/head_consent_adsense.html — Include in <head> of base.html #}
<meta name="google-adsense-account" content="{{ site_config.adsense_client_attr }}" />
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
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);
</script>
{% if not suppress_ads %}
<script async src="https://fundingchoicesmessages.google.com/i/{{ site_config.adsense_publisher_id }}?ers=1"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ site_config.adsense_client_attr }}" crossorigin="anonymous"></script>
{% endif %}`,
        universal_html: `<!-- Universal HTML5 <head> Consent Mode v2 + Certified TCF v2.2 + Ownership Meta -->
<meta name="google-adsense-account" content="ca-${pubIdVal.replace(/^ca-/, '')}" />
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
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);
</script>
<script async src="https://fundingchoicesmessages.google.com/i/${pubIdVal}?ers=1"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${pubIdVal.replace(/^ca-/, '')}" crossorigin="anonymous"></script>`,
      },
    },
    {
      id: 'verify-adsense-build',
      title: 'Multi-Stack Pre-Build AdSense Compiler Gate (Next.js, React, SvelteKit, Python, HTML)',
      description:
        'Stack-agnostic CI/CD script that auto-detects your project layout (app/, src/, templates/, or public/) and fails the build if any route violates AdSense policies.',
      filenamesByStack: {
        nextjs: 'scripts/verify-adsense-build.mjs',
        react_vite: 'scripts/verify-adsense-build.mjs',
        sveltekit: 'scripts/verify-adsense-build.mjs',
        python_jinja: 'scripts/verify_adsense_build.py',
        universal_html: 'scripts/verify-adsense-build.mjs',
      },
      variants: {
        nextjs: `#!/usr/bin/env node
/**
 * scripts/verify-adsense-build.mjs (Universal Multi-Stack Node.js Enforcer)
 * Auto-detects Next.js (app/), React/Vite/SvelteKit (src/), Python (templates/), or HTML (public/)
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const errors = [];

// 1. Check ads.txt across common static directories (public/, static/, root)
const adsTxtCandidates = ['public/ads.txt', 'static/ads.txt', 'ads.txt'];
const foundAdsTxt = adsTxtCandidates.find((p) => fs.existsSync(path.join(ROOT, p)));

if (!foundAdsTxt) {
  errors.push('[MISSING_ADS_TXT] No ads.txt found in public/ads.txt, static/ads.txt, or root.');
} else {
  const adsTxt = fs.readFileSync(path.join(ROOT, foundAdsTxt), 'utf8');
  if (!/google\\.com,\\s*pub-\\d{16},\\s*(DIRECT|RESELLER),\\s*f08c47fec0942fa0/.test(adsTxt)) {
    errors.push(\`[INVALID_ADS_TXT] \${foundAdsTxt} must match: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0\`);
  }
}

// 2. Recursively scan all source & template directories
const dirsToScan = ['app', 'src', 'components', 'lib', 'templates', 'pages', 'content'];

function scanDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (/\\.(tsx|ts|jsx|js|svelte|astro|html|jinja|jinja2|py)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const rel = path.relative(ROOT, fullPath);

      if (/href=["'](?:#|javascript:void\\(0\\))["']/i.test(content)) {
        errors.push(\`[DEAD_LINK] Forbidden placeholder link href="#" in \${rel}\`);
      }
      if (/\\/\\/\\s*\\.\\.\\.\\s*(?:rest of|more|remaining|todo)|lorem ipsum/i.test(content)) {
        errors.push(\`[TRUNCATION_STUB] AI truncation comment or Lorem Ipsum in \${rel}\`);
      }
      if (/in our \\d+-day benchmark|we surveyed \\d+|across \\d+,\\d+ (?:production|enterprise|live)/i.test(content)) {
        errors.push(\`[FAKE_EEAT_CLAIM] Fabricated first-person lab benchmark in \${rel}. Use deterministic formula tables.\`);
      }
      if (/picsum\\.photos|placehold\\.co|via\\.placeholder\\.com/i.test(content)) {
        errors.push(\`[STOCK_PLACEHOLDER_IMG] Forbidden stock placeholder image in \${rel}. Use inline <svg> diagrams.\`);
      }
      if (/[a-zA-Z0-9._%+-]+@example\\.com|123\\s+Main\\s+(?:St|Street)/i.test(content)) {
        errors.push(\`[DUMMY_CONTACT_INFO] Fake @example.com email or 123 Main St address in \${rel}.\`);
      }
    }
  }
}

dirsToScan.forEach((d) => scanDir(path.join(ROOT, d)));

if (errors.length > 0) {
  console.error('\\n❌ ADSENSE PRE-BUILD VERIFICATION FAILED (' + errors.length + ' violations):');
  for (const err of errors) console.error('  - ' + err);
  process.exit(1);
}
console.log('✅ AdSense Multi-Stack Pre-Build Verification Passed.');`,
        react_vite: `#!/usr/bin/env node
// scripts/verify-adsense-build.mjs — Wire to "prebuild" in Vite/React package.json
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const errors = [];

if (!fs.existsSync(path.join(ROOT, 'public/ads.txt'))) {
  errors.push('[MISSING_FILE] public/ads.txt is missing.');
}

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(full);
    else if (/\\.(tsx|ts|jsx|js|html)$/.test(entry.name)) {
      const txt = fs.readFileSync(full, 'utf8');
      if (/href=["']#["']|picsum\\.photos|@example\\.com|lorem ipsum/i.test(txt)) {
        errors.push(\`[POLICY_VIOLATION] Placeholder link, stock image, or dummy email in \${path.relative(ROOT, full)}\`);
      }
    }
  }
}
scan(path.join(ROOT, 'src'));

if (errors.length) {
  console.error(errors.join('\\n'));
  process.exit(1);
}
console.log('✅ React/Vite AdSense Pre-Build Check Passed.');`,
        sveltekit: `#!/usr/bin/env node
// scripts/verify-adsense-build.mjs — Wire to "prebuild" in SvelteKit/Astro package.json
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const errors = [];

if (!fs.existsSync(path.join(ROOT, 'static/ads.txt')) && !fs.existsSync(path.join(ROOT, 'public/ads.txt'))) {
  errors.push('[MISSING_FILE] static/ads.txt (or public/ads.txt) is missing.');
}

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(full);
    else if (/\\.(svelte|astro|ts|js|html)$/.test(entry.name)) {
      const txt = fs.readFileSync(full, 'utf8');
      if (/href=["']#["']|picsum\\.photos|@example\\.com|lorem ipsum/i.test(txt)) {
        errors.push(\`[POLICY_VIOLATION] Forbidden placeholder in \${path.relative(ROOT, full)}\`);
      }
    }
  }
}
scan(path.join(ROOT, 'src'));

if (errors.length) {
  console.error(errors.join('\\n'));
  process.exit(1);
}
console.log('✅ SvelteKit/Astro AdSense Pre-Build Check Passed.');`,
        python_jinja: `#!/usr/bin/env python3
"""
scripts/verify_adsense_build.py — Python (Django / Flask / FastAPI) Pre-Deploy Enforcer
Run in CI or before starting gunicorn/uvicorn: python3 scripts/verify_adsense_build.py
"""
import pathlib
import re
import sys

ROOT = pathlib.Path.cwd()
errors = []

for path in ROOT.rglob("*"):
    if path.suffix in {".html", ".jinja", ".jinja2", ".py"} and "venv" not in path.parts:
        content = path.read_text(encoding="utf-8", errors="ignore")
        rel = path.relative_to(ROOT)
        if re.search(r'href=["\\'](?:#|javascript:void\\(0\\))["\\']', content, re.I):
            errors.append(f"[DEAD_LINK] Forbidden href='#' in {rel}")
        if re.search(r"picsum\\.photos|placehold\\.co|@example\\.com|123 Main St", content, re.I):
            errors.append(f"[PLACEHOLDER_ASSET] Forbidden stock URL or @example.com in {rel}")
        if re.search(r"in our \\d+-day benchmark|we surveyed \\d+", content, re.I):
            errors.append(f"[FAKE_EEAT_CLAIM] Fabricated lab claim in {rel}")

if errors:
    print("❌ ADSENSE PYTHON PRE-DEPLOY CHECK FAILED:")
    for e in errors:
        print("  -", e)
    sys.exit(1)

print("✅ Python AdSense Pre-Deploy Verification Passed.")`,
        universal_html: `#!/usr/bin/env node
// scripts/verify-adsense-build.mjs — Scans static HTML5 / PHP / Go templates
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const errors = [];

if (!fs.existsSync(path.join(ROOT, 'ads.txt')) && !fs.existsSync(path.join(ROOT, 'public/ads.txt'))) {
  errors.push('[MISSING_FILE] ads.txt not found.');
}

for (const file of fs.readdirSync(ROOT)) {
  if (file.endsWith('.html')) {
    const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
    if (/href=["']#["']|picsum\\.photos|@example\\.com/i.test(html)) {
      errors.push(\`[VIOLATION] Placeholder link, stock image, or dummy email in \${file}\`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\\n'));
  process.exit(1);
}
console.log('✅ HTML5 AdSense Verification Passed.');`,
      },
    },
    {
      id: 'ssr-guide-architecture',
      title: 'SSR Pillar Guide + Inline SVG Diagram + BreadcrumbList JSON-LD',
      description:
        'Renders 1,000+ words of server-rendered prose, an inline <svg> technical diagram, deterministic sensitivity matrix, and Hub-and-Spoke internal links.',
      filenamesByStack: {
        nextjs: 'app/guides/[slug]/page.tsx',
        react_vite: 'src/pages/GuideDetail.tsx',
        sveltekit: 'src/routes/guides/[slug]/+page.svelte',
        python_jinja: 'templates/guide_detail.html',
        universal_html: 'guides/guide-template.html',
      },
      variants: {
        nextjs: `import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdUnitSlot } from '@/components/adsense/AdUnitSlot';
import { SITE_CONFIG } from '@/lib/site-config';
import { GUIDES_DATA } from '@/lib/guides-data';

export async function generateStaticParams() {
  return GUIDES_DATA.map((guide) => ({ slug: guide.slug }));
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = GUIDES_DATA.find((g) => g.slug === slug);
  if (!guide) notFound();

  const relatedGuides = GUIDES_DATA.filter((g) => g.slug !== guide.slug).slice(0, 3);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: guide.title,
      description: guide.excerpt,
      datePublished: guide.publishedAt,
      dateModified: guide.updatedAt,
      author: {
        '@type': 'Person',
        name: SITE_CONFIG.leadAuthorWithCredentials,
        url: \`\${SITE_CONFIG.siteUrl}/about\`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_CONFIG.siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: \`\${SITE_CONFIG.siteUrl}/guides\` },
        { '@type': 'ListItem', position: 3, name: guide.title, item: \`\${SITE_CONFIG.siteUrl}/guides/\${guide.slug}\` },
      ],
    },
  ];

  return (
    <article className="max-w-3xl mx-auto px-6 py-12 text-zinc-200 leading-relaxed space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="text-xs text-zinc-400 flex items-center gap-2">
        <Link href="/" className="hover:text-white underline">Home</Link>
        <span>/</span>
        <Link href="/guides" className="hover:text-white underline">Guides</Link>
        <span>/</span>
        <span className="text-zinc-200">{guide.title}</span>
      </nav>

      <header className="space-y-3 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold text-white">{guide.title}</h1>
        <div className="text-xs text-zinc-400">
          Reviewed by <strong className="text-zinc-200">{SITE_CONFIG.leadAuthorWithCredentials}</strong> •{' '}
          <time dateTime={guide.updatedAt}>Updated {guide.updatedAt}</time>
        </div>
      </header>

      {/* Inline Deterministic SVG Architecture Diagram (ADS-IMG-01: Zero Stock Placeholders) */}
      <figure className="my-6 p-4 border border-zinc-800 rounded-lg bg-zinc-950">
        <svg viewBox="0 0 600 120" role="img" aria-label={\`\${guide.title} Architecture Diagram\`}>
          <rect x="10" y="25" width="170" height="70" rx="6" fill="#09090b" stroke="#3f3f46" />
          <text x="95" y="65" textAnchor="middle" fill="#e4e4e7" fontSize="11">Input Parameters</text>
          <rect x="215" y="25" width="170" height="70" rx="6" fill="#09090b" stroke="#10b981" />
          <text x="300" y="65" textAnchor="middle" fill="#6ee7b7" fontSize="11">Deterministic Model</text>
          <rect x="420" y="25" width="170" height="70" rx="6" fill="#09090b" stroke="#3f3f46" />
          <text x="505" y="65" textAnchor="middle" fill="#e4e4e7" fontSize="11">Sensitivity Matrix</text>
        </svg>
        <figcaption className="text-xs text-zinc-400 mt-2">
          Figure 1: Deterministic mathematical verification pipeline for {guide.title}.
        </figcaption>
      </figure>

      <div className="space-y-4">
        {guide.sectionOneParagraphs.map((p, idx) => <p key={idx}>{p}</p>)}
      </div>

      <AdUnitSlot slotId="3948571029" format="rectangle" isContentReady={true} />

      <div className="space-y-4">
        {guide.sectionTwoParagraphs.map((p, idx) => <p key={idx}>{p}</p>)}
      </div>

      <footer className="pt-8 border-t border-zinc-800 space-y-4">
        <h2 className="text-lg font-semibold text-white">Related Pillar Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {relatedGuides.map((rel) => (
            <Link key={rel.slug} href={\`/guides/\${rel.slug}\`} className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
              <div className="text-sm font-medium text-zinc-200">{rel.title}</div>
            </Link>
          ))}
        </div>
      </footer>
    </article>
  );
}`,
        react_vite: `import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { AdUnitSlot } from '../components/AdUnitSlot';
import { SITE_CONFIG } from '../config/siteConfig';
import { GUIDES_DATA } from '../data/guidesData';

export function GuideDetail() {
  const { slug } = useParams();
  const guide = GUIDES_DATA.find((g) => g.slug === slug);
  if (!guide) return <main data-adsense-suppress="true"><h1>404 — Guide Not Found</h1></main>;

  return (
    <article className="max-w-3xl mx-auto px-6 py-12 text-zinc-200 space-y-8">
      <nav aria-label="Breadcrumb" className="text-xs text-zinc-400">
        <Link to="/">Home</Link> › <Link to="/guides">Guides</Link> › <span>{guide.title}</span>
      </nav>
      <header>
        <h1 className="text-3xl font-bold text-white">{guide.title}</h1>
        <p className="text-xs text-zinc-400 mt-2">
          Reviewed by {SITE_CONFIG.leadAuthorWithCredentials} • <time dateTime={guide.updatedAt}>{guide.updatedAt}</time>
        </p>
      </header>
      <div className="space-y-4">{guide.sectionOneParagraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
      <AdUnitSlot slotId="3948571029" isContentReady={true} />
      <div className="space-y-4">{guide.sectionTwoParagraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
    </article>
  );
}`,
        sveltekit: `<script lang="ts">
  import AdUnitSlot from '$lib/components/AdUnitSlot.svelte';
  import { SITE_CONFIG } from '$lib/siteConfig';
  export let data;
  $: ({ guide, relatedGuides } = data);
</script>

<article class="max-w-3xl mx-auto px-6 py-12 text-zinc-200 space-y-8">
  <nav aria-label="Breadcrumb" class="text-xs text-zinc-400">
    <a href="/">Home</a> › <a href="/guides">Guides</a> › <span>{guide.title}</span>
  </nav>
  <header class="border-b border-zinc-800 pb-6">
    <h1 class="text-3xl font-bold text-white">{guide.title}</h1>
    <div class="text-xs text-zinc-400 mt-2">
      Reviewed by {SITE_CONFIG.leadAuthorWithCredentials} • <time datetime={guide.updatedAt}>{guide.updatedAt}</time>
    </div>
  </header>
  <div class="space-y-4">
    {#each guide.sectionOneParagraphs as p}<p>{p}</p>{/each}
  </div>
  <AdUnitSlot slotId="3948571029" isContentReady={true} />
  <div class="space-y-4">
    {#each guide.sectionTwoParagraphs as p}<p>{p}</p>{/each}
  </div>
</article>`,
        python_jinja: `{# templates/guide_detail.html — Python (Flask / Django / FastAPI) SSR Guide Template #}
{% extends "base.html" %}
{% block content %}
<article class="max-w-3xl mx-auto px-6 py-12 text-zinc-200 space-y-8">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "{{ guide.title }}",
    "author": { "@type": "Person", "name": "{{ site_config.lead_author_with_credentials }}" },
    "dateModified": "{{ guide.updated_at }}"
  }
  </script>
  <nav aria-label="Breadcrumb" class="text-xs text-zinc-400">
    <a href="/">Home</a> › <a href="/guides">Guides</a> › <span>{{ guide.title }}</span>
  </nav>
  <header>
    <h1 class="text-3xl font-bold text-white">{{ guide.title }}</h1>
    <div class="text-xs text-zinc-400">
      Reviewed by <strong>{{ site_config.lead_author_with_credentials }}</strong> •
      <time datetime="{{ guide.updated_at }}">{{ guide.updated_at }}</time>
    </div>
  </header>
  {% for p in guide.section_one_paragraphs %}<p>{{ p }}</p>{% endfor %}
  {% include "partials/ad_unit_slot.html" %}
  {% for p in guide.section_two_paragraphs %}<p>{{ p }}</p>{% endfor %}
</article>
{% endblock %}`,
        universal_html: `<!-- Universal HTML5 Guide Article with BreadcrumbList JSON-LD & Inline SVG -->
<article style="max-width: 768px; margin: 0 auto; padding: 48px 24px; color: #e4e4e7;">
  <nav aria-label="Breadcrumb" style="font-size: 12px; color: #a1a1aa;">
    <a href="/">Home</a> › <a href="/guides/">Guides</a> › <span>Guide Title</span>
  </nav>
  <header>
    <h1>Technical Guide Title (800–1,200+ Words SSR Prose)</h1>
    <div>Reviewed by ${authorVal} • <time datetime="2026-10-28">Updated Oct 2026</time></div>
  </header>
</article>`,
      },
    },
    {
      id: 'privacy-policy-page',
      title: 'AdSense-Compliant Privacy Policy Route (DART + TCF v2.2 + CCPA)',
      description:
        'Includes mandatory Google DoubleClick DART cookie disclosure, direct link to Google Ad Settings, and user consent revocation button.',
      filenamesByStack: {
        nextjs: 'app/privacy/page.tsx',
        react_vite: 'src/pages/PrivacyPolicy.tsx',
        sveltekit: 'src/routes/privacy/+page.svelte',
        python_jinja: 'templates/privacy.html',
        universal_html: 'privacy.html',
      },
      variants: {
        nextjs: `import React from 'react';
import { SITE_CONFIG } from '@/lib/site-config';

export const metadata = {
  title: \`Privacy Policy & Cookie Disclosure | \${SITE_CONFIG.domain}\`,
  description: \`How \${SITE_CONFIG.domain} handles user data, Google AdSense DART cookies, and GDPR TCF v2.2 consent.\`,
};

export default function PrivacyPolicyPage() {
  return (
    <main data-adsense-suppress="true" className="max-w-3xl mx-auto px-6 py-12 text-zinc-200 space-y-6 leading-relaxed">
      <h1 className="text-3xl font-bold text-white">Privacy Policy & Advertising Disclosure</h1>
      <p className="text-xs font-mono text-zinc-400">Effective for {SITE_CONFIG.siteUrl}</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">1. Google AdSense & DoubleClick DART Cookie Disclosure</h2>
        <p>
          Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to{' '}
          <strong>{SITE_CONFIG.domain}</strong> or other websites on the internet. Users may opt out of personalized
          advertising by visiting{' '}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">
            Google Ads Settings
          </a>{' '}
          or{' '}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">
            www.aboutads.info/choices/
          </a>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">2. EEA/UK User Consent (IAB TCF v2.2) & Contact</h2>
        <p>
          We implement a Google-certified CMP compliant with IAB TCF v2.2. For privacy inquiries, contact{' '}
          <a href={\`mailto:\${SITE_CONFIG.editorialEmail}\`} className="text-emerald-400 underline">
            {SITE_CONFIG.editorialEmail}
          </a>.
        </p>
      </section>
    </main>
  );
}`,
        react_vite: `import React from 'react';
import { SITE_CONFIG } from '../config/siteConfig';

export function PrivacyPolicy() {
  return (
    <main data-adsense-suppress="true" className="max-w-3xl mx-auto px-6 py-12 text-zinc-200 space-y-6">
      <h1 className="text-3xl font-bold text-white">Privacy Policy & DoubleClick DART Disclosure</h1>
      <p>
        Third-party vendors, including Google, use cookies to serve ads based on prior visits to {SITE_CONFIG.domain}.
        Users may opt out of personalized advertising at{' '}
        <a href="https://adssettings.google.com" className="text-emerald-400 underline">https://adssettings.google.com</a>.
      </p>
    </main>
  );
}`,
        sveltekit: `<script lang="ts">
  import { SITE_CONFIG } from '$lib/siteConfig';
</script>

<main data-adsense-suppress="true" class="max-w-3xl mx-auto px-6 py-12 text-zinc-200 space-y-6">
  <h1 class="text-3xl font-bold text-white">Privacy Policy & DoubleClick DART Disclosure</h1>
  <p>
    Third-party vendors, including Google, use cookies to serve ads based on prior visits to {SITE_CONFIG.domain}.
    Opt out at <a href="https://adssettings.google.com" class="text-emerald-400 underline">Google Ads Settings</a>.
  </p>
</main>`,
        python_jinja: `{# templates/privacy.html — Pass suppress_ads=True in Flask/Django route #}
{% extends "base.html" %}
{% block content %}
<main data-adsense-suppress="true" class="max-w-3xl mx-auto px-6 py-12 text-zinc-200 space-y-6">
  <h1 class="text-3xl font-bold text-white">Privacy Policy & Google DoubleClick DART Disclosure</h1>
  <p>
    Third-party vendors, including Google, use cookies to serve ads based on prior visits to
    <strong>{{ site_config.domain }}</strong>. Users may opt out of personalized advertising at
    <a href="https://adssettings.google.com">https://adssettings.google.com</a>.
  </p>
</main>
{% endblock %}`,
        universal_html: `<main data-adsense-suppress="true" style="max-width:768px;margin:0 auto;padding:48px 24px;">
  <h1>Privacy Policy & Google DoubleClick DART Cookie Disclosure</h1>
  <p>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website. Users may opt out at <a href="https://adssettings.google.com">https://adssettings.google.com</a>.</p>
</main>`,
      },
    },
    {
      id: 'about-eeat-page',
      title: 'E-E-A-T Editorial Standards, Author Bio & Corrections Policy Page',
      description:
        'Satisfies Google Quality Rater Guidelines for Experience, Expertise, Authoritativeness, and Trustworthiness, including a formal Corrections Policy.',
      filenamesByStack: {
        nextjs: 'app/about/page.tsx',
        react_vite: 'src/pages/AboutPage.tsx',
        sveltekit: 'src/routes/about/+page.svelte',
        python_jinja: 'templates/about.html',
        universal_html: 'about.html',
      },
      variants: {
        nextjs: `import React from 'react';
import { SITE_CONFIG } from '@/lib/site-config';

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-zinc-200 space-y-8 leading-relaxed">
      <header className="space-y-3 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold text-white">About {SITE_CONFIG.domain} & Editorial Methodology</h1>
      </header>
      <section className="p-6 rounded-lg border border-zinc-800 bg-zinc-950 space-y-3">
        <div className="text-xs font-mono uppercase text-emerald-400">Lead Author & Reviewer (E-E-A-T)</div>
        <h2 className="text-xl font-semibold text-white">{SITE_CONFIG.leadAuthorWithCredentials}</h2>
        <p className="text-sm text-zinc-300">
          All interactive models and sensitivity matrices on {SITE_CONFIG.domain} are verified against official institutional standards.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Editorial Verification & Corrections Policy</h2>
        <p>
          Report calculation edge cases or citation updates to{' '}
          <a href={\`mailto:\${SITE_CONFIG.editorialEmail}\`} className="text-emerald-400 underline">
            {SITE_CONFIG.editorialEmail}
          </a>{' '}
          (48-hour audit SLA).
        </p>
      </section>
    </main>
  );
}`,
        react_vite: `import React from 'react';
import { SITE_CONFIG } from '../config/siteConfig';

export function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-zinc-200 space-y-6">
      <h1 className="text-3xl font-bold text-white">About {SITE_CONFIG.domain} & Editorial Corrections Policy</h1>
      <p>Lead Reviewer: <strong>{SITE_CONFIG.leadAuthorWithCredentials}</strong> ({SITE_CONFIG.editorialEmail}).</p>
    </main>
  );
}`,
        sveltekit: `<script lang="ts">
  import { SITE_CONFIG } from '$lib/siteConfig';
</script>
<main class="max-w-3xl mx-auto px-6 py-12 text-zinc-200 space-y-6">
  <h1 class="text-3xl font-bold text-white">About {SITE_CONFIG.domain} & Editorial Corrections Policy</h1>
  <p>Lead Reviewer: <strong>{SITE_CONFIG.leadAuthorWithCredentials}</strong> ({SITE_CONFIG.editorialEmail}).</p>
</main>`,
        python_jinja: `{% extends "base.html" %}
{% block content %}
<main class="max-w-3xl mx-auto px-6 py-12 text-zinc-200 space-y-6">
  <h1 class="text-3xl font-bold text-white">About {{ site_config.domain }} & Editorial Corrections Policy</h1>
  <p>Lead Reviewer: <strong>{{ site_config.lead_author_with_credentials }}</strong> ({{ site_config.editorial_email }}).</p>
</main>
{% endblock %}`,
        universal_html: `<main style="max-width:768px;margin:0 auto;padding:48px 24px;">
  <h1>About & Editorial Corrections Policy</h1>
  <p>Lead Author & Reviewer: <strong>${authorVal}</strong> (editorial@${rawDomainLiteral})</p>
</main>`,
      },
    },
    {
      id: 'functional-contact-and-svg-diagram',
      title: 'Functional Contact Route + Server Handler (ADS-TRUST-01)',
      description:
        'Prevents human review rejections caused by fake @example.com emails or dead e.preventDefault() no-op forms.',
      filenamesByStack: {
        nextjs: 'app/contact/page.tsx',
        react_vite: 'src/pages/ContactPage.tsx',
        sveltekit: 'src/routes/contact/+page.svelte',
        python_jinja: 'app.py (/contact route)',
        universal_html: 'contact.html',
      },
      variants: {
        nextjs: `'use client';

import React, { useState } from 'react';
import { SITE_CONFIG } from '@/lib/site-config';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, message }),
    }).catch(() => null);
    setStatus('submitted');
  }

  return (
    <main data-adsense-suppress="true" className="max-w-2xl mx-auto px-6 py-12 text-zinc-200 space-y-6">
      <h1 className="text-3xl font-bold text-white">Contact Editorial & Technical Support</h1>
      <p className="text-sm text-zinc-400">
        Direct Email: <a href={\`mailto:\${SITE_CONFIG.editorialEmail}\`} className="text-emerald-400 underline">{SITE_CONFIG.editorialEmail}</a>
      </p>
      {status === 'submitted' ? (
        <div className="p-4 rounded border border-emerald-500/40 bg-emerald-950/20 text-emerald-200 text-sm">
          Inquiry logged for review by {SITE_CONFIG.leadAuthorWithCredentials}.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-950 p-6 rounded-xl border border-zinc-800">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="w-full px-3 py-2 rounded bg-black border border-zinc-800 text-sm text-white" />
          <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your technical question or correction report..." className="w-full px-3 py-2 rounded bg-black border border-zinc-800 text-sm text-white" />
          <button type="submit" className="px-4 py-2 rounded bg-white text-black text-xs font-semibold">Send Verified Inquiry</button>
        </form>
      )}
    </main>
  );
}`,
        react_vite: `import React, { useState } from 'react';
import { SITE_CONFIG } from '../config/siteConfig';

export function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <main data-adsense-suppress="true" className="max-w-2xl mx-auto px-6 py-12 text-zinc-200 space-y-6">
      <h1 className="text-3xl font-bold text-white">Contact {SITE_CONFIG.domain}</h1>
      <p>Email: <a href={\`mailto:\${SITE_CONFIG.editorialEmail}\`} className="text-emerald-400 underline">{SITE_CONFIG.editorialEmail}</a></p>
      {sent ? <p className="text-emerald-400">Inquiry received.</p> : (
        <form onSubmit={async (e) => { e.preventDefault(); await fetch('/api/contact', { method: 'POST' }).catch(() => null); setSent(true); }} className="space-y-4">
          <input type="email" required placeholder="you@domain.com" className="w-full p-2 bg-black border border-zinc-800 rounded" />
          <textarea required rows={4} placeholder="Message..." className="w-full p-2 bg-black border border-zinc-800 rounded" />
          <button type="submit" className="px-4 py-2 bg-white text-black rounded text-xs font-semibold">Submit</button>
        </form>
      )}
    </main>
  );
}`,
        sveltekit: `<script lang="ts">
  import { SITE_CONFIG } from '$lib/siteConfig';
  let sent = false;
</script>
<main data-adsense-suppress="true" class="max-w-2xl mx-auto px-6 py-12 text-zinc-200 space-y-6">
  <h1 class="text-3xl font-bold text-white">Contact {SITE_CONFIG.domain}</h1>
  <p>Direct Email: <a href="mailto:{SITE_CONFIG.editorialEmail}" class="text-emerald-400 underline">{SITE_CONFIG.editorialEmail}</a></p>
</main>`,
        python_jinja: `# Flask / FastAPI / Django Contact Endpoint + Template
@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        email = request.form.get("email", "")
        message = request.form.get("message", "")
        return render_template("contact.html", submitted=True, suppress_ads=True, site_config=SITE_CONFIG)
    return render_template("contact.html", submitted=False, suppress_ads=True, site_config=SITE_CONFIG)`,
        universal_html: `<main data-adsense-suppress="true" style="max-width:640px;margin:0 auto;padding:48px 24px;">
  <h1>Contact Editorial Support</h1>
  <p>Direct Publisher Email: <a href="mailto:editorial@${rawDomainLiteral}">editorial@${rawDomainLiteral}</a></p>
</main>`,
      },
    },
    {
      id: 'ads-txt-file',
      title: 'IAB Authorized Digital Sellers (ads.txt)',
      description:
        'Serve at root /ads.txt so https://yourdomain.com/ads.txt resolves with HTTP 200 text/plain.',
      filenamesByStack: {
        nextjs: 'public/ads.txt',
        react_vite: 'public/ads.txt',
        sveltekit: 'static/ads.txt',
        python_jinja: 'app.py (/ads.txt route)',
        universal_html: 'ads.txt',
      },
      variants: {
        nextjs: `# Authorized Digital Sellers (ads.txt) for ${rawDomainLiteral}
# Official Google AdSense TAG Certification ID: f08c47fec0942fa0
google.com, ${pubIdVal}, DIRECT, f08c47fec0942fa0`,
        react_vite: `# public/ads.txt (Vite copies /public to root dist/)
google.com, ${pubIdVal}, DIRECT, f08c47fec0942fa0`,
        sveltekit: `# static/ads.txt (SvelteKit & Astro serve /static or /public at root)
google.com, ${pubIdVal}, DIRECT, f08c47fec0942fa0`,
        python_jinja: `# Flask / FastAPI root /ads.txt endpoint
from flask import Response
from config import SITE_CONFIG

@app.get("/ads.txt")
def ads_txt():
    record = f"google.com, {SITE_CONFIG['adsense_publisher_id']}, DIRECT, f08c47fec0942fa0\\n"
    return Response(record, mimetype="text/plain")`,
        universal_html: `google.com, ${pubIdVal}, DIRECT, f08c47fec0942fa0`,
      },
    },
    {
      id: 'robots-sitemap-config',
      title: 'Mediapartners-Google Crawler-Safe robots.txt & XML Sitemap',
      description:
        'Explicitly permits Google AdSense crawlers (Mediapartners-Google and Google-AdSense-Inspection) and exposes /sitemap.xml.',
      filenamesByStack: {
        nextjs: 'app/robots.ts',
        react_vite: 'public/robots.txt',
        sveltekit: 'static/robots.txt',
        python_jinja: 'app.py (/robots.txt & /sitemap.xml)',
        universal_html: 'robots.txt',
      },
      variants: {
        nextjs: `import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: 'Mediapartners-Google', allow: '/' },
      { userAgent: 'Google-AdSense-Inspection', allow: '/' },
      { userAgent: '*', allow: '/', disallow: ['/api/', '/account/', '/settings/'] },
    ],
    sitemap: \`\${SITE_CONFIG.siteUrl}/sitemap.xml\`,
  };
}`,
        react_vite: `User-agent: Mediapartners-Google
Allow: /

User-agent: Google-AdSense-Inspection
Allow: /

User-agent: *
Allow: /

Sitemap: https://${rawDomainLiteral}/sitemap.xml`,
        sveltekit: `User-agent: Mediapartners-Google
Allow: /

User-agent: Google-AdSense-Inspection
Allow: /

User-agent: *
Allow: /

Sitemap: https://${rawDomainLiteral}/sitemap.xml`,
        python_jinja: `@app.get("/robots.txt")
def robots_txt():
    lines = [
        "User-agent: Mediapartners-Google",
        "Allow: /",
        "User-agent: Google-AdSense-Inspection",
        "Allow: /",
        "User-agent: *",
        "Allow: /",
        f"Sitemap: {SITE_CONFIG['site_url']}/sitemap.xml",
    ]
    return Response("\\n".join(lines), mimetype="text/plain")`,
        universal_html: `User-agent: Mediapartners-Google
Allow: /

User-agent: Google-AdSense-Inspection
Allow: /

User-agent: *
Allow: /

Sitemap: https://${rawDomainLiteral}/sitemap.xml`,
      },
    },
    {
      id: 'custom-404-page',
      title: 'Zero-Ad Custom 404 Not Found Page (Navigation Recovery)',
      description:
        'Guarantees zero ad scripts fire on 404 routes while giving users clear recovery links to top pillar guides.',
      filenamesByStack: {
        nextjs: 'app/not-found.tsx',
        react_vite: 'src/pages/NotFound.tsx',
        sveltekit: 'src/routes/+error.svelte',
        python_jinja: 'templates/404.html',
        universal_html: '404.html',
      },
      variants: {
        nextjs: `import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main data-adsense-suppress="true" className="max-w-2xl mx-auto px-6 py-20 text-center space-y-6">
      <div className="text-xs font-mono uppercase tracking-widest text-amber-400">HTTP 404 • Page Not Found</div>
      <h1 className="text-3xl font-bold text-white">We couldn&apos;t find that resource</h1>
      <div className="flex justify-center gap-4 pt-4">
        <Link href="/" className="px-4 py-2 rounded-md bg-white text-black font-medium text-sm">Return to Primary Tool</Link>
        <Link href="/guides" className="px-4 py-2 rounded-md border border-zinc-700 text-zinc-200 text-sm">Browse All Reference Guides</Link>
      </div>
    </main>
  );
}`,
        react_vite: `import React from 'react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <main data-adsense-suppress="true" className="max-w-2xl mx-auto px-6 py-20 text-center space-y-6">
      <h1 className="text-3xl font-bold text-white">404 — Page Not Found (Ads Suppressed)</h1>
      <Link to="/" className="px-4 py-2 rounded bg-white text-black text-sm font-semibold">Return Home</Link>
    </main>
  );
}`,
        sveltekit: `<main data-adsense-suppress="true" class="max-w-2xl mx-auto px-6 py-20 text-center space-y-6">
  <h1 class="text-3xl font-bold text-white">404 — Resource Not Found (Ads Suppressed)</h1>
  <a href="/" class="px-4 py-2 rounded bg-white text-black text-sm font-semibold">Return Home</a>
</main>`,
        python_jinja: `{# templates/404.html — Rendered with suppress_ads=True in @app.errorhandler(404) #}
{% extends "base.html" %}
{% block content %}
<main data-adsense-suppress="true" class="max-w-2xl mx-auto px-6 py-20 text-center space-y-6">
  <h1 class="text-3xl font-bold text-white">404 — Resource Not Found</h1>
  <a href="/" class="px-4 py-2 rounded bg-white text-black text-sm font-semibold">Return to Primary Tool</a>
</main>
{% endblock %}`,
        universal_html: `<main data-adsense-suppress="true" style="max-width:640px;margin:0 auto;padding:80px 24px;text-align:center;">
  <h1>404 — Page Not Found</h1>
  <p><a href="/">Return to Homepage</a></p>
</main>`,
      },
    },
  ];

  return templates.map((t) => ({
    ...t,
    filename: t.filenamesByStack[defaultVariant],
    code: t.variants[defaultVariant],
  }));
}
