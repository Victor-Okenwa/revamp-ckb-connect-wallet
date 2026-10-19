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
import { ComponentCards } from "./components-page";
import { HeroTitle } from "./hero-title";
import connectWalletSource from "../../../packages/ckb-connect-wallet-kit/src/connect-wallet.tsx?raw";
import kitProviderSource from "../../../packages/ckb-connect-wallet-kit/src/connect-wallet-kit-provider.tsx?raw";
import didCkbSource from "../../../packages/ckb-connect-wallet-kit/src/did-ckb.ts?raw";
import connectWalletDidSource from "../../../packages/ckb-connect-wallet-kit/src/connect-wallet-did.tsx?raw";
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

const cccProviderShell = `import { ccc } from "@ckb-ccc/connector-react";

export function CccRoot({ children }: { children: React.ReactNode }) {
  return (
    <ccc.Provider
      defaultClient={new ccc.ClientPublicTestnet()}
      clientOptions={[
        { name: "CKB Testnet", client: new ccc.ClientPublicTestnet() },
        { name: "CKB Mainnet", client: new ccc.ClientPublicMainnet() },
      ]}
    >
      {children}
    </ccc.Provider>
  );
}`;

const packageUsage = `import { ConnectWalletKitProvider } from "ckb-connect-wallet-kit";

export function AppRoot({ children }: { children: React.ReactNode }) {
  return (
    <ConnectWalletKitProvider
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

const exampleCccProvider = `import { ccc } from "@ckb-ccc/connector-react";
import {
  ConnectWallet,
  ConnectWalletButton,
  ConnectWalletInfoContainer,
  ConnectWalletInfoImage,
  ConnectWalletInfoBalance,
  ConnectWalletInfoAddress,
} from "ckb-connect-wallet-kit";

export function App() {
  return (
    <ccc.Provider
      defaultClient={new ccc.ClientPublicTestnet()}
      clientOptions={[
        { name: "CKB Testnet", client: new ccc.ClientPublicTestnet() },
        { name: "CKB Mainnet", client: new ccc.ClientPublicMainnet() },
      ]}
    >
      <ConnectWallet>
        <ConnectWalletButton />
        <ConnectWalletInfoContainer>
          <ConnectWalletInfoImage />
          <ConnectWalletInfoBalance />
          <ConnectWalletInfoAddress />
        </ConnectWalletInfoContainer>
      </ConnectWallet>
    </ccc.Provider>
  );
}`;

const exampleKitNoDefaults = `import { ccc } from "@ckb-ccc/connector-react";
import {
  ConnectWalletKitProvider,
  ConnectWallet,
  ConnectWalletButton,
  ConnectWalletInfoContainer,
  ConnectWalletInfoImage,
  ConnectWalletInfoBalance,
  ConnectWalletInfoAddress,
} from "ckb-connect-wallet-kit";

export function App() {
  return (
    <ccc.Provider
      defaultClient={new ccc.ClientPublicTestnet()}
      clientOptions={[
        { name: "CKB Testnet", client: new ccc.ClientPublicTestnet() },
        { name: "CKB Mainnet", client: new ccc.ClientPublicMainnet() },
      ]}
    >
      <ConnectWalletKitProvider>
        <ConnectWallet>
          <ConnectWalletButton>Connect</ConnectWalletButton>
          <ConnectWalletInfoContainer>
            <ConnectWalletInfoImage />
            <ConnectWalletInfoBalance decimalPlaces={4} withCurrency />
            <ConnectWalletInfoAddress frontChars={6} endChars={4} />
          </ConnectWalletInfoContainer>
        </ConnectWallet>
      </ConnectWalletKitProvider>
    </ccc.Provider>
  );
}`;

const exampleKitWithDefaults = `import { ccc } from "@ckb-ccc/connector-react";
import {
  ConnectWalletKitProvider,
  ConnectWallet,
  ConnectWalletButton,
  ConnectWalletInfoContainer,
  ConnectWalletInfoImage,
  ConnectWalletInfoBalance,
  ConnectWalletInfoAddress,
} from "ckb-connect-wallet-kit";

export function App() {
  return (
    <ccc.Provider
      defaultClient={new ccc.ClientPublicTestnet()}
      clientOptions={[
        { name: "CKB Testnet", client: new ccc.ClientPublicTestnet() },
        { name: "CKB Mainnet", client: new ccc.ClientPublicMainnet() },
      ]}
    >
      <ConnectWalletKitProvider
        defaults={{
          buttonClassName: "rounded-md bg-blue-600 text-white dark:bg-blue-600 dark:text-white",
          infoContainerClassName: "rounded-md bg-blue-600 text-white dark:bg-blue-600 dark:text-white",
          decimalPlaces: 4,
          withCurrency: true,
          frontChars: 6,
          endChars: 4,
          buttonLabel: "Connect Wallet",
        }}
      >
        <ConnectWallet>
          <ConnectWalletButton />
          <ConnectWalletInfoContainer className="flex items-center gap-2">
            <ConnectWalletInfoImage />
            <div className="flex flex-col items-start">
              <ConnectWalletInfoBalance />
              <ConnectWalletInfoAddress />
            </div>
          </ConnectWalletInfoContainer>
        </ConnectWallet>
      </ConnectWalletKitProvider>
    </ccc.Provider>
  );
}`;

const exampleDidProfile = `import { ccc } from "@ckb-ccc/connector-react";
import {
  ConnectWallet,
  ConnectWalletButton,
  ConnectWalletDid,
  ConnectWalletDidAvatar,
  ConnectWalletDidId,
  ConnectWalletDidName,
  ConnectWalletInfoAddress,
  ConnectWalletInfoContainer,
  ConnectWalletInfoImage,
} from "ckb-connect-wallet-kit";

export function App() {
  return (
    <ccc.Provider
      defaultClient={new ccc.ClientPublicTestnet()}
      clientOptions={[
        { name: "CKB Testnet", client: new ccc.ClientPublicTestnet() },
        { name: "CKB Mainnet", client: new ccc.ClientPublicMainnet() },
      ]}
    >
      <ConnectWallet>
        <ConnectWalletButton />
        <ConnectWalletInfoContainer className="flex items-center gap-2">
          <ConnectWalletDid>
            <ConnectWalletDidAvatar fallback={<ConnectWalletInfoImage />} />
            <div className="flex flex-col items-start">
              <ConnectWalletDidName fallback={<ConnectWalletInfoAddress frontChars={6} endChars={4} />} />
              <ConnectWalletDidId />
            </div>
          </ConnectWalletDid>
        </ConnectWalletInfoContainer>
      </ConnectWallet>
    </ccc.Provider>
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
    note: "Must sit under the app's ccc.Provider. Use defaults for the shared look. This file does not mount CCC.",
    source: kitProviderSource,
  },
  {
    id: "did-ckb.ts",
    path: "src/components/did-ckb.ts",
    note: "Optional. Finds and decodes the did:ckb cells owned by a lock. Only needed with connect-wallet-did.tsx.",
    source: didCkbSource,
  },
  {
    id: "connect-wallet-did.tsx",
    path: "src/components/connect-wallet-did.tsx",
    note: "Optional. The DID pieces. Imports ./connect-wallet, ./did-ckb, and ./utils, so it stays in the same folder.",
    source: connectWalletDidSource,
  },
] as const;

export function HomePage() {
  const [installPath, setInstallPath] = useState<InstallPath>("package");
  const [manager, setManager] = useState<PackageManager>("npm");
  const [sourceId, setSourceId] = useState<(typeof sourceFiles)[number]["id"]>("connect-wallet.tsx");
  const activeSource = sourceFiles.find((file) => file.id === sourceId) ?? sourceFiles[0];

  return (
    <div className="flex flex-col">
      <section className="hero-grid relative flex min-h-[calc(100svh-4.75rem)] items-center justify-center overflow-hidden text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 text-white opacity-20"
        >
          <img src="/images/ckb-logo.svg" alt="" className="h-full w-full" />
        </div>

        <div className="relative z-10 flex max-w-4xl flex-col items-center px-5 py-16 text-center">
          <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs tracking-wide text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            v0.1.1 - drop-in React component
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
      <ComponentCards />
      <section id="install" className="scroll-mt-24 flex flex-col gap-6">
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
            <CodeBlock label="ccc.Provider — the app owns CCC" lang="tsx" code={cccProviderShell} />
            <CodeBlock label="ConnectWalletKitProvider — defaults only" lang="tsx" code={packageUsage} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-6 text-black/70 dark:text-white/70">
              Copy the files below into your app. The first three are required, the two DID files are optional. All of them have to stay in the same folder. Tailwind will see the classes because the files are in your project, so you do not add an <code>@source</code> rule.
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
            <CodeBlock label="ccc.Provider — the app owns CCC" lang="tsx" code={cccProviderShell} />
            <CodeBlock label="ConnectWalletKitProvider — local import, defaults only" lang="tsx" code={copyUsage} />
          </div>
        )}
      </section>

      <section id="examples" className="scroll-mt-24 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-semibold tracking-tight">Examples</h2>
          <p className="max-w-2xl text-black/70 dark:text-white/70">
            Mount your own <code>ccc.Provider</code>. <code>ConnectWalletKitProvider</code> only supplies defaults and must sit under that provider. Leave off <code>className</code>, formatting props, and <code>defaults</code> to use the built-in styles. The DID tree is optional and only fetches when you render it.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold tracking-tight">CCC provider, no styling</h3>
          <p className="max-w-2xl text-sm leading-6 text-black/70 dark:text-white/70">
            The app’s <code>ccc.Provider</code> plus the kit pieces. No <code>ConnectWalletKitProvider</code>, no <code>defaults</code>, no <code>className</code>.
          </p>
          <CodeBlock label="ccc.Provider" lang="tsx" code={exampleCccProvider} />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold tracking-tight">Kit provider, no defaults</h3>
          <p className="max-w-2xl text-sm leading-6 text-black/70 dark:text-white/70">
            Same CCC tree, with the kit provider for context only. Omit <code>defaults</code> so every composition uses the built-in look. Style or format a single piece with props when you need to.
          </p>
          <CodeBlock label="ConnectWalletKitProvider" lang="tsx" code={exampleKitNoDefaults} />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold tracking-tight">Kit provider, with defaults</h3>
          <p className="max-w-2xl text-sm leading-6 text-black/70 dark:text-white/70">
            Set look and formatting once. A prop on one piece still wins over the matching default. <code>className</code> is merged last.
          </p>
          <CodeBlock label="defaults + composition" lang="tsx" code={exampleKitWithDefaults} />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold tracking-tight">did:ckb profile</h3>
          <p className="max-w-2xl text-sm leading-6 text-black/70 dark:text-white/70">
            Optional. <code>ConnectWalletDid</code> lists the live did:ckb cells owned by the connected lock and shares the newest one with its children. Each piece takes a <code>fallback</code> for wallets with no DID or no profile. Creating or editing a DID is outside this kit.
          </p>
          <CodeBlock label="ConnectWalletDid" lang="tsx" code={exampleDidProfile} />
        </div>
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
