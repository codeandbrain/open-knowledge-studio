/**
 * ChatInterface — Multi-provider AI chat with voice input, thinking mode, and context grounding.
 * @license SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, MessageSender, ProviderConfig, KBFile } from '../types';
import { queryLLM, getInitialSuggestions } from '../services/geminiService';
import { Search, Send, Mic, MicOff, Sparkles, Loader2, Download } from './icons/lucide-shim';

interface Props {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  providerConfig: ProviderConfig;
  files: KBFile[];
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  initialSuggestions: string[];
  isFetchingSuggestions: boolean;
  setIsFetchingSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
  setInitialSuggestions: React.Dispatch<React.SetStateAction<string[]>>;
}

const ChatInterface: React.FC<Props> = ({
  messages, setMessages, providerConfig, files, isLoading, setIsLoading,
  initialSuggestions, isFetchingSuggestions, setIsFetchingSuggestions, setInitialSuggestions,
}) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [turnDepth, setTurnDepth] = useState(10);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load initial suggestions
  useEffect(() => {
    if (messages.length === 0 && initialSuggestions.length === 0) {
      setIsFetchingSuggestions(true);
      getInitialSuggestions(providerConfig).then((suggestions) => {
        setInitialSuggestions(suggestions);
        setIsFetchingSuggestions(false);
      }).catch(() => setIsFetchingSuggestions(false));
    }
  }, [providerConfig]);

  // Speech recognition setup
  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setInput(transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  // Build context documents string
  const getContextDocs = useCallback(() => {
    const activeFiles = files.filter((f) => f.isActive);
    if (activeFiles.length === 0) return undefined;
    return activeFiles.map((f) => `### ${f.name}\n${f.content}`).join('\n\n');
  }, [files]);

  // Send message
  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      text: messageText,
      sender: MessageSender.USER,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    const loadingMsg: ChatMessage = {
      id: `loading-${Date.now()}`,
      text: '',
      sender: MessageSender.MODEL,
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMsg]);

    const contextDocs = getContextDocs();
    const recentMessages = messages.slice(-turnDepth);

    try {
      const response = await queryLLM(recentMessages, providerConfig, contextDocs);
      setMessages((prev) => prev.map((m) =>
        m.id === loadingMsg.id ? { ...m, text: response, isLoading: false, provider: providerConfig.provider, modelName: providerConfig.selectedModel } : m
      ));
    } catch (err) {
      setMessages((prev) => prev.map((m) =>
        m.id === loadingMsg.id ? { ...m, text: `Error: ${(err as Error).message}`, isLoading: false } : m
      ));
    }
  };

  // Export chat
  const exportChat = () => {
    const content = messages.map((m) => `[${m.sender}] ${m.text}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a3e]">
        <div className="flex items-center gap-2">
          <Sparkles size={18} color="#4f46e5" />
          <span className="text-sm font-medium">AI Chat</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#4f46e5]/20 text-indigo-400">{providerConfig.selectedModel}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Context turns:</label>
          <input type="range" min={2} max={30} value={turnDepth} onChange={(e) => setTurnDepth(Number(e.target.value))} className="w-20 h-1 accent-indigo-500" />
          <span className="text-xs text-gray-500 w-4">{turnDepth}</span>
          <button onClick={exportChat} className="p-1.5 rounded hover:bg-[#2a2a3e]" title="Export chat"><Download size={14} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-container px-4 py-3 space-y-4">
        {messages.length === 0 && initialSuggestions.length > 0 && !isRecording && (
          <div className="space-y-3 mt-8">
            <p className="text-sm text-gray-400">Try asking:</p>
            {initialSuggestions.map((s, i) => (
              <button key={i} onClick={() => handleSend(s)} className="block w-full text-left p-3 rounded-lg bg-[#1a1a2e] border border-[#2a2a3e] hover:border-indigo-500/50 text-sm transition-colors">
                {s}
              </button>
            ))}
            {isFetchingSuggestions && <p className="text-xs text-gray-500">Loading suggestions...</p>}
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
              msg.sender === MessageSender.USER
                ? 'bg-indigo-600 text-white'
                : 'bg-[#1a1a2e] border border-[#2a2a3e] text-gray-200'
            }`}>
              {msg.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking...
                </div>
              ) : (
                <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
              )}
              {msg.modelName && !msg.isLoading && (
                <div className="text-[10px] text-gray-500 mt-1">{msg.modelName}</div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#2a2a3e]">
        <div className="flex items-center gap-2">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-lg transition-colors ${isRecording ? 'bg-red-500/20 text-red-400 voice-recording' : 'hover:bg-[#2a2a3e] text-gray-400'}`}
            title={isRecording ? 'Stop recording' : 'Voice input'}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask anything... (Enter to send)"
            className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 placeholder-gray-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        {files.filter((f) => f.isActive).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-[10px] text-gray-500">Active context:</span>
            {files.filter((f) => f.isActive).map((f) => (
              <span key={f.id} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">{f.name}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
