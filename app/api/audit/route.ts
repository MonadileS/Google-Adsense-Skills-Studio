import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { AiProviderId } from '@/lib/ai-provider-settings';

interface AuditRequestBody {
  content?: string;
  archetype?: string;
  deterministicSummary?: Record<string, unknown>;
  provider?: AiProviderId;
  model?: string;
  apiKeys?: string[];
  nvidiaNimBaseUrl?: string;
  enableAutoKeyFailover?: boolean;
  useServerEnvFallback?: boolean;
  testConnectionOnly?: boolean;
}

/**
 * Extracts a valid JSON object from raw LLM text output, stripping optional
 * <think>...</think> reasoning blocks or ```json ... ``` markdown fences.
 */
function extractJsonObjectFromText(raw: string): Record<string, unknown> {
  const withoutThink = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  const withoutFences = withoutThink
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(withoutFences);
  } catch {
    const firstBrace = withoutFences.indexOf('{');
    const lastBrace = withoutFences.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = withoutFences.slice(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }
    throw new Error('Model response did not contain a valid JSON object.');
  }
}

function buildCandidateKeys(
  provider: AiProviderId,
  clientKeys: string[] = [],
  useServerEnvFallback = true,
  enableAutoKeyFailover = true
): Array<{ key: string; source: string }> {
  const candidates: Array<{ key: string; source: string }> = [];
  const seen = new Set<string>();

  clientKeys.forEach((rawKey, idx) => {
    const trimmed = (rawKey || '').trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      candidates.push({
        key: trimmed,
        source: `User Key #${idx + 1} (${trimmed.slice(0, 6)}...${trimmed.slice(-4)})`,
      });
    }
  });

  if (useServerEnvFallback || candidates.length === 0) {
    const envKey =
      provider === 'gemini'
        ? process.env.GEMINI_API_KEY
        : provider === 'groq'
        ? process.env.GROQ_API_KEY
        : process.env.NVIDIA_NIM_API_KEY;

    if (envKey && envKey.trim() && !seen.has(envKey.trim())) {
      seen.add(envKey.trim());
      candidates.push({
        key: envKey.trim(),
        source: `Server Environment (${provider.toUpperCase()})`,
      });
    }
  }

  if (!enableAutoKeyFailover && candidates.length > 1) {
    return [candidates[0]];
  }

  return candidates;
}

async function runGeminiWithFailover(
  candidates: Array<{ key: string; source: string }>,
  model: string,
  prompt: string,
  testConnectionOnly: boolean
): Promise<{
  parsed: Record<string, unknown>;
  keySourceUsed: string;
  keyIndexUsed: number;
}> {
  let lastError = 'No Gemini API keys available.';

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    try {
      const ai = new GoogleGenAI({
        apiKey: candidate.key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      if (testConnectionOnly) {
        const pingRes = await ai.models.generateContent({
          model: model || 'gemini-3.8-flash',
          contents:
            'Respond with a JSON object: {"status":"ok","message":"Gemini connection verified"}',
          config: {
            responseMimeType: 'application/json',
          },
        });
        const text = pingRes.text || '{"status":"ok"}';
        return {
          parsed: extractJsonObjectFromText(text),
          keySourceUsed: candidate.source,
          keyIndexUsed: i,
        };
      }

      const response = await ai.models.generateContent({
        model: model || 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdictHeadline: {
                type: Type.STRING,
                description:
                  'Concise 1-sentence executive verdict on whether Google AdSense reviewers would approve or reject this page and why.',
              },
              lowValueContentRisk: {
                type: Type.STRING,
                description:
                  'LOW, MEDIUM, or HIGH risk of Low Value Content rejection.',
              },
              eeatAssessment: {
                type: Type.STRING,
                description:
                  '2-3 sentences evaluating Experience, Expertise, Authoritativeness, and Trustworthiness signals.',
              },
              semanticViolations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    policyCode: {
                      type: Type.STRING,
                      description:
                        'e.g. ADS-LVC-01, ADS-UX-02, ADS-CMP-01, ADS-PRO-02',
                    },
                    issueTitle: {
                      type: Type.STRING,
                    },
                    explanation: {
                      type: Type.STRING,
                    },
                    concreteFix: {
                      type: Type.STRING,
                    },
                  },
                  required: [
                    'policyCode',
                    'issueTitle',
                    'explanation',
                    'concreteFix',
                  ],
                },
              },
              masterAiRemediationPrompt: {
                type: Type.STRING,
                description:
                  'A complete, copy-ready prompt the developer can paste into their AI coding assistant to automatically fix all detected AdSense issues on this page.',
              },
            },
            required: [
              'verdictHeadline',
              'lowValueContentRisk',
              'eeatAssessment',
              'semanticViolations',
              'masterAiRemediationPrompt',
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Empty response from Gemini model.');
      }

      return {
        parsed: extractJsonObjectFromText(rawText),
        keySourceUsed: candidate.source,
        keyIndexUsed: i,
      };
    } catch (err: unknown) {
      lastError =
        err instanceof Error ? err.message : 'Gemini request failed.';
    }
  }

  throw new Error(
    `All ${candidates.length} Gemini key(s) failed. Last error: ${lastError}`
  );
}

async function runOpenAiCompatibleWithFailover(
  provider: 'groq' | 'nvidia_nim',
  baseUrl: string,
  candidates: Array<{ key: string; source: string }>,
  model: string,
  prompt: string,
  testConnectionOnly: boolean
): Promise<{
  parsed: Record<string, unknown>;
  keySourceUsed: string;
  keyIndexUsed: number;
}> {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const endpoint = cleanBaseUrl.endsWith('/chat/completions')
    ? cleanBaseUrl
    : `${cleanBaseUrl}/chat/completions`;

  let lastError = `No ${provider.toUpperCase()} API keys available.`;

  const systemInstruction = `You are a Principal Google AdSense Policy Reviewer & Web Quality Auditor.
You MUST respond with a single valid JSON object matching this exact schema (no markdown commentary outside JSON):
{
  "verdictHeadline": "Concise 1-sentence executive verdict on whether Google AdSense reviewers would approve or reject this project and why.",
  "lowValueContentRisk": "LOW | MEDIUM | HIGH",
  "eeatAssessment": "2-3 sentences evaluating Experience, Expertise, Authoritativeness, and Trustworthiness signals.",
  "semanticViolations": [
    {
      "policyCode": "ADS-LVC-01",
      "issueTitle": "Short title of violation",
      "explanation": "Why this triggers AdSense rejection",
      "concreteFix": "Concrete code or editorial fix"
    }
  ],
  "masterAiRemediationPrompt": "A complete, copy-ready prompt the developer can paste into their AI coding assistant to fix all detected AdSense issues."
}`;

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    try {
      const payload: Record<string, unknown> = {
        model,
        messages: testConnectionOnly
          ? [
              {
                role: 'system',
                content: 'Respond only with valid JSON: {"status":"ok"}',
              },
              {
                role: 'user',
                content:
                  'Return {"status":"ok","message":"Connection verified"}',
              },
            ]
          : [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: prompt },
            ],
        temperature: 0.2,
        max_tokens: testConnectionOnly ? 128 : 2600,
      };

      // Enable JSON object mode for models that support it natively (non-reasoning-chain models)
      if (!/deepseek-r1|qwq/i.test(model)) {
        payload.response_format = { type: 'json_object' };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${candidate.key}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(45000),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const apiErrMsg =
          data?.error?.message ||
          data?.detail ||
          `HTTP ${res.status} from ${provider.toUpperCase()}`;
        throw new Error(apiErrMsg);
      }

      const rawContent: string =
        data?.choices?.[0]?.message?.content || '';
      if (!rawContent) {
        throw new Error(`Empty completion content from ${provider} (${model}).`);
      }

      const parsed = extractJsonObjectFromText(rawContent);
      return {
        parsed,
        keySourceUsed: candidate.source,
        keyIndexUsed: i,
      };
    } catch (err: unknown) {
      lastError =
        err instanceof Error
          ? err.message
          : `${provider.toUpperCase()} request failed.`;
    }
  }

  throw new Error(
    `All ${candidates.length} ${provider.toUpperCase()} key(s) failed. Last error: ${lastError}`
  );
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const body: AuditRequestBody = await req.json();
    const {
      content,
      archetype,
      deterministicSummary,
      provider = 'gemini',
      model,
      apiKeys = [],
      nvidiaNimBaseUrl = 'https://integrate.api.nvidia.com/v1',
      enableAutoKeyFailover = true,
      useServerEnvFallback = true,
      testConnectionOnly = false,
    } = body;

    const candidates = buildCandidateKeys(
      provider,
      apiKeys,
      useServerEnvFallback,
      enableAutoKeyFailover
    );

    if (candidates.length === 0) {
      return NextResponse.json(
        {
          error: `No API key configured for ${provider.toUpperCase()}. Open "AI Models & API Keys" settings to add one or more ${provider.toUpperCase()} keys.`,
        },
        { status: 400 }
      );
    }

    const resolvedModel =
      model ||
      (provider === 'gemini'
        ? 'gemini-3.8-flash'
        : provider === 'groq'
        ? 'llama-3.3-70b-versatile'
        : 'meta/llama-3.3-70b-instruct');

    if (testConnectionOnly) {
      const testOutcome =
        provider === 'gemini'
          ? await runGeminiWithFailover(candidates, resolvedModel, '', true)
          : await runOpenAiCompatibleWithFailover(
              provider,
              provider === 'groq'
                ? 'https://api.groq.com/openai/v1'
                : nvidiaNimBaseUrl,
              candidates,
              resolvedModel,
              '',
              true
            );

      return NextResponse.json({
        ok: true,
        provider,
        model: resolvedModel,
        keySourceUsed: testOutcome.keySourceUsed,
        latencyMs: Date.now() - startedAt,
      });
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content or HTML snippet is required for auditing.' },
        { status: 400 }
      );
    }

    const prompt = `You are a Principal Google AdSense Policy Reviewer & Web Quality Auditor evaluating a ${
      archetype || 'web application'
    } against all 28 rules of the 2026 Google AdSense Program Policies, Google Publisher Policies, Better Ads Standards, E-E-A-T Search Quality Rater Guidelines, and Google Consent Mode v2 / IAB TCF v2.2 requirements.

Deterministic Pre-Scan Summary (Mode: ${
      (deterministicSummary as { auditMode?: string })?.auditMode || 'snippet'
    }):
${JSON.stringify(deterministicSummary || {}, null, 2)}

Submitted Page / Multi-File Repository Digest / Live Crawled Site Content:
"""
${content.slice(0, 22000)}
"""

Perform a comprehensive, zero-blind-spot semantic compliance evaluation covering every dimension:
1. "Low Value Content", Information Gain & Anti-Doorway Uniqueness (ADS-LVC-01..06): Does the content demonstrate genuine original methodology, Deterministic Sensitivity Matrices, and < 25% 5-gram shingle overlap across routes, or does it read like thin/generic AI filler, truncated stubs, or Mad-Libs programmatic SEO doorway pages?
2. Anti-Fabrication & Visual Integrity (ADS-LVC-04, ADS-IMG-01): Are there fabricated first-person empirical claims ("In our 30-day lab test..."), or generic stock placeholder URLs (picsum.photos / unsplash) instead of deterministic inline <svg> technical diagrams?
3. Ad Placement, CLS & System Route Suppression (ADS-UX-01..05): Are there layout shift hazards (missing min-h-[280px]), < 24px accidental click traps, or active ads inside 404/auth/system routes?
4. Trust Endpoints, Consent Mode v2 & TCF v2.2 (ADS-CMP-01..03, ADS-TRUST-01): Are /privacy (DoubleClick DART cookie), /about (Editorial Corrections Policy), /contact (real domain email, zero @example.com), /terms, Consent Mode v2 default-denied, and IAB TCF v2.2 present?
5. Technical Crawlability & Ownership (ADS-TEC-01..07): Are /ads.txt, /robots.txt (Mediapartners-Google allowed), /sitemap.xml, Schema.org JSON-LD + BreadcrumbList, and <meta name="google-adsense-account"> properly configured?

Return a structured JSON evaluation.`;

    const outcome =
      provider === 'gemini'
        ? await runGeminiWithFailover(candidates, resolvedModel, prompt, false)
        : await runOpenAiCompatibleWithFailover(
            provider,
            provider === 'groq'
              ? 'https://api.groq.com/openai/v1'
              : nvidiaNimBaseUrl,
            candidates,
            resolvedModel,
            prompt,
            false
          );

    return NextResponse.json({
      aiAudit: outcome.parsed,
      providerMeta: {
        provider,
        model: resolvedModel,
        keySourceUsed: outcome.keySourceUsed,
        keyIndexUsed: outcome.keyIndexUsed,
        totalCandidateKeys: candidates.length,
        latencyMs: Date.now() - startedAt,
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Failed to execute semantic AI audit.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
