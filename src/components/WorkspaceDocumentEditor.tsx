/**
 * WorkspaceDocumentEditor — Split-pane editor with live preview, TOC, version history, and export.
 * @license SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { KBFile, DocumentVersion } from '../types';
import { parse, generateTOC } from '../utils/markdown';
import { Edit, Download, Clock, Plus, X, Eye, Layout, Copy } from './icons/lucide-shim';

interface Props {
  file: KBFile | null;
  onSave: (file: KBFile) => void;
  versions: DocumentVersion[];
  onSaveVersion: (docId: string, content: string, label?: string) => void;
  templates: { id: string; name: string; content: string; category: string }[];
}

export const WorkspaceDocumentEditor: React.FC<Props> = ({ file, onSave, versions, onSaveVersion, templates }) => {
  const [content, setContent] = useState('');
  const [showTOC, setShowTOC] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [renderedHTML, setRenderedHTML] = useState('');
  const [toast, setToast] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (file) {
      setContent(file.content);
      const html = parse(file.content);
      setRenderedHTML(html);
    } else {
      setContent('');
      setRenderedHTML('');
    }
  }, [file?.id]);

  // Render KaTeX after content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (previewRef.current && (window as any).renderMathInElement) {
        try {
          (window as any).renderMathInElement(previewRef.current, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
            ],
            throwOnError: false,
          });
        } catch {}
      }
      // Also render Mermaid
      if (previewRef.current && (window as any).mermaid) {
        (window as any).mermaid.run({ nodes: previewRef.current.querySelectorAll('.language-mermaid') });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [renderedHTML]);

  // Auto-save (debounced)
  useEffect(() => {
    if (!file) return;
    const timer = setTimeout(() => {
      const updated: KBFile = { ...file, content, size: `${(content.length / 1024).toFixed(1)} KB` };
      onSave(updated);
    }, 2000);
    return () => clearTimeout(timer);
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setRenderedHTML(parse(newContent));
  };

  const handleTOCLinkClick = (id: string) => {
    const el = previewRef.current?.querySelector(`#${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const saveVersion = () => {
    if (!file) return;
    const label = `v${versions.length + 1}`;
    onSaveVersion(file.id, content, label);
    setToast('Version saved');
    setTimeout(() => setToast(''), 2000);
  };

  const exportMarkdown = () => {
    if (!file) return;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportHTML = () => {
    if (!file) return;
    const htmlDoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${file.name}</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.17.0/dist/katex.min.css"></head><body style="max-width:800px;margin:0 auto;padding:2em;font-family:system-ui;"><div class="prose">${renderedHTML}</div></body></html>`;
    const blob = new Blob([htmlDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.md$/, '.html');
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyContent = () => {
    navigator.clipboard.writeText(content).then(() => {
      setToast('Copied to clipboard');
      setTimeout(() => setToast(''), 2000);
    });
  };

  const injectTemplate = (templateContent: string) => {
    setContent((prev) => prev + '\n\n' + templateContent);
    setShowTemplates(false);
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <Edit size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a file to edit</p>
        </div>
      </div>
    );
  }

  const toc = generateTOC(content);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a3e]">
        <div className="flex items-center gap-2">
          <Edit size={14} className="text-indigo-400" />
          <span className="text-sm font-medium">{file.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowTOC(!showTOC)} className={`p-1.5 rounded ${showTOC ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-[#2a2a3e] text-gray-400'}`} title="Table of Contents"><Layout size={14} /></button>
          <button onClick={() => setShowTemplates(!showTemplates)} className="p-1.5 rounded hover:bg-[#2a2a3e] text-gray-400" title="Templates"><Plus size={14} /></button>
          <button onClick={() => setShowVersions(!showVersions)} className="p-1.5 rounded hover:bg-[#2a2a3e] text-gray-400" title="Versions"><Clock size={14} /></button>
          <button onClick={saveVersion} className="p-1.5 rounded hover:bg-[#2a2a3e] text-gray-400" title="Save version"><Eye size={14} /></button>
          <button onClick={copyContent} className="p-1.5 rounded hover:bg-[#2a2a3e] text-gray-400" title="Copy"><Copy size={14} /></button>
          <button onClick={exportMarkdown} className="p-1.5 rounded hover:bg-[#2a2a3e] text-gray-400" title="Export .md"><Download size={14} /></button>
          <button onClick={exportHTML} className="p-1.5 rounded hover:bg-[#2a2a3e] text-gray-400" title="Export .html"><Download size={14} /></button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="absolute top-12 right-4 z-50 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">{toast}</div>
      )}

      {/* Templates panel */}
      {showTemplates && (
        <div className="absolute top-12 right-4 z-40 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg shadow-xl p-3 w-72 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium">Templates</span>
            <button onClick={() => setShowTemplates(false)}><X size={12} /></button>
          </div>
          {templates.map((t) => (
            <button key={t.id} onClick={() => injectTemplate(t.content)} className="block w-full text-left p-2 rounded hover:bg-[#2a2a3e] text-xs mb-1">
              <span className="font-medium">{t.name}</span>
              <span className="block text-[10px] text-gray-500">{t.category}</span>
            </button>
          ))}
          {templates.length === 0 && <p className="text-[10px] text-gray-500">No templates available</p>}
        </div>
      )}

      {/* Versions panel */}
      {showVersions && (
        <div className="absolute top-12 right-4 z-40 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg shadow-xl p-3 w-72 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium">Version History</span>
            <button onClick={() => setShowVersions(false)}><X size={12} /></button>
          </div>
          {versions.filter((v) => v.documentId === file.id).map((v) => (
            <div key={v.id} className="flex items-center gap-2 p-2 rounded hover:bg-[#2a2a3e] text-xs">
              <Clock size={12} className="text-gray-500" />
              <div>
                <span className="font-medium">{v.label || 'Version'}</span>
                <span className="block text-[10px] text-gray-500">{new Date(v.createdAt).toLocaleString()} — {v.size}</span>
              </div>
              <button onClick={() => { setContent(v.content); setRenderedHTML(parse(v.content)); }} className="ml-auto text-[10px] text-indigo-400">Restore</button>
            </div>
          ))}
          {versions.filter((v) => v.documentId === file.id).length === 0 && <p className="text-[10px] text-gray-500">No versions yet</p>}
        </div>
      )}

      {/* Split Pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* TOC sidebar */}
        {showTOC && toc.length > 0 && (
          <div className="w-48 border-r border-[#2a2a3e] overflow-y-auto p-2 shrink-0">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Contents</div>
            {toc.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTOCLinkClick(item.id)}
                className="block w-full text-left text-xs py-0.5 hover:text-indigo-400 truncate"
                style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
              >
                {item.text}
              </button>
            ))}
          </div>
        )}

        {/* Editor (left) */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            className="w-full h-full bg-[#0f0f1a] text-gray-200 p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed"
            placeholder="Start writing in Markdown..."
            spellCheck={false}
          />
        </div>

        {/* Preview (right) */}
        <div className="flex-1 min-w-0 border-l border-[#2a2a3e] overflow-y-auto">
          <div ref={previewRef} className="prose p-4" dangerouslySetInnerHTML={{ __html: renderedHTML }} />
        </div>
      </div>
    </div>
  );
};
