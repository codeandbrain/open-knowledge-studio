/**
 * Open Knowledge Studio v2 — Shared Type Definitions
 * @license SPDX-License-Identifier: Apache-2.0
 */

/* ─── Message & Chat Types ─── */
export enum MessageSender {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
}

export interface UrlContextMetadataItem {
  retrievedUrl: string;
  urlRetrievalStatus: string;
}

export interface ToolCallItem {
  toolName: string;
  query: string;
  resultSummary?: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date;
  isLoading?: boolean;
  urlContext?: UrlContextMetadataItem[];
  toolCalls?: ToolCallItem[];
  provider?: string;
  modelName?: string;
  thinkingSeconds?: number;
  thinkingContent?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  provider: LLMProvider;
  modelName: string;
}

/* ─── LLM Provider Types ─── */
export type LLMProvider = 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'groq' | 'ollama';

export interface ProviderConfig {
  provider: LLMProvider;
  apiKey: string;
  selectedModel: string;
  temperature: number;
  enableThinking: boolean;
  thinkingLevel: 'low' | 'medium' | 'high';
  enableSearchGrounding: boolean;
  enableMapsGrounding: boolean;
  maxTokens?: number;
  customEndpoint?: string; // For Ollama / custom endpoints
}

/* ─── Knowledge Base File & Folder Types ─── */
export type FileType = 'pdf' | 'doc' | 'sheet' | 'slides' | 'csv' | 'json' | 'markdown' | 'text' | 'image';

export interface KBFile {
  id: string;
  name: string;
  type: FileType;
  content: string;
  size: string;
  url?: string;
  parentFolderId?: string | null;
  isActive: boolean;
  createdAt: Date;
  metadata?: {
    rowsCount?: number;
    pagesCount?: number;
    slideCount?: number;
  };
}

export interface KBFolder {
  id: string;
  name: string;
  parentFolderId?: string | null;
}

/* ─── URL Groups (for AI context grounding) ─── */
export interface URLGroup {
  id: string;
  name: string;
  urls: string[];
  userId?: string;
}

/* ─── MCP Tool & Server Standards ─── */
export interface MCPTool {
  name: string;
  description: string;
  parameters: string;
  isActive: boolean;
}

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected';
  tools: MCPTool[];
}

/* ─── A2A Collaboration Types ─── */
export interface A2AAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  systemPrompt: string;
  color: string;
  isActive: boolean;
}

export interface SavedPrompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  createdAt: Date | string;
}

/* ─── Observability & Metrics ─── */
export interface A2AMetric {
  id: string;
  timestamp: string;
  topic: string;
  agentId: string;
  agentName: string;
  latencyMs: number;
  thinkingSeconds?: number;
  tokensEstimated: number;
  status: 'success' | 'error';
}

/* ─── Sandbox Settings ─── */
export interface SandboxSettings {
  strictSandbox: boolean;
  allowedOutbound: boolean;
  showAuditLedger: boolean;
}

/* ─── Document Version History (v2 NEW) ─── */
export interface DocumentVersion {
  id: string;
  documentId: string;
  content: string;
  createdAt: Date;
  size: string;
  label?: string;
}

/* ─── Kanban Task Board (v2 NEW) ─── */
export interface TaskColumn {
  id: string;
  title: string;
  color: string;
  order: number;
}

export interface TaskCard {
  id: string;
  title: string;
  description: string;
  columnId: string;
  order: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  tags: string[];
  createdAt: Date;
}

export interface KanbanBoard {
  id: string;
  title: string;
  columns: TaskColumn[];
  cards: TaskCard[];
}

/* ─── Document Tag & Category (v2 NEW) ─── */
export interface DocumentTag {
  id: string;
  name: string;
  color: string;
}

/* ─── Feedback Item (v2 NEW) ─── */
export interface FeedbackItem {
  id: string;
  documentId: string;
  userId: string;
  type: 'helpful' | 'not_helpful';
  comment?: string;
  createdAt: Date;
}

/* ─── Template Types (v2 NEW) ─── */
export type TemplateCategory = 'epidemiology' | 'clinical' | 'research' | 'project' | 'mcp' | 'mermaid' | 'math' | 'custom';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  content: string;
  icon?: string;
}

/* ─── App-wide State ─── */
export type AppView = 'chat' | 'editor' | 'observability' | 'kanban' | 'templates' | 'search' | 'settings';

export interface AppState {
  currentUser: AppUser | null;
  files: KBFile[];
  folders: KBFolder[];
  chatMessages: ChatMessage[];
  providerConfig: ProviderConfig;
  urlGroups: URLGroup[];
  savedPrompts: SavedPrompt[];
  a2aAgents: A2AAgent[];
  a2aMetrics: A2AMetric[];
  sandboxSettings: SandboxSettings;
  activeView: AppView;
  isDarkMode: boolean;
  isOnline: boolean;
  kanbanBoards: KanbanBoard[];
  documentVersions: DocumentVersion[];
  templates: DocumentTemplate[];
  tags: DocumentTag[];
}

/* ─── Google Auth Types ─── */
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/* ─── Search Result Type ─── */
export interface SearchResult {
  fileId: string;
  fileName: string;
  score: number;
  snippet: string;
  matchedField: 'name' | 'content' | 'tags';
}
