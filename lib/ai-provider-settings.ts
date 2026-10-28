export type AiProviderId = 'gemini' | 'groq' | 'nvidia_nim';

export interface ApiKeyEntry {
  id: string;
  provider: AiProviderId;
  label: string;
  key: string;
  enabled: boolean;
  addedAt: string;
}

export interface AiModelOption {
  id: string;
  label: string;
  badge: string;
  description: string;
}

export interface AiProviderMetadata {
  id: AiProviderId;
  name: string;
  shortName: string;
  endpointLabel: string;
  defaultBaseUrl: string;
  keyPrefixHint: string;
  docsUrl: string;
  defaultModel: string;
  models: AiModelOption[];
}

export interface MultiProviderAiSettings {
  activeProvider: AiProviderId;
  selectedModels: Record<AiProviderId, string>;
  customModelOverrides: Record<AiProviderId, string>;
  nvidiaNimBaseUrl: string;
  enableAutoKeyFailover: boolean;
  useServerEnvFallback: boolean;
  apiKeys: ApiKeyEntry[];
}

export const AI_PROVIDER_CATALOG: Record<AiProviderId, AiProviderMetadata> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini API',
    shortName: 'Gemini',
    endpointLabel: '@google/genai SDK (generativelanguage.googleapis.com)',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com',
    keyPrefixHint: 'AIzaSy...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    defaultModel: 'gemini-3.8-flash',
    models: [
      {
        id: 'gemini-3.8-flash',
        label: 'Gemini 3.8 Flash',
        badge: 'DEFAULT · FAST',
        description:
          'High-speed multimodal & structured JSON policy auditor with deep E-E-A-T reasoning.',
      },
      {
        id: 'gemini-2.5-pro',
        label: 'Gemini 2.5 Pro',
        badge: 'DEEP REASONING',
        description:
          'Maximum reasoning depth for complex multi-file repository & YMYL compliance audits.',
      },
      {
        id: 'gemini-2.5-flash',
        label: 'Gemini 2.5 Flash',
        badge: 'LOW LATENCY',
        description:
          'Balanced speed and structured schema adherence for rapid single-page scans.',
      },
    ],
  },
  groq: {
    id: 'groq',
    name: 'Groq Cloud (LPU Inference)',
    shortName: 'Groq',
    endpointLabel: 'https://api.groq.com/openai/v1/chat/completions',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    keyPrefixHint: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      {
        id: 'llama-3.3-70b-versatile',
        label: 'Llama 3.3 70B Versatile',
        badge: 'RECOMMENDED · 300+ T/S',
        description:
          'Meta flagship 70B model on Groq LPU hardware with native JSON mode support.',
      },
      {
        id: 'deepseek-r1-distill-llama-70b',
        label: 'DeepSeek R1 Distill Llama 70B',
        badge: 'REASONING CHAIN',
        description:
          'Distilled reasoning model ideal for detecting subtle E-E-A-T fabrication & doorway patterns.',
      },
      {
        id: 'moonshotai/kimi-k2-instruct',
        label: 'Kimi K2 Instruct (Groq)',
        badge: 'AGENTIC CODER',
        description:
          'High-precision code & technical architecture auditor for multi-stack boilerplates.',
      },
      {
        id: 'qwen-qwq-32b',
        label: 'Qwen QwQ 32B Reasoning',
        badge: 'MATH & LOGIC',
        description:
          'Strong mathematical and structural verification for calculator & tool portals.',
      },
      {
        id: 'llama-3.1-8b-instant',
        label: 'Llama 3.1 8B Instant',
        badge: 'ULTRA FAST',
        description:
          'Sub-second compliance triage and remediation prompt generation.',
      },
    ],
  },
  nvidia_nim: {
    id: 'nvidia_nim',
    name: 'NVIDIA NIM Microservices',
    shortName: 'NVIDIA NIM',
    endpointLabel: 'https://integrate.api.nvidia.com/v1/chat/completions',
    defaultBaseUrl: 'https://integrate.api.nvidia.com/v1',
    keyPrefixHint: 'nvapi-...',
    docsUrl: 'https://build.nvidia.com',
    defaultModel: 'meta/llama-3.3-70b-instruct',
    models: [
      {
        id: 'meta/llama-3.3-70b-instruct',
        label: 'Meta Llama 3.3 70B Instruct (NIM)',
        badge: 'RECOMMENDED · NIM',
        description:
          'Enterprise NVIDIA TensorRT-LLM optimized Llama 3.3 70B for structured JSON policy auditing.',
      },
      {
        id: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
        label: 'NVIDIA Llama 3.1 Nemotron Ultra 253B',
        badge: 'FLAGSHIP 253B',
        description:
          'NVIDIA flagship alignment-tuned 253B model for deep repository & E-E-A-T diagnostics.',
      },
      {
        id: 'nvidia/llama-3.1-nemotron-70b-instruct',
        label: 'NVIDIA Llama 3.1 Nemotron 70B',
        badge: 'HIGH PRECISION',
        description:
          'Steerable instruction-following model tuned by NVIDIA for technical verification.',
      },
      {
        id: 'deepseek-ai/deepseek-r1',
        label: 'DeepSeek R1 671B (NVIDIA NIM)',
        badge: 'FRONTIER REASONING',
        description:
          'Full DeepSeek R1 frontier model hosted on NVIDIA NIM infrastructure.',
      },
      {
        id: 'qwen/qwen2.5-coder-32b-instruct',
        label: 'Qwen 2.5 Coder 32B Instruct (NIM)',
        badge: 'CODE AUDITOR',
        description:
          'Specialized code-level compliance reviewer for Next.js, SvelteKit, React & Python repos.',
      },
      {
        id: 'mistralai/mistral-large-2-instruct',
        label: 'Mistral Large 2 Instruct (NIM)',
        badge: 'MULTILINGUAL & EU',
        description:
          'Strong GDPR / IAB TCF v2.2 & European regulatory compliance reviewer.',
      },
    ],
  },
};

export const DEFAULT_MULTI_PROVIDER_SETTINGS: MultiProviderAiSettings = {
  activeProvider: 'gemini',
  selectedModels: {
    gemini: 'gemini-3.8-flash',
    groq: 'llama-3.3-70b-versatile',
    nvidia_nim: 'meta/llama-3.3-70b-instruct',
  },
  customModelOverrides: {
    gemini: '',
    groq: '',
    nvidia_nim: '',
  },
  nvidiaNimBaseUrl: 'https://integrate.api.nvidia.com/v1',
  enableAutoKeyFailover: true,
  useServerEnvFallback: true,
  apiKeys: [],
};

export const AI_SETTINGS_STORAGE_KEY = 'adsenseguard_multi_provider_ai_v1';

export function getActiveModelForProvider(
  settings: MultiProviderAiSettings,
  provider: AiProviderId = settings.activeProvider
): string {
  const custom = (settings.customModelOverrides[provider] || '').trim();
  if (custom) return custom;
  return (
    settings.selectedModels[provider] ||
    AI_PROVIDER_CATALOG[provider].defaultModel
  );
}

export function getEnabledKeysForProvider(
  settings: MultiProviderAiSettings,
  provider: AiProviderId = settings.activeProvider
): string[] {
  return settings.apiKeys
    .filter((k) => k.provider === provider && k.enabled && k.key.trim().length > 0)
    .map((k) => k.key.trim());
}

export function maskApiKey(rawKey: string): string {
  const trimmed = rawKey.trim();
  if (trimmed.length <= 10) return '••••••••';
  return `${trimmed.slice(0, 6)}••••••••••••${trimmed.slice(-4)}`;
}
