import { useEffect, useState } from "react";
import { getSingletonHighlighter, type BundledLanguage, type ThemeRegistrationRaw } from "shiki";
import cursorDarkTheme from "./themes/cursor-dark-color-theme.json";

const cursorDark = cursorDarkTheme as ThemeRegistrationRaw;

function CopyButton({ value, idle = "Copy" }: { value: string; idle?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="shrink-0 rounded border border-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white/70 hover:bg-white/10 hover:text-white"
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
      themes: [cursorDark],
      langs: ["tsx", "typescript", "css", "bash"],
    }).then((highlighter) => {
      if (!active) return;
      setHtml(highlighter.codeToHtml(source, {
        lang,
        theme: cursorDark.name,
      }));
    });
    return () => {
      active = false;
    };
  }, [source, lang]);

  return (
    <div className="code-block overflow-hidden rounded-xl border border-white/10 bg-[#181818] text-[#F0F0F0]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#141414] px-3 py-2">
        <span className="font-mono text-xs text-white/55">{label}</span>
        <CopyButton value={source} />
      </div>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="max-h-80 overflow-auto bg-[#181818] p-4 text-left text-sm leading-6 text-[#F0F0F0]">
          <code>{source}</code>
        </pre>
      )}
    </div>
  );
}
