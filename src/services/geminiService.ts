/**
 * Multi-Provider LLM Router — Zero-dependency REST API client.
 * Supports: Gemini (3.5 Flash stable), OpenAI, Anthropic, DeepSeek, Groq, Ollama.
 * All calls via plain fetch(), no vendor SDKs.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { ChatMessage, MessageSender, ProviderConfig } from '../types';

/* ─── Gemini 3.5 Flash (Stable) ─── */
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

interface GeminiRequest {
  contents: { role: string; parts: { text: string }[] }[];
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
    thinkingConfig?: { thinkingBudget?: number };
  };
  tools?: { google_search?: Record<string, never> }[];
}

export async function queryLLM(
  messages: ChatMessage[],
  config: ProviderConfig,
  contextDocs?: string,
  systemPrompt?: string
): Promise<string> {
  switch (config.provider) {
    case 'gemini':
      return queryGemini(messages, config, contextDocs, systemPrompt);
    case 'openai':
      return queryOpenAICompatible(messages, config, contextDocs, systemPrompt, 'https://api.openai.com/v1');
    case 'deepseek':
      return queryOpenAICompatible(messages, config, contextDocs, systemPrompt, 'https://api.deepseek.com/v1');
    case 'groq':
      return queryOpenAICompatible(messages, config, contextDocs, systemPrompt, 'https://api.groq.com/openai/v1');
    case 'ollama':
      return queryOllama(messages, config, contextDocs, systemPrompt);
    case 'anthropic':
      return queryAnthropic(messages, config, contextDocs, systemPrompt);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

async function queryGemini(
  messages: ChatMessage[],
  config: ProviderConfig,
  contextDocs?: string,
  systemPrompt?: string
): Promise<string> {
  const model = config.selectedModel || 'gemini-3.5-flash';
  const apiKey = config.apiKey || (import.meta as any).env?.GEMINI_API_KEY || '';

  if (!apiKey) throw new Error('Gemini API key is required. Set GEMINI_API_KEY in .env or provider config.');

  const systemInstruction = systemPrompt
    ? { role: 'system', parts: [{ text: systemPrompt }] }
    : { role: 'system', parts: [{ text: 'You are a helpful research and knowledge assistant.' }] };

  const contextPart = contextDocs
    ? { role: 'user', parts: [{ text: `## Context Documents:\n${contextDocs}\n\nPlease reference these documents when answering.` }] }
    : null;

  const contents = [
    systemInstruction,
    ...(contextPart ? [contextPart] : []),
    ...messages
      .filter((m) => m.sender !== MessageSender.SYSTEM && !m.isLoading)
      .map((m) => ({
        role: m.sender === MessageSender.USER ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
  ];

  const body: GeminiRequest = {
    contents,
    generationConfig: {
      temperature: config.temperature,
      maxOutputTokens: 8192,
      ...(config.enableThinking && config.thinkingLevel !== 'low'
        ? { thinkingConfig: { thinkingBudget: config.thinkingLevel === 'high' ? 24576 : 8192 } }
        : {}),
    },
    ...(config.enableSearchGrounding ? { tools: [{ google_search: {} }] } : {}),
  };

  const res = await fetch(`${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
}

async function queryOpenAICompatible(
  messages: ChatMessage[],
  config: ProviderConfig,
  contextDocs: string | undefined,
  systemPrompt: string | undefined,
  baseUrl: string
): Promise<string> {
  const apiKey = config.apiKey;
  if (!apiKey) throw new Error(`API key required for ${config.provider}.`);

  const model = config.selectedModel || 'gpt-4o-mini';

  const systemMsg = systemPrompt || 'You are a helpful research and knowledge assistant.';

  const chatMessages = [
    { role: 'system', content: systemMsg },
    ...(contextDocs ? [{ role: 'user', content: `## Context:\n${contextDocs}` }] : []),
    ...messages
      .filter((m) => m.sender !== MessageSender.SYSTEM && !m.isLoading)
      .map((m) => ({
        role: m.sender === MessageSender.USER ? 'user' : 'assistant',
        content: m.text,
      })),
  ];

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: chatMessages,
      temperature: config.temperature,
      max_tokens: config.maxTokens || 4096,
      stream: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${config.provider} API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
}

async function queryOllama(
  messages: ChatMessage[],
  config: ProviderConfig,
  contextDocs: string | undefined,
  systemPrompt: string | undefined
): Promise<string> {
  const baseUrl = config.customEndpoint || 'http://localhost:11434';
  const model = config.selectedModel || 'llama3';

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
        ...(contextDocs ? [{ role: 'user', content: `## Context:\n${contextDocs}` }] : []),
        ...messages
          .filter((m) => m.sender !== MessageSender.SYSTEM && !m.isLoading)
          .map((m) => ({
            role: m.sender === MessageSender.USER ? 'user' : 'assistant',
            content: m.text,
          })),
      ],
      stream: false,
      options: { temperature: config.temperature },
    }),
  });

  if (!res.ok) throw new Error(`Ollama API error: ${res.status}`);
  const data = await res.json();
  return data.message?.content || 'No response generated.';
}

async function queryAnthropic(
  messages: ChatMessage[],
  config: ProviderConfig,
  contextDocs: string | undefined,
  systemPrompt: string | undefined
): Promise<string> {
  const apiKey = config.apiKey;
  if (!apiKey) throw new Error('Anthropic API key required.');

  const model = config.selectedModel || 'claude-3-5-sonnet-latest';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system: systemPrompt || 'You are a helpful research and knowledge assistant.',
      messages: [
        ...(contextDocs ? [{ role: 'user', content: `## Context:\n${contextDocs}` }] : []),
        ...messages
          .filter((m) => m.sender !== MessageSender.SYSTEM && !m.isLoading)
          .map((m) => ({
            role: m.sender === MessageSender.USER ? 'user' : 'assistant',
            content: m.text,
          })),
      ],
      max_tokens: config.maxTokens || 4096,
      temperature: config.temperature,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || 'No response generated.';
}

/* ─── A2A Multi-Agent Debate ─── */
export async function runA2ADebate(
  topic: string,
  agents: { name: string; systemPrompt: string; color: string; avatar: string }[],
  config: ProviderConfig,
  contextDocs?: string,
  onAgentResponse?: (agentName: string, response: string, latency: number) => void
): Promise<string[]> {
  const responses: string[] = [];

  for (const agent of agents) {
    const start = Date.now();
    try {
      const response = await queryLLM(
        [{ id: '1', text: topic, sender: MessageSender.USER, timestamp: new Date() }],
        config,
        contextDocs,
        agent.systemPrompt
      );
      const latency = Date.now() - start;
      responses.push(response);
      onAgentResponse?.(agent.name, response, latency);
    } catch (err) {
      const latency = Date.now() - start;
      responses.push(`[Error from ${agent.name}: ${(err as Error).message}]`);
      onAgentResponse?.(agent.name, `Error: ${(err as Error).message}`, latency);
    }
  }

  // Synthesis pass
  const debateSummary = await queryLLM(
    [{ id: 'debate', text: `Summarize this multi-agent debate and provide a consensus recommendation:\n\n${responses.map((r, i) => `### ${agents[i].name}:\n${r}`).join('\n\n')}`, sender: MessageSender.USER, timestamp: new Date() }],
    config,
    contextDocs,
    'You are a consensus facilitator. Synthesize multiple expert opinions into a unified recommendation.'
  );

  return [...responses, debateSummary];
}

/* ─── Initial Suggestions ─── */
export async function getInitialSuggestions(config: ProviderConfig): Promise<string[]> {
  try {
    const response = await queryLLM(
      [{ id: '1', text: 'Generate 5 diverse research questions a health program manager might explore using knowledge documents. Return only the questions, numbered.', sender: MessageSender.USER, timestamp: new Date() }],
      config,
      undefined,
      'You are a research brainstorming assistant. Be specific and actionable.'
    );
    return response.split('\n').filter((l) => l.trim()).slice(0, 5);
  } catch {
    return [];
  }
}
