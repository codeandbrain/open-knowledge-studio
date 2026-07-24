/**
 * Zero-dependency Markdown parser (CommonMark subset).
 * Supports: headings, emphasis, lists, tables, code fences, links, images, blockquotes, hr.
 * Routes code blocks through highlight.ts for syntax highlighting.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { highlight, getLanguage } from './highlight';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderInline(text: string): string {
  // Images ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:6px;margin:0.4em 0;">');
  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  // Inline code `code`
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold **text** or __text__
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // Italic *text* or _text_
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/_(.+?)_/g, '<em>$1</em>');
  // Strikethrough ~~text~~
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');
  return text;
}

export function parse(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Code fence
    const codeFence = line.match(/^```(\w*)$/);
    if (codeFence) {
      const lang = codeFence[1] || '';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].match(/^```\s*$/)) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      const rawCode = codeLines.join('\n');
      const langClass = lang ? getLanguage(lang) : '';
      const highlighted = lang ? highlight(rawCode, lang) : escapeHtml(rawCode);
      html.push(`<pre><code class="hljs${langClass ? ' language-' + langClass : ''}">${highlighted}</code></pre>`);
      continue;
    }

    // KaTeX display math $$...$$
    if (line.trim().startsWith('$$')) {
      const mathLines: string[] = [line.trim().replace(/^\$\$/, '')];
      i++;
      while (i < lines.length && !lines[i].trim().endsWith('$$')) {
        mathLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        mathLines.push(lines[i].trim().replace(/\$\$$/, ''));
        i++;
      }
      const mathExpr = mathLines.join(' ').trim();
      html.push(`<div class="katex-display"><span class="katex-math" data-math="${escapeHtml(mathExpr)}">${escapeHtml(mathExpr)}</span></div>`);
      continue;
    }

    // Inline KaTeX $...$
    const inlineMath = line.match(/\$([^\$\n]+)\$/g);
    let processedLine = line;
    if (inlineMath) {
      for (const match of inlineMath) {
        const expr = match.slice(1, -1);
        processedLine = processedLine.replace(match, `<span class="katex-inline" data-math="${escapeHtml(expr)}">${escapeHtml(expr)}</span>`);
      }
    }

    // Heading
    const headingMatch = processedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const id = headingMatch[2].toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      html.push(`<h${level} id="${id}">${renderInline(headingMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (line.match(/^(-{3,}|\*{3,}|_{3,})\s*$/)) {
      html.push('<hr>');
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      html.push(`<blockquote>${quoteLines.map((l) => `<p>${renderInline(l)}</p>`).join('')}</blockquote>`);
      continue;
    }

    // Unordered list
    if (line.match(/^\s*[-*+]\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\s*[-*+]\s+/)) {
        listItems.push(`<li>${renderInline(lines[i].replace(/^\s*[-*+]\s+/, ''))}</li>`);
        i++;
      }
      html.push(`<ul>${listItems.join('')}</ul>`);
      continue;
    }

    // Ordered list
    if (line.match(/^\s*\d+\.\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\s*\d+\.\s+/)) {
        listItems.push(`<li>${renderInline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`);
        i++;
      }
      html.push(`<ol>${listItems.join('')}</ol>`);
      continue;
    }

    // Task list
    if (line.match(/^\s*[-*+]\s+\[[ x]\]\s+/)) {
      const taskItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\s*[-*+]\s+\[[ x]\]\s+/)) {
        const checked = lines[i].includes('[x]');
        const text = lines[i].replace(/^\s*[-*+]\s+\[[ x]\]\s+/, '');
        taskItems.push(`<li><input type="checkbox" ${checked ? 'checked' : ''} disabled> ${renderInline(text)}</li>`);
        i++;
      }
      html.push(`<ul style="list-style:none;padding-left:0.5em;">${taskItems.join('')}</ul>`);
      continue;
    }

    // Table
    if (line.includes('|') && lines[i + 1]?.match(/^\|?\s*[-:]+[-| :\s]*$/)) {
      const headerCells = line.split('|').map((c) => c.trim()).filter(Boolean);
      i += 2; // skip header and separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) {
        const cells = lines[i].split('|').map((c) => c.trim()).filter(Boolean);
        rows.push(cells);
        i++;
      }
      html.push('<div style="overflow-x:auto;"><table><thead><tr>');
      headerCells.forEach((cell) => { html.push(`<th>${renderInline(cell)}</th>`); });
      html.push('</tr></thead><tbody>');
      rows.forEach((row) => {
        html.push('<tr>');
        row.forEach((cell) => { html.push(`<td>${renderInline(cell)}</td>`); });
        html.push('</tr>');
      });
      html.push('</tbody></table></div>');
      continue;
    }

    // Regular paragraph
    html.push(`<p>${renderInline(processedLine)}</p>`);
    i++;
  }

  return html.join('\n');
}

/* ─── Table of Contents Generator ─── */
export function generateTOC(markdown: string): { id: string; text: string; level: number }[] {
  const lines = markdown.split('\n');
  const toc: { id: string; text: string; level: number }[] = [];
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2];
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      toc.push({ id, text, level });
    }
  }
  return toc;
}
