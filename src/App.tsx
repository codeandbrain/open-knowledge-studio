/**
 * Open Knowledge Studio v2 — Main Application
 * World-class, free, no-code-friendly knowledge studio.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChatMessage, MessageSender, KBFile, KBFolder, URLGroup,
  ProviderConfig, SavedPrompt, A2AAgent, A2AMetric, SandboxSettings,
  DocumentVersion, KanbanBoard, DocumentTemplate, DocumentTag,
  AppView, AppUser, SearchResult, TaskColumn, TaskCard
} from './types';
import { queryLLM, getInitialSuggestions, runA2ADebate } from './services/geminiService';
import { signInWithGoogle, logoutUser, subscribeAuth, updateUserDoc } from './services/googleAuthService';
import { search } from './services/searchService';
import { dbGetAll, dbPut, dbDelete, dbGetKey, dbSetKey, migrateLocalStorage, exportAllData } from './db/indexedDB';
import KnowledgeBaseManager from './components/KnowledgeBaseManager';
import ChatInterface from './components/ChatInterface';
import ThemeSwitcher from './components/ThemeSwitcher';
import { WorkspaceDocumentEditor } from './components/WorkspaceDocumentEditor';
import { A2AMetricsDashboard } from './components/A2AMetricsDashboard';
import { GoogleWorkspacePanel } from './components/GoogleWorkspacePanel';
import SearchPanel from './components/SearchPanel';
import {
  Sparkles, Brain, Code, ShieldCheck, Database, GitMerge, Activity, BarChart,
  Edit, BookOpen, X, Search, MessageSquare, Settings, Folder, FileText,
  Moon, Sun, Cloud, Wifi, WifiOff, Layout, Menu, Clock, Users, Zap,
  Globe, Layers, Template, Kanban, Download, Upload, Plus, Trash
} from './components/icons/lucide-shim';

/* ─── Initial Data ─── */
const INITIAL_FOLDERS: KBFolder[] = [
  { id: 'dev-guidelines', name: 'Development Guidelines' },
  { id: 'market-research', name: 'Market Intelligence' },
  { id: 'health-reports', name: 'Health & Epidemiology' },
  { id: 'templates', name: 'Templates' },
];

const INITIAL_FILES: KBFile[] = [
  {
    id: 'coding-standards', name: 'Coding Standards.md', type: 'markdown',
    content: `# Coding Standards & Guidelines\n\n1. **TypeScript First**: All components and helpers must be typed strictly.\n2. **React Hooks**: Prefer hooks and state separation.\n3. **Tailwind Styling**: Stick to clean, modular utilities and responsive borders.\n4. **Zero Dependencies**: No npm packages beyond react + react-dom.`,
    size: '0.8 KB', parentFolderId: 'dev-guidelines', isActive: true, createdAt: new Date(),
  },
  {
    id: 'architecture-map', name: 'Architecture Map.json', type: 'json',
    content: JSON.stringify({ appName: 'Open Knowledge Studio', aiEngine: 'Gemini 3.5 Flash', infrastructure: 'IndexedDB + Google Drive', security: 'Google Sign-In Auth' }, null, 2),
    size: '0.4 KB', parentFolderId: 'dev-guidelines', isActive: true, createdAt: new Date(),
  },
  {
    id: 'epi-report-template', name: 'WHO Field Report.md', type: 'markdown',
    content: `# WHO FIELD EPIDEMIOLOGY REPORT\n\n## 1. Demographic Overview\n- **Officer**: Field Unit\n- **Location**: District\n- **Date**: ${new Date().toISOString().split('T')[0]}\n\n## 2. Incident Summary\n| Metric | Value |\n|---|---|\n| Total Cases | 0 |\n| Active Cases | 0 |\n| Recovered | 0 |\n| Fatalities | 0 |\n\n## 3. SIR Model Parameters\n$$R_0 = \\frac{\\beta}{\\gamma}$$\n\n## 4. Action Items\n- [ ] Establish surveillance zone\n- [ ] Deploy rapid response team\n- [ ] Verify supply chain integrity`,
    size: '1.2 KB', parentFolderId: 'health-reports', isActive: true, createdAt: new Date(),
  },
  {
    id: 'revenue-data', name: 'Quarterly Projections.csv', type: 'csv',
    content: `Quarter,Revenue,GrowthRate,DirectCosts\nQ1-2026,245000,12%,82000\nQ2-2026,290000,18%,95000\nQ3-2026,345000,19%,112000\nQ4-2026,420000,22%,135000`,
    size: '0.5 KB', parentFolderId: 'market-research', isActive: false, createdAt: new Date(),
  },
];

const INITIAL_PROVIDER_CONFIG: ProviderConfig = {
  provider: 'gemini', apiKey: '', selectedModel: 'gemini-3.5-flash',
  temperature: 0.7, enableThinking: false, thinkingLevel: 'low',
  enableSearchGrounding: false, enableMapsGrounding: false,
};

const INITIAL_TEMPLATES: DocumentTemplate[] = [
  { id: 't1', name: 'WHO Epidemiology Report', description: 'Field epidemiology report template with SIR modeling', category: 'epidemiology', content: '# WHO FIELD REPORT\n\n## Overview\n## Incident Matrix\n## SIR Model\n## Action Items' },
  { id: 't2', name: 'System Architecture Diagram', description: 'Mermaid sequence diagram for system design', category: 'mermaid', content: '```mermaid\nsequenceDiagram\n  Client->>Server: Request\n  Server->>DB: Query\n  DB-->>Server: Data\n  Server-->>Client: Response\n```' },
  { id: 't3', name: 'Mathematical Reference', description: 'Common statistical formulas with KaTeX', category: 'math', content: '## Normal Distribution\n$$f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$$\n\n## Standard Error\n$$SE = \\frac{\\sigma}{\\sqrt{n}}$$' },
  { id: 't4', name: 'Research Paper Draft', description: 'Academic paper structure template', category: 'research', content: '# Research Paper\n\n## Abstract\n\n## 1. Introduction\n\n## 2. Methodology\n\n## 3. Results\n\n## 4. Discussion\n\n## 5. Conclusion\n\n## References' },
];

const INITIAL_URL_GROUPS: URLGroup[] = [
  { id: 'gemini-overview', name: 'Gemini Docs Overview', urls: ['https://ai.google.dev/gemini-api/docs', 'https://ai.google.dev/gemini-api/docs/models', 'https://ai.google.dev/gemini-api/docs/api-key'] },
  { id: 'model-capabilities', name: 'Model Capabilities', urls: ['https://ai.google.dev/gemini-api/docs/text-generation', 'https://ai.google.dev/gemini-api/docs/structured-output', 'https://ai.google.dev/gemini-api/docs/thinking'] },
];

const INITIAL_A2A_AGENTS: A2AAgent[] = [
  { id: 'ux-agent', name: 'Design & UX Expert', role: 'Specialist in user interfaces and visual layout', avatar: '🎨', systemPrompt: 'You are an elite Design and User Experience Engineer. Focus heavily on layout, negative space, visual rhythm, micro-interactions, responsive sizing, and high-fidelity interface design.', color: '#3B82F6', isActive: true },
  { id: 'sec-agent', name: 'Cybersecurity Architect', role: 'Specialist in OAuth, API gateways, and encryption', avatar: '🛡️', systemPrompt: 'You are an elite Cybersecurity Architect. Critique design proposals from a threat perspective, advising on credentials security, token storage, least-privilege API access, and transport encryption.', color: '#EF4444', isActive: true },
  { id: 'qa-agent', name: 'Performance & QA Analyst', role: 'Specialist in testing, benchmarking, and edge cases', avatar: '⚙️', systemPrompt: 'You are an elite QA and Performance Automation Engineer. Focus on performance bottlenecks, latency benchmarking, memory leaks, invalid state handling, and end-to-end reliability.', color: '#10B981', isActive: true },
];

const INITIAL_SAVED_PROMPTS: SavedPrompt[] = [
  { id: 'p1', title: 'Design & UX Expert', description: 'Specialist in interfaces and visual layout', content: 'You are an elite Design and User Experience Engineer. Focus heavily on layout, negative space, visual rhythm, micro-interactions, responsive sizing, and high-fidelity interface design.', category: 'Design & UX', createdAt: new Date().toISOString() },
  { id: 'p2', title: 'Cybersecurity Architect', description: 'Specialist in OAuth, API gateways, encryption', content: 'You are an elite Cybersecurity Architect. Critique design proposals from a threat perspective.', category: 'Security', createdAt: new Date().toISOString() },
  { id: 'p3', title: 'Performance & QA Analyst', description: 'Specialist in testing and benchmarking', content: 'You are an elite QA Engineer. Focus on performance bottlenecks, latency, memory leaks, and reliability.', category: 'QA & Testing', createdAt: new Date().toISOString() },
];

/* ─── App Component ─── */
const App: React.FC = () => {
  // Core state
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [files, setFiles] = useState<KBFile[]>(INITIAL_FILES);
  const [folders, setFolders] = useState<KBFolder[]>(INITIAL_FOLDERS);
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>(INITIAL_PROVIDER_CONFIG);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [initialSuggestions, setInitialSuggestions] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<AppView>('chat');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Feature state
  const [activeFile, setActiveFile] = useState<KBFile | null>(null);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>(INITIAL_SAVED_PROMPTS);
  const [a2aAgents] = useState<A2AAgent[]>(INITIAL_A2A_AGENTS);
  const [a2aMetrics, setA2aMetrics] = useState<A2AMetric[]>([]);
  const [isA2ALoading, setIsA2ALoading] = useState(false);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([]);
  const [templates] = useState<DocumentTemplate[]>(INITIAL_TEMPLATES);
  const [tags] = useState<DocumentTag[]>([
    { id: 'tag-1', name: 'epidemiology', color: '#ef4444' },
    { id: 'tag-2', name: 'architecture', color: '#3b82f6' },
    { id: 'tag-3', name: 'research', color: '#10b981' },
  ]);
  const [kanbanBoards, setKanbanBoards] = useState<KanbanBoard[]>([]);
  const [urlGroups] = useState<URLGroup[]>(INITIAL_URL_GROUPS);

  // Settings state
  const [sandboxSettings, setSandboxSettings] = useState<SandboxSettings>({ strictSandbox: true, allowedOutbound: true, showAuditLedger: false });
  const [showSettings, setShowSettings] = useState(false);
  const [showGooglePanel, setShowGooglePanel] = useState(false);

  // Persistence with IndexedDB
  useEffect(() => {
    migrateLocalStorage();
  }, []);

  // Save files to IndexedDB on change
  useEffect(() => {
    files.forEach((f) => dbPut('files', f));
  }, [files]);

  // Auth subscription
  useEffect(() => {
    const unsub = subscribeAuth((u) => setCurrentUser(u));
    return unsub;
  }, []);

  // Online/offline detection
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  // Theme toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  // Auto-save document versions (every 30s)
  useEffect(() => {
    if (!activeFile) return;
    const interval = setInterval(() => {
      const version: DocumentVersion = {
        id: `v-${Date.now()}`,
        documentId: activeFile.id,
        content: activeFile.content,
        createdAt: new Date(),
        size: `${(activeFile.content.length / 1024).toFixed(1)} KB`,
        label: `Auto-saved ${new Date().toLocaleTimeString()}`,
      };
      setDocumentVersions((prev) => [...prev.slice(-50), version]);
    }, 30000);
    return () => clearInterval(interval);
  }, [activeFile?.content]);

  // Cloud sync (when signed in)
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      updateUserDoc({
        files: JSON.parse(JSON.stringify(files)),
        folders: JSON.parse(JSON.stringify(folders)),
        providerConfig,
        savedPrompts,
        lastSync: new Date().toISOString(),
      }).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [currentUser, files, folders, providerConfig, savedPrompts]);

  // File selection handler
  const handleFileSelect = useCallback((file: KBFile) => {
    setActiveFile(file);
    setActiveView('editor');
  }, []);

  // Save file handler
  const handleSaveFile = useCallback((updatedFile: KBFile) => {
    setFiles((prev) => prev.map((f) => f.id === updatedFile.id ? updatedFile : f));
    if (activeFile?.id === updatedFile.id) setActiveFile(updatedFile);
  }, [activeFile]);

  // Version save handler
  const handleSaveVersion = useCallback((docId: string, content: string, label?: string) => {
    const version: DocumentVersion = {
      id: `v-${Date.now()}`,
      documentId: docId,
      content,
      createdAt: new Date(),
      size: `${(content.length / 1024).toFixed(1)} KB`,
      label,
    };
    setDocumentVersions((prev) => [...prev, version]);
  }, []);

  // A2A debate handler
  const handleA2ADebate = async (topic: string) => {
    setIsA2ALoading(true);
    const contextDocs = files.filter((f) => f.isActive).map((f) => `### ${f.name}\n${f.content}`).join('\n\n') || undefined;
    const responses = await runA2ADebate(topic, a2aAgents, providerConfig, contextDocs, (agentName, response, latency) => {
      const metric: A2AMetric = {
        id: `m-${Date.now()}-${agentName}`,
        timestamp: new Date().toISOString(),
        topic,
        agentId: a2aAgents.find((a) => a.name === agentName)?.id || '',
        agentName,
        latencyMs: latency,
        tokensEstimated: Math.round(response.length / 4),
        status: 'success',
      };
      setA2aMetrics((prev) => [...prev, metric]);
    });
    setIsA2ALoading(false);

    // Add debate summary to chat
    const summaryMsg: ChatMessage = {
      id: `debate-${Date.now()}`,
      text: `## A2A Debate Results\n\n${a2aAgents.map((a, i) => `### ${a.name}\n${responses[i]}`).join('\n\n')}\n\n### Consensus\n${responses[responses.length - 1]}`,
      sender: MessageSender.MODEL,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, summaryMsg]);
  };

  // Import data handler
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.files) setFiles(data.files);
    if (data.folders) setFolders(data.folders);
    if (data.providerConfig) setProviderConfig(data.providerConfig);
    if (data.savedPrompts) setSavedPrompts(data.savedPrompts);
    e.target.value = '';
  };

  // Export all data
  const handleExportAll = async () => {
    const data = await exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oks-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-[#0f0f1a] text-gray-200 overflow-hidden">
      {/* ─── Top Navigation Bar ─── */}
      <header className="h-11 flex items-center justify-between px-3 bg-[#1a1a2e] border-b border-[#2a2a3e] shrink-0 no-print">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded hover:bg-[#2a2a3e]">
            <Menu size={16} className="text-gray-400" />
          </button>
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-indigo-400" />
            <span className="text-sm font-semibold">Open Knowledge Studio</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">v2.0</span>
          </div>
          {/* View switcher */}
          <nav className="flex items-center gap-0.5 ml-4">
            {([
              { view: 'chat' as AppView, icon: <MessageSquare size={14} />, label: 'Chat' },
              { view: 'editor' as AppView, icon: <Edit size={14} />, label: 'Editor' },
              { view: 'search' as AppView, icon: <Search size={14} />, label: 'Search' },
              { view: 'observability' as AppView, icon: <Activity size={14} />, label: 'Dashboard' },
              { view: 'templates' as AppView, icon: <Template size={14} />, label: 'Templates' },
            ]).map(({ view, icon, label }) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${activeView === view ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {icon}
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Online/Offline indicator */}
          <div className="flex items-center gap-1 text-[10px]">
            {isOnline ? <Wifi size={12} className="text-green-400" /> : <WifiOff size={12} className="text-red-400" />}
            <span className={isOnline ? 'text-green-400' : 'text-red-400'}>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Cloud sync indicator */}
          {currentUser && <Cloud size={14} className="text-indigo-400" />}

          {/* Google Workspace */}
          <button onClick={() => setShowGooglePanel(!showGooglePanel)} className="p-1.5 rounded hover:bg-[#2a2a3e]" title="Google Workspace">
            <Globe size={14} className="text-gray-400" />
          </button>

          {/* Theme toggle */}
          <ThemeSwitcher isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />

          {/* Settings */}
          <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 rounded hover:bg-[#2a2a3e]">
            <Settings size={14} className="text-gray-400" />
          </button>

          {/* Auth */}
          {currentUser ? (
            <button onClick={logoutUser} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400" title={currentUser.email || ''}>
              {currentUser.photoURL && <img src={currentUser.photoURL} alt="" className="w-5 h-5 rounded-full" />}
            </button>
          ) : (
            <button onClick={signInWithGoogle} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">Sign in</button>
          )}
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── Left Sidebar ─── */}
        {isSidebarOpen && (
          <aside className="w-72 border-r border-[#2a2a3e] bg-[#1a1a2e]/50 flex flex-col shrink-0 overflow-hidden">
            <KnowledgeBaseManager
              files={files}
              folders={folders}
              setFiles={setFiles}
              setFolders={setFolders}
              onFileSelect={handleFileSelect}
              activeFileId={activeFile?.id || null}
            />
          </aside>
        )}

        {/* ─── Center Panel ─── */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {activeView === 'chat' && (
            <ChatInterface
              messages={chatMessages}
              setMessages={setChatMessages}
              providerConfig={providerConfig}
              files={files}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              initialSuggestions={initialSuggestions}
              isFetchingSuggestions={isFetchingSuggestions}
              setIsFetchingSuggestions={setIsFetchingSuggestions}
              setInitialSuggestions={setInitialSuggestions}
            />
          )}

          {activeView === 'editor' && (
            <WorkspaceDocumentEditor
              file={activeFile}
              onSave={handleSaveFile}
              versions={documentVersions}
              onSaveVersion={handleSaveVersion}
              templates={templates.map((t) => ({ id: t.id, name: t.name, content: t.content, category: t.category }))}
            />
          )}

          {activeView === 'search' && (
            <SearchPanel files={files} tags={tags} onFileSelect={handleFileSelect} />
          )}

          {activeView === 'observability' && (
            <A2AMetricsDashboard metrics={a2aMetrics} agents={a2aAgents.map((a) => ({ id: a.id, name: a.name, color: a.color, avatar: a.avatar }))} />
          )}

          {activeView === 'templates' && (
            <div className="p-4 overflow-y-auto">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Template size={16} className="text-indigo-400" /> Document Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map((t) => (
                  <div key={t.id} className="p-4 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-medium">{t.name}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">{t.category}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mb-3">{t.description}</p>
                    <button
                      onClick={() => {
                        const newFile: KBFile = {
                          id: `template-${Date.now()}`,
                          name: `${t.name}.md`,
                          type: 'markdown',
                          content: t.content,
                          size: `${(t.content.length / 1024).toFixed(1)} KB`,
                          parentFolderId: null,
                          isActive: false,
                          createdAt: new Date(),
                        };
                        setFiles((prev) => [newFile, ...prev]);
                        setActiveFile(newFile);
                        setActiveView('editor');
                      }}
                      className="text-[10px] bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* ─── Right Panel (Google Workspace) ─── */}
        {showGooglePanel && (
          <aside className="w-80 border-l border-[#2a2a3e] bg-[#1a1a2e]/50 shrink-0">
            <GoogleWorkspacePanel currentFile={activeFile || undefined} />
          </aside>
        )}
      </div>

      {/* ─── Settings Modal ─── */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3e] w-full max-w-lg max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold">Settings</h2>
              <button onClick={() => setShowSettings(false)}><X size={16} /></button>
            </div>

            {/* LLM Provider */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xs font-medium text-gray-400">AI Provider</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['gemini', 'openai', 'anthropic', 'deepseek', 'groq', 'ollama'] as const).map((p) => (
                  <button key={p} onClick={() => setProviderConfig((c) => ({ ...c, provider: p }))} className={`p-2 rounded-lg text-xs border transition-colors ${providerConfig.provider === p ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-[#2a2a3e] hover:border-[#3a3a4e]'}`}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={providerConfig.apiKey}
                onChange={(e) => setProviderConfig((c) => ({ ...c, apiKey: e.target.value }))}
                placeholder="API Key..."
                className="w-full bg-[#0f0f1a] border border-[#2a2a3e] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500/50"
              />
              <input
                type="text"
                value={providerConfig.selectedModel}
                onChange={(e) => setProviderConfig((c) => ({ ...c, selectedModel: e.target.value }))}
                placeholder="Model (e.g., gemini-3.5-flash)"
                className="w-full bg-[#0f0f1a] border border-[#2a2a3e] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500/50"
              />
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-400">Temperature:</label>
                <input type="range" min={0} max={1} step={0.1} value={providerConfig.temperature} onChange={(e) => setProviderConfig((c) => ({ ...c, temperature: parseFloat(e.target.value) }))} className="flex-1 accent-indigo-500" />
                <span className="text-xs w-8">{providerConfig.temperature}</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={providerConfig.enableThinking} onChange={(e) => setProviderConfig((c) => ({ ...c, enableThinking: e.target.checked }))} className="accent-indigo-500" />
                <label className="text-xs">Enable thinking mode</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={providerConfig.enableSearchGrounding} onChange={(e) => setProviderConfig((c) => ({ ...c, enableSearchGrounding: e.target.checked }))} className="accent-indigo-500" />
                <label className="text-xs">Enable web search grounding</label>
              </div>
            </div>

            {/* Data Management */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xs font-medium text-gray-400">Data Management</h3>
              <div className="flex gap-2">
                <button onClick={handleExportAll} className="flex items-center gap-1 text-xs bg-[#0f0f1a] border border-[#2a2a3e] rounded-lg px-3 py-2 hover:border-indigo-500/50">
                  <Download size={12} /> Export All Data
                </button>
                <label className="flex items-center gap-1 text-xs bg-[#0f0f1a] border border-[#2a2a3e] rounded-lg px-3 py-2 hover:border-indigo-500/50 cursor-pointer">
                  <Upload size={12} /> Import Data
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
            </div>

            {/* A2A Agent Management */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-gray-400">A2A Agents</h3>
              {a2aAgents.map((agent) => (
                <div key={agent.id} className="flex items-center gap-2 p-2 rounded bg-[#0f0f1a] border border-[#2a2a3e]">
                  <span className="text-sm">{agent.avatar}</span>
                  <div className="flex-1">
                    <span className="text-xs font-medium">{agent.name}</span>
                    <span className="block text-[10px] text-gray-500">{agent.role}</span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => handleA2ADebate('Discuss the best approach to build a resilient knowledge base for field researchers')}
                disabled={isA2ALoading}
                className="w-full py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {isA2ALoading ? 'Running debate...' : 'Run Demo Debate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Footer Status Bar ─── */}
      <footer className="h-6 flex items-center justify-between px-3 bg-[#1a1a2e] border-t border-[#2a2a3e] text-[10px] text-gray-500 shrink-0 no-print">
        <div className="flex items-center gap-3">
          <span>{files.length} files</span>
          <span>{folders.length} folders</span>
          <span>{documentVersions.length} versions</span>
        </div>
        <div className="flex items-center gap-3">
          <span>IndexedDB</span>
          <span>Gemini 3.5 Flash</span>
          {currentUser && <span>{currentUser.email}</span>}
        </div>
      </footer>
    </div>
  );
};

export default App;
