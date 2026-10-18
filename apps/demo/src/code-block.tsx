import { useEffect, useState } from "react";
import { getSingletonHighlighter, type BundledLanguage } from "shiki";

function CopyButton({ value, idle = "Copy" }: { value: string; idle?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="shrink-0 border border-current px-3 py-1 text-xs font-semibold tracking-wide hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? "Copied" : idle}
    </button>
  );
}

export function CodeBlock({ code, label, lang }: { code: string; label?: string; lang: BundledLanguage }) {
  const source = code.trim();
  const [html, setHtml] = useState("");

  useEffect(() => {
    let active = true;
    getSingletonHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["tsx", "typescript", "css", "bash"],
    }).then((highlighter) => {
      if (!active) return;
      setHtml(highlighter.codeToHtml(source, {
        lang,
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
        defaultColor: false,
      }));
    });
    return () => {
      active = false;
    };
  }, [source, lang]);

  return (
    <div className="code-block border border-black/15 dark:border-white/15">
      <div className="flex items-center justify-between gap-3 border-b border-black/10 px-3 py-2 dark:border-white/10">
        <span className="font-mono text-xs text-black/60 dark:text-white/60">{label}</span>
        <CopyButton value={source} />
      </div>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="max-h-80 overflow-auto p-4 text-left text-sm leading-6">
          <code>{source}</code>
        </pre>
      )}
    </div>
  );
}
