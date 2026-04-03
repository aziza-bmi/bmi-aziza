'use client'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({
  content,
  className = '',
}: MarkdownRendererProps) {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-indigo-700 dark:text-indigo-300">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-600 dark:text-slate-300">{children}</em>
          ),
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 mt-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2 mt-3 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 mt-3 first:mt-0">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 mb-2 ml-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1 mb-2 ml-1 list-decimal list-inside">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 text-sm leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 flex-shrink-0" />
              <span>{children}</span>
            </li>
          ),
          code: ({ children, className: cls }) => {
            const isInline = !cls
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded-md text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-mono">
                  {children}
                </code>
              )
            }
            return (
              <code className="block p-4 rounded-xl text-xs bg-slate-900 dark:bg-slate-950 text-green-400 font-mono overflow-x-auto my-2">
                {children}
              </code>
            )
          },
          pre: ({ children }) => <pre className="my-3">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-400 dark:border-indigo-600 pl-4 py-1 my-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-r-xl italic text-slate-600 dark:text-slate-300 text-sm">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="w-full text-sm border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200 bg-indigo-50 dark:bg-indigo-900/30 border border-slate-200 dark:border-slate-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {children}
            </td>
          ),
          hr: () => <hr className="my-4 border-slate-200 dark:border-slate-700" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
