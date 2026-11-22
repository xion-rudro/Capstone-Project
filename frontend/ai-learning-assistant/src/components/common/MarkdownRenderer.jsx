import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="markdown-renderer max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ _node, ...props }) => (
            <h1
              className="text-2xl font-bold text-slate-900 mt-6 mb-4"
              {...props}
            />
          ),

          h2: ({ _node, ...props }) => (
            <h2
              className="text-xl font-bold text-slate-900 mt-5 mb-3"
              {...props}
            />
          ),

          h3: ({ _node, ...props }) => (
            <h3
              className="text-lg font-semibold text-slate-900 mt-4 mb-2"
              {...props}
            />
          ),

          h4: ({ _node, ...props }) => (
            <h4
              className="text-base font-semibold text-slate-900 mt-3 mb-2"
              {...props}
            />
          ),

          p: ({ _node, ...props }) => (
            <p
              className="text-sm leading-7 text-slate-700 mb-4"
              {...props}
            />
          ),

          a: ({ _node, ...props }) => (
            <a
              className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),

          ul: ({ _node, ...props }) => (
            <ul
              className="list-disc pl-6 space-y-2 mb-4 text-slate-700"
              {...props}
            />
          ),

          ol: ({ _node, ...props }) => (
            <ol
              className="list-decimal pl-6 space-y-2 mb-4 text-slate-700"
              {...props}
            />
          ),

          li: ({ _node, ...props }) => (
            <li className="text-sm leading-6 pl-1" {...props} />
          ),

          strong: ({ _node, ...props }) => (
            <strong
              className="font-semibold text-slate-900"
              {...props}
            />
          ),

          em: ({ _node, ...props }) => (
            <em className="italic" {...props} />
          ),

          blockquote: ({ _node, ...props }) => (
            <blockquote
              className="border-l-4 border-emerald-500 pl-4 py-2 my-4 bg-slate-50 text-slate-700 italic"
              {...props}
            />
          ),

          code: ({ _node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");

            return !inline && match ? (
              <SyntaxHighlighter
                style={dracula}
                language={match[1]}
                PreTag="div"
                className="rounded-lg my-4 text-sm"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className="bg-slate-100 text-emerald-800 px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },

          pre: ({ _node, ...props }) => (
            <pre className="overflow-x-auto rounded-lg my-4" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
