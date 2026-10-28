'use client';

import React, {useState, useMemo, useEffect, useRef, useCallback} from 'react';
import * as d3 from 'd3';
import {
  FolderGit2,
  GitBranch,
  Maximize2,
  Move,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {ADSENSE_POLICY_RULES} from '@/lib/adsense-policies';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  shortCode: string;
  column: 0 | 1 | 2; // 0 = Project Structure, 1 = Core Policy Pillar, 2 = AdSense Review Outcome
  row: number; // 0..5 vertical position slot
  layerLabel: string;
  category: 'content' | 'navigation' | 'ux_cls' | 'privacy_cmp';
  summary: string;
  projectFiles: string[];
  diagnosticQuestion: string;
  remediationRule: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  impactWeight: 'critical' | 'high' | 'moderate';
  description: string;
}

export interface FailureSimulation {
  id: string;
  label: string;
  subtitle: string;
  triggeredNodes: string[];
  outcomeVerdict: string;
}

export const KNOWLEDGE_GRAPH_NODES: GraphNode[] = [
  // COLUMN 0: PROJECT STRUCTURE & CODE ARTIFACTS
  {
    id: 'proj-tool-routes',
    label: 'Tool & Guide Pages',
    shortCode: 'app/tools & /guides',
    column: 0,
    row: 0,
    layerLabel: 'Project Route Layer',
    category: 'content',
    summary:
      'Public interactive calculators, converters, and article routes evaluated by Mediapartners-Google for word depth and Information Gain.',
    projectFiles: ['app/page.tsx', 'app/tools/[slug]/page.tsx', 'app/guides/[slug]/page.tsx'],
    diagnosticQuestion: 'Does every route render >= 800 words + empirical benchmark tables in initial SSR HTML?',
    remediationRule: 'ADS-LVC-01 & ADS-LVC-03: Pair every interactive tool with an 800w+ methodology article and empirical comparison table.',
  },
  {
    id: 'proj-content-modules',
    label: 'Content Store & Authors',
    shortCode: 'content/guides/*.ts',
    column: 0,
    row: 1.4,
    layerLabel: 'Data & E-E-A-T Layer',
    category: 'content',
    summary:
      'Standalone content modules, author credentials, publication dates, and Schema.org TechArticle JSON-LD metadata.',
    projectFiles: ['content/guides/*.ts', 'content/authors.ts', 'app/about/page.tsx'],
    diagnosticQuestion: 'Are articles stored in dedicated unabridged files rather than 100-word LLM array stubs?',
    remediationRule: 'ADS-LVC-02 & ADS-LVC-05: Ban 100w array stubs; require named author bios and <time> timestamps.',
  },
  {
    id: 'proj-navigation-sitemap',
    label: 'Navigation, Sitemap & 404',
    shortCode: 'sitemap.ts & not-found.tsx',
    column: 0,
    row: 2.8,
    layerLabel: 'Crawler & Routing Layer',
    category: 'navigation',
    summary:
      'Header/footer link integrity, dynamic XML sitemap generation, SSG static params, and ad-free 404 error screens.',
    projectFiles: ['app/sitemap.ts', 'app/robots.ts', 'app/not-found.tsx', 'components/Navbar.tsx'],
    diagnosticQuestion: 'Can Googlebot discover 15–25+ routes via /sitemap.xml with zero href="#" dead links or ads on 404s?',
    remediationRule: 'ADS-TEC-02, ADS-TEC-03 & ADS-TEC-04: Zero href="#" links, full SSG sitemap, and data-adsense-suppress on 404s.',
  },
  {
    id: 'proj-ad-containers',
    label: 'Ad Slot DOM Wrappers',
    shortCode: 'CompliantAdSlot.tsx',
    column: 0,
    row: 4.1,
    layerLabel: 'Monetization DOM Layer',
    category: 'ux_cls',
    summary:
      'CLS-reserved <ins class="adsbygoogle"> wrappers, 150px click-safety buffers, and localhost Invalid Traffic (IVT) guards.',
    projectFiles: ['components/CompliantAdSlot.tsx'],
    diagnosticQuestion: 'Does every ad slot reserve min-h-[280px] outside <form> tags and block live impressions on localhost?',
    remediationRule: 'ADS-UX-01, ADS-UX-02 & ADS-IVT-01: Reserve explicit height (0.00 CLS) and isolate ads from interactive controls.',
  },
  {
    id: 'proj-cmp-trust',
    label: 'CMP, Trust & ads.txt',
    shortCode: 'Consent + /privacy + ads.txt',
    column: 0,
    row: 5.3,
    layerLabel: 'Legal & Consent Layer',
    category: 'privacy_cmp',
    summary:
      'Google-Certified IAB TCF v2.2 CMP (Funding Choices), Consent Mode v2 signals, DoubleClick DART privacy page, and /public/ads.txt.',
    projectFiles: ['components/CertifiedConsentModeProvider.tsx', 'app/privacy/page.tsx', 'public/ads.txt'],
    diagnosticQuestion: 'Are all 4 Consent Mode v2 signals defaulted to denied alongside a Google-Certified TCF v2.2 CMP?',
    remediationRule: 'ADS-CMP-01, ADS-CMP-02 & ADS-CMP-03: Load Google Funding Choices TCF v2.2 + DART cookie opt-out links.',
  },

  // COLUMN 1: CORE ADSENSE POLICY PILLARS
  {
    id: 'pol-data-moat',
    label: 'Original Data Moat & Depth',
    shortCode: 'ADS-LVC-01 / 02 / 03',
    column: 1,
    row: 0.3,
    layerLabel: 'Core Content Policy',
    category: 'content',
    summary:
      'Requires 800+ words per tool/guide, zero LLM token-truncation stubs, and original empirical benchmark tables (Information Gain).',
    projectFiles: ['app/tools/[slug]/page.tsx', 'content/guides/*.ts'],
    diagnosticQuestion: 'Does the page provide unique Information Gain beyond generic textbook formulas?',
    remediationRule: 'Embed empirical benchmark datasets, multi-scenario comparison matrices, and 800+ words of unabridged prose.',
  },
  {
    id: 'pol-eeat-authority',
    label: 'E-E-A-T & Trust Signals',
    shortCode: 'ADS-LVC-05 / ADS-PRO-02',
    column: 1,
    row: 1.6,
    layerLabel: 'Quality Rater Standard',
    category: 'content',
    summary:
      'Experience, Expertise, Authoritativeness, and Trustworthiness: verifiable human authorship, review timestamps, YMYL disclaimers, and /about + /contact transparency.',
    projectFiles: ['app/about/page.tsx', 'app/contact/page.tsx', 'app/guides/[slug]/page.tsx'],
    diagnosticQuestion: 'Can a human reviewer verify who wrote the content, their credentials, and how to contact the publisher?',
    remediationRule: 'Display named author credentials, <time> dates, Schema.org TechArticle JSON-LD, and accessible /about & /contact routes.',
  },
  {
    id: 'pol-nav-crawl',
    label: 'Navigation & Crawl Completeness',
    shortCode: 'ADS-TEC-01 / 02 / 03',
    column: 1,
    row: 2.9,
    layerLabel: 'Technical & Behavioral Policy',
    category: 'navigation',
    summary:
      'Governs how crawlers and users traverse the site: zero dead links (href="#"), no empty category archives, full SSR HTML, and XML sitemap indexing.',
    projectFiles: ['app/sitemap.ts', 'app/robots.ts', 'components/Navbar.tsx'],
    diagnosticQuestion: 'Does every link resolve to a complete, server-rendered page with unique canonical metadata?',
    remediationRule: 'Eliminate all href="#" placeholders, pre-render dynamic routes via generateStaticParams(), and expose /sitemap.xml.',
  },
  {
    id: 'pol-ad-ux-cls',
    label: 'Better Ads, Zero CLS & Click Integrity',
    shortCode: 'ADS-UX-01..05 / IVT-01',
    column: 1,
    row: 4.2,
    layerLabel: 'Placement & Traffic Policy',
    category: 'ux_cls',
    summary:
      'Enforces zero layout shift (CLS <= 0.1), 150px separation from buttons, strict "Advertisement" labels, <30% viewport ad density, and zero ads on 404/login screens.',
    projectFiles: ['components/CompliantAdSlot.tsx', 'app/not-found.tsx'],
    diagnosticQuestion: 'Could an asynchronous ad load shift text or cause a user to accidentally click an ad near a button?',
    remediationRule: 'Wrap ads in min-h-[280px] containers outside <form> blocks and suppress ads on /404, /login, and localhost.',
  },
  {
    id: 'pol-cmp-privacy',
    label: 'EU User Consent (TCF v2.2) & DART',
    shortCode: 'ADS-CMP-01..05',
    column: 1,
    row: 5.3,
    layerLabel: 'Regulatory & Inventory Policy',
    category: 'privacy_cmp',
    summary:
      'Mandates Google-Certified IAB TCF v2.2 CMP, Consent Mode v2 (4 signals), DoubleClick DART cookie disclosure in /privacy, and root /ads.txt.',
    projectFiles: ['components/CertifiedConsentModeProvider.tsx', 'app/privacy/page.tsx', 'public/ads.txt'],
    diagnosticQuestion: 'Does the site pass cryptographic IAB TCF v2.2 tcString signals and disclose Google DART cookies?',
    remediationRule: 'Deploy Google Funding Choices TCF v2.2 message, default Consent Mode v2 to denied, and link myadcenter.google.com in /privacy.',
  },

  // COLUMN 2: GOOGLE ADSENSE REVIEW OUTCOMES & RISKS
  {
    id: 'out-low-value-content',
    label: 'Rejection: "Low Value Content"',
    shortCode: '68% of All Rejections',
    column: 2,
    row: 0.9,
    layerLabel: 'Review Outcome',
    category: 'content',
    summary:
      'Google\'s umbrella rejection triggered when ANY of its upstream dependencies fail: thin utility tools, 100-word LLM array stubs, missing E-E-A-T authorship, missing /about or /privacy pages, or unindexed routes.',
    projectFiles: ['app/page.tsx', 'content/guides/*.ts', 'app/about/page.tsx'],
    diagnosticQuestion: 'Are all 4 upstream pillars (Data Moat, Anti-Truncation, E-E-A-T, and Crawl Completeness) satisfied?',
    remediationRule: 'Requires simultaneous compliance across Content Depth (800w+), Original Data Moat, E-E-A-T Attribution, and Navigation Integrity.',
  },
  {
    id: 'out-site-navigation',
    label: 'Rejection: "Under Construction / Navigation"',
    shortCode: 'Crawler & UX Failure',
    column: 2,
    row: 2.5,
    layerLabel: 'Review Outcome',
    category: 'navigation',
    summary:
      'Triggered when crawlers encounter href="#" links, "Coming soon" text, empty category tags, client-only blank SPAs, or ads firing on 404 error screens.',
    projectFiles: ['components/Navbar.tsx', 'app/not-found.tsx', 'app/sitemap.ts'],
    diagnosticQuestion: 'Are there zero dead links, zero placeholder stubs, and zero ads on 404 routes?',
    remediationRule: 'Replace dead links with working routes or <button> controls, remove empty archives, and isolate app/not-found.tsx.',
  },
  {
    id: 'out-accidental-clicks-ivt',
    label: 'Ban: "Invalid Traffic / Accidental Clicks"',
    shortCode: 'Ad Serving Disabled',
    column: 2,
    row: 4.0,
    layerLabel: 'Enforcement Penalty',
    category: 'ux_cls',
    summary:
      'Severe enforcement penalty caused by unreserved ad containers shifting layout (CLS), ads wedged inside forms next to CTA buttons, or developer self-impressions on localhost.',
    projectFiles: ['components/CompliantAdSlot.tsx'],
    diagnosticQuestion: 'Is live ad serving strictly gated to production domain with 0.00 CLS reservation?',
    remediationRule: 'Enforce min-h-[280px] wrappers, 150px button separation, and strict hostname gating.',
  },
  {
    id: 'out-cmp-revenue-block',
    label: 'Block: "CMP Not Certified / Earnings at Risk"',
    shortCode: 'EEA & Bidder Block',
    column: 2,
    row: 5.3,
    layerLabel: 'Monetization Block',
    category: 'privacy_cmp',
    summary:
      'Ad serving blocked in EEA/UK due to DIY non-TCF cookie banners or programmatic demand blocked due to missing/malformed /public/ads.txt.',
    projectFiles: ['components/CertifiedConsentModeProvider.tsx', 'public/ads.txt'],
    diagnosticQuestion: 'Is a Google-Certified IAB TCF v2.2 CMP active and is /ads.txt returning HTTP 200?',
    remediationRule: 'Activate Google Funding Choices TCF v2.2 message and verify google.com, pub-xxx, DIRECT, f08c47fec0942fa0 in /ads.txt.',
  },
];

export const KNOWLEDGE_GRAPH_EDGES: GraphEdge[] = [
  // Project Structure -> Policy Pillars
  {
    id: 'e1',
    source: 'proj-tool-routes',
    target: 'pol-data-moat',
    relationship: 'Requires 800w+ & Benchmark Tables',
    impactWeight: 'critical',
    description: 'Interactive tool routes without below-the-fold methodology and benchmark tables fail Information Gain checks.',
  },
  {
    id: 'e2',
    source: 'proj-content-modules',
    target: 'pol-data-moat',
    relationship: 'Prevents 100w Array Stubs',
    impactWeight: 'critical',
    description: 'Dedicated content files prevent LLM token-truncation array stubs from creating thin doorway URLs.',
  },
  {
    id: 'e3',
    source: 'proj-content-modules',
    target: 'pol-eeat-authority',
    relationship: 'Supplies Author & JSON-LD',
    impactWeight: 'critical',
    description: 'Named author credentials, <time> dates, and TechArticle schema establish E-E-A-T accountability.',
  },
  {
    id: 'e4',
    source: 'proj-navigation-sitemap',
    target: 'pol-nav-crawl',
    relationship: 'Exposes 15–25+ SSG Routes',
    impactWeight: 'critical',
    description: 'Dynamic sitemap.ts and generateStaticParams allow Mediapartners-Google to discover all site inventory.',
  },
  {
    id: 'e5',
    source: 'proj-navigation-sitemap',
    target: 'pol-ad-ux-cls',
    relationship: 'Suppresses Ads on 404s',
    impactWeight: 'high',
    description: 'app/not-found.tsx sets data-adsense-suppress="true" so crawlers never see ads on broken URLs.',
  },
  {
    id: 'e6',
    source: 'proj-ad-containers',
    target: 'pol-ad-ux-cls',
    relationship: 'Enforces 0.00 CLS & 150px Buffer',
    impactWeight: 'critical',
    description: 'CompliantAdSlot.tsx reserves min-h-[280px] and blocks live impressions on localhost.',
  },
  {
    id: 'e7',
    source: 'proj-cmp-trust',
    target: 'pol-cmp-privacy',
    relationship: 'Provides TCF v2.2 & DART Opt-Out',
    impactWeight: 'critical',
    description: 'CertifiedConsentModeProvider.tsx and /privacy satisfy EU User Consent and DART cookie mandates.',
  },
  {
    id: 'e8',
    source: 'proj-cmp-trust',
    target: 'pol-eeat-authority',
    relationship: 'Verifies Publisher Identity',
    impactWeight: 'high',
    description: 'Accessible /about, /contact, and /privacy routes prove legitimate publisher operations to human reviewers.',
  },

  // Cross-Policy Interdependencies & Policy -> Review Outcomes
  {
    id: 'e9',
    source: 'pol-data-moat',
    target: 'out-low-value-content',
    relationship: 'Primary Trigger (Thin/Commodity)',
    impactWeight: 'critical',
    description: 'Failing content depth or Original Data Moat is the #1 cause of "Low Value Content" rejections.',
  },
  {
    id: 'e10',
    source: 'pol-eeat-authority',
    target: 'out-low-value-content',
    relationship: 'Co-Trigger (Anonymous AI Text)',
    impactWeight: 'critical',
    description: 'Even 1,000-word articles get rejected as "Low Value Content" if they lack E-E-A-T authorship and trust pages.',
  },
  {
    id: 'e11',
    source: 'pol-nav-crawl',
    target: 'out-low-value-content',
    relationship: 'Co-Trigger (Unindexed Routes)',
    impactWeight: 'high',
    description: 'If sitemap.xml or SSG is missing, Google only sees the homepage and rejects for "Valuable Inventory: Not enough content".',
  },
  {
    id: 'e12',
    source: 'pol-nav-crawl',
    target: 'out-site-navigation',
    relationship: 'Direct Trigger (href="#" / 404)',
    impactWeight: 'critical',
    description: 'Dead links (href="#") or "Coming Soon" sections trigger "Site under construction / Difficult navigation".',
  },
  {
    id: 'e13',
    source: 'pol-ad-ux-cls',
    target: 'out-accidental-clicks-ivt',
    relationship: 'Direct Trigger (CLS Jump / Form Ad)',
    impactWeight: 'critical',
    description: 'Unreserved ad slots shifting layout or placed inside <form> blocks cause accidental clicks and IVT bans.',
  },
  {
    id: 'e14',
    source: 'pol-ad-ux-cls',
    target: 'out-site-navigation',
    relationship: 'Co-Trigger (Ads on 404 Screen)',
    impactWeight: 'high',
    description: 'Serving ads on a 404 Not Found or empty search result page triggers a "No publisher content" violation.',
  },
  {
    id: 'e15',
    source: 'pol-cmp-privacy',
    target: 'out-cmp-revenue-block',
    relationship: 'Direct Trigger (Non-TCF / ads.txt)',
    impactWeight: 'critical',
    description: 'Using a DIY non-TCF cookie banner blocks EEA ad serving; missing /ads.txt blocks programmatic bidding.',
  },
];

export const FAILURE_SIMULATIONS: FailureSimulation[] = [
  {
    id: 'sim-none',
    label: 'Nominal Compliant Architecture',
    subtitle: 'All 5 project layers satisfy their policy dependencies.',
    triggeredNodes: [],
    outcomeVerdict: 'All 14 nodes nominal — 0 cascading policy risks detected.',
  },
  {
    id: 'sim-llm-stubs',
    label: 'Simulate: 100-Word LLM Array Stubs',
    subtitle: 'AI puts 15 short 100w summaries in a single array to save tokens.',
    triggeredNodes: [
      'proj-content-modules',
      'proj-tool-routes',
      'pol-data-moat',
      'pol-eeat-authority',
      'out-low-value-content',
    ],
    outcomeVerdict:
      'CASCADE FAILURE: Short array stubs in content/guides/*.ts violate ADS-LVC-02 (Original Data Moat) -> Directly triggers "Low Value Content" rejection across the entire domain.',
  },
  {
    id: 'sim-missing-eeat-nav',
    label: 'Simulate: Missing E-E-A-T & Dead Footer Links',
    subtitle: 'Anonymous articles + href="#" placeholder links in navigation.',
    triggeredNodes: [
      'proj-content-modules',
      'proj-navigation-sitemap',
      'pol-eeat-authority',
      'pol-nav-crawl',
      'out-low-value-content',
      'out-site-navigation',
    ],
    outcomeVerdict:
      'DUAL CASCADE FAILURE: Missing author credentials + href="#" anchors trigger both "Low Value Content" AND "Difficult Site Navigation / Under Construction" rejections.',
  },
  {
    id: 'sim-cls-click-trap',
    label: 'Simulate: Unreserved Ad Inside <form>',
    subtitle: 'Ad unit placed above Calculate button with no min-height reservation.',
    triggeredNodes: [
      'proj-ad-containers',
      'pol-ad-ux-cls',
      'out-accidental-clicks-ivt',
      'out-site-navigation',
    ],
    outcomeVerdict:
      'CRITICAL PENALTY: Unreserved ad slot causes CLS layout shift + accidental fat-finger taps -> Triggers "Encouraging Accidental Clicks" & Invalid Traffic (IVT) suspension.',
  },
  {
    id: 'sim-diy-cookie-banner',
    label: 'Simulate: DIY React Cookie Banner (No TCF v2.2)',
    subtitle: 'Custom React banner without Google-Certified IAB TCF v2.2 tcString.',
    triggeredNodes: ['proj-cmp-trust', 'pol-cmp-privacy', 'out-cmp-revenue-block'],
    outcomeVerdict:
      'EEA MONETIZATION BLOCK: Homemade banner lacks a registered IAB TCF v2.2 CMP ID -> Triggers "CMP Not Certified" error and halts personalized ad serving in Europe/UK.',
  },
];

export function mapRuleCodeToGraphNodeId(ruleCode: string): string {
  const code = ruleCode.trim().toUpperCase();
  if (
    code === 'ADS-LVC-01' ||
    code === 'ADS-LVC-02' ||
    code === 'ADS-LVC-04' ||
    code === 'ADS-LVC-06' ||
    code === 'ADS-IMG-01'
  ) {
    return 'pol-data-moat';
  }
  if (
    code === 'ADS-LVC-03' ||
    code === 'ADS-LVC-05' ||
    code === 'ADS-TRUST-01' ||
    code.startsWith('ADS-PRO-')
  ) {
    return 'pol-eeat-authority';
  }
  if (code.startsWith('ADS-TEC-')) {
    return 'pol-nav-crawl';
  }
  if (code.startsWith('ADS-UX-') || code.startsWith('ADS-IVT-')) {
    return 'pol-ad-ux-cls';
  }
  if (code.startsWith('ADS-CMP-')) {
    return 'pol-cmp-privacy';
  }
  return 'out-low-value-content';
}

interface PolicyKnowledgeGraphProps {
  onNavigateToRule?: (ruleCode: string) => void;
  onNavigateToTemplate?: (templateId: string) => void;
  focusedNodeId?: string | null;
  focusedRuleCode?: string | null;
  onClearFocusedRule?: () => void;
}

const COLUMN_ANCHOR_X: Record<0 | 1 | 2, number> = {
  0: 155,
  1: 500,
  2: 845,
};

function getTargetY(row: number): number {
  return 78 + row * 88;
}

export default function PolicyKnowledgeGraph({
  onNavigateToRule,
  onNavigateToTemplate,
  focusedNodeId,
  focusedRuleCode,
  onClearFocusedRule,
}: PolicyKnowledgeGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    focusedNodeId || 'out-low-value-content'
  );
  const [activeSimulationId, setActiveSimulationId] = useState<string>('sim-none');
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | 'content' | 'navigation' | 'ux_cls' | 'privacy_cmp'
  >('all');
  const [zoomScale, setZoomScale] = useState<number>(1);

  // D3 simulation node coordinates state
  const [nodePositions, setNodePositions] = useState<
    Record<string, {x: number; y: number}>
  >(() => {
    const initial: Record<string, {x: number; y: number}> = {};
    KNOWLEDGE_GRAPH_NODES.forEach((n) => {
      initial[n.id] = {
        x: COLUMN_ANCHOR_X[n.column],
        y: getTargetY(n.row),
      };
    });
    return initial;
  });

  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomGroupRef = useRef<SVGGElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(
    null
  );
  const simulationRef = useRef<d3.Simulation<GraphNode, undefined> | null>(null);
  const simNodesRef = useRef<GraphNode[]>([]);

  useEffect(() => {
    if (focusedNodeId) {
      setSelectedNodeId(focusedNodeId);
      setCategoryFilter('all');
    }
  }, [focusedNodeId]);

  // Initialize D3.js Force Simulation, Zoom, and Node Dragging
  useEffect(() => {
    const simNodes: GraphNode[] = KNOWLEDGE_GRAPH_NODES.map((n) => ({
      ...n,
      x: COLUMN_ANCHOR_X[n.column],
      y: getTargetY(n.row),
    }));
    simNodesRef.current = simNodes;

    const simLinks = KNOWLEDGE_GRAPH_EDGES.map((e) => ({
      ...e,
      source: e.source,
      target: e.target,
    }));

    const simulation = d3
      .forceSimulation<GraphNode>(simNodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, d3.SimulationLinkDatum<GraphNode>>(simLinks)
          .id((d) => d.id)
          .strength(0.08)
      )
      .force(
        'x',
        d3.forceX<GraphNode>((d) => COLUMN_ANCHOR_X[d.column]).strength(0.92)
      )
      .force(
        'y',
        d3.forceY<GraphNode>((d) => getTargetY(d.row)).strength(0.92)
      )
      .force('collide', d3.forceCollide<GraphNode>(44))
      .alphaDecay(0.05)
      .on('tick', () => {
        const updated: Record<string, {x: number; y: number}> = {};
        simNodes.forEach((node) => {
          updated[node.id] = {
            x: Math.max(135, Math.min(865, node.x ?? COLUMN_ANCHOR_X[node.column])),
            y: Math.max(45, Math.min(565, node.y ?? getTargetY(node.row))),
          };
        });
        setNodePositions(updated);
      });

    simulationRef.current = simulation;

    // Attach D3 Zoom to SVG
    if (svgRef.current && zoomGroupRef.current) {
      const svgSelection = d3.select(svgRef.current);
      const groupSelection = d3.select(zoomGroupRef.current);

      const zoomBehavior = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.65, 2.2])
        .filter((event) => {
          // Allow wheel zoom with Ctrl/Meta or pinch, and pan on background drag
          if (event.type === 'wheel') {
            return event.ctrlKey || event.metaKey;
          }
          return !event.button;
        })
        .on('zoom', (event) => {
          groupSelection.attr('transform', event.transform.toString());
          setZoomScale(Number(event.transform.k.toFixed(2)));
        });

      svgSelection.call(zoomBehavior);
      zoomBehaviorRef.current = zoomBehavior;
    }

    return () => {
      simulation.stop();
    };
  }, []);

  // Attach D3 Drag behavior to all rendered node groups
  useEffect(() => {
    if (!zoomGroupRef.current || !simulationRef.current) return;

    const simulation = simulationRef.current;
    const simNodes = simNodesRef.current;

    const dragBehavior = d3
      .drag<SVGGElement, unknown>()
      .on('start', (event, d) => {
        const nodeId = (event.sourceEvent.currentTarget as SVGGElement).getAttribute(
          'data-node-id'
        );
        const simNode = simNodes.find((n) => n.id === nodeId);
        if (!simNode) return;
        if (!event.active) simulation.alphaTarget(0.25).restart();
        simNode.fx = simNode.x;
        simNode.fy = simNode.y;
      })
      .on('drag', (event) => {
        const nodeId = (event.sourceEvent.currentTarget as SVGGElement).getAttribute(
          'data-node-id'
        );
        const simNode = simNodes.find((n) => n.id === nodeId);
        if (!simNode) return;
        simNode.fx = Math.max(135, Math.min(865, event.x));
        simNode.fy = Math.max(45, Math.min(565, event.y));
      })
      .on('end', (event) => {
        const nodeId = (event.sourceEvent.currentTarget as SVGGElement).getAttribute(
          'data-node-id'
        );
        const simNode = simNodes.find((n) => n.id === nodeId);
        if (!simNode) return;
        if (!event.active) simulation.alphaTarget(0);
        // Release fixed constraint so D3 force gently snaps back or stabilizes
        simNode.fx = null;
        simNode.fy = null;
      });

    const nodeSelections = d3
      .select(zoomGroupRef.current)
      .selectAll<SVGGElement, unknown>('g.d3-policy-node');
    nodeSelections.call(dragBehavior);
  }, []);

  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(220)
      .call(zoomBehaviorRef.current.scaleBy, 1.2);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(220)
      .call(zoomBehaviorRef.current.scaleBy, 0.84);
  }, []);

  const handleResetGraphLayout = useCallback(() => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(280)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
    if (simulationRef.current) {
      simNodesRef.current.forEach((n) => {
        n.fx = null;
        n.fy = null;
      });
      simulationRef.current.alpha(0.6).restart();
    }
  }, []);

  const focusedRule = useMemo(
    () =>
      focusedRuleCode
        ? ADSENSE_POLICY_RULES.find((r) => r.code === focusedRuleCode) || null
        : null,
    [focusedRuleCode]
  );

  const activeSimulation = useMemo(
    () =>
      FAILURE_SIMULATIONS.find((s) => s.id === activeSimulationId) ||
      FAILURE_SIMULATIONS[0],
    [activeSimulationId]
  );

  const selectedNode = useMemo(
    () =>
      KNOWLEDGE_GRAPH_NODES.find((n) => n.id === selectedNodeId) ||
      KNOWLEDGE_GRAPH_NODES[0],
    [selectedNodeId]
  );

  // Connected edges and neighbor nodes for the currently selected node
  const connectedEdges = useMemo(
    () =>
      KNOWLEDGE_GRAPH_EDGES.filter(
        (e) => e.source === selectedNodeId || e.target === selectedNodeId
      ),
    [selectedNodeId]
  );

  const connectedNodeIds = useMemo(() => {
    const ids = new Set<string>([selectedNodeId]);
    connectedEdges.forEach((e) => {
      ids.add(e.source);
      ids.add(e.target);
    });
    return ids;
  }, [selectedNodeId, connectedEdges]);

  // D3 cubic Bezier horizontal link generator
  const d3LinkGenerator = useMemo(
    () =>
      d3
        .linkHorizontal<
          {source: [number, number]; target: [number, number]},
          [number, number]
        >()
        .x((d) => d[0])
        .y((d) => d[1]),
    []
  );

  const getNodeCoords = (node: GraphNode) => {
    return (
      nodePositions[node.id] || {
        x: COLUMN_ANCHOR_X[node.column],
        y: getTargetY(node.row),
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Control Bar: Failure Cascade Simulator + Layer Filter */}
      <div className="bg-zinc-950 border border-white/[0.08] rounded-xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <span>D3.js Force-Anchored Policy Knowledge Graph</span>
              <span aria-hidden="true">·</span>
              <span>14 Architectural Nodes · 15 Causal Edges</span>
            </div>
            <h2 className="text-base font-semibold text-white">
              Visualize How &ldquo;Low Value Content&rdquo; Connects to E-E-A-T, Navigation &amp; Review Verdicts
            </h2>
          </div>

          {/* Layer Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-black border border-white/[0.08] rounded-lg">
            {(
              [
                {id: 'all', label: 'All Layers'},
                {id: 'content', label: 'Low-Value & E-E-A-T'},
                {id: 'navigation', label: 'Navigation & Sitemap'},
                {id: 'ux_cls', label: 'Ad UX & CLS'},
                {id: 'privacy_cmp', label: 'TCF v2.2 & Privacy'},
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  categoryFilter === tab.id
                    ? 'bg-white text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {FAILURE_SIMULATIONS.map((sim) => {
            const isSelected = activeSimulationId === sim.id;
            const isNominal = sim.id === 'sim-none';
            return (
              <button
                key={sim.id}
                type="button"
                onClick={() => {
                  setActiveSimulationId(sim.id);
                  if (sim.triggeredNodes.length > 0) {
                    setSelectedNodeId(
                      sim.triggeredNodes[sim.triggeredNodes.length - 1]
                    );
                  }
                }}
                className={`text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? isNominal
                      ? 'bg-emerald-950/30 border-emerald-500/60 text-white'
                      : 'bg-rose-950/30 border-rose-500/70 text-white'
                    : 'bg-black border-white/[0.07] text-zinc-300 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-semibold leading-snug">
                    {sim.label}
                  </span>
                  {isNominal ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                  {sim.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Simulation Banner */}
        {activeSimulationId !== 'sim-none' && (
          <div className="p-3.5 bg-rose-950/25 border border-rose-500/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5 text-rose-200">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{activeSimulation.outcomeVerdict}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveSimulationId('sim-none')}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-zinc-200 bg-zinc-900 border border-white/10 rounded hover:bg-zinc-800 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Simulation</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive D3.js Knowledge Graph Canvas (Aceternity Pure Dark Grid Backdrop) */}
      <div className="bg-black border border-white/[0.09] rounded-xl overflow-hidden relative">
        {/* Column Headers & D3 Viewport Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-zinc-950/90 px-5 py-3 text-xs font-mono text-zinc-400">
          <div className="grid grid-cols-3 flex-1 min-w-[480px] text-[11px]">
            <div>01. PROJECT FILES &amp; ROUTES</div>
            <div className="text-center">02. CORE ADSENSE POLICY PILLARS</div>
            <div className="text-right">03. GOOGLE REVIEW VERDICTS</div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-zinc-500 mr-2">
              <Move className="w-3 h-3 text-zinc-400" />
              <span>Drag nodes · Click to inspect</span>
            </span>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 rounded bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 py-1 text-[11px] font-mono text-zinc-300 bg-zinc-950 border border-white/[0.07] rounded">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 rounded bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetGraphLayout}
              title="Reset D3 Layout & Zoom"
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-white/10 text-[11px] text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* D3 Graph Viewport */}
        <div className="w-full overflow-x-auto bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px] [color-scheme:dark] [scrollbar-width:thin] [scrollbar-color:#27272a_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:w-0 [&::-webkit-scrollbar-button]:h-0 [&::-webkit-scrollbar-corner]:bg-transparent">
          <svg
            ref={svgRef}
            viewBox="0 0 1000 610"
            className="w-full min-w-[780px] h-auto select-none cursor-grab active:cursor-grabbing"
            role="img"
            aria-label="D3.js AdSense Policy Interdependency Knowledge Graph"
          >
            <defs>
              <marker
                id="arrow-neutral"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#52525b" />
              </marker>
              <marker
                id="arrow-active"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#ffffff" />
              </marker>
              <marker
                id="arrow-danger"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#fb7185" />
              </marker>
            </defs>

            <g ref={zoomGroupRef}>
              {/* Render D3 Cubic Bezier Edges */}
              {KNOWLEDGE_GRAPH_EDGES.map((edge) => {
                const sourceNode = KNOWLEDGE_GRAPH_NODES.find(
                  (n) => n.id === edge.source
                );
                const targetNode = KNOWLEDGE_GRAPH_NODES.find(
                  (n) => n.id === edge.target
                );
                if (!sourceNode || !targetNode) return null;

                const p1 = getNodeCoords(sourceNode);
                const p2 = getNodeCoords(targetNode);

                const startX = p1.x + 125;
                const startY = p1.y;
                const endX = p2.x - 125;
                const endY = p2.y;
                const midX = (startX + endX) / 2;

                const pathData =
                  d3LinkGenerator({
                    source: [startX, startY],
                    target: [endX, endY],
                  }) ||
                  `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

                const isTriggeredInSim =
                  activeSimulation.triggeredNodes.includes(edge.source) &&
                  activeSimulation.triggeredNodes.includes(edge.target);

                const isSelectedEdge =
                  edge.source === selectedNodeId ||
                  edge.target === selectedNodeId;

                const isCategoryDimmed =
                  categoryFilter !== 'all' &&
                  sourceNode.category !== categoryFilter &&
                  targetNode.category !== categoryFilter;

                let strokeColor = '#27272a';
                let strokeWidth = 1.5;
                let marker = 'url(#arrow-neutral)';

                if (isTriggeredInSim) {
                  strokeColor = '#fb7185';
                  strokeWidth = 2.6;
                  marker = 'url(#arrow-danger)';
                } else if (isSelectedEdge) {
                  strokeColor = '#e4e4e7';
                  strokeWidth = 2.2;
                  marker = 'url(#arrow-active)';
                }

                return (
                  <g
                    key={edge.id}
                    style={{opacity: isCategoryDimmed ? 0.15 : 1}}
                    className="transition-opacity duration-200"
                  >
                    <path
                      d={pathData}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={isTriggeredInSim ? '6 4' : undefined}
                      markerEnd={marker}
                    />
                    {(isSelectedEdge || isTriggeredInSim) && (
                      <g>
                        <rect
                          x={midX - 78}
                          y={(startY + endY) / 2 - 10}
                          width={156}
                          height={18}
                          rx={4}
                          fill="#09090b"
                          stroke={isTriggeredInSim ? '#f43f5e' : '#3f3f46'}
                          strokeWidth={1}
                        />
                        <text
                          x={midX}
                          y={(startY + endY) / 2 + 2}
                          textAnchor="middle"
                          fill={isTriggeredInSim ? '#fda4af' : '#d4d4d8'}
                          fontSize="9.5"
                          fontFamily="var(--font-mono), monospace"
                        >
                          {edge.relationship}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Render D3 Force-Simulated Draggable Nodes */}
              {KNOWLEDGE_GRAPH_NODES.map((node) => {
                const {x, y} = getNodeCoords(node);
                const isSelected = node.id === selectedNodeId;
                const isNeighbor = connectedNodeIds.has(node.id);
                const isSimTriggered = activeSimulation.triggeredNodes.includes(
                  node.id
                );
                const isCategoryDimmed =
                  categoryFilter !== 'all' && node.category !== categoryFilter;

                let borderStroke = '#27272a';
                let bgFill = '#09090b';
                let codeColor = '#a1a1aa';

                if (isSimTriggered) {
                  borderStroke = '#f43f5e';
                  bgFill = '#2c0612';
                  codeColor = '#fda4af';
                } else if (isSelected) {
                  borderStroke = '#ffffff';
                  bgFill = '#18181b';
                  codeColor = '#ffffff';
                } else if (isNeighbor) {
                  borderStroke = '#52525b';
                  bgFill = '#0f0f12';
                  codeColor = '#d4d4d8';
                }

                return (
                  <g
                    key={node.id}
                    data-node-id={node.id}
                    transform={`translate(${x - 122}, ${y - 31})`}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{
                      cursor: 'pointer',
                      opacity: isCategoryDimmed ? 0.2 : 1,
                    }}
                    className="d3-policy-node transition-opacity duration-200"
                  >
                    <rect
                      width={244}
                      height={62}
                      rx={8}
                      fill={bgFill}
                      stroke={borderStroke}
                      strokeWidth={isSelected || isSimTriggered ? 2 : 1}
                    />
                    {/* Top metadata line */}
                    <text
                      x={12}
                      y={21}
                      fill={codeColor}
                      fontSize="10"
                      fontFamily="var(--font-mono), monospace"
                    >
                      {node.shortCode}
                    </text>
                    {/* Node status indicator text */}
                    <text
                      x={232}
                      y={21}
                      textAnchor="end"
                      fill={
                        isSimTriggered
                          ? '#fb7185'
                          : node.column === 2
                          ? '#fbbf24'
                          : '#34d399'
                      }
                      fontSize="9.5"
                      fontFamily="var(--font-mono), monospace"
                    >
                      {isSimTriggered
                        ? 'FAIL'
                        : node.column === 0
                        ? 'FILE'
                        : node.column === 1
                        ? 'POLICY'
                        : 'RISK'}
                    </text>
                    {/* Main Node Title */}
                    <text
                      x={12}
                      y={43}
                      fill="#fafafa"
                      fontSize="12"
                      fontWeight="600"
                      fontFamily="var(--font-display), sans-serif"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Selected Node Deep-Dive & Project File Structure Impact Mapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Selected Node Interdependencies */}
        <div className="lg:col-span-7 bg-zinc-950 border border-white/[0.08] rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
            <div>
              <div className="text-xs font-mono text-zinc-400">
                {selectedNode.layerLabel} · {selectedNode.shortCode}
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {selectedNode.label}
              </h3>
            </div>
            {onNavigateToRule && (
              <button
                type="button"
                onClick={() => onNavigateToRule(selectedNode.shortCode.split(' ')[0])}
                className="px-3 py-1.5 text-xs font-medium text-black bg-white rounded-md hover:bg-zinc-200 transition-colors"
              >
                Inspect in Policy Docs
              </button>
            )}
          </div>

          {focusedRule && (
            <div className="p-4 rounded-lg bg-[#11141c] border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-mono text-emerald-400 font-semibold">
                  Jumped via Cmd+K · {focusedRule.code} ({focusedRule.updatedRelease})
                </div>
                {onClearFocusedRule && (
                  <button
                    type="button"
                    onClick={onClearFocusedRule}
                    className="text-[11px] font-mono text-zinc-400 hover:text-white"
                  >
                    Dismiss
                  </button>
                )}
              </div>
              <div className="text-sm font-bold text-white">
                {focusedRule.title}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {focusedRule.aiBuilderDirective}
              </p>
              {onNavigateToRule && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onNavigateToRule(focusedRule.code)}
                    className="text-xs font-mono text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Open Full Code Examples for {focusedRule.code} →
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {selectedNode.summary}
          </p>

          <div className="p-4 bg-black border border-white/[0.07] rounded-lg space-y-2">
            <div className="text-xs font-mono text-zinc-400">
              Audit Verification Question:
            </div>
            <div className="text-xs font-medium text-white">
              {selectedNode.diagnosticQuestion}
            </div>
            <div className="text-xs font-mono text-emerald-400 pt-1">
              Mandate: {selectedNode.remediationRule}
            </div>
          </div>

          {/* Connected Upstream & Downstream Edges */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-zinc-200">
              Connected Policy &amp; Architecture Links ({connectedEdges.length}):
            </div>
            {connectedEdges.map((edge) => {
              const otherId =
                edge.source === selectedNodeId ? edge.target : edge.source;
              const otherNode = KNOWLEDGE_GRAPH_NODES.find(
                (n) => n.id === otherId
              );
              const direction =
                edge.source === selectedNodeId ? 'Downstream Impact' : 'Upstream Cause';
              return (
                <button
                  key={edge.id}
                  type="button"
                  onClick={() => setSelectedNodeId(otherId)}
                  className="w-full text-left p-3.5 bg-black border border-white/[0.07] hover:border-white/25 rounded-lg transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">
                      {direction}: {otherNode?.label} ({otherNode?.shortCode})
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400">
                      {edge.relationship} →
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{edge.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Project File Tree Compliance Risk Mapper */}
        <div className="lg:col-span-5 bg-zinc-950 border border-white/[0.08] rounded-xl p-6 space-y-4">
          <div className="border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <FolderGit2 className="w-3.5 h-3.5 text-white" />
              <span>Repository Risk Topology</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              Project Structure Compliance Map
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Click any file in your Next.js project structure to highlight its governing AdSense policies in the graph.
            </p>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {[
              {
                file: 'app/layout.tsx',
                nodeId: 'proj-cmp-trust',
                templateId: 'certified-tcf-v22-cmp',
                role: 'Consent Mode v2 + Certified TCF v2.2 CMP Init',
              },
              {
                file: 'app/page.tsx & app/tools/[slug]/page.tsx',
                nodeId: 'proj-tool-routes',
                templateId: 'ssg-dynamic-guide-route',
                role: '800w+ Methodology + Original Data Moat Table',
              },
              {
                file: 'content/guides/*.ts',
                nodeId: 'proj-content-modules',
                templateId: 'ssg-dynamic-guide-route',
                role: 'Unabridged 1,000w+ Articles (Zero Array Stubs)',
              },
              {
                file: 'components/CompliantAdSlot.tsx',
                nodeId: 'proj-ad-containers',
                templateId: 'cls-safe-ad-slot',
                role: 'min-h-[280px] Zero-CLS + 150px Buffer + Dev Guard',
              },
              {
                file: 'app/sitemap.ts & app/robots.ts',
                nodeId: 'proj-navigation-sitemap',
                templateId: 'nextjs-sitemap-and-robots',
                role: 'Mediapartners-Google Access & SSG URL Discovery',
              },
              {
                file: 'app/not-found.tsx',
                nodeId: 'proj-navigation-sitemap',
                templateId: 'ad-free-custom-404',
                role: 'data-adsense-suppress="true" (Zero Ads on 404)',
              },
              {
                file: 'app/privacy/page.tsx & app/about/page.tsx',
                nodeId: 'proj-cmp-trust',
                templateId: 'privacy-policy-page',
                role: 'DoubleClick DART Opt-Out & E-E-A-T Authorship',
              },
              {
                file: 'public/ads.txt',
                nodeId: 'proj-cmp-trust',
                templateId: 'ads-txt-and-robots',
                role: 'IAB Authorized Digital Seller Record',
              },
            ].map((item) => {
              const isHighlighted = selectedNode.projectFiles.some((f) =>
                item.file.includes(f.split('/')[1] || f)
              );
              return (
                <div
                  key={item.file}
                  onClick={() => setSelectedNodeId(item.nodeId)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    isHighlighted
                      ? 'bg-zinc-900 border-white/40 text-white'
                      : 'bg-black border-white/[0.06] text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-zinc-100 truncate">
                      {item.file}
                    </span>
                    {onNavigateToTemplate && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToTemplate(item.templateId);
                        }}
                        className="text-[11px] text-zinc-300 hover:text-white underline shrink-0"
                      >
                        Template →
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] font-sans text-zinc-400 mt-1">
                    {item.role}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
