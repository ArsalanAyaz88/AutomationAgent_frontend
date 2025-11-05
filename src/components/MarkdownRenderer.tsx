'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="markdown-content text-military-text text-sm leading-relaxed"
      components={{
        // Headers
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold text-military-orange mb-3 mt-4 border-b border-military-border pb-2">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold text-military-orange mb-2 mt-3">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold text-military-green mb-2 mt-2">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-base font-semibold text-military-text mb-1 mt-2">
            {children}
          </h4>
        ),
        
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-3 last:mb-0">
            {children}
          </p>
        ),
        
        // Lists
        ul: ({ children }) => (
          <ul className="list-none space-y-1 mb-3 ml-1">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-3 ml-4 text-military-text">
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => {
          // Check if this is part of an unordered list
          const isUnordered = !('ordered' in props);
          return (
            <li className={`${isUnordered ? 'before:content-["▸"] before:text-military-green before:mr-2 before:font-bold' : ''} text-military-text`}>
              {children}
            </li>
          );
        },
        
        // Code
        code: ({ inline, children }) => 
          inline ? (
            <code className="bg-military-dark/80 border border-military-border px-1.5 py-0.5 rounded text-military-green font-mono text-xs">
              {children}
            </code>
          ) : (
            <code className="block bg-military-dark border border-military-border p-3 rounded my-2 text-military-green font-mono text-xs overflow-x-auto">
              {children}
            </code>
          ),
        
        pre: ({ children }) => (
          <pre className="bg-military-dark border border-military-border p-3 rounded my-2 overflow-x-auto">
            {children}
          </pre>
        ),
        
        // Strong/Bold
        strong: ({ children }) => (
          <strong className="font-bold text-military-orange">
            {children}
          </strong>
        ),
        
        // Emphasis/Italic
        em: ({ children }) => (
          <em className="italic text-military-text">
            {children}
          </em>
        ),
        
        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-military-green hover:text-military-orange underline transition-colors"
          >
            {children}
          </a>
        ),
        
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-military-green pl-4 my-3 italic text-military-muted">
            {children}
          </blockquote>
        ),
        
        // Horizontal Rule
        hr: () => (
          <hr className="border-t border-military-border my-4" />
        ),
        
        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="min-w-full border border-military-border">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-military-dark/60 border-b border-military-border">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-military-border">
            {children}
          </tbody>
        ),
        tr: ({ children }) => (
          <tr className="hover:bg-military-dark/30 transition-colors">
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 text-left text-military-orange font-semibold text-xs uppercase">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 text-military-text text-sm">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
