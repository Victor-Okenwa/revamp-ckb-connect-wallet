import { useEffect, useState } from "react";
import { getSingletonHighlighter, type BundledLanguage } from "shiki";
import {
  ConnectWallet,
  ConnectWalletButton,
  ConnectWalletInfoAddress,
  ConnectWalletInfoBalance,
  ConnectWalletInfoContainer,
  ConnectWalletInfoImage,
} from "ckb-connect-wallet-kit";
import connectWalletSource from "../../../packages/ckb-connect-wallet-kit/src/connect-wallet.tsx?raw";
import kitProviderSource from "../../../packages/ckb-connect-wallet-kit/src/connect-wallet-kit-provider.tsx?raw";
import utilsSource from "../../../packages/ckb-connect-wallet-kit/src/utils.ts?raw";

const NPM_URL = "https://www.npmjs.com/package/ckb-connect-wallet-kit";
const REPO_URL = "https://github.com/Victor-Okenwa/revamp-ckb-connect-wallet";

type InstallPath = "package" | "copy";
type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

const packageManagers: PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

const packageInstall: Record<PackageManager, string> = {
  npm: "npm install ckb-connect-wallet-kit @ckb-ccc/connector-react react react-dom",
  pnpm: "pnpm add ckb-connect-wallet-kit @ckb-ccc/connector-react react react-dom",
  yarn: "yarn add ckb-connect-wallet-kit @ckb-ccc/connector-react react react-dom",
  bun: "bun add ckb-connect-wallet-kit @ckb-ccc/connector-react react react-dom",
};

const copyInstall: Record<PackageManager, string> = {
  npm: "npm install @ckb-ccc/connector-react clsx tailwind-merge react react-dom",
  pnpm: "pnpm add @ckb-ccc/connector-react clsx tailwind-merge react react-dom",
  yarn: "yarn add @ckb-ccc/connector-react clsx tailwind-merge react react-dom",
  bun: "bun add @ckb-ccc/connector-react clsx tailwind-merge react react-dom",
};

const packageUsage = `import { ConnectWalletKitProvider } from "ckb-connect-wallet-kit";

export function AppRoot({ children }: { children: React.ReactNode }) {
  return (
    <ConnectWalletKitProvider
      network="testnet"
      defaults={{
        buttonClassName: "rounded-md bg-blue-600 text-white dark:bg-blue-600 dark:text-white",
        infoContainerClassName: "rounded-md bg-blue-600 text-white dark:bg-blue-600 dark:text-white",
        decimalPlaces: 4,
        frontChars: 6,
        endChars: 4,
      }}
    >
      {children}
    </ConnectWalletKitProvider>
  );
}`;

const copyUsage = `import { ConnectWalletKitProvider } from "./components/connect-wallet-kit-provider";

export function AppRoot({ children }: { children: React.ReactNode }) {
  return (
    <ConnectWalletKitProvider
      network="testnet"
      defaults={{
        buttonClassName: "rounded-md bg-blue-600 text-white dark:bg-blue-600 dark:text-white",
        decimalPlaces: 4,
        frontChars: 6,
        endChars: 4,
      }}
    >
      {children}
    </ConnectWalletKitProvider>
  );
}`;

const tailwindSource = `@import "tailwindcss";
@source "../node_modules/ckb-connect-wallet-kit/dist";`;

const sourceFiles = [
  {
    id: "connect-wallet.tsx",
    path: "src/components/connect-wallet.tsx",
    note: "Place this next to utils.ts. The component imports ./utils.",
    source: connectWalletSource,
  },
  {
    id: "utils.ts",
    path: "src/components/utils.ts",
    note: "Same folder as connect-wallet.tsx. Not part of the public package API.",
    source: utilsSource,
  },
  {
    id: "connect-wallet-kit-provider.tsx",
    path: "src/components/connect-wallet-kit-provider.tsx",
    note: "Pass network to mount the CCC provider. Omit network when the app already has ccc.Provider, and use defaults for the shared look.",
    source: kitProviderSource,
  },
] as const;

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

function CodeBlock({ code, label, lang }: { code: string; label?: string; lang: BundledLanguage }) {
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

function WalletCluster({ stacked = false }: { stacked?: boolean }) {
  return (
    <ConnectWallet>
      <ConnectWalletButton />
      <ConnectWalletInfoContainer className={stacked ? "flex items-center gap-3" : "flex items-center gap-2"}>
        <ConnectWalletInfoImage />
        <div className={stacked ? "flex flex-col items-start" : "flex items-baseline gap-2"}>
          <ConnectWalletInfoBalance decimalPlaces={4} withCurrency={stacked} />
          <ConnectWalletInfoAddress frontChars={stacked ? 8 : 5} endChars={4} />
        </div>
      </ConnectWalletInfoContainer>
    </ConnectWallet>
  );
}

function App() {
  const [installPath, setInstallPath] = useState<InstallPath>("package");
  const [manager, setManager] = useState<PackageManager>("npm");
  const [sourceId, setSourceId] = useState<(typeof sourceFiles)[number]["id"]>("connect-wallet.tsx");
  const activeSource = sourceFiles.find((file) => file.id === sourceId) ?? sourceFiles[0];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-[var(--background)]/90 backdrop-blur dark:border-white/10">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 px-5 py-4 sm:grid-cols-[auto_1fr_auto]">
          <a href="#top" className="flex items-center gap-3">
            <img src="/images/ccc-logo.svg" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="text-sm font-semibold tracking-tight">ckb-connect-wallet-kit</span>
          </a>
          <nav className="col-span-2 flex items-center gap-5 text-sm sm:col-span-1 sm:col-start-2 sm:justify-self-center">
            <a href="#install" className="hover:underline">Install</a>
            <a href="#compose" className="hover:underline">Compose</a>
            <a href={NPM_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">npm</a>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
          </nav>
          <div className="col-start-2 row-start-1 sm:col-start-3">
            <WalletCluster />
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto flex max-w-6xl flex-col gap-20 px-5 py-16">
        <section className="grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/55 dark:text-white/55">
              Published · v0.1.0 · MIT
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              A CKB connect wallet you compose yourself.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-black/75 dark:text-white/75">
              Compound components for <code>@ckb-ccc/connector-react</code>. Install the npm package, or copy the source into your app and own the files.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#install" className="bg-black px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-black">
                Choose an install path
              </a>
              <a
                href="https://docs.ckbccc.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-black/20 px-5 py-3 text-sm font-bold dark:border-white/20"
              >
                CCC docs
              </a>
            </div>
          </div>

          <div className="demo-stage flex min-h-64 flex-col justify-between border border-black/15 p-6 dark:border-white/15">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-black/50 dark:text-white/50">
              <span>Live · testnet by default</span>
              <span>Stacked</span>
            </div>
            <div className="flex justify-center py-8">
              <WalletCluster stacked />
            </div>
            <p className="text-sm leading-6 text-black/70 dark:text-white/70">
              The header and this panel are two compositions of the same components. Connecting once updates both.
            </p>
          </div>
        </section>

        <section id="install" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-semibold tracking-tight">Two ways to add it</h2>
            <p className="max-w-2xl text-black/70 dark:text-white/70">
              The package is the path for updates. Copying the source is the path when the component should live in your repository.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2" role="tablist" aria-label="Install method">
            <button
              type="button"
              role="tab"
              aria-selected={installPath === "package"}
              className={`border px-5 py-4 text-left ${installPath === "package" ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-black/15 dark:border-white/15"}`}
              onClick={() => setInstallPath("package")}
            >
              <span className="block text-xs uppercase tracking-[0.16em] opacity-70">Option A</span>
              <span className="mt-1 block text-lg font-semibold">Install the package</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={installPath === "copy"}
              className={`border px-5 py-4 text-left ${installPath === "copy" ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-black/15 dark:border-white/15"}`}
              onClick={() => setInstallPath("copy")}
            >
              <span className="block text-xs uppercase tracking-[0.16em] opacity-70">Option B</span>
              <span className="mt-1 block text-lg font-semibold">Copy the source</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Package manager">
            {packageManagers.map((name) => (
              <button
                key={name}
                type="button"
                className={`px-3 py-1 font-mono text-sm ${manager === name ? "bg-black text-white dark:bg-white dark:text-black" : "text-black/60 dark:text-white/60"}`}
                onClick={() => setManager(name)}
              >
                {name}
              </button>
            ))}
          </div>

          {installPath === "package" ? (
            <div className="flex flex-col gap-4">
              <CodeBlock label="Install" lang="bash" code={packageInstall[manager]} />
              <CodeBlock label="app.css — Tailwind v4 must scan the package" lang="css" code={tailwindSource} />
              <CodeBlock label="header.tsx" lang="tsx" code={packageUsage} />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm leading-6 text-black/70 dark:text-white/70">
                Copy the three files below into your app. <code>connect-wallet.tsx</code> and <code>utils.ts</code> have to stay in the same folder. Tailwind will see the classes because the files are in your project, so you do not add an <code>@source</code> rule.
              </p>
              <CodeBlock label="Install the dependencies the files import" lang="bash" code={copyInstall[manager]} />
              <div className="flex flex-wrap gap-2">
                {sourceFiles.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    className={`border px-3 py-1 font-mono text-sm ${sourceId === file.id ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-black/15 dark:border-white/15"}`}
                    onClick={() => setSourceId(file.id)}
                  >
                    {file.id}
                  </button>
                ))}
              </div>
              <p className="font-mono text-xs text-black/60 dark:text-white/60">
                {activeSource.path} — {activeSource.note}
              </p>
              <CodeBlock label={activeSource.path} lang={activeSource.id.endsWith(".tsx") ? "tsx" : "typescript"} code={activeSource.source} />
              <CodeBlock label="header.tsx — local imports" lang="tsx" code={copyUsage} />
            </div>
          )}
        </section>

        <section id="compose" className="grid gap-8 border-t border-black/10 pt-12 dark:border-white/10 md:grid-cols-3">
          <div>
            <h2 className="text-xl font-semibold">Compose</h2>
            <p className="mt-2 text-sm leading-6 text-black/70 dark:text-white/70">
              <code>ConnectWallet</code> holds the CCC signer, balance, and address. Children read that context. Disconnected pieces render nothing once a wallet is connected, and the reverse.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Format</h2>
            <p className="mt-2 text-sm leading-6 text-black/70 dark:text-white/70">
              Balance accepts <code>decimalPlaces</code> from 0 to 20 and truncates instead of rounding. Address accepts <code>frontChars</code> and <code>endChars</code>. Every piece takes <code>className</code>.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Provider</h2>
            <p className="mt-2 text-sm leading-6 text-black/70 dark:text-white/70">
              <code>ConnectWalletKitProvider</code> sets the shared look and, when <code>network</code> is set, wraps <code>ccc.Provider</code>. A prop on a single piece still overrides that default. Omit <code>network</code> when the app already has a CCC provider.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-8 text-sm">
          <a className="inline-flex items-center gap-2 hover:underline" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            <img src="/images/github.svg" alt="" width={16} height={16} />
            Repository
          </a>
          <a className="hover:underline" href={NPM_URL} target="_blank" rel="noopener noreferrer">npm</a>
          <a className="inline-flex items-center gap-2 hover:underline" href="https://github.com/ckb-devrel/ccc" target="_blank" rel="noopener noreferrer">
            CCC
          </a>
          <a className="inline-flex items-center gap-2 hover:underline" href="https://app.ckbccc.com" target="_blank" rel="noopener noreferrer">
            <img src="/images/window.svg" alt="" width={16} height={16} />
            Examples
          </a>
          <a className="inline-flex items-center gap-2 hover:underline" href="https://x.com/CKBDevrel" target="_blank" rel="noopener noreferrer">
            <img src="/images/x-logo.svg" alt="" width={16} height={16} />
            CKB DevRel
          </a>
          <a className="hover:underline" href={`${REPO_URL}/blob/main/ARCHITECTURE.md`} target="_blank" rel="noopener noreferrer">
            Architecture
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
