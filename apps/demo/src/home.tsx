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

export function HomePage() {
  const [installPath, setInstallPath] = useState<InstallPath>("package");
  const [manager, setManager] = useState<PackageManager>("npm");
  const [sourceId, setSourceId] = useState<(typeof sourceFiles)[number]["id"]>("connect-wallet.tsx");
  const activeSource = sourceFiles.find((file) => file.id === sourceId) ?? sourceFiles[0];

  return (
    <div className="flex flex-col">
      <section className="relative flex min-h-[calc(100svh-4.75rem)] items-center justify-center overflow-hidden bg-black text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 text-white opacity-20"
        >
          <img src="/images/ckb-logo.svg" alt="" className="h-full w-full" />
        </div>

        <div className="relative z-10 flex max-w-4xl flex-col items-center px-5 py-16 text-center">
          <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs tracking-wide text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            v0.1.0 - drop-in React component
          </p>
          <HeroTitle />
          <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
            Faster development with ckb wallet component. Choose what to show and how to show it.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#install" className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black">
              Get started
            </a>
            <a
              href="https://github.com/Victor-Okenwa/revamp-ckb-connect-wallet"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black px-6 py-2.5 text-sm font-semibold text-white"
            >
              <img src="/images/github.svg" alt="" width={16} height={16} className="h-4 w-4 invert" />
              GitHub
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-5 py-16">
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
