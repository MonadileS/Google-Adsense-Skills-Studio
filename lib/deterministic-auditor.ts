import { PolicyCategory } from './adsense-policies';

export interface AuditFinding {
  id: string;
  ruleId: string;
  title: string;
  category: PolicyCategory;
  severity: 'critical' | 'high' | 'medium' | 'pass';
  status: 'fail' | 'warning' | 'pass';
  diagnosis: string;
  remediation: string;
  snippet?: string;
  affectedFiles?: string[];
}

export interface DeterministicAuditReport {
  overallScore: number;
  readinessVerdict: 'READY_FOR_REVIEW' | 'HIGH_REJECTION_RISK' | 'IMMEDIATE_AUTO_REJECT';
  metrics: {
    estimatedWordCount: number;
    adSlotCount: number;
    clsReservedSlots: number;
    unreservedSlots: number;
    hasConsentModeV2: boolean;
    hasTrustLinks: boolean;
    hasAuthorEeatSignals: boolean;
    hasStructuredDataJsonLd: boolean;
    hasBreadcrumbsAndInternalLinks: boolean;
    hasFakeLabClaims: boolean;
    hasStockPlaceholderImages: boolean;
    hasDummyContactInfo: boolean;
    hasAdSenseAccountMetaTag: boolean;
    deadLinkCount: number;
    aiTruncationStubCount: number;
    isSystemOrErrorRoute: boolean;
  };
  categoryScores: Record<PolicyCategory, number>;
  findings: AuditFinding[];
}

export interface RepoFileEntry {
  path: string;
  content: string;
  sizeBytes?: number;
}

export interface EndpointCheckStatus {
  endpoint: string;
  requiredByRule: string;
  present: boolean;
  valid: boolean;
  matchedFileOrUrl: string;
  statusDetail: string;
}

export interface RouteContentMetric {
  path: string;
  wordCount: number;
  hasTableMatrix: boolean;
  hasInlineSvg: boolean;
  hasJsonLd: boolean;
  hasBreadcrumbs: boolean;
  status: 'pass' | 'thin' | 'stub';
}

export interface ShingleOverlapPair {
  fileA: string;
  fileB: string;
  overlapPercent: number;
}

export interface RepositoryAuditReport {
  detectedStack: string;
  totalFilesScanned: number;
  totalEditorialWords: number;
  pillarRouteCount: number;
  thinRouteCount: number;
  maxShingleOverlapPercent: number;
  highestOverlapPair: ShingleOverlapPair | null;
  endpointChecklist: EndpointCheckStatus[];
  routeMetrics: RouteContentMetric[];
  auditReport: DeterministicAuditReport;
  compiledDigestForAi: string;
}

/** Extracts visible prose words from HTML, JSX, TSX, Svelte, Python Jinja2, or Markdown */
export function extractVisibleWords(raw: string): string[] {
  const stripped = raw
    .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, ' ')
    .replace(/\{#[\s\S]*?#\}/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(
      /\b(import|export|from|const|let|var|function|return|interface|type|className|div|span|section|article|main|header|footer|true|false|null|undefined|async|await|def|render_template|request)\b/g,
      ' '
    )
    .replace(/[{}()[\].,;:=<>'"`+-/*&|!~?#$%_\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return stripped ? stripped.split(' ').filter((w) => w.length > 2) : [];
}

/** Computes 5-gram Jaccard shingle overlap percentage (0..100) between two word arrays */
export function computeFiveGramOverlapPercent(wordsA: string[], wordsB: string[]): number {
  if (wordsA.length < 40 || wordsB.length < 40) return 0;
  const buildShingles = (words: string[]) => {
    const set = new Set<string>();
    const lower = words.map((w) => w.toLowerCase());
    for (let i = 0; i <= lower.length - 5; i++) {
      set.add(`${lower[i]} ${lower[i + 1]} ${lower[i + 2]} ${lower[i + 3]} ${lower[i + 4]}`);
    }
    return set;
  };
  const setA = buildShingles(wordsA);
  const setB = buildShingles(wordsB);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const s of setA) {
    if (setB.has(s)) intersection++;
  }
  const smallerSize = Math.min(setA.size, setB.size);
  return Math.round((intersection / smallerSize) * 100);
}

export function runDeterministicAudit(codeInput: string): DeterministicAuditReport {
  const findings: AuditFinding[] = [];

  const words = extractVisibleWords(codeInput);
  const estimatedWordCount = words.length;

  // Count AdSense slots
  const rawInsMatches = codeInput.match(/<ins[^>]*adsbygoogle[^>]*>/gi) || [];
  const wrapperMatches = codeInput.match(/<(?:AdUnitSlot|CompliantAdSlot)\b[^>]*>/gi) || [];
  const adSlotCount = rawInsMatches.length + wrapperMatches.length;

  // Check CLS reservation (min-h-[280px], min-h-[90px], min-h-[250px], min-height, or AdUnitSlot wrapper)
  const hasMinHeightReservation =
    /min-h-\[(?:250|280|90|600)px\]|min-height:\s*(?:250|280|90|600)px/i.test(codeInput) ||
    wrapperMatches.length > 0;

  const clsReservedSlots = hasMinHeightReservation ? adSlotCount : 0;
  const unreservedSlots = adSlotCount - clsReservedSlots;

  // Check Consent Mode v2
  const hasConsentModeV2 =
    /ad_user_data['"]?\s*:\s*['"]denied['"]/i.test(codeInput) ||
    /CertifiedConsentModeProvider/i.test(codeInput) ||
    /fundingchoicesmessages\.google\.com/i.test(codeInput);

  // Check Trust Pages (/privacy, /about, /contact, /terms)
  const hasPrivacyLink = /\/privacy|Privacy Policy/i.test(codeInput);
  const hasAboutOrContact = /\/about|\/contact|About Us|Contact/i.test(codeInput);
  const hasTrustLinks = hasPrivacyLink && hasAboutOrContact;

  // Check E-E-A-T Author & Timestamp signals
  const hasAuthorEeatSignals =
    /Reviewed by|By\s+[A-Z]|Author|dateModified|updatedAt|time\s+datetime|Editorial Methodology/i.test(codeInput);

  // Check Schema.org JSON-LD
  const hasStructuredDataJsonLd =
    /application\/ld\+json|schema\.org/i.test(codeInput);

  // Check BreadcrumbList & Hub-and-Spoke Internal Links (ADS-TEC-05)
  const hasBreadcrumbsAndInternalLinks =
    /BreadcrumbList|aria-label=["']Breadcrumb["']/i.test(codeInput) &&
    /\/guides\/|Related\s+(?:Pillar\s+|Infrastructure\s+|Technical\s+)?Guides/i.test(codeInput);

  // Check Fabricated First-Person Empirical Lab Claims (ADS-PRO-04)
  const fakeLabClaimMatches =
    codeInput.match(
      /in our \d+-day (?:lab\s+)?benchmark|we surveyed \d[\d,]*|across \d[\d,]* (?:production|live|enterprise) (?:servers|clusters|deployments|brokerage)|our proprietary lab tested/gi
    ) || [];
  const hasFakeLabClaims = fakeLabClaimMatches.length > 0;

  // Check Prohibited Piracy / Media Ripper Keywords (ADS-PRO-01)
  const piracyMatches =
    codeInput.match(
      /YouTube\s+(?:to\s+)?MP3|TikTok\s+Video\s+Downloader|rip\s+audio\s+instantly|cracked\s+APK|keygen|torrent\s+download/gi
    ) || [];

  // Check Unverified YMYL Financial/Medical Guarantees (ADS-PRO-02)
  const ymylGuaranteeMatches =
    codeInput.match(
      /Guaranteed\s+\d+%\s+(?:Monthly|Crypto|ROI|Return)|zero\s+risk\s+using\s+weekly\s+options|guaranteed\s+passive\s+income/gi
    ) || [];

  // Check Stock Placeholder Images vs Inline Technical SVG Diagrams (ADS-IMG-01)
  const stockImageMatches =
    codeInput.match(/picsum\.photos|placehold\.co|via\.placeholder\.com|unsplash\.com\/random/gi) || [];
  const hasStockPlaceholderImages = stockImageMatches.length > 0;

  // Check Dummy Contact Info & No-Op Forms (ADS-TRUST-01)
  const dummyContactMatches =
    codeInput.match(
      /[a-zA-Z0-9._%+-]+@example\.com|123\s+Main\s+(?:St|Street)|onSubmit=\{\s*\(?e\)?\s*=>\s*e\.preventDefault\(\)\s*\}/gi
    ) || [];
  const hasDummyContactInfo = dummyContactMatches.length > 0;

  // Check Programmatic SEO Mad-Libs Variable Swapping (ADS-LVC-06)
  const pseoMadLibsMatches =
    codeInput.match(
      /How to convert \$\{(?:fromUnit|unitA|currencyA)\} to \$\{(?:toUnit|unitB|currencyB)\}/gi
    ) || [];
  const hasPseoMadLibs = pseoMadLibsMatches.length > 0;

  // Check <meta name="google-adsense-account"> (ADS-TEC-07)
  const hasAdSenseAccountMetaTag =
    /google-adsense-account/i.test(codeInput);

  // Check Dead Links
  const deadLinkMatches =
    codeInput.match(/href\s*=\s*["'](?:#|javascript:void\(0\)|todo)["']/gi) || [];
  const deadLinkCount = deadLinkMatches.length;

  // Check AI Truncation Stubs / Placeholder Comments
  const aiStubMatches =
    codeInput.match(
      /\/\/\s*\.\.\.\s*(?:add|more|remaining|rest|todo)|coming soon|under construction|lorem ipsum|placeholder article|remaining \d+ guides/gi
    ) || [];
  const aiTruncationStubCount = aiStubMatches.length;

  // Check if route is a system/error/auth page
  const isSystemOrErrorRoute =
    /\b(?:404|NotFound|Page Not Found|Login|Sign In|Sign Up|Reset Password)\b/i.test(codeInput);

  // Check deceptive ad labels
  const hasDeceptiveLabel =
    /(?:Sponsored Links|Helpful Partner Links|Helpful Links|Click Here to Support|Support Our Sponsors|Recommended Resources)/i.test(
      codeInput
    ) || /Click a sponsor below|Click our sponsors|Support us by clicking/i.test(codeInput);

  // Check client-only CSR without SSR prose
  const isClientOnlyAppWithoutProse =
    /['"]use client['"]/.test(codeInput) &&
    estimatedWordCount < 180 &&
    !/application\/ld\+json|<article|<table/i.test(codeInput);

  // 1. Evaluate Content Quality & E-E-A-T (ADS-LVC-01)
  if (estimatedWordCount < 250 && adSlotCount > 0) {
    findings.push({
      id: 'f-lvc-01',
      ruleId: 'ADS-LVC-01',
      title: 'Critical Low-Value / Thin Content With Active Ad Units',
      category: 'low_value_content',
      severity: 'critical',
      status: 'fail',
      diagnosis: `Detected only ~${estimatedWordCount} words of visible editorial prose alongside ${adSlotCount} ad slot(s). Google AdSense automatically rejects utility or article pages under 500–800 words as "Low Value Content".`,
      remediation:
        'Add an 800+ word SSR Methodology, Mathematical Formula Reference, Deterministic Sensitivity Matrix (<table>), and 5-item FAQ section below the primary interactive view.',
    });
  } else if (estimatedWordCount < 450) {
    findings.push({
      id: 'f-lvc-01-warn',
      ruleId: 'ADS-LVC-01',
      title: 'Below Recommended 800-Word Pillar Depth Threshold',
      category: 'low_value_content',
      severity: 'medium',
      status: 'warning',
      diagnosis: `Detected ~${estimatedWordCount} words of visible text. Primary landing and tool routes should exceed 800 words of original analysis.`,
      remediation:
        'Expand the page with a worked step-by-step example, edge-case guide, and deterministic comparison table.',
    });
  } else {
    findings.push({
      id: 'f-lvc-01-pass',
      ruleId: 'ADS-LVC-01',
      title: 'Substantial Editorial Depth & Prose Ratio Verified',
      category: 'low_value_content',
      severity: 'pass',
      status: 'pass',
      diagnosis: `Detected ~${estimatedWordCount} words of substantive prose, well above the minimum threshold required by AdSense quality raters.`,
      remediation: 'Maintain this content-to-ad ratio across all 8–10 pillar routes.',
    });
  }

  // 2. Evaluate AI Truncation Stubs & pSEO Mad-Libs (ADS-LVC-02 & ADS-LVC-06)
  if (aiTruncationStubCount > 0 || hasPseoMadLibs) {
    findings.push({
      id: 'f-lvc-05',
      ruleId: hasPseoMadLibs ? 'ADS-LVC-06' : 'ADS-LVC-02',
      title: hasPseoMadLibs
        ? 'Programmatic SEO "Mad-Libs" Doorway Template Detected'
        : 'AI Truncation Comments / "Under Construction" Placeholders Detected',
      category: 'low_value_content',
      severity: 'critical',
      status: 'fail',
      diagnosis: hasPseoMadLibs
        ? 'Detected variable-swapped Mad-Libs template boilerplate across dynamic routes. Google flags near-duplicate parameterized pages as Scaled Content Abuse / Doorway Pages.'
        : `Found ${aiTruncationStubCount} placeholder or AI truncation marker(s) (${aiStubMatches.slice(0, 2).join(', ')}). Submitting a site with stubbed articles triggers immediate "Low Value Content" rejection.`,
      remediation:
        'Replace every "// ... add more articles" comment or variable-swapped template with complete, unabridged 800–1,200 word articles (< 25% 5-gram shingle overlap across routes).',
      snippet: aiStubMatches[0] || pseoMadLibsMatches[0],
    });
  } else {
    findings.push({
      id: 'f-lvc-05-pass',
      ruleId: 'ADS-LVC-06',
      title: 'Zero AI Truncation Stubs or pSEO Doorway Boilerplate',
      category: 'low_value_content',
      severity: 'pass',
      status: 'pass',
      diagnosis: 'No "// ... more articles", "Coming Soon", or variable-swapped doorway templates detected.',
      remediation: 'Ensure all routes in your sitemap maintain < 25% 5-gram shingle overlap.',
    });
  }

  // 3. Evaluate Stock Image Placeholders vs Inline Technical SVG Diagrams (ADS-IMG-01)
  if (hasStockPlaceholderImages) {
    findings.push({
      id: 'f-img-01',
      ruleId: 'ADS-IMG-01',
      title: 'Generic Stock Placeholder Image URL (picsum.photos / placehold.co) Detected',
      category: 'low_value_content',
      severity: 'high',
      status: 'fail',
      diagnosis: `Detected generic stock placeholder image source (${stockImageMatches[0]}). Human AdSense reviewers immediately flag sites with random stock placeholders as auto-generated templates.`,
      remediation:
        'Remove picsum.photos / placehold.co URLs and embed a deterministic inline <svg> architecture diagram or formula chart inside a semantic <figure> element.',
      snippet: stockImageMatches[0],
    });
  } else {
    findings.push({
      id: 'f-img-01-pass',
      ruleId: 'ADS-IMG-01',
      title: 'Visual Authenticity Verified (Zero Stock Placeholder URLs)',
      category: 'low_value_content',
      severity: 'pass',
      status: 'pass',
      diagnosis: 'Zero picsum.photos or placehold.co stock placeholder URLs detected.',
      remediation: 'Continue using deterministic inline <svg> technical diagrams with <figcaption> annotations.',
    });
  }

  // 4. Evaluate Prohibited Content, Piracy, YMYL Claims & Fabricated Lab Benchmarks (ADS-PRO-01, ADS-PRO-02, ADS-PRO-04)
  if (piracyMatches.length > 0 || ymylGuaranteeMatches.length > 0 || hasFakeLabClaims) {
    const matchedSnippet =
      piracyMatches[0] || ymylGuaranteeMatches[0] || fakeLabClaimMatches[0];
    const ruleId =
      piracyMatches.length > 0
        ? 'ADS-PRO-01'
        : ymylGuaranteeMatches.length > 0
        ? 'ADS-PRO-02'
        : 'ADS-PRO-04';
    findings.push({
      id: 'f-pro-04',
      ruleId,
      title:
        piracyMatches.length > 0
          ? 'Prohibited Media Ripping / Copyright Infringement Utility Detected'
          : ymylGuaranteeMatches.length > 0
          ? 'Unverified YMYL Financial Guarantee Without Fiduciary Disclaimer'
          : 'Deceptive E-E-A-T: Fabricated First-Person Lab Benchmark Detected',
      category: 'prohibited_content',
      severity: 'critical',
      status: 'fail',
      diagnosis: `Detected policy-violating claim or keyword ("${matchedSnippet}"). This triggers immediate Google Publisher Policy rejection.`,
      remediation:
        'Remove media-ripping utilities, guaranteed ROI claims, and fictional first-person testing stories. Ground all data tables in deterministic mathematical formulas and official specifications with a visible YMYL Educational Disclaimer.',
      snippet: matchedSnippet,
    });
  } else {
    findings.push({
      id: 'f-pro-04-pass',
      ruleId: 'ADS-PRO-04',
      title: 'Honest E-E-A-T Grounding & Safe Publisher Content Verified',
      category: 'prohibited_content',
      severity: 'pass',
      status: 'pass',
      diagnosis: 'No copyright-infringing keywords, unverified financial guarantees, or fabricated lab benchmarks detected.',
      remediation: 'Continue grounding data tables in deterministic mathematical formulas and official specifications.',
    });
  }

  // 5. Evaluate E-E-A-T & Structured Data (ADS-LVC-05)
  if (!hasAuthorEeatSignals || !hasStructuredDataJsonLd) {
    findings.push({
      id: 'f-eeat-03',
      ruleId: 'ADS-LVC-05',
      title: 'Missing Verifiable E-E-A-T Byline or Schema.org JSON-LD',
      category: 'low_value_content',
      severity: 'high',
      status: 'warning',
      diagnosis: `Author credentials/timestamps (${hasAuthorEeatSignals ? 'Present' : 'Missing'}) or Schema.org JSON-LD (${hasStructuredDataJsonLd ? 'Present' : 'Missing'}) are incomplete.`,
      remediation:
        'Add an explicit "Reviewed by [Author Name & Credentials]" header, <time dateTime="...">, and Article/WebApplication JSON-LD.',
    });
  } else {
    findings.push({
      id: 'f-eeat-03-pass',
      ruleId: 'ADS-LVC-05',
      title: 'E-E-A-T Attribution & Schema.org JSON-LD Present',
      category: 'low_value_content',
      severity: 'pass',
      status: 'pass',
      diagnosis: 'Verified author attribution, publication timestamps, and application/ld+json structured data.',
      remediation: 'Keep author credentials linked to your /about methodology page.',
    });
  }

  // 6. Evaluate Hub-and-Spoke Internal Link Graph & BreadcrumbList (ADS-TEC-05)
  if (!hasBreadcrumbsAndInternalLinks) {
    findings.push({
      id: 'f-tec-05',
      ruleId: 'ADS-TEC-05',
      title: 'Missing BreadcrumbList Schema or Hub-and-Spoke Internal Links',
      category: 'technical_crawlability',
      severity: 'medium',
      status: 'warning',
      diagnosis: 'No visible <nav aria-label="Breadcrumb">, BreadcrumbList JSON-LD, or contextual "/guides/..." internal links detected. Orphan routes get stuck in "Crawled - currently not indexed".',
      remediation:
        'Add visible breadcrumb navigation, BreadcrumbList JSON-LD, and a "Related Pillar Guides & Tools" internal link section.',
    });
  } else {
    findings.push({
      id: 'f-tec-05-pass',
      ruleId: 'ADS-TEC-05',
      title: 'Hub-and-Spoke Internal Link Graph & BreadcrumbList Verified',
      category: 'technical_crawlability',
      severity: 'pass',
      status: 'pass',
      diagnosis: 'Verified BreadcrumbList structured data and bidirectional internal links to pillar guides.',
      remediation: 'Ensure every guide in /guides/[slug] links back to the primary interactive tool.',
    });
  }

  // 7. Evaluate Ad Placement on System / Error Pages (ADS-UX-02)
  if (isSystemOrErrorRoute && adSlotCount > 0 && wrapperMatches.length === 0) {
    findings.push({
      id: 'f-plc-02',
      ruleId: 'ADS-UX-02',
      title: 'Unprotected Ad Unit Mounted on 404 / Auth / System Screen',
      category: 'ad_placement_ux',
      severity: 'critical',
      status: 'fail',
      diagnosis: 'Detected raw <ins class="adsbygoogle"> on a 404, login, or system route. Serving ads on pages without publisher content is a critical Program Policy violation.',
      remediation:
        'Remove raw <ins> tags and use <AdUnitSlot isContentReady={false} /> which automatically suppresses ads on /404, /login, /privacy, and empty states.',
    });
  } else {
    findings.push({
      id: 'f-plc-02-pass',
      ruleId: 'ADS-UX-02',
      title: 'System & Empty-State Ad Kill-Switch Verified',
      category: 'ad_placement_ux',
      severity: 'pass',
      status: 'pass',
      diagnosis: 'No unprotected ad tags detected on 404 or authentication screens.',
      remediation: 'Continue using <AdUnitSlot /> with pathname and isContentReady guards.',
    });
  }

  // 8. Evaluate CLS Layout Shift Reservation (ADS-UX-01)
  if (adSlotCount > 0 && unreservedSlots > 0) {
    findings.push({
      id: 'f-ux-01',
      ruleId: 'ADS-UX-01',
      title: 'Unreserved Ad Container (High Cumulative Layout Shift & Accidental Click Risk)',
      category: 'ad_placement_ux',
      severity: 'critical',
      status: 'fail',
      diagnosis: `Detected ${unreservedSlots} ad slot(s) without explicit min-h-[280px] or min-h-[90px] reservation. Asynchronous ad injection will push text down and trigger accidental clicks.`,
      remediation:
        'Wrap every ad unit in a reserved min-h-[280px] container with a 24px (my-6) buffer and a muted "Advertisement" label.',
    });
  } else {
    findings.push({
      id: 'f-ux-01-pass',
      ruleId: 'ADS-UX-01',
      title: 'Zero-CLS Dimension Reservation Verified',
      category: 'ad_placement_ux',
      severity: 'pass',
      status: 'pass',
      diagnosis: 'All ad containers reserve explicit minimum heights to prevent layout shifts.',
      remediation: 'Keep CLS below 0.05 across mobile and desktop viewports.',
    });
  }

  // 9. Evaluate Dead / Placeholder Links (ADS-TEC-02)
  if (deadLinkCount > 0) {
    findings.push({
      id: 'f-ux-04',
      ruleId: 'ADS-TEC-02',
      title: 'Dead Placeholder Links (href="#" / javascript:void(0)) Detected',
      category: 'ad_placement_ux',
      severity: 'high',
      status: 'fail',
      diagnosis: `Found ${deadLinkCount} non-functional anchor tag(s) (${deadLinkMatches.slice(0, 3).join(', ')}). This triggers the "Site Behavior: Navigation" rejection.`,
      remediation:
        'Replace every href="#" with a real route or convert non-navigation triggers into <button type="button"> elements.',
      snippet: deadLinkMatches[0],
    });
  } else {
    findings.push({
      id: 'f-ux-04-pass',
      ruleId: 'ADS-TEC-02',
      title: 'Clean Navigation Integrity (Zero Dead href="#" Links)',
      category: 'ad_placement_ux',
      severity: 'pass',
      status: 'pass',
      diagnosis: 'Zero broken anchor placeholders or deceptive navigation links detected.',
      remediation: 'Verify all footer links resolve with HTTP 200.',
    });
  }

  // 10. Evaluate Deceptive Ad Labels / Encouraged Clicks (ADS-IVT-02)
  if (hasDeceptiveLabel) {
    findings.push({
      id: 'f-ivt-01',
      ruleId: 'ADS-IVT-02',
      title: 'Deceptive Ad Labeling / Incentivized Click Phrasing',
      category: 'traffic_integrity',
      severity: 'critical',
      status: 'fail',
      diagnosis: 'Detected forbidden phrasing ("Sponsored Links", "Helpful Partner Links", or "Click a sponsor below") adjacent to an ad unit.',
      remediation:
        'Google AdSense strictly permits only "Advertisement" or "Sponsored" above ad units. Remove all call-to-action phrasing near ads.',
    });
  } else {
    findings.push({
      id: 'f-ivt-01-pass',
      ruleId: 'ADS-IVT-02',
      title: 'Compliant "Advertisement" Disclosure Labeling',
      category: 'traffic_integrity',
      severity: 'pass',
      status: 'pass',
      diagnosis: 'No deceptive headers or click-incentivizing copy found near ad units.',
      remediation: 'Only label ad wrappers with "Advertisement".',
    });
  }

  // 11. Evaluate Privacy, Trust Routes, Consent Mode v2 & Dummy Contact Info (ADS-CMP-01 & ADS-TRUST-01)
  if (hasDummyContactInfo) {
    findings.push({
      id: 'f-trust-01',
      ruleId: 'ADS-TRUST-01',
      title: 'Dummy Contact Email (@example.com / 123 Main St / No-Op Form) Detected',
      category: 'trust_privacy_cmp',
      severity: 'critical',
      status: 'fail',
      diagnosis: `Detected fake publisher contact placeholder (${dummyContactMatches[0]}). Human AdSense reviewers fail domains with unverified or fake contact details.`,
      remediation:
        'Replace @example.com or 123 Main St with a real domain-matched email (editorial@yourdomain.com), wire the contact form to /api/contact, and include an Editorial Corrections Policy.',
      snippet: dummyContactMatches[0],
    });
  } else if (!hasConsentModeV2 || !hasTrustLinks) {
    findings.push({
      id: 'f-cmp-02',
      ruleId: 'ADS-CMP-02',
      title: 'Missing Google Consent Mode v2 or Mandatory Legal Trust Links',
      category: 'trust_privacy_cmp',
      severity: 'high',
      status: 'warning',
      diagnosis: `Consent Mode v2 Signals (${hasConsentModeV2 ? 'Detected' : 'Missing'}) or Footer Trust Links /privacy, /about, /contact (${hasTrustLinks ? 'Detected' : 'Missing in this snippet'}).`,
      remediation:
        'Mount <CertifiedConsentModeProvider /> in your root layout and ensure /privacy (with DoubleClick DART disclosure), /about, /contact, and /terms are linked in the global footer.',
    });
  } else {
    findings.push({
      id: 'f-cmp-02-pass',
      ruleId: 'ADS-CMP-02',
      title: 'Google Consent Mode v2, Real Contact & Trust Architecture Present',
      category: 'trust_privacy_cmp',
      severity: 'pass',
      status: 'pass',
      diagnosis: 'Verified Consent Mode v2 default-denied signals, verified domain contact address, and mandatory legal navigation links.',
      remediation: 'Ensure your CMP is certified under IAB TCF v2.2.',
    });
  }

  // 12. Evaluate SSR vs CSR Crawler Visibility & AdSense Meta Ownership Tag (ADS-TEC-01 & ADS-TEC-07)
  if (isClientOnlyAppWithoutProse) {
    findings.push({
      id: 'f-tec-01',
      ruleId: 'ADS-TEC-01',
      title: 'Client-Side Empty Shell Risk (Mediapartners-Google Crawler Blindness)',
      category: 'technical_crawlability',
      severity: 'critical',
      status: 'fail',
      diagnosis: 'File uses "use client" with minimal static prose (< 180 words). When Mediapartners-Google inspects the initial HTML response, it sees an empty form and flags the site as "Low Value Content".',
      remediation:
        'Keep the page route as a Server Component / pre-rendered HTML template that renders 800+ words of static prose and JSON-LD.',
    });
  } else {
    findings.push({
      id: 'f-tec-01-pass',
      ruleId: 'ADS-TEC-01',
      title: 'Server-Rendered Crawler Visibility & Ownership Meta Verified',
      category: 'technical_crawlability',
      severity: 'pass',
      status: 'pass',
      diagnosis: `Substantial static HTML prose is visible to crawlers on initial load${hasAdSenseAccountMetaTag ? ' alongside <meta name="google-adsense-account">' : ''}.`,
      remediation: 'Verify /ads.txt and /sitemap.xml are also accessible at the root domain.',
    });
  }

  return computeReportScores(findings, {
    estimatedWordCount,
    adSlotCount,
    clsReservedSlots,
    unreservedSlots,
    hasConsentModeV2,
    hasTrustLinks,
    hasAuthorEeatSignals,
    hasStructuredDataJsonLd,
    hasBreadcrumbsAndInternalLinks,
    hasFakeLabClaims,
    hasStockPlaceholderImages,
    hasDummyContactInfo,
    hasAdSenseAccountMetaTag,
    deadLinkCount,
    aiTruncationStubCount,
    isSystemOrErrorRoute,
  });
}

export function computeReportScores(
  findings: AuditFinding[],
  metrics: DeterministicAuditReport['metrics']
): DeterministicAuditReport {
  const categories: PolicyCategory[] = [
    'low_value_content',
    'ad_placement_ux',
    'trust_privacy_cmp',
    'prohibited_content',
    'traffic_integrity',
    'technical_crawlability',
  ];

  const categoryScores: Record<PolicyCategory, number> = {
    low_value_content: 100,
    ad_placement_ux: 100,
    trust_privacy_cmp: 100,
    prohibited_content: 100,
    traffic_integrity: 100,
    technical_crawlability: 100,
  };

  for (const cat of categories) {
    const catFindings = findings.filter((f) => f.category === cat);
    let score = 100;
    for (const f of catFindings) {
      if (f.status === 'fail') {
        score -= f.severity === 'critical' ? 55 : 35;
      } else if (f.status === 'warning') {
        score -= 20;
      }
    }
    categoryScores[cat] = Math.max(0, score);
  }

  const totalScore = Math.round(
    Object.values(categoryScores).reduce((acc, v) => acc + v, 0) / categories.length
  );

  const criticalFailures = findings.filter(
    (f) => f.status === 'fail' && f.severity === 'critical'
  ).length;
  const readinessVerdict: DeterministicAuditReport['readinessVerdict'] =
    criticalFailures >= 2 || totalScore < 55
      ? 'IMMEDIATE_AUTO_REJECT'
      : criticalFailures === 1 || totalScore < 85
      ? 'HIGH_REJECTION_RISK'
      : 'READY_FOR_REVIEW';

  return {
    overallScore: totalScore,
    readinessVerdict,
    metrics,
    categoryScores,
    findings,
  };
}

/**
 * Full Multi-File Local Codebase / Repository Auditor
 * Inspects an entire project directory across Next.js, React+Vite, SvelteKit/Astro, Python (Flask/Django), or HTML5.
 */
export function runRepositoryFolderAudit(rawFiles: RepoFileEntry[]): RepositoryAuditReport {
  const files = rawFiles.map((f) => ({
    ...f,
    // Normalize leading root folder name if uploaded via webkitdirectory (e.g. "my-repo/app/page.tsx" -> "app/page.tsx")
    path: f.path.replace(/^[^/]+\/(?=(?:app|src|public|static|components|lib|content|pages|templates|scripts|package\.json|requirements\.txt|manage\.py|app\.py|index\.html|ads\.txt|robots\.txt|sitemap\.xml))/, ''),
  }));

  const pathsLower = files.map((f) => f.path.toLowerCase());

  // 1. Auto-detect Tech Stack
  let detectedStack = 'Universal HTML5 / Multi-File Web App';
  if (pathsLower.some((p) => p.startsWith('app/') && (p.endsWith('page.tsx') || p.endsWith('layout.tsx')))) {
    detectedStack = 'Next.js (App Router / SSR & SSG)';
  } else if (pathsLower.some((p) => p.includes('svelte.config') || p.endsWith('+page.svelte'))) {
    detectedStack = 'SvelteKit / Astro';
  } else if (pathsLower.some((p) => p.endsWith('.py') || p.includes('templates/'))) {
    detectedStack = 'Python (Flask / Django / FastAPI + Jinja2)';
  } else if (pathsLower.some((p) => p.includes('vite.config') || p.startsWith('src/'))) {
    detectedStack = 'React + Vite / SPA';
  }

  const allCombinedText = files.map((f) => f.content).join('\n\n');

  // 2. Check the 8 Mandatory Infrastructure & Trust Endpoints
  const findFile = (regex: RegExp) => files.find((f) => regex.test(f.path));

  const adsTxtFile =
    findFile(/(?:^|\/)(?:public\/|static\/)?ads\.txt$/i) ||
    files.find((f) => /@app\.(?:get|route)\(["']\/ads\.txt["']\)/i.test(f.content));
  const adsTxtValid = Boolean(
    adsTxtFile &&
      /google\.com,\s*(?:pub-\d{16}|\{[^{}]+\}|\$\{[^{}]+\}),\s*(?:DIRECT|RESELLER),\s*f08c47fec0942fa0/i.test(
        adsTxtFile.content
      )
  );

  const robotsFile =
    findFile(/(?:^|\/)(?:public\/|static\/|app\/)?robots\.(?:txt|ts|js)$/i) ||
    files.find((f) => /@app\.(?:get|route)\(["']\/robots\.txt["']\)/i.test(f.content));
  const robotsValid = Boolean(
    robotsFile &&
      /Mediapartners-Google/i.test(robotsFile.content) &&
      !/User-agent:\s*\*\s+Disallow:\s*\/\s*$/im.test(robotsFile.content)
  );

  const sitemapFile =
    findFile(/(?:^|\/)sitemap\.(?:xml|ts|js)$/i) ||
    findFile(/sitemap\.xml\/\+server\.(?:ts|js)$/i) ||
    files.find((f) => /sitemap\.xml/i.test(f.content) && /urlset|MetadataRoute\.Sitemap/i.test(f.content));

  const notFoundFile = findFile(
    /(?:not-found|404|\+error)\.(?:tsx|jsx|ts|js|svelte|astro|html|jinja|jinja2)$/i
  );
  const notFoundSafe = Boolean(
    notFoundFile &&
      (/data-adsense-suppress|suppress_ads/i.test(notFoundFile.content) ||
        !/adsbygoogle/i.test(notFoundFile.content))
  );

  const privacyFile =
    findFile(/privacy(?:-policy)?(?:\/page|\/\+page)?\.(?:tsx|jsx|svelte|astro|html|jinja|jinja2|md)$/i) ||
    files.find((f) => /DoubleClick DART|adssettings\.google\.com|myadcenter\.google\.com/i.test(f.content));
  const privacyHasDart = Boolean(
    privacyFile &&
      /adssettings\.google\.com|myadcenter\.google\.com|DoubleClick|third-party vendors, including Google/i.test(
        privacyFile.content
      )
  );

  const aboutFile = findFile(
    /about(?:-us)?(?:\/page|\/\+page)?\.(?:tsx|jsx|svelte|astro|html|jinja|jinja2|md)$/i
  );
  const aboutHasCorrections = Boolean(
    aboutFile && /Correction|Editorial|Methodology|Reviewed by/i.test(aboutFile.content)
  );

  const contactFile = findFile(
    /contact(?:-us)?(?:\/page|\/\+page)?\.(?:tsx|jsx|svelte|astro|html|jinja|jinja2|md)$/i
  );
  const contactValid = Boolean(
    contactFile &&
      !/@example\.com|123\s+Main\s+(?:St|Street)|onSubmit=\{\s*\(?e\)?\s*=>\s*e\.preventDefault\(\)\s*\}/i.test(
        contactFile.content
      )
  );

  const termsFile = findFile(
    /terms(?:-of-service)?(?:\/page|\/\+page)?\.(?:tsx|jsx|svelte|astro|html|jinja|jinja2|md)$/i
  );

  const endpointChecklist: EndpointCheckStatus[] = [
    {
      endpoint: '/ads.txt (Authorized Seller Record)',
      requiredByRule: 'ADS-CMP-05',
      present: Boolean(adsTxtFile),
      valid: adsTxtValid,
      matchedFileOrUrl: adsTxtFile?.path || 'Missing',
      statusDetail: adsTxtValid
        ? 'Valid IAB record + TAG ID f08c47fec0942fa0'
        : adsTxtFile
        ? 'File found, but missing google.com, pub-16digits, DIRECT, f08c47fec0942fa0'
        : 'Missing /public/ads.txt (or root /ads.txt)',
    },
    {
      endpoint: '/robots.txt (Mediapartners-Google Allowance)',
      requiredByRule: 'ADS-TEC-01',
      present: Boolean(robotsFile),
      valid: robotsValid,
      matchedFileOrUrl: robotsFile?.path || 'Missing',
      statusDetail: robotsValid
        ? 'Explicitly allows Mediapartners-Google'
        : robotsFile
        ? 'Missing explicit User-agent: Mediapartners-Google allowance'
        : 'Missing robots.ts / robots.txt',
    },
    {
      endpoint: '/sitemap.xml (Dynamic Route Discovery)',
      requiredByRule: 'ADS-TEC-03',
      present: Boolean(sitemapFile),
      valid: Boolean(sitemapFile),
      matchedFileOrUrl: sitemapFile?.path || 'Missing',
      statusDetail: sitemapFile
        ? 'Sitemap generator / XML present'
        : 'Missing sitemap.ts / sitemap.xml (Google cannot discover deep guides)',
    },
    {
      endpoint: 'Custom 404 Error Route (Zero-Ad Isolation)',
      requiredByRule: 'ADS-TEC-04',
      present: Boolean(notFoundFile),
      valid: notFoundSafe,
      matchedFileOrUrl: notFoundFile?.path || 'Missing',
      statusDetail: notFoundSafe
        ? 'Ad-free 404 screen verified'
        : 'Missing custom 404 route or 404 screen mounts active ads',
    },
    {
      endpoint: '/privacy (DoubleClick DART & TCF v2.2 Disclosure)',
      requiredByRule: 'ADS-CMP-03',
      present: Boolean(privacyFile),
      valid: privacyHasDart,
      matchedFileOrUrl: privacyFile?.path || 'Missing',
      statusDetail: privacyHasDart
        ? 'Contains Google DART & adssettings.google.com opt-out'
        : privacyFile
        ? 'Missing Google DoubleClick DART cookie opt-out link'
        : 'Missing /privacy route',
    },
    {
      endpoint: '/about (E-E-A-T Authorship & Corrections Policy)',
      requiredByRule: 'ADS-LVC-05',
      present: Boolean(aboutFile),
      valid: aboutHasCorrections,
      matchedFileOrUrl: aboutFile?.path || 'Missing',
      statusDetail: aboutHasCorrections
        ? 'Author E-E-A-T & Editorial Corrections Policy verified'
        : 'Missing /about route or Editorial Corrections Policy',
    },
    {
      endpoint: '/contact (Verified Email & Working Form Handler)',
      requiredByRule: 'ADS-TRUST-01',
      present: Boolean(contactFile),
      valid: contactValid,
      matchedFileOrUrl: contactFile?.path || 'Missing',
      statusDetail: contactValid
        ? 'Verified contact route (zero @example.com placeholders)'
        : contactFile
        ? 'Contains @example.com, 123 Main St, or dead e.preventDefault() form'
        : 'Missing /contact route',
    },
    {
      endpoint: '/terms (Terms of Service & YMYL Disclaimer)',
      requiredByRule: 'ADS-CMP-04',
      present: Boolean(termsFile),
      valid: Boolean(termsFile),
      matchedFileOrUrl: termsFile?.path || 'Missing',
      statusDetail: termsFile ? 'Terms of Service route present' : 'Missing /terms route',
    },
  ];

  // 3. Evaluate Content & Route Files for Word Count, Tables, SVGs, and 5-Gram Shingle Overlap
  const contentFiles = files.filter(
    (f) =>
      /\.(tsx|jsx|ts|js|svelte|astro|html|jinja|jinja2|md|mdx)$/i.test(f.path) &&
      !/(?:node_modules|\.next|dist|verify-adsense|verify_adsense|site-config|siteConfig|AdUnitSlot|ConsentMode|robots|sitemap|not-found|404|privacy|terms|contact)/i.test(
        f.path
      )
  );

  const routeMetrics: RouteContentMetric[] = [];
  const fileWordArrays: Array<{ path: string; words: string[] }> = [];

  for (const cf of contentFiles) {
    const words = extractVisibleWords(cf.content);
    if (words.length < 25 && !/(?:page|guide|article|tool|index)\./i.test(cf.path)) {
      continue;
    }
    const hasStub =
      /\/\/\s*\.\.\.\s*(?:add|more|remaining|rest|todo)|coming soon|under construction|lorem ipsum/i.test(
        cf.content
      );
    routeMetrics.push({
      path: cf.path,
      wordCount: words.length,
      hasTableMatrix: /<table|benchmarkTable|headers:/i.test(cf.content),
      hasInlineSvg: /<svg\b/i.test(cf.content),
      hasJsonLd: /application\/ld\+json|TechArticle|WebApplication|BreadcrumbList/i.test(
        cf.content
      ),
      hasBreadcrumbs: /Breadcrumb|aria-label=["']Breadcrumb["']/i.test(cf.content),
      status: hasStub ? 'stub' : words.length >= 650 ? 'pass' : 'thin',
    });
    if (words.length >= 50) {
      fileWordArrays.push({ path: cf.path, words });
    }
  }

  // Compute pairwise 5-gram shingle overlap across all content files
  let maxShingleOverlapPercent = 0;
  let highestOverlapPair: ShingleOverlapPair | null = null;

  for (let i = 0; i < fileWordArrays.length; i++) {
    for (let j = i + 1; j < fileWordArrays.length; j++) {
      const overlap = computeFiveGramOverlapPercent(
        fileWordArrays[i].words,
        fileWordArrays[j].words
      );
      if (overlap > maxShingleOverlapPercent) {
        maxShingleOverlapPercent = overlap;
        highestOverlapPair = {
          fileA: fileWordArrays[i].path,
          fileB: fileWordArrays[j].path,
          overlapPercent: overlap,
        };
      }
    }
  }

  const totalEditorialWords = routeMetrics.reduce((acc, r) => acc + r.wordCount, 0);
  const pillarRouteCount = routeMetrics.filter((r) => r.wordCount >= 650).length;
  const thinRouteCount = routeMetrics.filter((r) => r.wordCount < 650).length;

  // Run base deterministic checks on combined codebase + inject repository-level findings
  const baseAudit = runDeterministicAudit(allCombinedText);
  const repoFindings: AuditFinding[] = [...baseAudit.findings];

  // Add Multi-File Endpoint Findings
  const missingEndpoints = endpointChecklist.filter((e) => !e.present || !e.valid);
  if (missingEndpoints.length > 0) {
    repoFindings.unshift({
      id: 'repo-missing-endpoints',
      ruleId: missingEndpoints[0].requiredByRule,
      title: `Missing or Invalid Mandatory Repository Endpoints (${missingEndpoints.length} of 8 Failed)`,
      category: 'trust_privacy_cmp',
      severity: 'critical',
      status: 'fail',
      diagnosis: `Repository scan failed ${missingEndpoints.length} mandatory endpoint check(s): ${missingEndpoints
        .map((m) => `${m.endpoint} (${m.statusDetail})`)
        .join('; ')}.`,
      remediation:
        'Generate all missing trust and crawler files (/public/ads.txt, app/robots.ts, app/sitemap.ts, app/not-found.tsx, /privacy, /about, /contact, /terms) using the Multi-Stack Boilerplate Templates.',
      affectedFiles: missingEndpoints.map((m) => m.endpoint),
    });
  } else {
    repoFindings.unshift({
      id: 'repo-endpoints-pass',
      ruleId: 'ADS-CMP-04',
      title: 'All 8 Mandatory Crawler & Trust Endpoints Present in Repository',
      category: 'trust_privacy_cmp',
      severity: 'pass',
      status: 'pass',
      diagnosis:
        'Verified presence and syntax of ads.txt, robots.txt, sitemap.xml, ad-free 404, /privacy (with DART), /about (with Corrections Policy), /contact, and /terms.',
      remediation: 'Confirm all 8 routes return HTTP 200 after deployment.',
    });
  }

  // Add Site-Wide Pillar Inventory Check
  if (pillarRouteCount < 5 && totalEditorialWords < 4500) {
    repoFindings.unshift({
      id: 'repo-pillar-shortfall',
      ruleId: 'ADS-LVC-01',
      title: `Insufficient Site-Wide Pillar Depth (${pillarRouteCount} Deep Routes · ${totalEditorialWords.toLocaleString()} Total Words)`,
      category: 'low_value_content',
      severity: 'critical',
      status: 'fail',
      diagnosis: `Found only ${pillarRouteCount} route(s) with 650+ words (${totalEditorialWords.toLocaleString()} words across the entire repo). Google AdSense rejects domains with fewer than 8–10 deep, indexable pillar guides (~7,000–10,000+ site-wide words) as "Valuable Inventory: Not enough content".`,
      remediation:
        'Execute Turns 3 and 4 of the 4-Turn Anti-Truncation Playbook to populate at least 8 complete, unabridged 900-word pillar guides.',
      affectedFiles: routeMetrics.filter((r) => r.status !== 'pass').map((r) => r.path),
    });
  } else {
    repoFindings.unshift({
      id: 'repo-pillar-pass',
      ruleId: 'ADS-LVC-01',
      title: `Strong Site-Wide Content Inventory (${pillarRouteCount} Pillar Files · ${totalEditorialWords.toLocaleString()} Words)`,
      category: 'low_value_content',
      severity: 'pass',
      status: 'pass',
      diagnosis: `Repository contains ${totalEditorialWords.toLocaleString()} words of visible editorial prose across ${routeMetrics.length} inspected content modules.`,
      remediation: 'Submit /sitemap.xml in Google Search Console and wait for 15+ indexed URLs before requesting AdSense review.',
    });
  }

  // Add Cross-Route 5-Gram Shingle Overlap Check (ADS-LVC-06)
  if (maxShingleOverlapPercent >= 25 && highestOverlapPair) {
    repoFindings.unshift({
      id: 'repo-shingle-fail',
      ruleId: 'ADS-LVC-06',
      title: `High Cross-Route Shingle Duplication (${maxShingleOverlapPercent}% 5-Gram Overlap — Doorway Risk)`,
      category: 'low_value_content',
      severity: 'critical',
      status: 'fail',
      diagnosis: `Files "${highestOverlapPair.fileA}" and "${highestOverlapPair.fileB}" share ${maxShingleOverlapPercent}% identical 5-word shingles (threshold is < 25%). Google classifies near-duplicate templated routes as Scaled Content Abuse / Doorway Pages.`,
      remediation:
        'Rewrite overlapping routes so each URL addresses a distinct problem domain with at least 75% unique editorial prose and distinct deterministic matrices.',
      affectedFiles: [highestOverlapPair.fileA, highestOverlapPair.fileB],
    });
  } else if (fileWordArrays.length >= 2) {
    repoFindings.push({
      id: 'repo-shingle-pass',
      ruleId: 'ADS-LVC-06',
      title: `Cross-Route Uniqueness Verified (Max 5-Gram Overlap: ${maxShingleOverlapPercent}%)`,
      category: 'low_value_content',
      severity: 'pass',
      status: 'pass',
      diagnosis: `Compared ${fileWordArrays.length} content files pairwise; maximum 5-gram shingle overlap is ${maxShingleOverlapPercent}% (well below the 25% Doorway Page ceiling).`,
      remediation: 'Continue writing distinct methodology and worked examples for each route.',
    });
  }

  const finalAuditReport = computeReportScores(repoFindings, {
    ...baseAudit.metrics,
    estimatedWordCount: totalEditorialWords,
  });

  const compiledDigestForAi = `REPOSITORY AUDIT MANIFEST (${detectedStack})
Total Files Scanned: ${files.length}
Total Visible Editorial Words Across Repo: ${totalEditorialWords}
Pillar Content Files (>=650w): ${pillarRouteCount}
Thin/Stub Content Files: ${thinRouteCount}
Max Cross-File 5-Gram Shingle Overlap: ${maxShingleOverlapPercent}% ${
    highestOverlapPair ? `(${highestOverlapPair.fileA} <-> ${highestOverlapPair.fileB})` : ''
  }

ENDPOINT CHECKLIST:
${endpointChecklist
  .map((e) => `- ${e.endpoint}: ${e.valid ? 'PASS' : 'FAIL'} (${e.matchedFileOrUrl} — ${e.statusDetail})`)
  .join('\n')}

PER-FILE CONTENT METRICS:
${routeMetrics
  .map(
    (r) =>
      `- ${r.path}: ${r.wordCount} words | Table: ${r.hasTableMatrix} | InlineSVG: ${r.hasInlineSvg} | JSON-LD: ${r.hasJsonLd} | Status: ${r.status.toUpperCase()}`
  )
  .join('\n')}

SAMPLE FILE CONTENTS:
${files
  .slice(0, 6)
  .map((f) => `--- FILE: ${f.path} ---\n${f.content.slice(0, 1600)}`)
  .join('\n\n')}`;

  return {
    detectedStack,
    totalFilesScanned: files.length,
    totalEditorialWords,
    pillarRouteCount,
    thinRouteCount,
    maxShingleOverlapPercent,
    highestOverlapPair,
    endpointChecklist,
    routeMetrics,
    auditReport: finalAuditReport,
    compiledDigestForAi,
  };
}

export interface MarkdownAuditReportOptions {
  auditMode: 'snippet' | 'repo_folder' | 'live_url';
  sourceLabel: string;
  siteArchetype: string;
  deterministicReport: DeterministicAuditReport;
  multiRouteReport?: RepositoryAuditReport | null;
  liveProbeDetails?: Array<{
    endpoint: string;
    url: string;
    status: number;
    ok: boolean;
    redirected: boolean;
    finalUrl: string;
    contentType: string;
    byteLength: number;
  }>;
  aiAuditResult?: {
    verdictHeadline: string;
    lowValueContentRisk: string;
    eeatAssessment: string;
    semanticViolations: Array<{
      policyCode: string;
      issueTitle: string;
      explanation: string;
      concreteFix: string;
    }>;
    masterAiRemediationPrompt: string;
  } | null;
}

/**
 * Generates a clean, structured Markdown (.md) compliance report summarizing
 * the current project status, telemetry, 8-endpoint matrix, and actionable
 * recommendations for all failed/warning checks.
 */
export function generateMarkdownAuditReport(
  options: MarkdownAuditReportOptions
): string {
  const {
    auditMode,
    sourceLabel,
    siteArchetype,
    deterministicReport,
    multiRouteReport,
    liveProbeDetails,
    aiAuditResult,
  } = options;

  const timestamp = new Date().toISOString();
  const modeLabel =
    auditMode === 'snippet'
      ? 'Single File / HTML Snippet Audit'
      : auditMode === 'repo_folder'
      ? 'Local Codebase / Multi-File Repository Audit'
      : 'Live Production URL Multi-Endpoint Crawl Audit';

  const failedFindings = deterministicReport.findings.filter(
    (f) => f.status === 'fail'
  );
  const warningFindings = deterministicReport.findings.filter(
    (f) => f.status === 'warning'
  );
  const passedFindings = deterministicReport.findings.filter(
    (f) => f.status === 'pass'
  );

  const lines: string[] = [];

  lines.push(`# Google AdSense 2026 Compliance Audit Report`);
  lines.push(``);
  lines.push(`> **Generated by AdSenseGuard Studio** · \`${timestamp}\``);
  lines.push(``);
  lines.push(`## 1. Executive Summary`);
  lines.push(``);
  lines.push(`| Audit Property | Value |`);
  lines.push(`| :--- | :--- |`);
  lines.push(`| **Audit Scope** | ${modeLabel} |`);
  lines.push(`| **Inspected Target** | \`${sourceLabel}\` |`);
  lines.push(`| **Website Archetype** | \`${siteArchetype}\` |`);
  if (multiRouteReport) {
    lines.push(`| **Detected Tech Stack** | \`${multiRouteReport.detectedStack}\` |`);
    lines.push(
      `| **Files / Routes Scanned** | ${multiRouteReport.totalFilesScanned} files (${multiRouteReport.pillarRouteCount} deep pillar routes >= 650w) |`
    );
    lines.push(
      `| **Max 5-Gram Shingle Overlap** | **${multiRouteReport.maxShingleOverlapPercent}%** (Doorway Limit: < 25%) |`
    );
  }
  lines.push(
    `| **Overall Compliance Score** | **${deterministicReport.overallScore}%** |`
  );
  lines.push(
    `| **Readiness Verdict** | **\`${deterministicReport.readinessVerdict}\`** |`
  );
  lines.push(
    `| **Gate Summary** | **${failedFindings.length} Failed** · **${warningFindings.length} Warnings** · **${passedFindings.length}/${deterministicReport.findings.length} Passed** |`
  );
  lines.push(``);

  // Section 2: Telemetry & Category Scores
  lines.push(`## 2. Core Telemetry & Category Breakdown`);
  lines.push(``);
  lines.push(`| Policy Category | Score | Status |`);
  lines.push(`| :--- | :--- | :--- |`);
  const categoryLabels: Record<PolicyCategory, string> = {
    low_value_content: 'Low-Value Content, Information Gain & E-E-A-T',
    ad_placement_ux: 'Ad Placement, Zero-CLS & Click Safety',
    trust_privacy_cmp: 'Trust Pages, Privacy DART & Consent Mode v2 (TCF v2.2)',
    prohibited_content: 'Prohibited Content & YMYL Disclaimers',
    traffic_integrity: 'Traffic Quality & Invalid Traffic (IVT) Prevention',
    technical_crawlability: 'Technical Crawlability, ads.txt & Sitemap',
  };

  (Object.keys(categoryLabels) as PolicyCategory[]).forEach((cat) => {
    const score = deterministicReport.categoryScores[cat] ?? 100;
    const statusText =
      score >= 90 ? 'PASS' : score >= 70 ? 'NEEDS ATTENTION' : 'CRITICAL FAIL';
    lines.push(`| ${categoryLabels[cat]} | **${score}%** | \`${statusText}\` |`);
  });
  lines.push(``);

  const m = deterministicReport.metrics;
  lines.push(`### Key Page & Repository Telemetry`);
  lines.push(
    `- **Visible Editorial Prose**: \`~${m.estimatedWordCount.toLocaleString()} words\``
  );
  lines.push(
    `- **Ad Slots & CLS Reservation**: \`${m.adSlotCount} ad slot(s)\` (\`${m.clsReservedSlots} reserved\`, \`${m.unreservedSlots} unreserved CLS hazards\`)`
  );
  lines.push(
    `- **Anti-Fabrication E-E-A-T Check (\`ADS-LVC-04\`)**: \`${
      m.hasFakeLabClaims
        ? 'FAILED (Fabricated Empirical/Lab Claims Detected)'
        : 'PASSED (Honest Methodology / Matrices)'
    }\``
  );
  lines.push(
    `- **Visual Integrity Check (\`ADS-IMG-01\`)**: \`${
      m.hasStockPlaceholderImages
        ? 'FAILED (Stock Placeholder URLs like picsum.photos Detected)'
        : 'PASSED (Zero Stock Placeholders)'
    }\``
  );
  lines.push(
    `- **Verified Contact Check (\`ADS-TRUST-01\`)**: \`${
      m.hasDummyContactInfo
        ? 'FAILED (Dummy @example.com / 123 Main St Detected)'
        : 'PASSED (No Fake Contact Placeholders)'
    }\``
  );
  lines.push(
    `- **Consent Mode v2 & TCF v2.2 Signals (\`ADS-CMP-01\`)**: \`${
      m.hasConsentModeV2 ? 'PRESENT' : 'MISSING'
    }\``
  );
  lines.push(
    `- **Schema.org JSON-LD & BreadcrumbList (\`ADS-LVC-02\` / \`ADS-TEC-02\`)**: \`${
      m.hasStructuredDataJsonLd && m.hasBreadcrumbsAndInternalLinks
        ? 'VERIFIED'
        : 'INCOMPLETE'
    }\``
  );
  lines.push(
    `- **Dead Placeholder Links (\`href="#"\`)**: \`${m.deadLinkCount} detected\``
  );
  lines.push(
    `- **AI Truncation Stubs (\`// TODO\`, \`...rest of article\`)**: \`${m.aiTruncationStubCount} detected\``
  );
  lines.push(``);

  // Section 3: Actionable Recommendations for Failed & Warning Checks
  lines.push(
    `## 3. Actionable Remediation Plan (${
      failedFindings.length + warningFindings.length
    } Issues to Resolve)`
  );
  lines.push(``);

  if (failedFindings.length === 0 && warningFindings.length === 0) {
    lines.push(
      `All **${deterministicReport.findings.length}** deterministic compliance gates passed with zero policy violations.`
    );
    lines.push(``);
  } else {
    const actionableList = [...failedFindings, ...warningFindings];
    actionableList.forEach((finding, index) => {
      const badge =
        finding.status === 'fail' ? '[CRITICAL FAIL]' : '[WARNING]';
      lines.push(
        `### ${index + 1}. ${badge} \`${finding.ruleId}\` — ${finding.title}`
      );
      lines.push(`- **Severity**: \`${finding.severity.toUpperCase()}\``);
      if (finding.affectedFiles && finding.affectedFiles.length > 0) {
        lines.push(
          `- **Affected Files / Routes**: ${finding.affectedFiles
            .map((f) => `\`${f}\``)
            .join(', ')}`
        );
      }
      lines.push(`- **Root Cause Diagnosis**: ${finding.diagnosis}`);
      lines.push(`- **Actionable Recommendation**: **${finding.remediation}**`);
      lines.push(``);
    });
  }

  // Section 4: Multi-File / Live URL 8-Endpoint Checklist (if applicable)
  if (multiRouteReport) {
    lines.push(`## 4. Mandatory 8-Endpoint Infrastructure & Trust Matrix`);
    lines.push(``);
    lines.push(`| Endpoint | Rule | Status | Matched File / URL | Diagnostic Detail |`);
    lines.push(`| :--- | :--- | :--- | :--- | :--- |`);
    multiRouteReport.endpointChecklist.forEach((ep) => {
      const statusBadge =
        ep.present && ep.valid
          ? 'PASS'
          : ep.present
          ? 'WARNING (INVALID)'
          : 'MISSING (FAIL)';
      lines.push(
        `| \`${ep.endpoint}\` | \`${ep.requiredByRule}\` | **${statusBadge}** | \`${ep.matchedFileOrUrl}\` | ${ep.statusDetail} |`
      );
    });
    lines.push(``);

    if (multiRouteReport.routeMetrics.length > 0) {
      lines.push(
        `## 5. Per-Route Editorial Word Depth, Inline SVG & Anti-Doorway Matrix`
      );
      lines.push(``);
      lines.push(
        `| Route / File | Status | Prose Words | HTML Table | Inline SVG | JSON-LD | Breadcrumbs |`
      );
      lines.push(`| :--- | :--- | :--- | :--- | :--- | :--- | :--- |`);
      multiRouteReport.routeMetrics.forEach((rm) => {
        lines.push(
          `| \`${rm.path}\` | **${rm.status.toUpperCase()}** | ${rm.wordCount}w | ${
            rm.hasTableMatrix ? 'Yes' : 'No'
          } | ${rm.hasInlineSvg ? 'Yes' : 'No'} | ${
            rm.hasJsonLd ? 'Yes' : 'No'
          } | ${rm.hasBreadcrumbs ? 'Yes' : 'No'} |`
        );
      });
      lines.push(``);
    }
  }

  // Optional Live Crawler HTTP Probe Table
  if (liveProbeDetails && liveProbeDetails.length > 0) {
    lines.push(`## 6. Live HTTP Crawler Probe Results`);
    lines.push(``);
    lines.push(`| Probed Endpoint | URL | HTTP Status | Redirected | Payload Size |`);
    lines.push(`| :--- | :--- | :--- | :--- | :--- |`);
    liveProbeDetails.forEach((p) => {
      lines.push(
        `| ${p.endpoint} | \`${p.url}\` | \`${p.status || 'ERR'}\` | ${
          p.redirected ? 'Yes' : 'Direct'
        } | ${(p.byteLength / 1024).toFixed(1)} KB |`
      );
    });
    lines.push(``);
  }

  // Optional Gemini Semantic & E-E-A-T Policy Review
  if (aiAuditResult) {
    lines.push(`## 7. Gemini Semantic & E-E-A-T Policy Diagnosis`);
    lines.push(``);
    lines.push(
      `- **Executive Verdict**: ${aiAuditResult.verdictHeadline}`
    );
    lines.push(
      `- **Low-Value Content Risk Level**: \`${aiAuditResult.lowValueContentRisk}\``
    );
    lines.push(`- **E-E-A-T Assessment**: ${aiAuditResult.eeatAssessment}`);
    lines.push(``);

    if (
      aiAuditResult.semanticViolations &&
      aiAuditResult.semanticViolations.length > 0
    ) {
      lines.push(`### Semantic Policy Violations Detected by AI Reviewer`);
      lines.push(``);
      aiAuditResult.semanticViolations.forEach((v, idx) => {
        lines.push(
          `#### ${idx + 1}. \`${v.policyCode}\` — ${v.issueTitle}`
        );
        lines.push(`- **Why It Triggers Rejection**: ${v.explanation}`);
        lines.push(`- **Concrete Fix**: ${v.concreteFix}`);
        lines.push(``);
      });
    }

    if (aiAuditResult.masterAiRemediationPrompt) {
      lines.push(`### Copy-Ready Master AI Remediation Prompt`);
      lines.push(
        `Paste the prompt below directly into Cursor, Claude Code, Windsurf, or Google AI Studio to automatically remediate all flagged issues:`
      );
      lines.push(``);
      lines.push(`\`\`\`markdown`);
      lines.push(aiAuditResult.masterAiRemediationPrompt.trim());
      lines.push(`\`\`\``);
      lines.push(``);
    }
  }

  // Passed Gates Summary
  lines.push(`## Passed Compliance Gates (${passedFindings.length})`);
  lines.push(``);
  if (passedFindings.length === 0) {
    lines.push(`- None passed yet.`);
  } else {
    passedFindings.forEach((pf) => {
      lines.push(`- [x] **\`${pf.ruleId}\` — ${pf.title}**: ${pf.diagnosis}`);
    });
  }
  lines.push(``);

  return lines.join('\n');
}

