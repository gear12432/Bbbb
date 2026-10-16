import React from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
  onToggleChecklist?: (lineIndex: number) => void;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  onToggleChecklist,
}) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = React.useState<number | null>(null);

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  if (!content || !content.trim()) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-xs italic">
        Empty note preview...
      </div>
    );
  }

  // Parse lines into simple renderable blocks
  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';
  let codeBlockCounter = 0;

  const renderedElements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    // Code block check ```
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeBuffer.join('\n');
        const blockIndex = codeBlockCounter++;
        renderedElements.push(
          <div key={`code-${index}`} className="relative my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 text-slate-100 text-xs font-mono">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 text-slate-400 text-[11px] font-semibold border-b border-slate-700">
              <span>{codeLanguage || 'code'}</span>
              <button
                onClick={() => handleCopyCode(codeText, blockIndex)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {copiedCodeIndex === blockIndex ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto leading-relaxed font-mono text-[13px]">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLanguage = '';
      } else {
        // Start code block
        inCodeBlock = true;
        codeLanguage = line.trim().replace('```', '');
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Horizontal Rule
    if (/^---$|^\*\*\*$|^___$/.test(line.trim())) {
      renderedElements.push(
        <hr key={`hr-${index}`} className="my-4 border-slate-200 dark:border-slate-800" />
      );
      return;
    }

    // Headings
    if (line.startsWith('# ')) {
      renderedElements.push(
        <h1 key={`h1-${index}`} className="text-2xl font-bold text-slate-900 dark:text-white mt-5 mb-2 leading-tight">
          {renderInlineFormatting(line.replace('# ', ''))}
        </h1>
      );
      return;
    }
    if (line.startsWith('## ')) {
      renderedElements.push(
        <h2 key={`h2-${index}`} className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2 leading-tight">
          {renderInlineFormatting(line.replace('## ', ''))}
        </h2>
      );
      return;
    }
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3-${index}`} className="text-lg font-semibold text-slate-900 dark:text-white mt-3 mb-1.5 leading-snug">
          {renderInlineFormatting(line.replace('### ', ''))}
        </h3>
      );
      return;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      renderedElements.push(
        <blockquote key={`quote-${index}`} className="my-2 pl-4 py-1 italic border-l-2 border-blue-500 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 rounded-r-md text-sm">
          {renderInlineFormatting(line.replace('> ', ''))}
        </blockquote>
      );
      return;
    }

    // Checklist item
    if (line.trim().startsWith('- [ ] ') || line.trim().startsWith('- [x] ') || line.trim().startsWith('- [X] ')) {
      const checked = line.trim().startsWith('- [x] ') || line.trim().startsWith('- [X] ');
      const text = line.replace(/- \[[ xX]\] /, '');

      renderedElements.push(
        <div key={`check-${index}`} className="flex items-start gap-2.5 my-1 text-sm text-slate-800 dark:text-slate-200">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggleChecklist && onToggleChecklist(index)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span className={checked ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
            {renderInlineFormatting(text)}
          </span>
        </div>
      );
      return;
    }

    // Unordered List
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.trim().substring(2);
      renderedElements.push(
        <div key={`ul-${index}`} className="flex items-start gap-2 my-0.5 text-sm text-slate-800 dark:text-slate-200 pl-2">
          <span className="text-blue-500 select-none">•</span>
          <span>{renderInlineFormatting(text)}</span>
        </div>
      );
      return;
    }

    // Ordered List
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      renderedElements.push(
        <div key={`ol-${index}`} className="flex items-start gap-2 my-0.5 text-sm text-slate-800 dark:text-slate-200 pl-2">
          <span className="font-mono text-slate-400 select-none text-xs">{numMatch[1]}.</span>
          <span>{renderInlineFormatting(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Paragraph
    if (line.trim()) {
      renderedElements.push(
        <p key={`p-${index}`} className="my-2 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
          {renderInlineFormatting(line)}
        </p>
      );
    } else {
      renderedElements.push(<div key={`empty-${index}`} className="h-2" />);
    }
  });

  return <div className="prose dark:prose-invert max-w-none space-y-1">{renderedElements}</div>;
};

// Helper for bold, italic, inline code, links, highlights
function renderInlineFormatting(text: string): React.ReactNode {
  if (!text) return null;

  // Split logic for inline elements
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Inline Code `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.substring(codeMatch[0].length);
      continue;
    }

    // Highlight ==text==
    const hlMatch = remaining.match(/^==([^=]+)==/);
    if (hlMatch) {
      parts.push(
        <mark key={key++} className="bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 px-1 rounded">
          {hlMatch[1]}
        </mark>
      );
      remaining = remaining.substring(hlMatch[0].length);
      continue;
    }

    // Bold **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>);
      remaining = remaining.substring(boldMatch[0].length);
      continue;
    }

    // Italic *text*
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
      remaining = remaining.substring(italicMatch[0].length);
      continue;
    }

    // Strikethrough ~~text~~
    const strikeMatch = remaining.match(/^~~([^~]+)~~/);
    if (strikeMatch) {
      parts.push(<del key={key++} className="line-through text-slate-400">{strikeMatch[1]}</del>);
      remaining = remaining.substring(strikeMatch[0].length);
      continue;
    }

    // Link [label](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 inline-flex items-center gap-0.5"
        >
          {linkMatch[1]}
          <ExternalLink className="w-3 h-3 inline" />
        </a>
      );
      remaining = remaining.substring(linkMatch[0].length);
      continue;
    }

    // Plain text up to next syntax char
    const nextCharIndex = remaining.search(/[`*~=\[]/);
    if (nextCharIndex === -1) {
      parts.push(remaining);
      break;
    } else if (nextCharIndex === 0) {
      parts.push(remaining[0]);
      remaining = remaining.substring(1);
    } else {
      parts.push(remaining.substring(0, nextCharIndex));
      remaining = remaining.substring(nextCharIndex);
    }
  }

  return parts;
}
