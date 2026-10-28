# AdSenseGuard Studio — Standalone AI Skill Compiler & Pre-Submission Compliance Auditor

AdSenseGuard Studio solves the "black-box AdSense rejection" problem by providing a complete, standalone AI skill compiler paired with a live diagnostic auditor. It enables developers and creators to equip any AI coding agent (Claude, Cursor, Windsurf, Gemini, or custom LLMs) with every 2026 Google AdSense policy, architectural guardrail, and technical requirement from day one, while auditing codebases and pages before submission.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> All core product decisions from Phase 1 have been locked in below. Review the proposed architecture and approve when ready to build.

- **Confirmed Decision 1 (Primary Workflow)**: Integrated 4-pillar workbench combining the **Standalone AI Skill Compiler**, **Interactive 2026 AdSense Policy Matrix**, **Compliance Boilerplate & Template Generator**, and **Live Pre-Submission Site & Code Auditor**.
- **Confirmed Decision 2 (Export Formats)**: Instant compilation and one-click export to **Universal `SKILL.md` & System Prompt Bundle**, **Cursor `.cursorrules`**, **Claude `CLAUDE.md`**, and **Drop-in Code Templates** (Google Consent Mode v2 + IAB TCF v2.2 banner, `ads.txt` validator/generator, CLS-safe ad slot wrapper, and mandatory Privacy/Terms/About/Contact trust pages).
- **Confirmed Decision 3 (Diagnostic Coverage)**: Automated hybrid auditing (deterministic DOM/heuristic analysis + server-side Gemini deep semantic inspection) across **Low-Value Content & E-E-A-T Signals**, **Ad Placement & CLS / Accidental Click Traps**, **Mandatory Trust Pages & GDPR/CCPA Consent Mode v2**, and **Prohibited/Restricted Content & Invalid Traffic (IVT) Patterns**.
- **Confirmed Decision 4 (Visual Direction)**: **Technical Precision Dark Workbench** (`#0F172A` slate canvas, `#1E293B` structural surfaces, `Plus Jakarta Sans` + `JetBrains Mono` tabular typography, and semantic compliance indicators).

---

### 1. Overview & Core Concept

- **What It Does**:
  1. **Standalone AI Skill Builder & Exporter**: Compiles a comprehensive, zero-ambiguity AI instruction package (`SKILL.md`, `.cursorrules`, `CLAUDE.md`, or system prompt) tailored to the user's site niche (e.g., SaaS Tool/Calculator, Editorial Blog, Directory/Data Hub, Web App/Utility), target frameworks, and monetization regions (EEA/UK/Global). When given to any AI at project start, it forces the AI to build AdSense-compliant architecture, E-E-A-T authorship, CLS-reserved ad containers, and mandatory trust routes automatically.
  2. **Exhaustive 2026 AdSense Rule Matrix**: Interactive, searchable reference of every Google AdSense Program Policy, Google Publisher Policy, Google Publisher Restriction, Coalition for Better Ads standard, IAB TCF v2.2 / Consent Mode v2 mandate, and "Low Value Content" trigger—complete with concrete "Why Sites Get Rejected" vs. "How the AI Must Build It" code comparisons.
  3. **Pre-Submission Diagnostic Auditor**: Inspects any pasted HTML/JSX/Markdown page, URL content, or site structure against 40+ deterministic compliance checks and a server-side Gemini semantic policy evaluator to catch rejection triggers before submitting to Google AdSense.
  4. **Ready-to-Use Compliance Code Templates**: Generates copy-ready, production-grade code for CLS-zero AdSense responsive wrappers, Google Consent Mode v2 default/update scripts, `ads.txt` records, and AdSense-specific Privacy Policy (including DoubleClick DART cookie disclosures), About Us, and Contact page templates.
- **Target Audience / Persona**: Indie hackers, web developers, niche site builders, and AI-assisted creators who build websites or web apps with AI coding tools and want guaranteed AdSense readiness on their first review.
- **Key Value**: Eliminates weeks of blind re-submissions and vague "Low Value Content" or "Policy Violation" rejections by shifting AdSense compliance to the very first prompt given to an AI builder.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Skill Compilation & Export Flow**: The user selects their project archetype (e.g., *Interactive Web Tool / Calculator*, *Content & Editorial Publication*, *Documentation / Knowledge Base*, or *Full-Stack Web App*), target regions (*EEA/UK GDPR + Global*), and strictness profile. The live preview pane updates the compiled `SKILL.md` / `.cursorrules` / `CLAUDE.md` artifact in real time, showing exact word-count minimums, DOM rules, forbidden patterns, and required routes, ready for one-click copy or file download.
  2. **Pre-Submission Audit Flow**: The user pastes page content, HTML/React JSX code, or loads a realistic sample scenario (e.g., *"Thin AI Calculator App (Rejected)"*, *"Deceptive Ad Layout & Missing CMP"*, or *"Compliant Editorial + Tool Site"*). Clicking **Run Compliance Audit** executes both instant deterministic rule checks (word depth, heading hierarchy, trust link presence, ad density ratio, `min-height` CLS reservation, Consent Mode v2 signals, prohibited keyword triggers) and deep AI semantic analysis, returning a prioritized remediation report with exact fix snippets.
  3. **Interactive Policy Explorer Flow**: The user filters the 2026 AdSense Rulebook by category (*Low-Value Content & E-E-A-T*, *Ad Placement & Better Ads*, *Privacy, Consent Mode v2 & ads.txt*, *Prohibited & Restricted Content*, *Invalid Traffic & Click Integrity*), inspects exact rejection causes, and toggles individual rules directly into their custom AI skill export.
  4. **Compliance Boilerplate Generator Flow**: The user enters their domain name, publisher ID (`pub-xxxxxxxxxxxxxxxx`), and company/author details to generate drop-in code for `ads.txt`, Google Consent Mode v2 (`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`), CLS-safe `<AdSlot />` components, and legal disclosure pages.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: **Technical Precision Dark Workbench**—modeled after high-precision developer consoles and verification suites. Clean 1px structural borders (`#1E293B`), zero nested card clutter, crisp tabular data alignment, and immediate visual scannability.
  - *Color Palette & Mood* (60-30-10 discipline):
    - **60% Dominant Neutral Canvas**: Deep Slate (`#0F172A` / `bg-slate-950`) and elevated workspace panels (`#111827` / `bg-slate-900`).
    - **30% Structural Surfaces & Typography**: Subtle borders (`#1E293B`), high-contrast primary text (`#F8FAFC`), and muted secondary text (`#94A3B8`).
    - **10% Semantic & Action Accents**: Electric Cobalt (`#3B82F6`) for primary actions and active workspace tabs; Emerald (`#16A34A`) for Verified/Compliant states; Amber (`#D97706`) for Publisher Restrictions & Warnings; Crimson (`#DC2626`) for Critical Rejection Triggers. Every semantic state pairs color with an explicit text label and icon.
  - *Typography & Hierarchy* (2+1 Font Rule):
    - **Display & Navigation**: `Plus Jakarta Sans` (SemiBold 600 / Bold 700, tight tracking, balanced headlines).
    - **UI & Dense Prose**: `DM Sans` (Regular 400 / Medium 500, 15px body measure for policy legibility).
    - **Code, Telemetry & Rule IDs**: `JetBrains Mono` with `tabular-nums` for rule codes (`ADS-LVC-01`), word counts, ad-to-content ratios, and generated skill markdown.
  - *Component Styling & Layout*:
    - Strict 3-zone Top Bar Contract: Single-line Brand Wordmark on the left, 4 single-line workspace navigation links in the center (`Skill Compiler`, `Compliance Auditor`, `Policy Encyclopedia`, `Code Templates`), and 1 primary CTA (`Export Skill Package`) on the right.
    - Full-viewport 1440px desktop grid with single-elevation flat panels separated by 1px solid hairline dividers.
    - Zero-pill discipline for static metadata: Rule IDs, severity levels, and update timestamps use clean typographic separators (`ADS-UX-04 · Critical Rejection Risk · Better Ads Standard`).

- **Interactive Feedback & Motion**:
  - Instant (<150ms) tab switching and live compiler preview updates as configuration toggles change.
  - Deterministic + AI audit progress breakdown with skeleton placeholders matching result rows and one-click "Copy Fix Prompt for AI" on any detected violation.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Exhaustive, Opinionated AI Skill Architecture (`SKILL.md` / `.cursorrules` / `CLAUDE.md`)**
  - *Chosen Approach*: Structure the generated AI skill into 7 enforceable engineering mandates: (1) Content Depth & E-E-A-T Architecture (no thin utility pages; every tool/calculator must include 600–800+ words of original methodology, examples, and FAQ), (2) Mandatory Trust & Legal Routes (`/privacy`, `/terms`, `/about`, `/contact`, `/editorial-policy`), (3) Technical Monetization Plumbing (`ads.txt`, Consent Mode v2 with 4 signals, DART cookie disclosure), (4) Layout & CLS Protection (explicit `min-height` reservation, no ads above-the-fold crowding primary H1, minimum 150px distance from interactive buttons), (5) Navigation & Crawlability Integrity (zero dead links, no empty category stubs, no gated/login-only primary content), (6) Prohibited & Restricted Content Guardrails, and (7) Automated Pre-Flight Verification Checklist.
  - *Why*: Generic prompts like "make this site AdSense friendly" fail because LLMs don't know that a standalone calculator with 80 words of text is automatically rejected for "Low Value Content" or that placing an ad near a "Download" button triggers an "Encouraging Accidental Clicks" ban. Concrete numerical and structural rules force the AI to build compliant pages from the start.
  - *Alternatives Considered*: A simple text checklist was rejected because it requires manual human translation into code rather than acting as a drop-in AI agent skill.

- **Decision 2: Hybrid Deterministic + Server-Side Gemini Audit Engine**
  - *Chosen Approach*: Combine a fast client-side deterministic analyzer (evaluating exact word counts, HTML tag ratios, link integrity, ad container CSS attributes, Consent Mode v2 script presence, and prohibited vocabulary) with a server-side Gemini API route (`/api/audit`) using `gemini-3.8-flash` and structured JSON schema output to evaluate nuanced E-E-A-T quality, content originality, and policy violations—plus an AI Remediation Generator that rewrites flagged sections into compliant code.
  - *Why*: Deterministic rules catch 100% of structural/technical violations (missing `ads.txt`, zero CLS reservation, thin word count) with zero latency, while Gemini catches semantic traps (fluff AI text, weak E-E-A-T authority, subtle policy restrictions).
  - *Alternatives Considered*: Relying solely on LLM evaluation was rejected because deterministic metrics (exact word counts, DOM tag inspection) are more accurate when computed directly.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     Top Bar (3-Zone Strict Contract)                         │
│  [AdSenseGuard Studio]    [Compiler · Auditor · Policies · Templates]  [CTA] │
└───────────────────┬──────────────────────────────────────┬───────────────────┘
                    │                                      │
                    ▼                                      ▼
┌─────────────────────────────────────────┐  ┌─────────────────────────────────┐
│     Workspace View Controller           │  │   2026 AdSense Knowledge Base   │
│  ┌───────────────────────────────────┐  │  │  • 48 Granular Policy Rules     │
│  │ 1. Standalone Skill Compiler      │◄─┼──┤  • 7 Core Rejection Categories  │
│  │    • Niche & Region Configurator  │  │  │  • Code Bad/Good Comparisons    │
│  │    • Rule Module Toggles          │  │  │  • Boilerplate Code Generators  │
│  │    • Live Markdown/Rules Preview  │  │  └─────────────────┬───────────────┘
│  │    • Multi-Format Exporter        │  │                    │
│  ├───────────────────────────────────┤  │                    ▼
│  │ 2. Pre-Submission Site Auditor    │  │  ┌─────────────────────────────────┐
│  │    • HTML / Content / URL Input   │  │  │  Deterministic Rule Engine      │
│  │    • Preset Failure Scenarios     ├──┼─►│  • Word Depth & Text/HTML Ratio │
│  │    • Category Scorecards          │  │  │  • Trust Route & Link Validator │
│  │    • Violation Remediation Diffs  │  │  │  • CLS & Ad Density Inspector   │
│  ├───────────────────────────────────┤  │  │  • Consent Mode v2 & IVT Checks │
│  │ 3. Interactive Policy Matrix      │  │  └─────────────────┬───────────────┘
│  │    • Category & Severity Filter   │  │                    │
│  │    • Search & Rule Deep-Dive      │  │                    ▼
│  ├───────────────────────────────────┤  │  ┌─────────────────────────────────┐
│  │ 4. Compliance Code Templates      │  │  │  Server Route (/api/audit)      │
│  │    • Publisher ID & Domain Inputs │  │  │  • @google/genai SDK            │
│  │    • Consent Mode v2 + CMP Code   │  │  │  • gemini-3.8-flash JSON Schema │
│  │    • CLS-Safe Ad Wrapper + Legal  │  │  │  • E-E-A-T & Policy Diagnostics │
│  └───────────────────────────────────┘  │  └─────────────────────────────────┘
└─────────────────────────────────────────┘
```

- **Data Model & State**:
  - `AdSensePolicyRule`: Structured rule definition containing `id` (e.g., `ADS-LVC-01`), `title`, `category` (`low_value_content` | `ad_placement_ux` | `trust_privacy_cmp` | `prohibited_content` | `traffic_integrity` | `technical_crawlability`), `severity` (`critical_rejection` | `ad_limitation` | `revenue_impact`), `officialPolicySource`, `rejectionSymptom`, `aiBuilderDirective` (the exact rule injected into `SKILL.md`), `badExampleCode`, and `goodExampleCode`.
  - `SkillCompilerConfig`: Tracks selected site archetype (`web_app_tool` | `editorial_blog` | `directory_data` | `saas_landing`), target privacy regimes (`gdpr_eea_uk`, `ccpa_us`, `global`), framework target (`nextjs_app_router`, `react_vite`, `universal_html`), custom domain/publisher metadata, and enabled rule IDs.
  - `AuditReport`: Holds deterministic metrics (`wordCount`, `headingCount`, `trustLinksFound`, `adSlotCount`, `unreservedAdSlots`, `consentSignalsFound`, `prohibitedTermsFound`), overall readiness status, granular findings per category, and AI-generated semantic E-E-A-T diagnostics and auto-fix prompts.

- **Interactive Component & State Mapping**:
  - **Skill Compiler Controls**: Changing project archetype, toggling policy modules, or switching output format (`SKILL.md`, `.cursorrules`, `CLAUDE.md`, `System Prompt`) dynamically recompiles the artifact text in real time and updates token/line counts (`tabular-nums`). Copy to Clipboard and Download File (`.md` / `.cursorrules`) buttons provide immediate feedback.
  - **Compliance Auditor Controls**: Users can load 4 realistic preset test cases (*"Rejected AI Tool (Thin Content + Accidental Click Trap)"*, *"Missing Consent Mode v2 & Trust Pages"*, *"Restricted Content & High Ad Density"*, *"100% Compliant Production App"*) or paste their own HTML/React/text. Clicking **Run Full Diagnostic** executes the local heuristic scanner immediately and calls `/api/audit` for deep Gemini analysis, with a one-click **"Generate AI Fix Prompt"** button on every flagged issue.
  - **Policy Matrix & Template Customizer**: Live search, category/severity segmented filters, expandable good-vs-bad code diffs, and live input binding for Publisher ID (`pub-...`), Domain Name, and Contact Email that injects directly into all generated legal and technical templates.
