'use client';

import React, { useMemo, useRef } from 'react';

const DARK_SCROLLBAR =
  '[color-scheme:dark] [scrollbar-width:thin] [scrollbar-color:#27272a_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:w-0 [&::-webkit-scrollbar-button]:h-0 [&::-webkit-scrollbar-corner]:bg-transparent';

interface TokenSpan {
  text: string;
  className: string;
}

const JS_KEYWORDS = new Set([
  'import',
  'export',
  'from',
  'const',
  'let',
  'var',
  'function',
  'return',
  'async',
  'await',
  'if',
  'else',
  'for',
  'of',
  'in',
  'try',
  'catch',
  'interface',
  'type',
  'default',
  'new',
  'typeof',
  'void',
]);

const JS_LITERALS = new Set([
  'true',
  'false',
  'null',
  'undefined',
  'NaN',
  'Infinity',
  'window',
  'document',
  'process',
  'console',
  'JSON',
  'React',
]);

/**
 * Tokenizes a single line of code (TSX / JSX / HTML / Markdown / YAML)
 * into VS Code / Atom One Dark color-coded spans using Space Mono.
 */
export function tokenizeCodeLine(line: string): TokenSpan[] {
  const trimmed = line.trimStart();

  // 1. Full-line comments (// ..., /* ..., * ..., <!-- ...)
  if (
    trimmed.startsWith('//') ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('<!--')
  ) {
    return [{ text: line, className: 'text-[#6a9955] italic' }];
  }

  // 2. Markdown headings (#, ##, ###)
  if (/^#{1,6}\s/.test(trimmed)) {
    return [{ text: line, className: 'text-[#61afef] font-bold' }];
  }

  // 3. Markdown blockquotes (> ...)
  if (trimmed.startsWith('>')) {
    return [{ text: line, className: 'text-[#e5c07b]' }];
  }

  // 4. YAML frontmatter delimiter (---)
  if (trimmed === '---') {
    return [{ text: line, className: 'text-[#c678dd]' }];
  }

  // 5. Markdown bullet list with bold prefix (- **Key:** Value or - [ ] Gate)
  if (/^-\s+\[[ xX]\]/.test(trimmed)) {
    const match = line.match(/^(\s*-\s+\[[ xX]\])(.*)$/);
    if (match) {
      return [
        { text: match[1], className: 'text-[#98c379] font-bold' },
        ...tokenizeInlineSegments(match[2]),
      ];
    }
  }

  // 6. YAML / Config key-value lines (e.g. name: adsense-compliance)
  const yamlMatch = line.match(/^(\s*[a-zA-Z0-9_-]+:)(\s+.*)$/);
  if (yamlMatch && !trimmed.startsWith('http') && !line.includes('<')) {
    return [
      { text: yamlMatch[1], className: 'text-[#e06c75]' },
      ...tokenizeInlineSegments(yamlMatch[2]),
    ];
  }

  return tokenizeInlineSegments(line);
}

function tokenizeInlineSegments(input: string): TokenSpan[] {
  const spans: TokenSpan[] = [];
  // Combined regex for comments, strings, inline code, HTML/JSX tags, attributes, numbers, and identifiers
  const tokenRegex =
    /(\/\/.*$|<!--[\s\S]*?-->|`[^`]*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\*\*[^*]+\*\*|<\/?[A-Za-z0-9_.-]+|\/>|>|\b[a-zA-Z_][a-zA-Z0-9_-]*(?=\s*=)|\b\d+(?:\.\d+)?(?:px|rem|em|ms|s|%|w)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      spans.push({
        text: input.slice(lastIndex, match.index),
        className: 'text-[#abb2bf]',
      });
    }

    const token = match[0];

    if (token.startsWith('//') || token.startsWith('<!--')) {
      spans.push({ text: token, className: 'text-[#6a9955] italic' });
    } else if (token.startsWith('**') && token.endsWith('**')) {
      spans.push({ text: token, className: 'text-[#e5c07b] font-bold' });
    } else if (token.startsWith('`')) {
      spans.push({ text: token, className: 'text-[#98c379]' });
    } else if (token.startsWith('"') || token.startsWith("'")) {
      spans.push({ text: token, className: 'text-[#98c379]' });
    } else if (token.startsWith('</') || token.startsWith('<')) {
      const tagName = token.replace(/^<\/?/, '');
      const isComponent = /^[A-Z]/.test(tagName);
      spans.push({
        text: token.startsWith('</') ? '</' : '<',
        className: 'text-[#56b6c2]',
      });
      spans.push({
        text: tagName,
        className: isComponent ? 'text-[#e5c07b] font-bold' : 'text-[#e06c75]',
      });
    } else if (token === '/>' || token === '>') {
      spans.push({ text: token, className: 'text-[#56b6c2]' });
    } else if (
      input.slice(match.index + token.length).trimStart().startsWith('=')
    ) {
      // Attribute or variable assignment
      spans.push({ text: token, className: 'text-[#d19a66]' });
    } else if (/^\d/.test(token)) {
      spans.push({ text: token, className: 'text-[#d19a66]' });
    } else if (JS_KEYWORDS.has(token)) {
      spans.push({ text: token, className: 'text-[#c678dd]' });
    } else if (JS_LITERALS.has(token)) {
      spans.push({ text: token, className: 'text-[#56b6c2]' });
    } else if (/^[A-Z][A-Za-z0-9_]*$/.test(token)) {
      spans.push({ text: token, className: 'text-[#e5c07b]' });
    } else if (
      input.slice(match.index + token.length).trimStart().startsWith('(')
    ) {
      spans.push({ text: token, className: 'text-[#61afef]' });
    } else {
      spans.push({ text: token, className: 'text-[#abb2bf]' });
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < input.length) {
    spans.push({
      text: input.slice(lastIndex),
      className: 'text-[#abb2bf]',
    });
  }

  return spans;
}

interface SyntaxCodeBlockProps {
  code: string;
  showLineNumbers?: boolean;
  maxHeightClass?: string;
  className?: string;
}

export function SyntaxCodeBlock({
  code,
  showLineNumbers = true,
  maxHeightClass = '',
  className = '',
}: SyntaxCodeBlockProps) {
  const tokenizedLines = useMemo(() => {
    const rawLines = code.split('\n');
    return rawLines.map((line) => tokenizeCodeLine(line));
  }, [code]);

  return (
    <div
      style={{ fontFamily: 'var(--font-mono), monospace' }}
      className={`bg-[#0a0c10] text-xs overflow-x-auto ${maxHeightClass} ${
        maxHeightClass ? 'overflow-y-auto' : ''
      } ${DARK_SCROLLBAR} ${className}`}
    >
      <pre
        style={{ fontFamily: 'var(--font-mono), monospace' }}
        className="p-4 sm:p-5 text-[11.5px] leading-[1.7] font-normal whitespace-pre min-w-full"
      >
        {tokenizedLines.map((spans, idx) => (
          <div
            key={idx}
            className="table-row hover:bg-white/[0.02] transition-colors"
          >
            {showLineNumbers && (
              <span className="table-cell pr-4 text-right text-[10px] text-[#4b5263] select-none w-9 tabular-nums">
                {idx + 1}
              </span>
            )}
            <span className="table-cell whitespace-pre-wrap break-words">
              {spans.length === 0 ? (
                '\n'
              ) : (
                spans.map((span, sIdx) => (
                  <span key={sIdx} className={span.className}>
                    {span.text}
                  </span>
                ))
              )}
            </span>
          </div>
        ))}
      </pre>
    </div>
  );
}

interface SyntaxCodeEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  rows?: number;
}

export function SyntaxCodeEditor({
  value,
  onChange,
  rows = 12,
}: SyntaxCodeEditorProps) {
  const preRef = useRef<HTMLPreElement>(null);

  const tokenizedLines = useMemo(() => {
    const rawLines = value.split('\n');
    return rawLines.map((line) => tokenizeCodeLine(line));
  }, [value]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  return (
    <div
      style={{ fontFamily: 'var(--font-mono), monospace' }}
      className="rounded-lg border border-white/[0.1] bg-[#0a0c10] overflow-hidden"
    >
      {/* VS Code / Atom Editor Window Header */}
      <div className="px-3.5 py-2 bg-[#11141c] border-b border-white/[0.07] flex items-center justify-between text-[11px] text-[#7f848e]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e06c75]/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#e5c07b]/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#98c379]/80 inline-block" />
          <span className="ml-2 text-[#abb2bf]">page-audit-buffer.tsx</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-[#61afef]">
          Space Mono · VS Code One Dark
        </span>
      </div>

      {/* Synchronized Overlay Code Editor */}
      <div className="relative h-[300px]">
        <pre
          ref={preRef}
          aria-hidden="true"
          style={{ fontFamily: 'var(--font-mono), monospace' }}
          className={`absolute inset-0 m-0 p-4 text-xs leading-[1.65] whitespace-pre-wrap break-words overflow-hidden pointer-events-none select-none`}
        >
          {tokenizedLines.map((spans, idx) => (
            <div key={idx}>
              {spans.length === 0 ? (
                <br />
              ) : (
                spans.map((span, sIdx) => (
                  <span key={sIdx} className={span.className}>
                    {span.text}
                  </span>
                ))
              )}
            </div>
          ))}
        </pre>

        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          style={{ fontFamily: 'var(--font-mono), monospace' }}
          className={`relative z-10 w-full h-full p-4 text-xs leading-[1.65] bg-transparent text-transparent caret-white selection:bg-[#3e4451]/70 focus:outline-none resize-none whitespace-pre-wrap break-words overflow-y-auto ${DARK_SCROLLBAR}`}
        />
      </div>
    </div>
  );
}
