import { useState } from "react";
import {
  ConnectWallet,
  ConnectWalletButton,
  ConnectWalletInfoAddress,
  ConnectWalletInfoBalance,
  ConnectWalletInfoContainer,
  ConnectWalletInfoImage,
} from "ckb-connect-wallet-kit";
import { CodeBlock } from "./code-block";
import { HeroTitle } from "./hero-title";
import connectWalletSource from "../../../packages/ckb-connect-wallet-kit/src/connect-wallet.tsx?raw";
import kitProviderSource from "../../../packages/ckb-connect-wallet-kit/src/connect-wallet-kit-provider.tsx?raw";
import utilsSource from "../../../packages/ckb-connect-wallet-kit/src/utils.ts?raw";

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

export function HomePage() {
  const [installPath, setInstallPath] = useState<InstallPath>("package");
  const [manager, setManager] = useState<PackageManager>("npm");
  const [sourceId, setSourceId] = useState<(typeof sourceFiles)[number]["id"]>("connect-wallet.tsx");
  const activeSource = sourceFiles.find((file) => file.id === sourceId) ?? sourceFiles[0];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-20 px-5 py-16">
      <section className="grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-6">
          <p className="hero-line text-xs font-semibold uppercase tracking-[0.18em] text-black/55 dark:text-white/55">
            Published · v0.1.0 · MIT
          </p>
          <HeroTitle />
          <p className="hero-line hero-line-delay max-w-xl text-lg leading-8 text-black/75 dark:text-white/75">
            Compound components for <code>@ckb-ccc/connector-react</code>. Install the npm package, or copy the source into your app and own the files.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#install" className="bg-black px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-black">
              Choose an install path
            </a>
            <a href="#/components" className="border border-black/20 px-5 py-3 text-sm font-bold dark:border-white/20">
              Component reference
            </a>
            <a href="#/demo" className="border border-black/20 px-5 py-3 text-sm font-bold dark:border-white/20">
              Open the demo
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
            <CodeBlock label="App root" lang="tsx" code={packageUsage} />
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
            <CodeBlock label="App root — local import" lang="tsx" code={copyUsage} />
          </div>
        )}
      </section>
    </div>
  );
}

export function HeaderWallet() {
  return (
    <ConnectWallet>
      <ConnectWalletButton />
      <ConnectWalletInfoContainer className="flex items-center gap-2">
        <ConnectWalletInfoImage />
        <div className="flex items-baseline gap-2">
          <ConnectWalletInfoBalance decimalPlaces={4} withCurrency={false} />
          <ConnectWalletInfoAddress frontChars={5} endChars={4} />
        </div>
      </ConnectWalletInfoContainer>
    </ConnectWallet>
  );
}
