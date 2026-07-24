/**
 * Client-Side Search Engine — Zero-dependency fuzzy full-text search.
 * Implements token-based scoring across file names, content, and tags.
 * No backend, no API key, no external library required.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { KBFile, DocumentTag, SearchResult } from '../types';

interface SearchIndexEntry {
  fileId: string;
  fileName: string;
  content: string;
  tags: string[];
  tokens: string[];
}

let searchIndex: SearchIndexEntry[] = [];
let isIndexed = false;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

export function buildSearchIndex(files: KBFile[], tags: DocumentTag[] = []): void {
  const tagMap = new Map(tags.map((t) => [t.id, t.name.toLowerCase()]));

  searchIndex = files.map((file) => {
    const fileTags = (file as any).tagIds || [];
    const tagNames = fileTags
      .map((tid: string) => tagMap.get(tid) || '')
      .filter(Boolean);

    return {
      fileId: file.id,
      fileName: file.name.toLowerCase(),
      content: file.content.toLowerCase(),
      tags: tagNames,
      tokens: tokenize(file.name + ' ' + file.content.substring(0, 5000) + ' ' + tagNames.join(' ')),
    };
  });

  isIndexed = true;
}

export function search(query: string, maxResults: number = 20): SearchResult[] {
  if (!isIndexed || !query.trim()) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const results: SearchResult[] = [];

  for (const entry of searchIndex) {
    let score = 0;

    for (const qt of queryTokens) {
      // Exact filename match (highest weight)
      if (entry.fileName.includes(qt)) {
        score += 10;
      }

      // Tag match (high weight)
      if (entry.tags.some((t) => t.includes(qt))) {
        score += 8;
      }

      // Content match (moderate weight)
      if (entry.content.includes(qt)) {
        score += 3;
      }

      // Fuzzy: prefix match in tokens
      if (entry.tokens.some((t) => t.startsWith(qt))) {
        score += 1;
      }
    }

    if (score > 0) {
      // Generate snippet
      const snippet = generateSnippet(entry.content, queryTokens, 120);
      const matchedField = score >= 10 ? 'name' : entry.tags.some((t) => queryTokens.some((qt) => t.includes(qt))) ? 'tags' : 'content';

      results.push({
        fileId: entry.fileId,
        fileName: entry.fileName,
        score,
        snippet,
        matchedField,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults);
}

function generateSnippet(content: string, queryTokens: string[], maxLength: number): string {
  const lower = content.toLowerCase();
  let bestStart = 0;
  let bestScore = 0;

  for (let i = 0; i < content.length - maxLength; i += 50) {
    const chunk = lower.substring(i, i + maxLength);
    let chunkScore = 0;
    for (const qt of queryTokens) {
      const idx = chunk.indexOf(qt);
      if (idx !== -1) chunkScore += qt.length;
    }
    if (chunkScore > bestScore) {
      bestScore = chunkScore;
      bestStart = i;
    }
  }

  const snippet = content.substring(bestStart, bestStart + maxLength);
  // Highlight matches
  let highlighted = snippet;
  for (const qt of queryTokens) {
    const regex = new RegExp(`(${qt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    highlighted = highlighted.replace(regex, '___HIGHLIGHT___$1___/HIGHLIGHT___');
  }
  return (bestStart > 0 ? '...' : '') + highlighted + (bestStart + maxLength < content.length ? '...' : '');
}

export function clearSearchIndex(): void {
  searchIndex = [];
  isIndexed = false;
}
