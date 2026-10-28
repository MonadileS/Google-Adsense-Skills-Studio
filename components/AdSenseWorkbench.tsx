'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Database,
  Download,
  FileText,
  FolderOpen,
  GitBranch,
  Globe,
  KeyRound,
  Layers,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Upload,
  XCircle,
} from 'lucide-react';
import {
  ADSENSE_POLICY_RULES,
  AUDIT_PRESET_SCENARIOS,
  POLICY_CATEGORIES,
  PolicyCategory,
} from '@/lib/adsense-policies';
import {
  compileStandaloneSkill,
  FRAMEWORK_METADATA,
  generateBoilerplateTemplates,
  generateFourTurnPlaybook,
  SkillCompilerConfig,
  SupportedFramework,
  TemplateStackVariant,
} from '@/lib/skill-compiler';
import {
  generateMarkdownAuditReport,
  RepoFileEntry,
  RepositoryAuditReport,
  runDeterministicAudit,
  runRepositoryFolderAudit,
} from '@/lib/deterministic-auditor';
import { REPO_AUDIT_PRESET_SCENARIOS } from '@/lib/repo-audit-presets';
import {
  AI_PROVIDER_CATALOG,
  AI_SETTINGS_STORAGE_KEY,
  DEFAULT_MULTI_PROVIDER_SETTINGS,
  getActiveModelForProvider,
  getEnabledKeysForProvider,
  MultiProviderAiSettings,
} from '@/lib/ai-provider-settings';
import AiProviderSettingsModal from '@/components/AiProviderSettingsModal';
import PolicyKnowledgeGraph, {
  KNOWLEDGE_GRAPH_NODES,
  mapRuleCodeToGraphNodeId,
} from '@/components/PolicyKnowledgeGraph';
import {
  SyntaxCodeBlock,
  SyntaxCodeEditor,
} from '@/components/SyntaxHighlightedCode';

const DARK_SCROLLBAR =
  '[color-scheme:dark] [scrollbar-width:thin] [scrollbar-color:#27272a_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:w-0 [&::-webkit-scrollbar-button]:h-0 [&::-webkit-scrollbar-corner]:bg-transparent';

// GitBook-style structured page routing IDs
type DocPageId =
  | 'compiler-quickstart'
  | 'turn-by-turn-playbook'
  | 'launch-readiness'
  | 'knowledge-graph'
  | 'live-auditor'
  | `policy-${PolicyCategory}`
  | `template-${string}`;

interface DocNavItem {
  id: DocPageId;
  title: string;
  section: string;
  subtitle: string;
  badgeText?: string;
}

interface SemanticAuditResponse {
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
}

const DARK_CHECKBOX_CLASS =
  "appearance-none w-4 h-4 shrink-0 rounded-[5px] border border-zinc-700 bg-zinc-950 checked:bg-emerald-400 checked:border-emerald-400 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all cursor-pointer checked:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000000' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3.5 8.5L6.5 11.5L12.5 4.5'/%3E%3C/svg%3E\")] bg-center bg-no-repeat bg-[length:12px_12px]";

const ARCHETYPE_OPTIONS: Array<{
  id: SkillCompilerConfig['siteArchetype'];
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBoxClass: string;
  iconColorClass: string;
}> = [
  {
    id: 'calculator_tool',
    label: 'Interactive Tool / Calculator / Converter',
    description:
      'Enforces 800+ words of SSR mathematical methodology, Deterministic Sensitivity Matrices, and 24px click buffers.',
    icon: Calculator,
    iconBoxClass: 'bg-emerald-500/10 border-emerald-500/25',
    iconColorClass: 'text-emerald-400',
  },
  {
    id: 'editorial_blog',
    label: 'Technical Documentation / Knowledge Portal',
    description:
      'Enforces 8–10 unabridged pillar articles, author credentials, Schema.org Article + BreadcrumbList JSON-LD, and ad pacing.',
    icon: BookOpen,
    iconBoxClass: 'bg-sky-500/10 border-sky-500/25',
    iconColorClass: 'text-sky-400',
  },
  {
    id: 'saas_webapp',
    label: 'Freemium SaaS / Web Application',
    description:
      'Enforces a public crawlable Resource Hub for Mediapartners-Google and zero ad execution inside auth/billing screens.',
    icon: Layers,
    iconBoxClass: 'bg-violet-500/10 border-violet-500/25',
    iconColorClass: 'text-violet-400',
  },
  {
    id: 'directory_database',
    label: 'Curated Dataset / Reference Directory',
    description:
      'Blocks thin CSV/API dumps, requires original comparative analysis, and suppresses ads when filters return < 3 items.',
    icon: Database,
    iconBoxClass: 'bg-amber-500/10 border-amber-500/25',
    iconColorClass: 'text-amber-400',
  },
];

const OFF_CODE_LAUNCH_GATES = [
  {
    id: 'prebuild-script',
    title: '1. Run node scripts/verify-adsense-build.mjs (0 Policy Violations)',
    detail:
      'Execute npm run build locally or in CI. The prebuild gate inspects every route for >= 800 words, zero dead href="#" links, zero picsum.photos or @example.com placeholders, zero fabricated lab claims, and valid /public/ads.txt.',
  },
  {
    id: 'pseo-shingle-uniqueness',
    title: '2. Verify < 25% Shingle Overlap Across Dynamic Routes (Anti-Doorway pSEO Gate)',
    detail:
      'Ensure dynamic [slug] routes cover distinct technical problem domains rather than variable-swapped Mad-Libs permutations (${unitA} to ${unitB}) that trigger Scaled Content Abuse rejections.',
  },
  {
    id: 'inline-svg-diagrams',
    title: '3. Replace All Stock Placeholders (picsum.photos) with Inline Technical <svg> Diagrams',
    detail:
      'Embed deterministic inline <svg> architecture diagrams or formula flowcharts inside <figure> blocks with <figcaption> annotations to maximize visual Information Gain with zero 404 or copyright risk.',
  },
  {
    id: 'verified-contact-editorial',
    title: '4. Verify Functional /contact Endpoint, Real Domain Email & Corrections Policy',
    detail:
      'Confirm /contact submits to /api/contact, displays a real domain-matched email (editorial@yourdomain.com — never @example.com or 123 Main St), and /about includes a dated Editorial Corrections Policy.',
  },
  {
    id: 'gsc-indexed',
    title: '5. Verify >= 15–20 Indexed URLs in Google Search Console Before Applying (Off-Code)',
    detail:
      'Never click "Request Review" in AdSense on a brand-new domain with 0 indexed pages. Submit https://yourdomain.com/sitemap.xml in Google Search Console and wait 2–4 weeks until URL Inspection confirms your Hub-and-Spoke guides are indexed.',
  },
  {
    id: 'tcf-cmp-console',
    title: '6. Activate European (GDPR TCF v2.2) & US State Messages in AdSense Dashboard (Off-Code)',
    detail:
      'Log into Google AdSense -> Privacy & Messaging -> European regulations & US state regulations -> click Create Message and Publish so fundingchoicesmessages.google.com serves a live certified TCF v2.2 banner.',
  },
  {
    id: 'ads-txt-crawl',
    title: '7. Verify <meta name="google-adsense-account"> & /ads.txt HTTP 200 Response',
    detail:
      'Confirm app/layout.tsx outputs <meta name="google-adsense-account" content="ca-pub-xxx"> and curl -I https://yourdomain.com/ads.txt returns HTTP 200 text/plain without multi-hop redirect chains.',
  },
  {
    id: 'zero-paid-traffic',
    title: '8. Zero Paid / Bot "Warmup" Traffic & Restraint on Auto Ads During Review (Off-Code)',
    detail:
      'Never buy cheap social, popunder, or arbitrage traffic during AdSense review (triggers instant IVT account ban). Apply with 100% organic Search traffic and keep Auto Ads off or at low density during initial review.',
  },
];

const INITIAL_CONFIG: SkillCompilerConfig = {
  siteArchetype: 'calculator_tool',
  targetGeo: 'global_eea_us',
  framework: 'universal_auto',
  useProjectOverride: false,
  publisherId: 'pub-4829103948571029',
  domainName: 'quantmetrics.io',
  authorNameAndCredentials: 'Dr. Elena Vance, CFA & Principal Systems Architect',
  enabledCategories: {
    low_value_content: true,
    ad_placement_ux: true,
    trust_privacy_cmp: true,
    prohibited_content: true,
    traffic_integrity: true,
    technical_crawlability: true,
  },
  strictClsBudget: true,
  enforceZeroAdOnSystemPages: true,
  minEditorialWordsOnToolPages: 850,
  exportFormat: 'skill_md',
};

const TEMPLATE_STACK_TABS: Array<{
  id: TemplateStackVariant;
  label: string;
}> = [
  { id: 'nextjs', label: 'Next.js (App Router)' },
  { id: 'react_vite', label: 'React + Vite' },
  { id: 'sveltekit', label: 'SvelteKit / Astro' },
  { id: 'python_jinja', label: 'Python (Flask / Django)' },
  { id: 'universal_html', label: 'Universal HTML5 / JS' },
];

export default function AdSenseWorkbench() {
  // Active GitBook Page ID
  const [activePageId, setActivePageId] = useState<DocPageId>('compiler-quickstart');
  const [sidebarSearch, setSidebarSearch] = useState<string>('');

  // Collapsible Sidebar Groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    policies: true,
    templates: true,
  });

  // 1. Skill Compiler State
  const [config, setConfig] = useState<SkillCompilerConfig>(INITIAL_CONFIG);
  const [activeTemplateStack, setActiveTemplateStack] =
    useState<TemplateStackVariant>('nextjs');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);
  const [checkedLaunchGates, setCheckedLaunchGates] = useState<string[]>([
    'prebuild-script',
    'gsc-indexed',
    'tcf-cmp-console',
  ]);

  // 2. Auditor State (3 Modes: Snippet | Local Codebase Folder | Live Production URL)
  const [auditMode, setAuditMode] = useState<'snippet' | 'repo_folder' | 'live_url'>('snippet');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    AUDIT_PRESET_SCENARIOS[0].id
  );
  const [auditInput, setAuditInput] = useState<string>(
    AUDIT_PRESET_SCENARIOS[0].htmlOrContent
  );

  // Local Codebase / Repository Folder Auditor State
  const [selectedRepoPresetId, setSelectedRepoPresetId] = useState<string>(
    REPO_AUDIT_PRESET_SCENARIOS[0].id
  );
  const [repoFiles, setRepoFiles] = useState<RepoFileEntry[]>(
    REPO_AUDIT_PRESET_SCENARIOS[0].files
  );
  const [repoSourceLabel, setRepoSourceLabel] = useState<string>(
    REPO_AUDIT_PRESET_SCENARIOS[0].name
  );
  const [isReadingFolder, setIsReadingFolder] = useState<boolean>(false);

  // Live Production URL Crawler State
  const [liveUrlInput, setLiveUrlInput] = useState<string>('https://quantmetrics.io');
  const [isCrawlingLiveUrl, setIsCrawlingLiveUrl] = useState<boolean>(false);
  const [liveUrlError, setLiveUrlError] = useState<string | null>(null);
  const [liveUrlReport, setLiveUrlReport] = useState<RepositoryAuditReport | null>(null);
  const [liveProbeDetails, setLiveProbeDetails] = useState<
    Array<{
      endpoint: string;
      url: string;
      status: number;
      ok: boolean;
      redirected: boolean;
      finalUrl: string;
      contentType: string;
      byteLength: number;
    }>
  >([]);
  const [liveCrawledOrigin, setLiveCrawledOrigin] = useState<string | null>(null);

  // Shared Deep AI Semantic Audit & Multi-Provider Settings State
  const [aiSettingsOpen, setAiSettingsOpen] = useState<boolean>(false);
  const [aiSettings, setAiSettings] = useState<MultiProviderAiSettings>(
    DEFAULT_MULTI_PROVIDER_SETTINGS
  );
  const [aiProviderMeta, setAiProviderMeta] = useState<{
    provider: string;
    model: string;
    keySourceUsed: string;
    latencyMs: number;
  } | null>(null);
  const [isRunningAiAudit, setIsRunningAiAudit] = useState<boolean>(false);
  const [aiAuditResult, setAiAuditResult] = useState<SemanticAuditResponse | null>(
    null
  );
  const [aiAuditError, setAiAuditError] = useState<string | null>(null);
  const [showAuditReportPreview, setShowAuditReportPreview] =
    useState<boolean>(false);

  // Load saved Multi-Provider AI Settings from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<MultiProviderAiSettings>;
        setAiSettings((prev) => ({
          ...prev,
          ...parsed,
          selectedModels: {
            ...prev.selectedModels,
            ...(parsed.selectedModels || {}),
          },
          customModelOverrides: {
            ...prev.customModelOverrides,
            ...(parsed.customModelOverrides || {}),
          },
          apiKeys: Array.isArray(parsed.apiKeys) ? parsed.apiKeys : [],
        }));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleUpdateAiSettings = (next: MultiProviderAiSettings) => {
    setAiSettings(next);
    try {
      window.localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  };

  // 3. Global Command Palette (Cmd+K) & Knowledge Graph Deep-Jump State
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState<boolean>(false);
  const [cmdQuery, setCmdQuery] = useState<string>('');
  const [cmdSelectedIndex, setCmdSelectedIndex] = useState<number>(0);
  const [graphFocusedNodeId, setGraphFocusedNodeId] = useState<string | null>(
    null
  );
  const [graphFocusedRuleCode, setGraphFocusedRuleCode] = useState<string | null>(
    null
  );

  // Combined searchable items for the Cmd+K Command Palette (24 Policies + 14 Graph Nodes)
  const commandPaletteItems = useMemo(() => {
    const ruleItems = ADSENSE_POLICY_RULES.map((rule) => {
      const targetNodeId = mapRuleCodeToGraphNodeId(rule.code);
      const targetNode = KNOWLEDGE_GRAPH_NODES.find((n) => n.id === targetNodeId);
      return {
        id: `cmd-rule-${rule.id}`,
        kind: 'policy_rule' as const,
        code: rule.code,
        title: rule.title,
        subtitle: `${rule.rejectionSymptom} · Maps to Graph Node: ${
          targetNode?.label || targetNodeId
        }`,
        category: rule.category,
        targetNodeId,
        ruleCode: rule.code,
        searchText: `${rule.code} ${rule.title} ${rule.rejectionSymptom} ${rule.whyItFails} ${rule.aiBuilderDirective}`.toLowerCase(),
      };
    });

    const nodeItems = KNOWLEDGE_GRAPH_NODES.map((node) => ({
      id: `cmd-node-${node.id}`,
      kind: 'graph_node' as const,
      code: node.shortCode,
      title: node.label,
      subtitle: `${node.layerLabel} · ${node.summary}`,
      category: 'low_value_content' as PolicyCategory,
      targetNodeId: node.id,
      ruleCode: null as string | null,
      searchText: `${node.label} ${node.shortCode} ${node.layerLabel} ${node.summary} ${node.remediationRule}`.toLowerCase(),
    }));

    const all = [...ruleItems, ...nodeItems];
    if (!cmdQuery.trim()) return all;
    const q = cmdQuery.toLowerCase().trim();
    return all.filter((item) => item.searchText.includes(q));
  }, [cmdQuery]);

  // Reset selected index when query changes
  useEffect(() => {
    setCmdSelectedIndex(0);
  }, [cmdQuery]);

  const handleJumpToKnowledgeGraphFromCmd = (item: {
    targetNodeId: string;
    ruleCode: string | null;
  }) => {
    setGraphFocusedNodeId(item.targetNodeId);
    setGraphFocusedRuleCode(item.ruleCode);
    setActivePageId('knowledge-graph');
    setCmdPaletteOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Global Cmd+K / Ctrl+K keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdPaletteOpen((prev) => !prev);
        return;
      }
      if (!cmdPaletteOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setCmdPaletteOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCmdSelectedIndex((prev) =>
          commandPaletteItems.length > 0
            ? (prev + 1) % commandPaletteItems.length
            : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCmdSelectedIndex((prev) =>
          commandPaletteItems.length > 0
            ? (prev - 1 + commandPaletteItems.length) %
              commandPaletteItems.length
            : 0
        );
      } else if (e.key === 'Enter' && commandPaletteItems[cmdSelectedIndex]) {
        e.preventDefault();
        handleJumpToKnowledgeGraphFromCmd(commandPaletteItems[cmdSelectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cmdPaletteOpen, commandPaletteItems, cmdSelectedIndex]);

  // Derived Boilerplate Templates & 4-Turn Playbook
  const boilerplateTemplates = useMemo(
    () => generateBoilerplateTemplates(config),
    [config]
  );

  const fourTurnPlaybook = useMemo(
    () => generateFourTurnPlaybook(config),
    [config]
  );

  // Complete Ordered List of GitBook Pages (for Sidebar + Previous/Next Pagination)
  const allDocPages: DocNavItem[] = useMemo(() => {
    const policyPages: DocNavItem[] = (
      Object.keys(POLICY_CATEGORIES) as PolicyCategory[]
    ).map((catKey) => ({
      id: `policy-${catKey}` as DocPageId,
      title: POLICY_CATEGORIES[catKey].shortLabel,
      section: '2026 Policy Documentation',
      subtitle: POLICY_CATEGORIES[catKey].description,
      badgeText: `${
        ADSENSE_POLICY_RULES.filter((r) => r.category === catKey).length
      } rules`,
    }));

    const templatePages: DocNavItem[] = boilerplateTemplates.map((tpl) => ({
      id: `template-${tpl.id}` as DocPageId,
      title: tpl.title,
      section: 'Production Boilerplates',
      subtitle: tpl.description,
      badgeText: tpl.filename,
    }));

    return [
      {
        id: 'compiler-quickstart',
        title: 'Standalone Skill Compiler',
        section: 'Get Started',
        subtitle:
          'Configure your project profile and compile a standalone 24-rule AdSense compliance skill (SKILL.md, .cursorrules, CLAUDE.md) for any AI coding agent.',
      },
      {
        id: 'turn-by-turn-playbook',
        title: '4-Turn AI Prompt Playbook',
        section: 'Get Started',
        subtitle:
          'Copy-ready Turn 1, Turn 2, Turn 3, and Turn 4 prompts engineered to prevent single-turn LLM token truncation while generating 8+ full-length 900-word pillar guides.',
      },
      {
        id: 'launch-readiness',
        title: 'Launch Readiness Checklist',
        section: 'Get Started',
        subtitle:
          'Mandatory pre-build CI verification, Google Search Console indexing, and TCF v2.2 activation gates before clicking Request Review.',
      },
      {
        id: 'knowledge-graph',
        title: 'Policy Knowledge Graph',
        section: 'Architecture & Diagnostics',
        subtitle:
          'Interactive node-and-edge dependency graph mapping how project routes, E-E-A-T, navigation, and CMP rules cascade into AdSense review verdicts.',
      },
      {
        id: 'live-auditor',
        title: 'Live Pre-Submission Auditor',
        section: 'Architecture & Diagnostics',
        subtitle:
          'Test your HTML, React JSX, or content against deterministic compliance gates (including Anti-Fabrication & BreadcrumbList checks) and Gemini semantic E-E-A-T diagnostics.',
      },
      ...policyPages,
      ...templatePages,
    ];
  }, [boilerplateTemplates]);

  const currentPageIndex = useMemo(
    () => allDocPages.findIndex((p) => p.id === activePageId),
    [allDocPages, activePageId]
  );

  const currentPage = allDocPages[currentPageIndex] || allDocPages[0];
  const prevPage = currentPageIndex > 0 ? allDocPages[currentPageIndex - 1] : null;
  const nextPage =
    currentPageIndex < allDocPages.length - 1
      ? allDocPages[currentPageIndex + 1]
      : null;

  // Derived Compiled Skill Output
  const compiledSkillOutput = useMemo(
    () => compileStandaloneSkill(config),
    [config]
  );

  const compiledStats = useMemo(() => {
    const lines = compiledSkillOutput.split('\n').length;
    const words = compiledSkillOutput.split(/\s+/).filter(Boolean).length;
    const approxTokens = Math.round(words * 1.35);
    return { lines, words, approxTokens };
  }, [compiledSkillOutput]);

  // Derived Deterministic Audit Report (Single Snippet Mode)
  const snippetReport = useMemo(
    () => runDeterministicAudit(auditInput),
    [auditInput]
  );

  // Derived Repository Audit Report (Local Codebase Folder Mode)
  const repoFolderReport = useMemo(
    () => runRepositoryFolderAudit(repoFiles),
    [repoFiles]
  );

  // Unified Active Audit Report across all 3 modes
  const activeMultiRouteReport: RepositoryAuditReport | null =
    auditMode === 'repo_folder'
      ? repoFolderReport
      : auditMode === 'live_url'
      ? liveUrlReport
      : null;

  const deterministicReport =
    activeMultiRouteReport?.auditReport || snippetReport;

  // Derived Markdown Audit Report (.md) summarizing current compliance status & actionable recommendations
  const compiledMarkdownAuditReport = useMemo(() => {
    const activeSourceLabel =
      auditMode === 'snippet'
        ? AUDIT_PRESET_SCENARIOS.find((p) => p.id === selectedPresetId)?.name ||
          'Custom HTML / Code Snippet'
        : auditMode === 'repo_folder'
        ? repoSourceLabel
        : liveCrawledOrigin || liveUrlInput || 'Live Production Domain';

    return generateMarkdownAuditReport({
      auditMode,
      sourceLabel: activeSourceLabel,
      siteArchetype: config.siteArchetype,
      deterministicReport,
      multiRouteReport: activeMultiRouteReport,
      liveProbeDetails: auditMode === 'live_url' ? liveProbeDetails : undefined,
      aiAuditResult,
    });
  }, [
    auditMode,
    selectedPresetId,
    repoSourceLabel,
    liveCrawledOrigin,
    liveUrlInput,
    config.siteArchetype,
    deterministicReport,
    activeMultiRouteReport,
    liveProbeDetails,
    aiAuditResult,
  ]);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback ignored
    }
  };

  const handleDownloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getExportFilename = (
    fmt: SkillCompilerConfig['exportFormat']
  ): string => {
    switch (fmt) {
      case 'skill_md':
        return 'SKILL.md';
      case 'cursorrules':
        return '.cursorrules';
      case 'claude_md':
        return 'CLAUDE.md';
      case 'system_prompt':
        return 'ADSENSE_SYSTEM_PROMPT.md';
    }
  };

  const toggleCategoryInCompiler = (cat: PolicyCategory) => {
    setConfig((prev) => ({
      ...prev,
      enabledCategories: {
        ...prev.enabledCategories,
        [cat]: !prev.enabledCategories[cat],
      },
    }));
  };

  const toggleLaunchGate = (gateId: string) => {
    setCheckedLaunchGates((prev) =>
      prev.includes(gateId) ? prev.filter((id) => id !== gateId) : [...prev, gateId]
    );
  };

  const handleSelectPreset = (presetId: string) => {
    const found = AUDIT_PRESET_SCENARIOS.find((p) => p.id === presetId);
    if (!found) return;
    setSelectedPresetId(found.id);
    setAuditInput(found.htmlOrContent);
    setAiAuditResult(null);
    setAiAuditError(null);
  };

  const handleSelectRepoPreset = (presetId: string) => {
    const found = REPO_AUDIT_PRESET_SCENARIOS.find((p) => p.id === presetId);
    if (!found) return;
    setSelectedRepoPresetId(found.id);
    setRepoFiles(found.files);
    setRepoSourceLabel(found.name);
    setAiAuditResult(null);
    setAiAuditError(null);
  };

  const handleUploadLocalFolder = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsReadingFolder(true);
    setAiAuditResult(null);
    setAiAuditError(null);

    try {
      const ignoredSegments =
        /(^|\/)(node_modules|\.next|\.git|dist|build|out|\.svelte-kit|\.vercel|coverage|__pycache__|venv|\.venv)(\/|$)/i;
      const allowedExt =
        /\.(tsx|ts|jsx|js|mjs|svelte|astro|vue|py|html|htm|md|mdx|json|txt|xml)$/i;

      const entries: RepoFileEntry[] = [];
      const filesArray = Array.from(fileList);

      for (const file of filesArray) {
        const relPath =
          (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
          file.name;
        if (ignoredSegments.test(relPath)) continue;
        if (
          !allowedExt.test(relPath) &&
          !/ads\.txt$|robots\.txt$|sitemap\.xml$/i.test(relPath)
        ) {
          continue;
        }
        if (file.size > 450_000) continue; // skip huge bundles/lockfiles

        const text = await file.text();
        // Strip top-level root folder name if webkitRelativePath starts with "my-repo/..."
        const normalizedPath = relPath.includes('/')
          ? relPath.split('/').slice(1).join('/') || relPath
          : relPath;

        entries.push({
          path: normalizedPath,
          content: text,
        });
        if (entries.length >= 160) break;
      }

      if (entries.length > 0) {
        setRepoFiles(entries);
        setSelectedRepoPresetId('uploaded-local-folder');
        const rootFolderName =
          ((filesArray[0] as File & { webkitRelativePath?: string })
            .webkitRelativePath || '')
            .split('/')[0] || 'Local Uploaded Folder';
        setRepoSourceLabel(
          `${rootFolderName} (${entries.length} inspectable source files)`
        );
      }
    } finally {
      setIsReadingFolder(false);
    }
  };

  const handleCrawlLiveUrl = async (targetUrlOverride?: string) => {
    const urlToCrawl = (targetUrlOverride ?? liveUrlInput).trim();
    if (!urlToCrawl) return;
    setIsCrawlingLiveUrl(true);
    setLiveUrlError(null);
    setAiAuditResult(null);
    setAiAuditError(null);

    try {
      const res = await fetch('/api/audit/live-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToCrawl }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(
          data.error || 'Unable to crawl the specified live URL.'
        );
      }
      setLiveUrlReport(data.repositoryReport);
      setLiveProbeDetails(data.probeDetails || []);
      setLiveCrawledOrigin(data.targetOrigin || urlToCrawl);
    } catch (err: unknown) {
      setLiveUrlError(
        err instanceof Error
          ? err.message
          : 'Failed to crawl live URL endpoints.'
      );
    } finally {
      setIsCrawlingLiveUrl(false);
    }
  };

  const handleRunDeepAiAudit = async () => {
    const contentPayload =
      auditMode === 'snippet'
        ? auditInput
        : activeMultiRouteReport?.compiledDigestForAi || '';

    if (!contentPayload.trim()) return;
    setIsRunningAiAudit(true);
    setAiAuditError(null);

    try {
      const activeProvider = aiSettings.activeProvider;
      const activeModel = getActiveModelForProvider(aiSettings, activeProvider);
      const enabledKeys = getEnabledKeysForProvider(aiSettings, activeProvider);

      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentPayload,
          archetype: config.siteArchetype,
          provider: activeProvider,
          model: activeModel,
          apiKeys: enabledKeys,
          nvidiaNimBaseUrl: aiSettings.nvidiaNimBaseUrl,
          enableAutoKeyFailover: aiSettings.enableAutoKeyFailover,
          useServerEnvFallback: aiSettings.useServerEnvFallback,
          deterministicSummary: {
            auditMode,
            readinessVerdict: deterministicReport.readinessVerdict,
            overallScore: deterministicReport.overallScore,
            metrics: deterministicReport.metrics,
            failedRules: deterministicReport.findings
              .filter((f) => f.status === 'fail' || f.status === 'warning')
              .map((f) => ({
                code: f.ruleId,
                title: f.title,
                diagnosis: f.diagnosis,
              })),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Semantic audit request failed.');
      }
      setAiAuditResult(data.aiAudit);
      if (data.providerMeta) {
        setAiProviderMeta(data.providerMeta);
      }
    } catch (err: unknown) {
      setAiAuditError(
        err instanceof Error ? err.message : 'Unable to complete semantic AI audit.'
      );
    } finally {
      setIsRunningAiAudit(false);
    }
  };

  const navigateToRuleCode = (codePrefix: string) => {
    const matchingRule = ADSENSE_POLICY_RULES.find((r) =>
      r.code.startsWith(codePrefix.trim())
    );
    if (matchingRule) {
      setActivePageId(`policy-${matchingRule.category}`);
    } else {
      setActivePageId('policy-low_value_content');
    }
  };

  const activeRuleCount = useMemo(
    () =>
      ADSENSE_POLICY_RULES.filter((p) => config.enabledCategories[p.category])
        .length,
    [config.enabledCategories]
  );

  // Filter sidebar items when searching
  const matchesSidebarSearch = (title: string, subtitle?: string) => {
    if (!sidebarSearch.trim()) return true;
    const q = sidebarSearch.toLowerCase();
    return (
      title.toLowerCase().includes(q) ||
      (subtitle ? subtitle.toLowerCase().includes(q) : false)
    );
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
      {/* =====================================================================
          STRICT 3-ZONE TOP BAR CONTRACT (ACETERNITY PURE DARK + GITBOOK NAV)
          Zone 1: Single-line Brand Wordmark
          Zone 2: 5 Concise Single-line Navigation Links
          Zone 3: 1 Primary Action Button
      ====================================================================== */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/[0.08] px-6 py-3.5 flex items-center justify-between gap-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActivePageId('compiler-quickstart');
          }}
          style={{ fontFamily: 'var(--font-display), sans-serif' }}
          className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          AdSenseGuard Studio
        </a>

        <nav
          aria-label="Primary Documentation Sections"
          className="hidden md:flex items-center gap-7 text-xs font-medium"
        >
          <button
            type="button"
            onClick={() => setActivePageId('compiler-quickstart')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activePageId === 'compiler-quickstart' ||
              activePageId === 'launch-readiness'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Skill Compiler
          </button>
          <button
            type="button"
            onClick={() => setActivePageId('turn-by-turn-playbook')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activePageId === 'turn-by-turn-playbook'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            4-Turn Playbook
          </button>
          <button
            type="button"
            onClick={() => setActivePageId('knowledge-graph')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activePageId === 'knowledge-graph'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Knowledge Graph
          </button>
          <button
            type="button"
            onClick={() => setActivePageId('live-auditor')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activePageId === 'live-auditor'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Compliance Auditor
          </button>
          <button
            type="button"
            onClick={() => setActivePageId('policy-low_value_content')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activePageId.startsWith('policy-') ||
              activePageId.startsWith('template-')
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Policies ({ADSENSE_POLICY_RULES.length})
          </button>
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setAiSettingsOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-950 border border-white/15 rounded-md hover:border-white/35 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="Configure Google Gemini, Groq LPU, and NVIDIA NIM API Keys & Models"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              AI Keys ({AI_PROVIDER_CATALOG[aiSettings.activeProvider].shortName})
            </span>
            {aiSettings.apiKeys.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono bg-emerald-500/15 text-emerald-300 rounded">
                {aiSettings.apiKeys.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setExportDrawerOpen(true)}
            className="px-4 py-1.5 text-xs font-semibold text-black bg-white rounded-md hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0"
          >
            Export Skill Bundle
          </button>
        </div>
      </header>

      {/* =====================================================================
          GITBOOK 3-COLUMN DOCUMENTATION & WORKBENCH SHELL
          1. Left Hierarchical Sidebar (272px)
          2. Center Focused Documentation & Interactive Canvas (flex-1)
          3. Right Contextual Project Profile & Quick Export Rail (300px on xl)
      ====================================================================== */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex items-start">
        {/* ===================================================================
            LEFT SIDEBAR: GITBOOK HIERARCHICAL TREE NAVIGATION
        ==================================================================== */}
        <aside
          aria-label="Documentation Tree Navigation"
          className="hidden lg:flex flex-col w-[272px] shrink-0 sticky top-[57px] h-[calc(100vh-57px)] border-r border-white/[0.08] bg-zinc-950/50 select-none"
        >
          {/* Sidebar Search Filter + Global Cmd+K Trigger */}
          <div className="p-4 border-b border-white/[0.06] space-y-2">
            <button
              type="button"
              onClick={() => setCmdPaletteOpen(true)}
              className="w-full px-3 py-2 text-xs bg-black border border-white/[0.12] hover:border-white/30 rounded-md text-zinc-300 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <span>Jump to Graph Policy...</span>
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-900 border border-white/10 rounded text-zinc-400">
                ⌘K
              </kbd>
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Filter sidebar tree..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-black border border-white/[0.08] rounded-md text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {/* Scrollable Tree */}
          <div className={`flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs ${DARK_SCROLLBAR}`}>
            {/* GROUP 1: GET STARTED */}
            <div className="space-y-1">
              <div className="px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                Get Started
              </div>
              {[
                {
                  id: 'compiler-quickstart' as DocPageId,
                  label: 'Standalone Skill Compiler',
                  meta: '24 Rules',
                },
                {
                  id: 'turn-by-turn-playbook' as DocPageId,
                  label: '4-Turn AI Prompt Playbook',
                  meta: 'Anti-Stub',
                },
                {
                  id: 'launch-readiness' as DocPageId,
                  label: 'Launch Readiness Checklist',
                  meta: '5 Gates',
                },
              ]
                .filter((item) => matchesSidebarSearch(item.label, item.meta))
                .map((item) => {
                  const isActive = activePageId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActivePageId(item.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-md transition-colors flex items-center justify-between gap-2 ${
                        isActive
                          ? 'bg-zinc-900 text-white font-semibold border border-white/[0.08]'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                        {item.meta}
                      </span>
                    </button>
                  );
                })}
            </div>

            {/* GROUP 2: ARCHITECTURE & DIAGNOSTICS */}
            <div className="space-y-1">
              <div className="px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                Architecture &amp; Diagnostics
              </div>
              {[
                {
                  id: 'knowledge-graph' as DocPageId,
                  label: 'Policy Knowledge Graph',
                  meta: 'Interactive',
                },
                {
                  id: 'live-auditor' as DocPageId,
                  label: 'Live Site & Code Auditor',
                  meta: 'AI + Regex',
                },
              ]
                .filter((item) => matchesSidebarSearch(item.label))
                .map((item) => {
                  const isActive = activePageId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActivePageId(item.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-md transition-colors flex items-center justify-between gap-2 ${
                        isActive
                          ? 'bg-zinc-900 text-white font-semibold border border-white/[0.08]'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                        {item.meta}
                      </span>
                    </button>
                  );
                })}
            </div>

            {/* GROUP 3: 2026 POLICY DOCUMENTATION (EXPANDABLE TREE) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() =>
                  setOpenGroups((prev) => ({ ...prev, policies: !prev.policies }))
                }
                className="w-full px-2.5 pb-1 flex items-center justify-between text-[11px] font-semibold tracking-wider text-zinc-500 uppercase hover:text-zinc-300"
              >
                <span>2026 Policy Reference ({ADSENSE_POLICY_RULES.length})</span>
                {openGroups.policies ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {openGroups.policies && (
                <div className="border-l border-white/[0.08] ml-2.5 pl-2 space-y-0.5">
                  {(Object.keys(POLICY_CATEGORIES) as PolicyCategory[])
                    .filter((catKey) =>
                      matchesSidebarSearch(
                        POLICY_CATEGORIES[catKey].label,
                        POLICY_CATEGORIES[catKey].description
                      )
                    )
                    .map((catKey) => {
                      const pageId = `policy-${catKey}` as DocPageId;
                      const isActive = activePageId === pageId;
                      const count = ADSENSE_POLICY_RULES.filter(
                        (r) => r.category === catKey
                      ).length;
                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => setActivePageId(pageId)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between gap-2 ${
                            isActive
                              ? 'bg-zinc-900 text-white font-semibold border border-white/[0.08]'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                          }`}
                        >
                          <span className="truncate">
                            {POLICY_CATEGORIES[catKey].shortLabel}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 tabular-nums shrink-0">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {/* GROUP 4: PRODUCTION BOILERPLATES (EXPANDABLE TREE) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() =>
                  setOpenGroups((prev) => ({
                    ...prev,
                    templates: !prev.templates,
                  }))
                }
                className="w-full px-2.5 pb-1 flex items-center justify-between text-[11px] font-semibold tracking-wider text-zinc-500 uppercase hover:text-zinc-300"
              >
                <span>Code Boilerplates ({boilerplateTemplates.length})</span>
                {openGroups.templates ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {openGroups.templates && (
                <div className="border-l border-white/[0.08] ml-2.5 pl-2 space-y-0.5">
                  {boilerplateTemplates
                    .filter((tpl) =>
                      matchesSidebarSearch(tpl.title, tpl.filename)
                    )
                    .map((tpl) => {
                      const pageId = `template-${tpl.id}` as DocPageId;
                      const isActive = activePageId === pageId;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setActivePageId(pageId)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between gap-2 ${
                            isActive
                              ? 'bg-zinc-900 text-white font-semibold border border-white/[0.08]'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                          }`}
                        >
                          <span className="truncate">{tpl.filename}</span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Footer Badge (GitBook Style) */}
          <div className="p-3 border-t border-white/[0.08] bg-black">
            <a
              href="/ADSENSE_SKILL.md"
              download="SKILL.md"
              className="w-full px-3 py-2 rounded-lg border border-white/[0.08] bg-zinc-950 hover:border-white/20 flex items-center justify-between text-xs text-zinc-300 transition-colors"
            >
              <span>Download Static SKILL.md</span>
              <Download className="w-3.5 h-3.5 text-zinc-400" />
            </a>
          </div>
        </aside>

        {/* ===================================================================
            CENTER VIEWPORT: GITBOOK DOCUMENTATION PAGE & INTERACTIVE CANVAS
        ==================================================================== */}
        <main className="flex-1 min-w-0 px-6 sm:px-10 lg:px-12 py-8 space-y-8">
          {/* Mobile Page Selector Dropdown */}
          <div className="lg:hidden">
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">
              Navigate Documentation Section:
            </label>
            <select
              value={activePageId}
              onChange={(e) => setActivePageId(e.target.value as DocPageId)}
              className="w-full px-3 py-2 text-xs bg-zinc-950 border border-white/10 rounded-lg text-white"
            >
              {allDocPages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.section} › {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* GitBook Top Breadcrumb & Page Header */}
          <div className="border-b border-white/[0.08] pb-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                <span>AdSenseGuard Docs</span>
                <span aria-hidden="true">›</span>
                <span>{currentPage.section}</span>
                <span aria-hidden="true">›</span>
                <span className="text-white font-medium">{currentPage.title}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCmdPaletteOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-950 border border-white/10 rounded-md hover:bg-zinc-900 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Search Graph Policies</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-black border border-white/10 rounded text-zinc-400">
                    ⌘K
                  </kbd>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(compiledSkillOutput, 'header-quick-copy')
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-950 border border-white/10 rounded-md hover:bg-zinc-900 transition-colors"
                >
                  {copiedId === 'header-quick-copy' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied Active Skill</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copy {getExportFilename(config.exportFormat)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display), sans-serif',
                textWrap: 'balance',
              }}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
            >
              {currentPage.title}
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">
              {currentPage.subtitle}
            </p>
          </div>

          {/* =================================================================
              PAGE 1: STANDALONE SKILL COMPILER & QUICKSTART
          ================================================================== */}
          {activePageId === 'compiler-quickstart' && (
            <div className="space-y-8">
              {/* Step 1: Archetype & Compliance Guards */}
              <div className="bg-zinc-950 border border-white/[0.08] rounded-xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      1. Select Website Archetype &amp; 2026 Compliance Guards
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Configures the structural rules, Deterministic Sensitivity Matrices, CWV non-blocking scripts, and prebuild CI gates injected into your AI skill.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-zinc-400 tabular-nums">
                    {activeRuleCount}/{ADSENSE_POLICY_RULES.length} rules active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ARCHETYPE_OPTIONS.map((item) => {
                    const isSelected = config.siteArchetype === item.id;
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() =>
                          setConfig({ ...config, siteArchetype: item.id })
                        }
                        className={`text-left p-4 rounded-lg border transition-all flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-zinc-900/90 border-white/80 text-white shadow-[0_0_20px_rgba(255,255,255,0.04)]'
                            : 'bg-black border-white/[0.07] text-zinc-300 hover:border-white/20'
                        }`}
                      >
                        {/* Left Colorful Icon Badge */}
                        <div
                          className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${item.iconBoxClass}`}
                        >
                          <IconComponent
                            className={`w-4 h-4 ${item.iconColorClass}`}
                          />
                        </div>

                        {/* Center Title & Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-white">
                              {item.label}
                            </span>

                            {/* Dark-Mode Styled Radio Button Indicator */}
                            <span
                              aria-hidden="true"
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                isSelected
                                  ? 'border-emerald-400 bg-emerald-400/15 shadow-[0_0_8px_rgba(52,211,153,0.35)]'
                                  : 'border-zinc-700 bg-zinc-950'
                              }`}
                            >
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Production Guard Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label
                    className={`flex items-center justify-between gap-3 p-3.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      config.strictClsBudget
                        ? 'bg-zinc-900/60 border-white/20 text-white'
                        : 'bg-black border-white/[0.07] text-zinc-300 hover:border-white/15'
                    }`}
                  >
                    <span>Strict CLS Reservation Budget (&lt;= 0.05 min-h-[280px])</span>
                    <input
                      type="checkbox"
                      checked={config.strictClsBudget}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          strictClsBudget: e.target.checked,
                        })
                      }
                      className={DARK_CHECKBOX_CLASS}
                    />
                  </label>
                  <label
                    className={`flex items-center justify-between gap-3 p-3.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      config.enforceZeroAdOnSystemPages
                        ? 'bg-zinc-900/60 border-white/20 text-white'
                        : 'bg-black border-white/[0.07] text-zinc-300 hover:border-white/15'
                    }`}
                  >
                    <span>System &amp; Thin-State Ad Kill-Switch (404 / Auth / Legal)</span>
                    <input
                      type="checkbox"
                      checked={config.enforceZeroAdOnSystemPages}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          enforceZeroAdOnSystemPages: e.target.checked,
                        })
                      }
                      className={DARK_CHECKBOX_CLASS}
                    />
                  </label>
                </div>
              </div>

              {/* Step 2: Live Compiled Skill Artifact Output */}
              <div className="bg-zinc-950 border border-white/[0.08] rounded-xl overflow-hidden">
                {/* Multi-Stack & Universal / Project-Override Bar */}
                <div className="px-4 py-3 border-b border-white/[0.08] bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      Target Stack:
                    </span>
                    <select
                      value={config.framework}
                      onChange={(e) => {
                        const fw = e.target.value as SupportedFramework;
                        setConfig({ ...config, framework: fw });
                        setActiveTemplateStack(
                          FRAMEWORK_METADATA[fw].defaultVariant
                        );
                      }}
                      className="px-2.5 py-1 text-xs font-mono bg-black border border-white/15 rounded-md text-white focus:outline-none focus:border-emerald-400"
                    >
                      {(
                        Object.keys(FRAMEWORK_METADATA) as SupportedFramework[]
                      ).map((fwKey) => (
                        <option key={fwKey} value={fwKey}>
                          {FRAMEWORK_METADATA[fwKey].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer select-none">
                    <span className="font-mono text-[11px] text-emerald-400">
                      {config.useProjectOverride
                        ? 'Mode: Project-Specific Override'
                        : 'Mode: Universal Fresh-Build (Default)'}
                    </span>
                    <input
                      type="checkbox"
                      checked={config.useProjectOverride}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          useProjectOverride: e.target.checked,
                        })
                      }
                      className={DARK_CHECKBOX_CLASS}
                    />
                  </label>
                </div>

                <div className="p-4 border-b border-white/[0.08] bg-black flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-white/[0.08] rounded-lg">
                    {(
                      [
                        { id: 'skill_md', label: 'SKILL.md' },
                        { id: 'cursorrules', label: '.cursorrules' },
                        { id: 'claude_md', label: 'CLAUDE.md' },
                        { id: 'system_prompt', label: 'System Prompt' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() =>
                          setConfig({ ...config, exportFormat: tab.id })
                        }
                        className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap ${
                          config.exportFormat === tab.id
                            ? 'bg-white text-black font-semibold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(compiledSkillOutput, 'main-compiler-copy')
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 border border-white/10 rounded-md hover:bg-zinc-800 transition-colors"
                    >
                      {copiedId === 'main-compiler-copy' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>
                            Copy {getExportFilename(config.exportFormat)}
                          </span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadFile(
                          compiledSkillOutput,
                          getExportFilename(config.exportFormat)
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-white rounded-md hover:bg-zinc-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>
                        Download {getExportFilename(config.exportFormat)}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="px-5 py-2.5 border-b border-white/[0.06] bg-zinc-950 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-400 tabular-nums">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-white" />
                    <span className="text-white font-semibold">
                      {getExportFilename(config.exportFormat)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{compiledStats.lines} lines</span>
                    <span aria-hidden="true">·</span>
                    <span>{compiledStats.words} words</span>
                    <span aria-hidden="true">·</span>
                    <span>~{compiledStats.approxTokens} tokens</span>
                  </div>
                  <span>Place in project root before your first AI prompt</span>
                </div>

                <SyntaxCodeBlock
                  code={compiledSkillOutput}
                  maxHeightClass="max-h-[680px]"
                />
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE 2: 4-TURN AI PROMPT EXECUTION PLAYBOOK (ANTI-TRUNCATION)
          ================================================================== */}
          {activePageId === 'turn-by-turn-playbook' && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-zinc-950 border border-white/[0.08] space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                  Why 4 Turns Instead of 1 Giant Prompt?
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Asking any LLM to write an entire Next.js app + 4 legal pages + an interactive calculator + 8 full 1,000-word guides (~12,000 words of prose) in a single turn physically exceeds output token caps, forcing the model to write stubbed 80-word articles. Send these <strong>4 sequential prompts</strong> alongside your exported <code>SKILL.md</code> to guarantee zero truncation and 100% AdSense readiness.
                </p>
              </div>

              <div className="space-y-5">
                {fourTurnPlaybook.map((step) => (
                  <div
                    key={step.turnNumber}
                    className="bg-zinc-950 border border-white/[0.08] rounded-xl overflow-hidden"
                  >
                    <div className="p-5 border-b border-white/[0.08] bg-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs font-mono text-zinc-400 tabular-nums">
                          STEP {step.turnNumber} OF 4 · {step.tokenBudgetNote}
                        </div>
                        <h2 className="text-base font-bold text-white">
                          {step.title}
                        </h2>
                        <p className="text-xs text-zinc-400">{step.subtitle}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(step.prompt, `turn-prompt-${step.turnNumber}`)
                        }
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-white rounded-md hover:bg-zinc-200 whitespace-nowrap shrink-0"
                      >
                        {copiedId === `turn-prompt-${step.turnNumber}` ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied Turn {step.turnNumber} Prompt</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Turn {step.turnNumber} Prompt</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-5 space-y-4">
                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                          Turn {step.turnNumber} Verified Deliverables:
                        </div>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-zinc-300">
                          {step.deliverables.map((deliv, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 bg-black p-2.5 rounded border border-white/[0.06]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{deliv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-[#0a0c10] border border-white/[0.08] rounded-lg overflow-hidden">
                        <div className="px-4 py-2 bg-[#11141c] border-b border-white/[0.06] text-[11px] font-mono text-[#7f848e] flex items-center justify-between">
                          <span>PROMPT TO SEND IN TURN {step.turnNumber}</span>
                          <span className="text-[#61afef]">Space Mono · Editor Theme</span>
                        </div>
                        <SyntaxCodeBlock
                          code={step.prompt}
                          showLineNumbers={true}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE 3: ADSENSE POLICY KNOWLEDGE GRAPH
          ================================================================== */}
          {activePageId === 'knowledge-graph' && (
            <PolicyKnowledgeGraph
              focusedNodeId={graphFocusedNodeId}
              focusedRuleCode={graphFocusedRuleCode}
              onClearFocusedRule={() => setGraphFocusedRuleCode(null)}
              onNavigateToRule={(ruleCode) => navigateToRuleCode(ruleCode)}
              onNavigateToTemplate={(tplId) =>
                setActivePageId(`template-${tplId}` as DocPageId)
              }
            />
          )}

          {/* =================================================================
              PAGE 4: LIVE PRE-SUBMISSION COMPLIANCE AUDITOR (3 MODES:
              1. Single File / HTML Snippet
              2. Local Codebase / Repository Folder Audit
              3. Live Production URL Multi-Endpoint Crawler)
          ================================================================== */}
          {activePageId === 'live-auditor' && (
            <div className="space-y-8">
              {/* 3-Mode Audit Switcher Bar */}
              <div className="bg-zinc-950 border border-white/[0.08] rounded-xl p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      Select Pre-Submission Audit Scope
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Inspect a single HTML/JSX file, upload an entire local repository folder (multi-file 5-gram doorway check + 8 endpoints), or crawl a live production URL.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black border border-white/[0.1] rounded-lg">
                    {(
                      [
                        {
                          id: 'snippet' as const,
                          label: '1. Single File / Snippet',
                          icon: Terminal,
                        },
                        {
                          id: 'repo_folder' as const,
                          label: '2. Local Codebase Folder',
                          icon: FolderOpen,
                        },
                        {
                          id: 'live_url' as const,
                          label: '3. Live URL Crawler',
                          icon: Globe,
                        },
                      ] as const
                    ).map((tab) => {
                      const IconComp = tab.icon;
                      const isActive = auditMode === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setAuditMode(tab.id);
                            setAiAuditResult(null);
                            setAiAuditError(null);
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            isActive
                              ? 'bg-white text-black font-semibold'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <IconComp className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* =============================================================
                  MODE 1: SINGLE FILE / HTML SNIPPET INPUT
              ============================================================== */}
              {auditMode === 'snippet' && (
                <div className="bg-zinc-950 border border-white/[0.08] rounded-xl p-6 space-y-5">
                  <div className="border-b border-white/[0.08] pb-3">
                    <h2 className="text-base font-semibold text-white">
                      1. Load a Test Scenario or Paste Your Page Code / HTML
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Evaluates word depth, Anti-Fabrication E-E-A-T claims, LLM truncation stubs, inline SVG vs. stock placeholders, verified contact emails, BreadcrumbList JSON-LD, Consent Mode v2, and CLS reservation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {AUDIT_PRESET_SCENARIOS.map((preset) => {
                      const isSelected = selectedPresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPreset(preset.id)}
                          className={`text-left p-4 rounded-lg border transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-zinc-900 border-white text-white'
                              : 'bg-black border-white/[0.07] text-zinc-300 hover:border-white/20'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-semibold text-white">
                              {preset.name}
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                              {preset.subtitle}
                            </p>
                          </div>
                          <div className="text-[11px] font-mono text-zinc-300 mt-3 pt-2 border-t border-white/[0.06]">
                            {preset.expectedOutcome}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-medium text-zinc-300">
                        HTML, React JSX, Svelte, or Markdown Input
                      </label>
                      <span className="font-mono text-zinc-500 tabular-nums">
                        {auditInput.length} chars
                      </span>
                    </div>
                    <SyntaxCodeEditor
                      rows={12}
                      value={auditInput}
                      onChange={(newVal) => {
                        setAuditInput(newVal);
                        setSelectedPresetId('custom');
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
                      <span>
                        Profile:{' '}
                        <strong className="text-white">
                          {config.siteArchetype}
                        </strong>
                      </span>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => setAiSettingsOpen(true)}
                        className="px-2.5 py-1 rounded bg-black border border-white/15 hover:border-white/35 text-zinc-200 flex items-center gap-1.5 transition-colors"
                      >
                        <Settings className="w-3 h-3 text-emerald-400" />
                        <span>
                          Model:{' '}
                          {AI_PROVIDER_CATALOG[aiSettings.activeProvider].shortName}{' '}
                          ({getActiveModelForProvider(aiSettings)})
                        </span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleRunDeepAiAudit}
                      disabled={isRunningAiAudit}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-white rounded-md hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                    >
                      {isRunningAiAudit ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>
                            Running {AI_PROVIDER_CATALOG[aiSettings.activeProvider].shortName} Audit...
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            Run Deep AI Policy Diagnosis (
                            {AI_PROVIDER_CATALOG[aiSettings.activeProvider].shortName})
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* =============================================================
                  MODE 2: LOCAL CODEBASE / REPOSITORY FOLDER AUDITOR
              ============================================================== */}
              {auditMode === 'repo_folder' && (
                <div className="bg-zinc-950 border border-white/[0.08] rounded-xl p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                    <div>
                      <h2 className="text-base font-semibold text-white">
                        Local Codebase &amp; Multi-File Repository Auditor
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Auto-detects your framework (Next.js, React+Vite, SvelteKit, Astro, Python Flask/Django, HTML5), verifies all 8 mandatory AdSense endpoints, checks 404 ad-suppression, and calculates pairwise 5-gram shingle overlap across all routes.
                      </p>
                    </div>

                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-white rounded-md hover:bg-zinc-200 transition-colors shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {isReadingFolder
                          ? 'Scanning Folder...'
                          : 'Select Local Project Folder'}
                      </span>
                      <input
                        type="file"
                        multiple
                        // @ts-expect-error webkitdirectory is standard in modern browsers for directory selection
                        webkitdirectory="true"
                        directory="true"
                        onChange={(e) => handleUploadLocalFolder(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* 2 Instant Multi-File Repository Presets */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {REPO_AUDIT_PRESET_SCENARIOS.map((preset) => {
                      const isSelected = selectedRepoPresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectRepoPreset(preset.id)}
                          className={`text-left p-4 rounded-lg border transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-zinc-900 border-white text-white'
                              : 'bg-black border-white/[0.07] text-zinc-300 hover:border-white/20'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-semibold text-white">
                              {preset.name}
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                              {preset.subtitle}
                            </p>
                          </div>
                          <div className="text-[11px] font-mono text-emerald-400 mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                            <span>{preset.expectedBadge}</span>
                            <span>{preset.files.length} files</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Repository Metadata Bar */}
                  <div className="p-4 bg-black border border-white/[0.08] rounded-lg flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-emerald-400" />
                        <span>Active Codebase: {repoSourceLabel}</span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">
                        Detected Stack:{' '}
                        <span className="text-white">
                          {repoFolderReport.detectedStack}
                        </span>{' '}
                        · {repoFolderReport.totalFilesScanned} source files ·{' '}
                        {repoFolderReport.pillarRouteCount} content/pillar routes · Max 5-Gram Overlap:{' '}
                        <span
                          className={
                            repoFolderReport.maxShingleOverlapPercent >= 25
                              ? 'text-rose-400 font-bold'
                              : 'text-emerald-400 font-bold'
                          }
                        >
                          {repoFolderReport.maxShingleOverlapPercent}%
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRunDeepAiAudit}
                      disabled={isRunningAiAudit}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-white rounded-md hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                    >
                      {isRunningAiAudit ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Auditing Entire Repository with Gemini...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Run Deep AI Codebase Diagnosis</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* =============================================================
                  MODE 3: LIVE PRODUCTION URL MULTI-ENDPOINT CRAWLER
              ============================================================== */}
              {auditMode === 'live_url' && (
                <div className="bg-zinc-950 border border-white/[0.08] rounded-xl p-6 space-y-5">
                  <div className="border-b border-white/[0.08] pb-4">
                    <h2 className="text-base font-semibold text-white">
                      Live Production URL Multi-Endpoint Crawler
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Server-side crawler probes your live domain as <code className="text-zinc-200">Mediapartners-Google/2.1</code> across 9 endpoints (<code className="text-zinc-200">/</code>, <code className="text-zinc-200">/ads.txt</code>, <code className="text-zinc-200">/robots.txt</code>, <code className="text-zinc-200">/sitemap.xml</code>, <code className="text-zinc-200">/privacy</code>, <code className="text-zinc-200">/about</code>, <code className="text-zinc-200">/contact</code>, <code className="text-zinc-200">/terms</code>, plus a synthetic <code className="text-zinc-200">404</code> route probe and up to 4 sampled sitemap guides).
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCrawlLiveUrl();
                    }}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <div className="relative flex-1">
                      <Globe className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={liveUrlInput}
                        onChange={(e) => setLiveUrlInput(e.target.value)}
                        placeholder="https://yourdomain.com"
                        className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-black border border-white/15 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isCrawlingLiveUrl}
                      className="px-5 py-2.5 text-xs font-semibold text-black bg-white rounded-lg hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                    >
                      {isCrawlingLiveUrl ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Crawling Live Endpoints...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5" />
                          <span>Crawl &amp; Audit Live Domain</span>
                        </>
                      )}
                    </button>
                  </form>

                  {liveUrlError && (
                    <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-lg text-xs text-rose-200">
                      Live Crawler Error: {liveUrlError}
                    </div>
                  )}

                  {liveProbeDetails.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">
                          Live HTTP Crawler Probe Matrix ({liveCrawledOrigin})
                        </span>
                        <button
                          type="button"
                          onClick={handleRunDeepAiAudit}
                          disabled={isRunningAiAudit}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-white rounded-md hover:bg-zinc-200 disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {isRunningAiAudit
                              ? 'Running Gemini Semantic Audit...'
                              : 'Run Deep AI Audit on Crawled Site'}
                          </span>
                        </button>
                      </div>

                      <div className="overflow-x-auto border border-white/[0.08] rounded-lg">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="bg-black border-b border-white/[0.08] text-zinc-400">
                              <th className="py-2 px-3">Probed Endpoint</th>
                              <th className="py-2 px-3">HTTP Status</th>
                              <th className="py-2 px-3">Redirected</th>
                              <th className="py-2 px-3">Payload Size</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.06] bg-zinc-950">
                            {liveProbeDetails.map((probe, idx) => (
                              <tr key={`${probe.endpoint}-${idx}`}>
                                <td className="py-2 px-3 text-white">
                                  {probe.endpoint}
                                  <span className="block text-[10px] text-zinc-500 truncate max-w-xs">
                                    {probe.url}
                                  </span>
                                </td>
                                <td className="py-2 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                      probe.ok ||
                                      (probe.endpoint.includes('404') &&
                                        probe.status === 404)
                                        ? 'bg-emerald-500/15 text-emerald-400'
                                        : 'bg-rose-500/15 text-rose-400'
                                    }`}
                                  >
                                    {probe.status || 'ERR'}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-zinc-400">
                                  {probe.redirected ? 'Yes (Hop)' : 'Direct'}
                                </td>
                                <td className="py-2 px-3 text-zinc-400 tabular-nums">
                                  {(probe.byteLength / 1024).toFixed(1)} KB
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =============================================================
                  MULTI-FILE / LIVE-URL 8-ENDPOINT INFRASTRUCTURE & ROUTE MATRIX
                  (Displayed when in Local Codebase Mode or after crawling a Live URL)
              ============================================================== */}
              {activeMultiRouteReport && (
                <div className="bg-zinc-950 border border-white/[0.08] rounded-xl p-6 space-y-6">
                  <div className="border-b border-white/[0.08] pb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        8 Mandatory AdSense Infrastructure &amp; Trust Endpoints
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Every production domain must pass all 8 site-wide endpoints before submitting for AdSense review.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">
                      {
                        activeMultiRouteReport.endpointChecklist.filter(
                          (e) => e.present && e.valid
                        ).length
                      }
                      /{activeMultiRouteReport.endpointChecklist.length} Endpoints Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {activeMultiRouteReport.endpointChecklist.map((ep) => (
                      <div
                        key={ep.endpoint}
                        className="p-3.5 bg-black border border-white/[0.08] rounded-lg space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white truncate">
                            {ep.endpoint}
                          </span>
                          {ep.present && ep.valid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : ep.present ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 truncate">
                          {ep.matchedFileOrUrl} · {ep.requiredByRule}
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          {ep.statusDetail}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Per-Route Editorial Depth & Shingle Uniqueness Table */}
                  {activeMultiRouteReport.routeMetrics.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                          Per-Route Editorial Word Count, Visual SVG &amp; Anti-Doorway Matrix
                        </h4>
                        <span className="text-xs font-mono text-zinc-400">
                          Max 5-Gram Shingle Overlap:{' '}
                          <strong
                            className={
                              activeMultiRouteReport.maxShingleOverlapPercent >= 25
                                ? 'text-rose-400'
                                : 'text-emerald-400'
                            }
                          >
                            {activeMultiRouteReport.maxShingleOverlapPercent}% (Limit &lt; 25%)
                          </strong>
                        </span>
                      </div>

                      <div className="overflow-x-auto border border-white/[0.08] rounded-lg">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="bg-black border-b border-white/[0.08] text-zinc-400">
                              <th className="py-2.5 px-3">Route / File</th>
                              <th className="py-2.5 px-3">Status</th>
                              <th className="py-2.5 px-3">Prose Words</th>
                              <th className="py-2.5 px-3">Data Table</th>
                              <th className="py-2.5 px-3">Inline SVG</th>
                              <th className="py-2.5 px-3">JSON-LD</th>
                              <th className="py-2.5 px-3">Breadcrumbs</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.06] bg-black/60">
                            {activeMultiRouteReport.routeMetrics.map((rm) => (
                              <tr key={rm.path}>
                                <td className="py-2 px-3 text-white truncate max-w-[240px]">
                                  {rm.path}
                                </td>
                                <td className="py-2 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      rm.status === 'pass'
                                        ? 'bg-emerald-500/15 text-emerald-400'
                                        : 'bg-rose-500/15 text-rose-400'
                                    }`}
                                  >
                                    {rm.status}
                                  </span>
                                </td>
                                <td
                                  className={`py-2 px-3 font-semibold tabular-nums ${
                                    rm.wordCount >= 300
                                      ? 'text-emerald-400'
                                      : 'text-rose-400'
                                  }`}
                                >
                                  {rm.wordCount}w
                                </td>
                                <td className="py-2 px-3">
                                  {rm.hasTableMatrix ? (
                                    <span className="text-emerald-400">Yes</span>
                                  ) : (
                                    <span className="text-zinc-500">—</span>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  {rm.hasInlineSvg ? (
                                    <span className="text-emerald-400">Yes</span>
                                  ) : (
                                    <span className="text-zinc-500">—</span>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  {rm.hasJsonLd ? (
                                    <span className="text-emerald-400">Yes</span>
                                  ) : (
                                    <span className="text-zinc-500">—</span>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  {rm.hasBreadcrumbs ? (
                                    <span className="text-emerald-400">Yes</span>
                                  ) : (
                                    <span className="text-zinc-500">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Highest Shingle Overlap Pair */}
                      {activeMultiRouteReport.highestOverlapPair && (
                        <div className="p-3.5 bg-black border border-white/[0.08] rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                          <span className="text-zinc-300">
                            Highest 5-Gram Similarity Pair ({' '}
                            <span className="text-white">
                              {activeMultiRouteReport.highestOverlapPair.fileA}
                            </span>{' '}
                            ↔{' '}
                            <span className="text-white">
                              {activeMultiRouteReport.highestOverlapPair.fileB}
                            </span>{' '}
                            ):
                          </span>
                          <span
                            className={
                              activeMultiRouteReport.highestOverlapPair
                                .overlapPercent >= 25
                                ? 'text-rose-400 font-bold'
                                : 'text-emerald-400 font-bold'
                            }
                          >
                            {
                              activeMultiRouteReport.highestOverlapPair
                                .overlapPercent
                            }
                            % overlap
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Telemetry Summary & Gate Findings */}
              <div className="bg-zinc-950 border border-white/[0.08] rounded-xl p-6 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div className="flex items-start gap-3">
                    {deterministicReport.readinessVerdict === 'READY_FOR_REVIEW' ? (
                      <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    ) : deterministicReport.readinessVerdict === 'HIGH_REJECTION_RISK' ? (
                      <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-xs font-mono text-zinc-400">
                        VERDICT: {deterministicReport.readinessVerdict.replace(/_/g, ' ')}
                      </div>
                      <h3 className="text-lg font-bold text-white mt-0.5">
                        {
                          deterministicReport.findings.filter(
                            (f) => f.status === 'fail'
                          ).length
                        }{' '}
                        Violations Flagged ·{' '}
                        {
                          deterministicReport.findings.filter(
                            (f) => f.status === 'pass'
                          ).length
                        }
                        /{deterministicReport.findings.length} Gates Passed
                      </h3>
                    </div>
                  </div>

                  {/* Action Bar: Download Audit Report (.md), Copy Report, Preview & Compliance Score */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setShowAuditReportPreview((prev) => !prev)
                      }
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-200 bg-black border border-white/10 rounded-md hover:border-white/30 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-zinc-400" />
                      <span>
                        {showAuditReportPreview
                          ? 'Hide MD Preview'
                          : 'Preview Report (.md)'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          compiledMarkdownAuditReport,
                          'copy-audit-report-md'
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-200 bg-black border border-white/10 rounded-md hover:border-white/30 transition-colors"
                    >
                      {copiedId === 'copy-audit-report-md' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied MD Report</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Copy Report (.md)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadFile(
                          compiledMarkdownAuditReport,
                          'ADSENSE_AUDIT_REPORT.md'
                        )
                      }
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-white rounded-md hover:bg-zinc-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Audit Report (.md)</span>
                    </button>

                    <div className="font-mono tabular-nums text-right pl-2 border-l border-white/[0.08]">
                      <div className="text-2xl font-bold text-white">
                        {deterministicReport.overallScore}%
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Compliance Score
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Collapsible Markdown Audit Report Preview */}
                {showAuditReportPreview && (
                  <div className="bg-[#0a0c10] border border-white/15 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-[#11141c] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <span className="text-emerald-400">
                        ADSENSE_AUDIT_REPORT.md · Live Compiled Markdown
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              compiledMarkdownAuditReport,
                              'preview-copy-md'
                            )
                          }
                          className="px-2.5 py-1 text-[11px] text-zinc-200 bg-black border border-white/10 rounded hover:border-white/30"
                        >
                          {copiedId === 'preview-copy-md'
                            ? 'Copied!'
                            : 'Copy Markdown'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadFile(
                              compiledMarkdownAuditReport,
                              'ADSENSE_AUDIT_REPORT.md'
                            )
                          }
                          className="px-2.5 py-1 text-[11px] font-semibold text-black bg-white rounded hover:bg-zinc-200"
                        >
                          Download .md
                        </button>
                      </div>
                    </div>
                    <div className={`max-h-[420px] overflow-y-auto ${DARK_SCROLLBAR}`}>
                      <SyntaxCodeBlock
                        code={compiledMarkdownAuditReport}
                        showLineNumbers={true}
                      />
                    </div>
                  </div>
                )}

                {/* 4-Metric Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums">
                  <div className="p-3 bg-black border border-white/[0.07] rounded-lg">
                    <div className="text-[11px] text-zinc-500">Editorial Depth</div>
                    <div
                      className={`text-sm font-semibold mt-1 ${
                        deterministicReport.metrics.estimatedWordCount >= 450
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      ~{deterministicReport.metrics.estimatedWordCount} words
                    </div>
                  </div>
                  <div className="p-3 bg-black border border-white/[0.07] rounded-lg">
                    <div className="text-[11px] text-zinc-500">Visual &amp; E-E-A-T Integrity</div>
                    <div
                      className={`text-sm font-semibold mt-1 ${
                        !deterministicReport.metrics.hasFakeLabClaims &&
                        !deterministicReport.metrics.hasStockPlaceholderImages
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {deterministicReport.metrics.hasFakeLabClaims
                        ? 'Fake Lab Claim!'
                        : deterministicReport.metrics.hasStockPlaceholderImages
                        ? 'Stock Image URL!'
                        : 'Verified Clean'}
                    </div>
                  </div>
                  <div className="p-3 bg-black border border-white/[0.07] rounded-lg">
                    <div className="text-[11px] text-zinc-500">Hub-and-Spoke &amp; Contact</div>
                    <div
                      className={`text-sm font-semibold mt-1 ${
                        deterministicReport.metrics.hasBreadcrumbsAndInternalLinks &&
                        !deterministicReport.metrics.hasDummyContactInfo
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {deterministicReport.metrics.hasDummyContactInfo
                        ? '@example.com!'
                        : deterministicReport.metrics.hasBreadcrumbsAndInternalLinks
                        ? 'Verified'
                        : 'Missing Links'}
                    </div>
                  </div>
                  <div className="p-3 bg-black border border-white/[0.07] rounded-lg">
                    <div className="text-[11px] text-zinc-500">CLS &amp; Dead Links</div>
                    <div
                      className={`text-sm font-semibold mt-1 ${
                        deterministicReport.metrics.unreservedSlots === 0 &&
                        deterministicReport.metrics.deadLinkCount === 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {deterministicReport.metrics.unreservedSlots} CLS ·{' '}
                      {deterministicReport.metrics.deadLinkCount} dead
                    </div>
                  </div>
                </div>

                {/* Deep Gemini Semantic Output */}
                {aiAuditError && (
                  <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-lg text-xs text-rose-200">
                    Semantic Audit Error: {aiAuditError}
                  </div>
                )}

                {aiAuditResult && (
                  <div className="p-5 bg-black border border-white/20 rounded-xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-white">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>
                          {aiProviderMeta
                            ? `${aiProviderMeta.provider.toUpperCase()} (${aiProviderMeta.model})`
                            : AI_PROVIDER_CATALOG[aiSettings.activeProvider].name}{' '}
                          — Semantic &amp; E-E-A-T Policy Review
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400">
                        {aiProviderMeta && (
                          <span className="text-[11px] text-zinc-500">
                            {aiProviderMeta.keySourceUsed} · {aiProviderMeta.latencyMs}ms
                          </span>
                        )}
                        <span>
                          Low-Value Content Risk:{' '}
                          <strong className="text-white">
                            {aiAuditResult.lowValueContentRisk}
                          </strong>
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-white">
                      {aiAuditResult.verdictHeadline}
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {aiAuditResult.eeatAssessment}
                    </p>
                    <div className="flex items-center justify-end pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            aiAuditResult.masterAiRemediationPrompt,
                            'copy-master-ai-fix'
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-white rounded-md hover:bg-zinc-200"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>
                          {copiedId === 'copy-master-ai-fix'
                            ? 'Copied Master Fix Prompt'
                            : 'Copy Master AI Fix Prompt'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Gate-by-Gate Findings */}
                <div className="space-y-3">
                  {deterministicReport.findings.map((finding) => (
                    <div
                      key={finding.id}
                      className="p-4 bg-black border border-white/[0.07] rounded-lg space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          {finding.status === 'pass' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : finding.status === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="text-xs font-semibold text-white">
                              <span className="font-mono text-zinc-400 mr-2">
                                {finding.ruleId}
                              </span>
                              {finding.title}
                            </div>
                          </div>
                        </div>

                        {finding.status !== 'pass' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(finding.remediation, `fix-${finding.id}`)
                            }
                            className="px-3 py-1 text-xs font-medium text-black bg-white rounded hover:bg-zinc-200 whitespace-nowrap shrink-0"
                          >
                            {copiedId === `fix-${finding.id}`
                              ? 'Copied Remediation'
                              : 'Copy Fix Directive'}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {finding.diagnosis}
                      </p>
                      {finding.status !== 'pass' && (
                        <div className="text-xs text-emerald-300/90 font-mono bg-zinc-950 p-2.5 rounded border border-white/[0.06]">
                          Fix: {finding.remediation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              PAGE 5: OFF-CODE PRE-SUBMISSION LAUNCH READINESS CHECKLIST
          ================================================================== */}
          {activePageId === 'launch-readiness' && (
            <div className="bg-zinc-950 border border-white/[0.08] rounded-xl p-6 space-y-5">
              <div className="border-b border-white/[0.08] pb-4">
                <h2 className="text-base font-semibold text-white">
                  Human Publisher Pre-Submission Verification Gates
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Complete these 5 verification gates after your AI agent finishes all 4 turns and before clicking &ldquo;Request Review&rdquo; in Google AdSense.
                </p>
              </div>
              <div className="space-y-3">
                {OFF_CODE_LAUNCH_GATES.map((gate) => {
                  const done = checkedLaunchGates.includes(gate.id);
                  return (
                    <label
                      key={gate.id}
                      className={`flex items-start gap-3.5 p-4 rounded-lg border cursor-pointer transition-colors ${
                        done
                          ? 'bg-zinc-900/50 border-white/20'
                          : 'bg-black border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => toggleLaunchGate(gate.id)}
                        className={`${DARK_CHECKBOX_CLASS} mt-0.5`}
                      />
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold text-white">{gate.title}</div>
                        <p className="text-zinc-400 leading-relaxed">{gate.detail}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================================
              PAGES 6..11: FOCUSED GITBOOK POLICY CATEGORY DOCUMENTATION PAGES
          ================================================================== */}
          {activePageId.startsWith('policy-') && (
            <div className="space-y-6">
              {ADSENSE_POLICY_RULES.filter(
                (r) => `policy-${r.category}` === activePageId
              ).map((rule) => {
                const isEnabled = config.enabledCategories[rule.category];
                return (
                  <article
                    key={rule.id}
                    className="bg-zinc-950 border border-white/[0.08] rounded-xl p-6 space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400 tabular-nums">
                          <span className="text-white font-semibold">
                            {rule.code}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              rule.severity === 'critical_rejection'
                                ? 'text-rose-400'
                                : 'text-amber-400'
                            }
                          >
                            {rule.severity.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{rule.updatedRelease}</span>
                        </div>
                        <h2 className="text-lg font-bold text-white">
                          {rule.title}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              rule.aiBuilderDirective,
                              `directive-${rule.id}`
                            )
                          }
                          className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-black border border-white/10 rounded-md hover:bg-zinc-900"
                        >
                          {copiedId === `directive-${rule.id}`
                            ? 'Copied Rule'
                            : 'Copy AI Rule'}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCategoryInCompiler(rule.category)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                            isEnabled
                              ? 'bg-white text-black'
                              : 'bg-zinc-900 text-zinc-400 border border-white/10'
                          }`}
                        >
                          {isEnabled ? 'Category Active' : 'Category Muted'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                      <div className="space-y-1.5">
                        <div className="font-semibold text-rose-300">
                          Why Sites Get Rejected ({rule.rejectionSymptom}):
                        </div>
                        <p className="text-zinc-300">{rule.whyItFails}</p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="font-semibold text-emerald-300">
                          Mandatory AI Builder Directive:
                        </div>
                        <p className="text-zinc-300">{rule.aiBuilderDirective}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-[#0a0c10] border border-rose-500/30 rounded-lg overflow-hidden">
                        <div className="px-3.5 py-2 bg-rose-950/20 border-b border-rose-500/20 text-[11px] font-mono text-rose-300 flex items-center justify-between">
                          <span>REJECTED PATTERN</span>
                          <span>Policy Violation</span>
                        </div>
                        <SyntaxCodeBlock
                          code={rule.badCodeExample}
                          showLineNumbers={true}
                        />
                      </div>

                      <div className="bg-[#0a0c10] border border-emerald-500/30 rounded-lg overflow-hidden">
                        <div className="px-3.5 py-2 bg-emerald-950/20 border-b border-emerald-500/20 text-[11px] font-mono text-emerald-300 flex items-center justify-between">
                          <span>COMPLIANT ARCHITECTURE</span>
                          <span>Verified Safe</span>
                        </div>
                        <SyntaxCodeBlock
                          code={rule.goodCodeExample}
                          showLineNumbers={true}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* =================================================================
              PAGES 12..21: FOCUSED GITBOOK MULTI-STACK CODE TEMPLATE PAGES
          ================================================================== */}
          {activePageId.startsWith('template-') &&
            (() => {
              const tpl =
                boilerplateTemplates.find(
                  (t) => `template-${t.id}` === activePageId
                ) || boilerplateTemplates[0];
              const currentFilename =
                tpl.filenamesByStack?.[activeTemplateStack] || tpl.filename;
              const currentCode =
                tpl.variants?.[activeTemplateStack] || tpl.code;

              return (
                <div className="bg-zinc-950 border border-white/[0.08] rounded-xl overflow-hidden">
                  {/* 5-Stack Variant Switcher Header */}
                  <div className="px-5 py-3 border-b border-white/[0.08] bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] font-mono text-zinc-400">
                      Select Framework Variant:
                    </div>
                    <div className="flex flex-wrap items-center gap-1 p-1 bg-black border border-white/[0.08] rounded-lg">
                      {TEMPLATE_STACK_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTemplateStack(tab.id)}
                          className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                            activeTemplateStack === tab.id
                              ? 'bg-white text-black font-semibold'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 border-b border-white/[0.08] bg-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-mono text-emerald-400">
                        {currentFilename}
                      </div>
                      <h2 className="text-base font-bold text-white mt-0.5">
                        {tpl.title}
                      </h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        {tpl.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          currentCode,
                          `tpl-${tpl.id}-${activeTemplateStack}`
                        )
                      }
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-white rounded-md hover:bg-zinc-200 whitespace-nowrap shrink-0"
                    >
                      {copiedId === `tpl-${tpl.id}-${activeTemplateStack}` ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied {currentFilename}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy {currentFilename}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <SyntaxCodeBlock
                    code={currentCode}
                    showLineNumbers={true}
                  />
                </div>
              );
            })()}

          {/* =================================================================
              GITBOOK PREVIOUS / NEXT FOOTER PAGINATION CARDS
          ================================================================== */}
          <div className="pt-6 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevPage ? (
              <button
                type="button"
                onClick={() => {
                  setActivePageId(prevPage.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-4 rounded-xl bg-zinc-950 border border-white/[0.08] hover:border-white/30 transition-colors text-left flex items-center justify-between gap-3"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-400 shrink-0" />
                <div className="text-right">
                  <div className="text-[11px] font-mono text-zinc-500">
                    Previous · {prevPage.section}
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {prevPage.title}
                  </div>
                </div>
              </button>
            ) : (
              <div />
            )}

            {nextPage ? (
              <button
                type="button"
                onClick={() => {
                  setActivePageId(nextPage.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-4 rounded-xl bg-zinc-950 border border-white/[0.08] hover:border-white/30 transition-colors text-left flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-[11px] font-mono text-zinc-500">
                    Next · {nextPage.section}
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {nextPage.title}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
              </button>
            ) : (
              <div />
            )}
          </div>
        </main>

        {/* ===================================================================
            RIGHT CONTEXTUAL RAIL: SKILL MODE, STACK & OPTIONAL PROJECT OVERRIDE
        ==================================================================== */}
        <aside
          aria-label="Project Configuration and Quick Export"
          className={`hidden xl:flex flex-col w-[300px] shrink-0 sticky top-[57px] h-[calc(100vh-57px)] border-l border-white/[0.08] bg-zinc-950/40 p-5 space-y-6 overflow-y-auto ${DARK_SCROLLBAR}`}
        >
          <div className="space-y-3">
            <div className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
              Skill Mode &amp; Tech Stack
            </div>

            {/* Universal Fresh-Build vs Project-Override Card */}
            <div className="p-3 rounded-lg bg-black border border-white/[0.08] space-y-2.5">
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <span className="text-xs font-semibold text-white">
                  Override Domain &amp; Pub-ID
                </span>
                <input
                  type="checkbox"
                  checked={config.useProjectOverride}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      useProjectOverride: e.target.checked,
                    })
                  }
                  className={DARK_CHECKBOX_CLASS}
                />
              </label>

              {!config.useProjectOverride ? (
                <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-200 leading-relaxed">
                  <strong className="text-emerald-400 block mb-0.5 font-mono">
                    UNIVERSAL FRESH-BUILD (DEFAULT)
                  </strong>
                  Zero hardcoded domains or author names. Your exported{' '}
                  <code>SKILL.md</code> adapts to any new website topic and
                  centralizes variables in <code>siteConfig / .env</code>.
                </div>
              ) : (
                <div className="space-y-2.5 pt-1 border-t border-white/[0.06]">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Production Domain
                    </label>
                    <input
                      type="text"
                      value={config.domainName}
                      onChange={(e) =>
                        setConfig({ ...config, domainName: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-zinc-950 border border-white/10 rounded text-white focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      AdSense Publisher ID
                    </label>
                    <input
                      type="text"
                      value={config.publisherId}
                      onChange={(e) =>
                        setConfig({ ...config, publisherId: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-zinc-950 border border-white/10 rounded text-white focus:outline-none focus:border-white/30 tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      E-E-A-T Author &amp; Credentials
                    </label>
                    <input
                      type="text"
                      value={config.authorNameAndCredentials}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          authorNameAndCredentials: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-white/10 rounded text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Target Web Tech Stack
                </label>
                <select
                  value={config.framework}
                  onChange={(e) => {
                    const fw = e.target.value as SupportedFramework;
                    setConfig({ ...config, framework: fw });
                    setActiveTemplateStack(
                      FRAMEWORK_METADATA[fw].defaultVariant
                    );
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-black border border-white/[0.08] rounded-md text-white"
                >
                  {(
                    Object.keys(FRAMEWORK_METADATA) as SupportedFramework[]
                  ).map((fwKey) => (
                    <option key={fwKey} value={fwKey}>
                      {FRAMEWORK_METADATA[fwKey].shortBadge} —{' '}
                      {FRAMEWORK_METADATA[fwKey].label.split(' (')[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Privacy &amp; Consent Region
                </label>
                <select
                  value={config.targetGeo}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      targetGeo: e.target.value as SkillCompilerConfig['targetGeo'],
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-black border border-white/[0.08] rounded-md text-white"
                >
                  <option value="global_eea_us">Global (EEA TCF v2.2 + US CCPA)</option>
                  <option value="eea_uk_strict">Strict EEA &amp; UK GDPR Only</option>
                  <option value="us_only">US Only (DART + State Opt-Out)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Tool Word Floor ({config.minEditorialWordsOnToolPages}w)
                </label>
                <input
                  type="range"
                  min={600}
                  max={1500}
                  step={50}
                  value={config.minEditorialWordsOnToolPages}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      minEditorialWordsOnToolPages: Number(e.target.value),
                    })
                  }
                  className="w-full accent-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
            <div className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
              AI Models &amp; Multi-Key Pool
            </div>
            <button
              type="button"
              onClick={() => setAiSettingsOpen(true)}
              className="w-full px-3 py-2.5 text-xs font-mono text-zinc-200 bg-black border border-white/[0.12] rounded-md hover:border-white/35 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2 truncate">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">
                  {AI_PROVIDER_CATALOG[aiSettings.activeProvider].shortName} ·{' '}
                  {getActiveModelForProvider(aiSettings)}
                </span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] bg-zinc-900 border border-white/10 rounded text-zinc-400 shrink-0">
                {aiSettings.apiKeys.length} keys
              </span>
            </button>
          </div>

          <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
            <div className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
              Quick Skill Export
            </div>
            {(
              [
                { fmt: 'skill_md' as const, label: 'Download SKILL.md' },
                { fmt: 'cursorrules' as const, label: 'Download .cursorrules' },
                { fmt: 'claude_md' as const, label: 'Download CLAUDE.md' },
              ] as const
            ).map((btn) => (
              <button
                key={btn.fmt}
                type="button"
                onClick={() =>
                  handleDownloadFile(
                    compileStandaloneSkill({ ...config, exportFormat: btn.fmt }),
                    getExportFilename(btn.fmt)
                  )
                }
                className="w-full px-3 py-2 text-xs font-mono text-zinc-200 bg-black border border-white/[0.08] rounded-md hover:border-white/30 flex items-center justify-between transition-colors"
              >
                <span>{btn.label}</span>
                <Download className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* =====================================================================
          MULTI-PROVIDER AI MODELS & API KEYS SETTINGS MODAL
      ====================================================================== */}
      <AiProviderSettingsModal
        open={aiSettingsOpen}
        onClose={() => setAiSettingsOpen(false)}
        settings={aiSettings}
        onUpdateSettings={handleUpdateAiSettings}
      />

      {/* =====================================================================
          EXPORT SKILL PACKAGE MODAL
      ====================================================================== */}
      {exportDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Export Standalone AdSense AI Skill Package"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-zinc-950 border border-white/15 rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Export Standalone AdSense AI Skill Bundle
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Includes 24 2026 rules, Anti-Fabrication Sensitivity Matrices, Pre-Build Compiler Gate, and 4-Turn Batching Protocol.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExportDrawerOpen(false)}
                className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white border border-white/10 rounded"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  {
                    fmt: 'skill_md' as const,
                    title: 'Universal SKILL.md',
                    desc: 'Complete YAML frontmatter + 24-rule architectural constitution for AI Studio, Claude Skills & Codex agents.',
                  },
                  {
                    fmt: 'cursorrules' as const,
                    title: 'Cursor .cursorrules',
                    desc: 'Drop into project root to enforce anti-truncation, CLS-zero ad wrappers, and prebuild verification in Cursor.',
                  },
                  {
                    fmt: 'claude_md' as const,
                    title: 'Claude CLAUDE.md',
                    desc: 'Repository constitution for Claude Code with SSG/Sitemap mandates, BreadcrumbList JSON-LD, and 12 DoD gates.',
                  },
                  {
                    fmt: 'system_prompt' as const,
                    title: 'First-Turn System Prompt',
                    desc: 'Paste directly as your very first message in Bolt, Lovable, v0, ChatGPT, or Gemini alongside the 4-Turn Playbook.',
                  },
                ] as const
              ).map((item) => {
                const content = compileStandaloneSkill({
                  ...config,
                  exportFormat: item.fmt,
                });
                const fname = getExportFilename(item.fmt);
                return (
                  <div
                    key={item.fmt}
                    className="p-4 bg-black border border-white/[0.08] rounded-lg flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {item.title}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        {fname}
                      </div>
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(content, `modal-${item.fmt}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 border border-white/10 rounded hover:bg-zinc-800"
                      >
                        {copiedId === `modal-${item.fmt}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(content, fname)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-white rounded hover:bg-zinc-200"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          GLOBAL COMMAND PALETTE MODAL (Cmd+K / Ctrl+K)
          Instant search & jump to any AdSense Policy within the Knowledge Graph
      ====================================================================== */}
      {cmdPaletteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Global AdSense Policy & Knowledge Graph Command Palette"
          onClick={() => setCmdPaletteOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-white/15 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl"
          >
            {/* Search Input Bar */}
            <div className="px-4 py-3.5 border-b border-white/[0.08] bg-black flex items-center gap-3">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Search any AdSense policy (e.g. ADS-LVC-01, CLS, TCF v2.2, fake lab, sitemap)..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCmdPaletteOpen(false)}
                className="px-2 py-0.5 text-[11px] font-mono text-zinc-400 hover:text-white bg-zinc-900 border border-white/10 rounded"
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div
              className={`max-h-[420px] overflow-y-auto divide-y divide-white/[0.05] ${DARK_SCROLLBAR}`}
            >
              {commandPaletteItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No matching AdSense policies or Knowledge Graph nodes found for &ldquo;{cmdQuery}&rdquo;.
                </div>
              ) : (
                commandPaletteItems.map((item, idx) => {
                  const isActive = idx === cmdSelectedIndex;
                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setCmdSelectedIndex(idx)}
                      onClick={() => handleJumpToKnowledgeGraphFromCmd(item)}
                      className={`px-4 py-3 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                        isActive ? 'bg-zinc-900 text-white' : 'bg-zinc-950/60 text-zinc-300'
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-[11px] font-bold text-[#61afef] shrink-0">
                            {item.code}
                          </span>
                          <span className="font-semibold text-white truncate">
                            {item.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {item.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.ruleCode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToRuleCode(item.ruleCode!);
                              setCmdPaletteOpen(false);
                            }}
                            className="px-2.5 py-1 text-[11px] font-mono text-zinc-300 hover:text-white bg-black border border-white/10 rounded"
                          >
                            Policy Spec
                          </button>
                        )}
                        <span className="px-2.5 py-1 text-[11px] font-mono font-semibold text-black bg-white rounded flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          <span>Jump in Graph ↵</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Shortcuts Legend */}
            <div className="px-4 py-2.5 bg-black border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-500">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Jump to Knowledge Graph Node</span>
                <span>ESC Close</span>
              </div>
              <span>{commandPaletteItems.length} policies &amp; nodes indexed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
