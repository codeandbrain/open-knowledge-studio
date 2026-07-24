/**
 * SearchPanel — Full-text search across all knowledge base content.
 * Powered by client-side search engine (zero backend, zero API key).
 * @license SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback } from 'react';
import { KBFile, DocumentTag, SearchResult } from '../types';
import { buildSearchIndex, search } from '../services/searchService';
import { Search, FileText, X, Tag } from './icons/lucide-shim';

interface Props {
  files: KBFile[];
  tags: DocumentTag[];
  onFileSelect: (file: KBFile) => void;
}

const SearchPanel: React.FC<Props> = ({ files, tags, onFileSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  // Rebuild index when files/tags change
  useEffect(() => {
    buildSearchIndex(files, tags);
  }, [files, tags]);

  // Search on query change
  useEffect(() => {
    if (query.trim().length >= 2) {
      const r = search(query.trim());
      setResults(r);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    const file = files.find((f) => f.id === result.fileId);
    if (file) {
      onFileSelect(file);
    }
  };

  // Keyboard shortcut: Ctrl/Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsFocused(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Search input */}
      <div className="px-3 py-3 border-b border-[#2a2a3e]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search all documents... (Ctrl+K)"
            className="w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 placeholder-gray-500"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-300">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="mt-1.5 text-[10px] text-gray-600">{files.length} files indexed</div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-2">
        {query.trim().length < 2 ? (
          <div className="text-center py-8 text-gray-500">
            <Search size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">Type at least 2 characters to search</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-xs">No results found for "{query}"</p>
          </div>
        ) : (
          <div className="space-y-1">
            {results.map((r) => (
              <button
                key={r.fileId}
                onClick={() => handleSelect(r)}
                className="w-full text-left p-2 rounded-lg hover:bg-[#2a2a3e] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText size={12} className="text-indigo-400 shrink-0" />
                  <span className="text-xs font-medium truncate">{r.fileName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    r.matchedField === 'name' ? 'bg-indigo-500/20 text-indigo-400' :
                    r.matchedField === 'tags' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>{r.matchedField}</span>
                </div>
                {r.snippet && (
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2" dangerouslySetInnerHTML={{
                    __html: r.snippet.replace(/___HIGHLIGHT___/g, '<mark class="bg-yellow-500/30 text-yellow-200 rounded px-0.5">').replace(/___\/HIGHLIGHT___/g, '</mark>')
                  }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;
