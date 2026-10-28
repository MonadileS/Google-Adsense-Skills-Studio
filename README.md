# AdSenseGuard Studio

AdSenseGuard Studio is a technical engineering workbench, standalone skill compiler, and multi-endpoint compliance auditor for the 2026 Google AdSense Program Policies, Google Publisher Policies, Better Ads Standards, E-E-A-T Search Quality Rater Guidelines, and Google Consent Mode v2 (IAB TCF v2.2).

Modern code assistants frequently generate web applications that look visually complete but get rejected during Google AdSense site review under **"Low Value Content"**, **"Valuable Inventory: No Content"**, **"Under Construction"**, or **GDPR / Consent Mode v2 non-compliance**. AdSenseGuard Studio solves this by compiling a 28-rule architectural constitution (`SKILL.md`, `.cursorrules`, `CLAUDE.md`, and System Prompts), providing a 4-Turn Anti-Truncation Prompt Playbook, supplying multi-stack production boilerplates, and auditing local codebases or live URLs before submission.

---

## Core Capabilities

### 1. Standalone Compliance Skill Compiler
Compiles a self-contained 28-rule architectural constitution that can be dropped into any coding agent or IDE (Cursor, Claude Code, Windsurf, Copilot, Bolt, Lovable, or v0).
- **Universal Fresh-Build Mode (Default)**: Generates reusable skill files with zero hardcoded domains or publisher IDs, instructing the coding agent to centralize domain, publisher ID, and author metadata inside `siteConfig` or `.env`.
- **Project-Specific Override Mode**: Optionally injects your exact production domain, `pub-XXXXXXXXXXXXXXXX` ID, and E-E-A-T author credentials directly into all exported skill files and boilerplates.
- **4 Export Formats**: `SKILL.md`, `.cursorrules`, `CLAUDE.md`, and a First-Turn System Prompt.

### 2. Multi-Stack Production Boilerplates (5 Web Frameworks)
Provides 10 production-ready code templates with an interactive 5-stack switcher covering:
- **Next.js 15+ (App Router)**
- **React 19 + Vite SPA / SSR**
- **SvelteKit 2 / Astro 5**
- **Python (Flask / Django / FastAPI + Jinja2)**
- **Universal HTML5 / Vanilla JS**

Included templates cover:
- CLS-reserved `<AdUnit />` wrappers (`min-h-[280px]`, 24px click buffers, and system/404 route kill-switches)
- Google Consent Mode v2 + IAB TCF v2.2 default-denied head bootstrapper
- Server-rendered Tool + 800-word Editorial Methodology + Deterministic Sensitivity Matrix + Inline `<svg>` diagram
- E-E-A-T Author Bio, `BreadcrumbList`, and `WebApplication` / `TechArticle` Schema.org JSON-LD
- Privacy Policy with mandatory DoubleClick DART cookie and opt-out disclosures
- Editorial `/about` page with Corrections Policy and verified `/contact` route
- Static `/ads.txt`, `/robots.txt` (`Mediapartners-Google` allowed), and `/sitemap.xml`
- Automated Pre-Build Compliance Verification Script (`scripts/verify-adsense-build.mjs`)

### 3. 4-Turn Anti-Truncation Prompt Playbook
Single-turn prompts cannot generate a complete website plus 8 to 10 full-length 900-word articles without hitting output token limits and leaving placeholder comments (`// TODO: add remaining articles`). The 4-Turn Playbook divides project generation into four sequential prompts:
1. **Turn 1**: Core Architecture, `siteConfig`, CLS-Zero Ad Wrapper, Consent Mode v2, Trust Pages, and `/ads.txt`
2. **Turn 2**: Primary Interactive Tool, Deterministic Sensitivity Matrix, Inline `<svg>` Diagram, and 850+ Word Methodology
3. **Turn 3**: Pillar Guides Batch 1 (Guides 1 to 4, 900+ words each with worked examples and internal links)
4. **Turn 4**: Pillar Guides Batch 2 (Guides 5 to 8), Dynamic `/sitemap.xml`, and Pre-Build CI Gate Verification

### 4. Interactive D3.js Policy Knowledge Graph & Global Command Palette (`Cmd+K`)
- Force-directed D3.js dependency graph visualizing how project routes, E-E-A-T signals, navigation depth, and CMP rules cascade into AdSense review verdicts.
- Press `Cmd+K` (or `Ctrl+K`) anywhere in the application to search all 28 policy rules and jump directly to the corresponding node in the Knowledge Graph.

### 5. 3-Mode Pre-Submission Compliance Auditor & Markdown Report Exporter
Audits your project against all 28 deterministic gates and deep LLM semantic analysis across three scopes:
1. **Single File / HTML Snippet Mode**: Paste HTML, React JSX, Svelte, or Markdown, or load built-in test presets.
2. **Local Codebase Folder Mode**: Select an entire local project directory from your machine. Automatically detects the framework, checks all 8 mandatory endpoints (`/ads.txt`, `/robots.txt`, `/sitemap.xml`, `404` ad suppression, `/privacy`, `/about`, `/contact`, `/terms`), counts visible prose words per route, and computes pairwise **5-gram Jaccard shingle overlap** (`< 25%` ceiling) to catch programmatic SEO doorway duplication.
3. **Live Production URL Crawler Mode**: Server-side crawler (`Mediapartners-Google/2.1`) probes your live domain across 9 endpoints plus sampled sitemap routes to verify HTTP status codes, soft-404s, redirects, and content depth.
4. **Downloadable Markdown Audit Report (`ADSENSE_AUDIT_REPORT.md`)**: Exports a structured Markdown report summarizing compliance scores, telemetry, endpoint checklists, and actionable remediation steps for every failed check.

### 6. Multi-Provider AI Models & Multi-Key Rotation Pool
Supports running deep semantic E-E-A-T diagnostics using multiple providers and API keys:
- **Google Gemini**: `gemini-3.8-flash`, `gemini-2.5-pro`, `gemini-2.5-flash`
- **Groq Cloud (LPU Inference)**: `llama-3.3-70b-versatile`, `deepseek-r1-distill-llama-70b`, `moonshotai/kimi-k2-instruct`, `qwen-qwq-32b`, `llama-3.1-8b-instant`
- **NVIDIA NIM Microservices**: `meta/llama-3.3-70b-instruct`, `nvidia/llama-3.1-nemotron-ultra-253b-v1`, `nvidia/llama-3.1-nemotron-70b-instruct`, `deepseek-ai/deepseek-r1`, `qwen/qwen2.5-coder-32b-instruct`, `mistralai/mistral-large-2-instruct`
- **Automatic Failover**: Configure multiple API keys per provider in the UI settings modal. If one key hits a `429` rate limit, the auditor automatically rotates to the next active key in the pool.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (Pure Dark Mode `#000000` / `#09090b` + Space Mono syntax-highlighted code blocks)
- **Visualization**: D3.js (`d3`) interactive force-directed Knowledge Graph
- **Icons**: `lucide-react`
- **AI SDKs & Endpoints**: `@google/genai` (Google Gemini), Groq OpenAI-compatible REST API, and NVIDIA NIM REST API

---

## Getting Started (Local Setup & Installation)

### Prerequisites
- **Node.js**: v18.18.0 or higher (v20+ recommended)
- **npm**: v9+ (or `pnpm` / `yarn`)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd adsenseguard-studio
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file to `.env.local`:
```bash
cp .env.example .env.local
```

Open `.env.local` and configure your optional server-side fallback API keys (you can also add and manage multiple API keys directly inside the web UI under **AI Keys**):
```env
# Optional server-side fallback key for Google Gemini models
GEMINI_API_KEY="your_gemini_api_key_here"

# Optional server-side fallback key for Groq Cloud LPU models
GROQ_API_KEY="your_groq_api_key_here"

# Optional server-side fallback key for NVIDIA NIM models
NVIDIA_NIM_API_KEY="your_nvidia_nim_api_key_here"

# Base URL where the application is hosted locally
APP_URL="http://localhost:3000"
```

### 4. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build and Run for Production
```bash
# Type-check and create an optimized production build
npm run build

# Start the production server on port 3000
npm run start
```

### 6. Run Code Linting
```bash
npm run lint
```

---

## Project Directory Structure

```text
.
├── app/
│   ├── api/
│   │   └── audit/
│   │       ├── route.ts            # Multi-provider semantic AI auditor (Gemini, Groq, NVIDIA NIM + key rotation)
│   │       └── live-url/
│   │           └── route.ts        # Server-side multi-endpoint live URL crawler (Mediapartners-Google probe)
│   ├── globals.css                 # Tailwind CSS v4 global stylesheet
│   ├── layout.tsx                  # Root layout with Space Grotesk, Inter, and Space Mono fonts
│   └── page.tsx                    # Main application entry route
├── components/
│   ├── AdSenseWorkbench.tsx        # 3-column GitBook documentation & interactive workbench shell
│   ├── AiProviderSettingsModal.tsx # Multi-provider API key pool & model selector modal
│   ├── PolicyKnowledgeGraph.tsx    # D3.js interactive policy dependency graph
│   └── SyntaxHighlightedCode.tsx   # Space Mono syntax-highlighted code viewer & editor
├── lib/
│   ├── adsense-policies.ts         # 28 structured 2026 Google AdSense policy rules & test presets
│   ├── ai-provider-settings.ts     # Model catalog & multi-key rotation helpers for Gemini, Groq, and NVIDIA NIM
│   ├── deterministic-auditor.ts    # Regex + AST + 5-gram shingle overlap auditor & Markdown report generator
│   ├── repo-audit-presets.ts       # Multi-file repository simulation presets for codebase auditing
│   └── skill-compiler.ts           # Standalone SKILL.md, .cursorrules, CLAUDE.md & multi-stack template compiler
└── public/
    └── ADSENSE_SKILL.md            # Static downloadable 28-rule AdSense architectural skill file
```

---

## How to Use AdSenseGuard Studio for a New Website Build

1. **Compile Your Skill File**:
   - Open the **Skill Compiler** tab, select your Website Archetype (`Calculator / Tool`, `Knowledge Portal`, `SaaS Web App`, or `Reference Directory`) and Target Tech Stack (`Universal Auto-Detect`, `Next.js`, `React + Vite`, `SvelteKit / Astro`, `Python Flask/Django`, or `HTML5`).
   - Keep **Universal Fresh-Build Mode** enabled for new projects, or toggle **Override Domain & Pub-ID** if you already have a registered domain and AdSense Publisher ID.
   - Click **Export Skill Bundle** and download `SKILL.md`, `.cursorrules`, or `CLAUDE.md` into your target project root.
2. **Execute the 4-Turn Prompt Playbook**:
   - Open the **4-Turn Playbook** tab and send Turn 1, Turn 2, Turn 3, and Turn 4 sequentially to your coding assistant so every route, sensitivity matrix, inline SVG diagram, and 900-word pillar guide is written in full without token truncation.
3. **Audit Your Local Codebase or Live URL**:
   - Open the **Compliance Auditor** tab, upload your local project folder or enter your live deployed URL, review all 28 deterministic gates and the 8-endpoint matrix, run **Deep AI Policy Diagnosis**, and click **Download Audit Report (.md)** to export your compliance verification summary.
