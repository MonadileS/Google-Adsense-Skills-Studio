'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Cpu,
  Eye,
  EyeOff,
  KeyRound,
  Plus,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  AI_PROVIDER_CATALOG,
  AiProviderId,
  ApiKeyEntry,
  getActiveModelForProvider,
   getEnabledKeysForProvider,
  maskApiKey,
  MultiProviderAiSettings,
} from '@/lib/ai-provider-settings';

const DARK_SCROLLBAR =
  '[color-scheme:dark] [scrollbar-width:thin] [scrollbar-color:#27272a_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:w-0 [&::-webkit-scrollbar-button]:h-0 [&::-webkit-scrollbar-corner]:bg-transparent';

const DARK_CHECKBOX_CLASS =
  "appearance-none w-4 h-4 shrink-0 rounded-[5px] border border-zinc-700 bg-zinc-950 checked:bg-emerald-400 checked:border-emerald-400 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all cursor-pointer checked:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000000' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3.5 8.5L6.5 11.5L12.5 4.5'/%3E%3C/svg%3E\")] bg-center bg-no-repeat bg-[length:12px_12px]";

interface AiProviderSettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: MultiProviderAiSettings;
  onUpdateSettings: (next: MultiProviderAiSettings) => void;
}

export default function AiProviderSettingsModal({
  open,
  onClose,
  settings,
  onUpdateSettings,
}: AiProviderSettingsModalProps) {
  const [selectedTab, setSelectedTab] = useState<AiProviderId>(
    settings.activeProvider
  );
  const [newKeyLabel, setNewKeyLabel] = useState<string>('');
  const [newKeyValue, setNewKeyValue] = useState<string>('');
  const [revealedKeyIds, setRevealedKeyIds] = useState<Record<string, boolean>>(
    {}
  );

  // Connection Test State
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  if (!open) return null;

  const providerMeta = AI_PROVIDER_CATALOG[selectedTab];
  const providerKeys = settings.apiKeys.filter(
    (k) => k.provider === selectedTab
  );
  const activeModelId = getActiveModelForProvider(settings, selectedTab);

  const handleSetActiveProvider = (provider: AiProviderId) => {
    setSelectedTab(provider);
    setTestResult(null);
    onUpdateSettings({
      ...settings,
      activeProvider: provider,
    });
  };

  const handleSelectPresetModel = (modelId: string) => {
    setTestResult(null);
    onUpdateSettings({
      ...settings,
      selectedModels: {
        ...settings.selectedModels,
        [selectedTab]: modelId,
      },
      customModelOverrides: {
        ...settings.customModelOverrides,
        [selectedTab]: '',
      },
    });
  };

  const handleCustomModelChange = (val: string) => {
    setTestResult(null);
    onUpdateSettings({
      ...settings,
      customModelOverrides: {
        ...settings.customModelOverrides,
        [selectedTab]: val,
      },
    });
  };

  const handleAddApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = newKeyValue.trim();
    if (!trimmedKey) return;

    const existingCount = providerKeys.length;
    const label =
      newKeyLabel.trim() ||
      `${providerMeta.shortName} Key #${existingCount + 1}`;

    const newEntry: ApiKeyEntry = {
      id: `${selectedTab}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      provider: selectedTab,
      label,
      key: trimmedKey,
      enabled: true,
      addedAt: new Date().toLocaleDateString(),
    };

    onUpdateSettings({
      ...settings,
      apiKeys: [...settings.apiKeys, newEntry],
    });

    setNewKeyLabel('');
    setNewKeyValue('');
    setTestResult(null);
  };

  const handleToggleKeyEnabled = (id: string) => {
    setTestResult(null);
    onUpdateSettings({
      ...settings,
      apiKeys: settings.apiKeys.map((k) =>
        k.id === id ? { ...k, enabled: !k.enabled } : k
      ),
    });
  };

  const handleDeleteKey = (id: string) => {
    setTestResult(null);
    onUpdateSettings({
      ...settings,
      apiKeys: settings.apiKeys.filter((k) => k.id !== id),
    });
  };

  const handleTestProviderConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const enabledKeys = getEnabledKeysForProvider(settings, selectedTab);
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testConnectionOnly: true,
          provider: selectedTab,
          model: activeModelId,
          apiKeys: enabledKeys,
          nvidiaNimBaseUrl: settings.nvidiaNimBaseUrl,
          enableAutoKeyFailover: settings.enableAutoKeyFailover,
          useServerEnvFallback: settings.useServerEnvFallback,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Connection test failed.');
      }
      setTestResult({
        ok: true,
        message: `Connected to ${data.model} via ${data.keySourceUsed}`,
        latencyMs: data.latencyMs,
      });
    } catch (err: unknown) {
      setTestResult({
        ok: false,
        message:
          err instanceof Error ? err.message : 'Unable to reach model endpoint.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Multi-Provider AI Models and API Keys Settings"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950 border border-white/15 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-black border-b border-white/[0.08] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                AI Models &amp; Multi-Key Pool Settings (Gemini · Groq · NVIDIA NIM)
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configure multiple API keys per provider with automatic failover rotation and choose your active inference model for Compliance Audits.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white border border-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider Switcher Bar */}
        <div className="px-6 py-3 bg-zinc-950 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                {
                  id: 'gemini' as const,
                  label: 'Google Gemini',
                  icon: Sparkles,
                  accent: 'text-sky-400',
                },
                {
                  id: 'groq' as const,
                  label: 'Groq Cloud (LPU)',
                  icon: Zap,
                  accent: 'text-amber-400',
                },
                {
                  id: 'nvidia_nim' as const,
                  label: 'NVIDIA NIM Models',
                  icon: Cpu,
                  accent: 'text-emerald-400',
                },
              ] as const
            ).map((tab) => {
              const IconComp = tab.icon;
              const isSelected = selectedTab === tab.id;
              const isActiveRuntime = settings.activeProvider === tab.id;
              const keyCount = settings.apiKeys.filter(
                (k) => k.provider === tab.id && k.enabled
              ).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSetActiveProvider(tab.id)}
                  className={`px-3.5 py-2 rounded-lg border text-xs font-medium flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-white text-white shadow-sm'
                      : 'bg-black border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${tab.accent}`} />
                  <span>{tab.label}</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono bg-black border border-white/10 rounded text-zinc-300">
                    {keyCount} {keyCount === 1 ? 'key' : 'keys'}
                  </span>
                  {isActiveRuntime && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active Provider" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>Active Runtime:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
              {AI_PROVIDER_CATALOG[settings.activeProvider].shortName} ·{' '}
              {getActiveModelForProvider(settings)}
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div
          className={`flex-1 overflow-y-auto p-6 space-y-6 ${DARK_SCROLLBAR}`}
        >
          {/* Section 1: Multi-Key Pool Manager for Selected Provider */}
          <div className="bg-black border border-white/[0.08] rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span>
                    {providerMeta.name} — Multi-Key Rotation Pool (
                    {providerKeys.length} Configured)
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Add multiple {providerMeta.shortName} API keys ({providerMeta.keyPrefixHint}). When Auto-Failover is enabled, requests automatically rotate to the next active key if a key hits rate limits (429).
                </p>
              </div>
              <a
                href={providerMeta.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-sky-400 hover:underline shrink-0"
              >
                Get {providerMeta.shortName} API Key ↗
              </a>
            </div>

            {/* Add New Key Form */}
            <form
              onSubmit={handleAddApiKey}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2.5"
            >
              <input
                type="text"
                value={newKeyLabel}
                onChange={(e) => setNewKeyLabel(e.target.value)}
                placeholder={`Key Label (e.g. ${providerMeta.shortName} Primary / Prod #1)`}
                className="sm:col-span-4 px-3 py-2 text-xs bg-zinc-950 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30"
              />
              <input
                type="password"
                value={newKeyValue}
                onChange={(e) => setNewKeyValue(e.target.value)}
                placeholder={`Paste ${providerMeta.shortName} API Key (${providerMeta.keyPrefixHint})`}
                className="sm:col-span-5 px-3 py-2 text-xs font-mono bg-zinc-950 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30"
              />
              <button
                type="submit"
                disabled={!newKeyValue.trim()}
                className="sm:col-span-3 px-4 py-2 text-xs font-semibold text-black bg-white rounded-lg hover:bg-zinc-200 disabled:opacity-40 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Key to Pool</span>
              </button>
            </form>

            {/* Key Pool List */}
            {providerKeys.length === 0 ? (
              <div className="p-4 rounded-lg bg-zinc-950/80 border border-white/[0.06] flex items-center justify-between gap-4 text-xs text-zinc-400">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span>
                    No custom {providerMeta.shortName} keys added yet.{' '}
                    {selectedTab === 'gemini'
                      ? 'Using default server-side GEMINI_API_KEY fallback.'
                      : `Add one or more ${providerMeta.shortName} API keys above to run ${providerMeta.shortName} models.`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {providerKeys.map((item, idx) => {
                  const isRevealed = !!revealedKeyIds[item.id];
                  return (
                    <div
                      key={item.id}
                      className={`px-3.5 py-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-3 ${
                        item.enabled
                          ? 'bg-zinc-950 border-white/15'
                          : 'bg-zinc-950/40 border-white/[0.05] opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => handleToggleKeyEnabled(item.id)}
                          className={DARK_CHECKBOX_CLASS}
                          title="Enable or mute this API key in rotation pool"
                        />
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-black border border-white/10 rounded text-zinc-400">
                          Slot #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">
                            {item.label}
                          </div>
                          <div className="text-[11px] font-mono text-emerald-400/90 mt-0.5">
                            {isRevealed ? item.key : maskApiKey(item.key)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-zinc-500">
                          Added {item.addedAt}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setRevealedKeyIds((prev) => ({
                              ...prev,
                              [item.id]: !prev[item.id],
                            }))
                          }
                          className="p-1.5 text-zinc-400 hover:text-white bg-black border border-white/10 rounded"
                          title={isRevealed ? 'Hide API Key' : 'Reveal API Key'}
                        >
                          {isRevealed ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteKey(item.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 bg-black border border-white/10 rounded"
                          title="Remove API Key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Failover & Env Fallback Toggles */}
            <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={settings.enableAutoKeyFailover}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      enableAutoKeyFailover: e.target.checked,
                    })
                  }
                  className={DARK_CHECKBOX_CLASS}
                />
                <span>
                  Automatic Multi-Key Failover (Rotate to next key on 429 Rate Limit / Quota error)
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={settings.useServerEnvFallback}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      useServerEnvFallback: e.target.checked,
                    })
                  }
                  className={DARK_CHECKBOX_CLASS}
                />
                <span>Use Server .env Key as Fallback</span>
              </label>
            </div>
          </div>

          {/* Section 2: Model Selection & Custom Model ID */}
          <div className="bg-black border border-white/[0.08] rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Select {providerMeta.shortName} Model for Compliance Auditing
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Endpoint: <code className="text-zinc-300 font-mono">{providerMeta.endpointLabel}</code>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {providerMeta.models.map((m) => {
                const isSelected =
                  !settings.customModelOverrides[selectedTab] &&
                  settings.selectedModels[selectedTab] === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectPresetModel(m.id)}
                    className={`text-left p-3.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-zinc-900 border-white/80 text-white'
                        : 'bg-zinc-950 border-white/[0.07] text-zinc-300 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {m.label}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-black border border-white/10 rounded text-emerald-400">
                          {m.badge}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 truncate">
                        {m.id}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed pt-0.5">
                        {m.description}
                      </p>
                    </div>

                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-400/20'
                          : 'border-zinc-700 bg-zinc-950'
                      }`}
                    >
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Model ID Override & NVIDIA NIM Base URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Custom {providerMeta.shortName} Model ID Override (Optional)
                </label>
                <input
                  type="text"
                  value={settings.customModelOverrides[selectedTab] || ''}
                  onChange={(e) => handleCustomModelChange(e.target.value)}
                  placeholder={`e.g. ${providerMeta.defaultModel}`}
                  className="w-full px-3 py-2 text-xs font-mono bg-zinc-950 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                />
              </div>

              {selectedTab === 'nvidia_nim' && (
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    NVIDIA NIM Base URL (Cloud or Self-Hosted NIM)
                  </label>
                  <input
                    type="text"
                    value={settings.nvidiaNimBaseUrl}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        nvidiaNimBaseUrl: e.target.value,
                      })
                    }
                    placeholder="https://integrate.api.nvidia.com/v1"
                    className="w-full px-3 py-2 text-xs font-mono bg-zinc-950 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Connection Test Bar */}
          {testResult && (
            <div
              className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 text-xs ${
                testResult.ok
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className="font-mono">{testResult.message}</span>
              </div>
              {testResult.latencyMs !== undefined && (
                <span className="font-mono text-emerald-400 font-semibold shrink-0">
                  {testResult.latencyMs} ms
                </span>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-black border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Total Keys Across All Providers:{' '}
              <strong className="text-white font-mono">
                {settings.apiKeys.length}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleTestProviderConnection}
              disabled={isTesting}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-200 bg-zinc-900 border border-white/15 rounded-lg hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing {providerMeta.shortName}...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Test {providerMeta.shortName} ({activeModelId})
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Save &amp; Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
