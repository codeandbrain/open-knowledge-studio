/**
 * Zero-dependency syntax highlighter.
 * Covers JS/TS/Python/Go/Bash/SQL/JSON/YAML/Markdown/HTML/CSS.
 * Regex-based, no external library required.
 * @license SPDX-License-Identifier: Apache-2.0
 */

const KEYWORDS: Record<string, string[]> = {
  javascript: ['const','let','var','function','return','if','else','for','while','do','switch','case','break','continue','new','delete','typeof','instanceof','this','import','export','default','from','class','extends','super','constructor','async','await','try','catch','finally','throw','yield','of','in','null','undefined','true','false','NaN','Infinity','void','debugger','enum','interface','type','implements'],
  typescript: ['const','let','var','function','return','if','else','for','while','do','switch','case','break','continue','new','delete','typeof','instanceof','this','import','export','default','from','class','extends','super','constructor','async','await','try','catch','finally','throw','yield','of','in','null','undefined','true','false','NaN','Infinity','void','debugger','enum','interface','type','implements','readonly','abstract','static','public','private','protected','as','is','keyof','namespace','declare','module','any','string','number','boolean','unknown','never','void','object'],
  python: ['def','class','return','if','elif','else','for','while','try','except','finally','raise','import','from','as','with','yield','lambda','pass','break','continue','and','or','not','in','is','None','True','False','global','nonlocal','assert','del','print','async','await'],
  go: ['package','import','func','return','if','else','for','range','switch','case','default','break','continue','go','defer','select','chan','map','struct','interface','type','var','const','new','make','len','cap','append','copy','close','delete','panic','recover','nil','true','false','iota','go'],
  bash: ['if','then','else','elif','fi','for','while','do','done','case','esac','function','return','local','export','source','echo','cat','grep','sed','awk','find','xargs','cd','ls','mkdir','rm','cp','mv','chmod','chown','sudo','apt','yum','pip','npm','git','docker','kubectl','curl','wget'],
  sql: ['SELECT','FROM','WHERE','AND','OR','NOT','IN','LIKE','ORDER','BY','GROUP','HAVING','LIMIT','OFFSET','JOIN','INNER','LEFT','RIGHT','FULL','OUTER','ON','INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','ALTER','DROP','INDEX','VIEW','AS','DISTINCT','COUNT','SUM','AVG','MAX','MIN','NULL','TRUE','FALSE','IS','BETWEEN','EXISTS','UNION','ALL','PRIMARY','KEY','FOREIGN','REFERENCES','DEFAULT','NOT','CASCADE','CONSTRAINT'],
  json: [],
  yaml: [],
  markdown: [],
  html: [],
  css: [],
};

const ALIASES: Record<string, string> = {
  js: 'javascript', ts: 'typescript', tsx: 'typescript', jsx: 'javascript',
  py: 'python', sh: 'bash', shell: 'bash', zsh: 'bash',
  sql: 'sql', json: 'json', yml: 'yaml', yaml: 'yaml',
  md: 'markdown', markdown: 'markdown',
  htm: 'html', html: 'html', xml: 'html',
  css: 'css', scss: 'css', less: 'css',
};

export function getLanguage(alias: string): string {
  return ALIASES[alias.toLowerCase()] || alias.toLowerCase();
}

export function highlight(code: string, language: string): string {
  const lang = getLanguage(language);
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (lang === 'json') {
    return highlightJSON(escaped);
  }
  if (lang === 'yaml') {
    return highlightYAML(escaped);
  }
  if (lang === 'html') {
    return highlightHTML(escaped);
  }
  if (lang === 'css') {
    return highlightCSS(escaped);
  }

  // General language highlighting
  let result = escaped;

  // Strings (double and single quoted)
  result = result.replace(/(["'])(?:(?!\1|\\).|\\.)*\1/g, '<span class="hljs-string">$&</span>');

  // Comments
  result = result.replace(/(\/\/[^\n]*)/g, '<span class="hljs-comment">$1</span>');
  result = result.replace(/(#[^\n]*)/g, '<span class="hljs-comment">$1</span>');
  result = result.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="hljs-comment">$1</span>');

  // Numbers
  result = result.replace(/\b(\d+\.?\d*)\b/g, '<span class="hljs-number">$1</span>');

  // Keywords
  const kws = KEYWORDS[lang] || [];
  if (kws.length > 0) {
    const kwRegex = new RegExp(`\\b(${kws.join('|')})\\b`, 'g');
    result = result.replace(kwRegex, (match) => {
      // Don't highlight keywords inside already-highlighted spans
      if (match.startsWith('<')) return match;
      return `<span class="hljs-keyword">${match}</span>`;
    });
  }

  // Function calls
  result = result.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span class="hljs-function">$1</span>');

  return result;
}

function highlightJSON(code: string): string {
  let result = code;
  result = result.replace(/(["'])(?:(?!\1|\\).|\\.)*\1/g, (m) =>
    m.startsWith('"') ? `<span class="hljs-string">${m}</span>` : m
  );
  result = result.replace(/\b(true|false|null)\b/g, '<span class="hljs-keyword">$1</span>');
  result = result.replace(/\b(-?\d+\.?\d*)\b/g, '<span class="hljs-number">$1</span>');
  return result;
}

function highlightYAML(code: string): string {
  const lines = code.split('\n');
  return lines.map((line) => {
    if (line.includes(':')) {
      const [key, ...rest] = line.split(':');
      const value = rest.join(':');
      if (key.trim() && !key.includes(' ')) {
        return `<span class="hljs-keyword">${key}:</span>${value}`;
      }
    }
    if (line.trim().startsWith('- ')) {
      return line.replace(/^- /, '<span class="hljs-keyword">-</span> ');
    }
    return line;
  }).join('\n');
}

function highlightHTML(code: string): string {
  let result = code;
  result = result.replace(/(&lt;\/?[a-zA-Z][a-zA-Z0-9]*)/g, '<span class="hljs-keyword">$1</span>');
  result = result.replace(/(&gt;)/g, '<span class="hljs-keyword">$1</span>');
  result = result.replace(/\b([a-zA-Z-]+)=/g, '<span class="hljs-variable">$1</span>=');
  result = result.replace(/(["'])(?:(?!\1|\\).|\\.)*\1/g, '<span class="hljs-string">$&</span>');
  result = result.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="hljs-comment">$1</span>');
  return result;
}

function highlightCSS(code: string): string {
  let result = code;
  result = result.replace(/([.#][a-zA-Z_-][a-zA-Z0-9_-]*)/g, '<span class="hljs-function">$1</span>');
  result = result.replace(/\b([a-zA-Z-]+)\s*:/g, '<span class="hljs-variable">$1</span>:');
  result = result.replace(/(["'])(?:(?!\1|\\).|\\.)*\1/g, '<span class="hljs-string">$&</span>');
  result = result.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="hljs-comment">$1</span>');
  result = result.replace(/\b(\d+\.?\d*(px|em|rem|%|vh|vw|s|ms|deg))\b/g, '<span class="hljs-number">$1</span>');
  return result;
}
