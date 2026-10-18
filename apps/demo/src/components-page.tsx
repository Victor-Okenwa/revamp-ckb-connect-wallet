import { useState } from "react";
import { flushSync } from "react-dom";
import { ChevronDown } from "lucide-react";
import { CodeBlock } from "./code-block";

type PropDoc = {
  name: string;
  type: string;
  detail: string;
};

type ComponentDoc = {
  id: string;
  name: string;
  summary: string;
  example: string;
  props: PropDoc[];
};

const components: ComponentDoc[] = [
  {
    id: "provider",
    name: "ConnectWalletKitProvider",
    summary: "Sit this under the app's ccc.Provider. It only stores shared defaults. It calls ccc.useCcc(), so it will fail if CCC is missing.",
    example: `<ccc.Provider defaultClient={new ccc.ClientPublicTestnet()}>
  <ConnectWalletKitProvider
    defaults={{
      buttonClassName: "rounded-md bg-blue-600 text-white dark:bg-blue-600 dark:text-white",
      decimalPlaces: 4,
      frontChars: 6,
      endChars: 4,
      buttonLabel: "Connect",
    }}
  >
    {children}
  </ConnectWalletKitProvider>
</ccc.Provider>`,
    props: [
      { name: "children", type: "React.ReactNode", detail: "The rest of the app." },
      { name: "defaults.buttonClassName", type: "ClassValue", detail: "Replaces the built-in button colors, radius, and padding. Include dark: utilities if the button should stay that color in dark mode." },
      { name: "defaults.infoContainerClassName", type: "ClassValue", detail: "Same role for the connected wallet pill." },
      { name: "defaults.imageClassName", type: "ClassValue", detail: "Replaces the default w-6 h-6 on the wallet icon." },
      { name: "defaults.balanceClassName", type: "ClassValue", detail: "Replaces the default font-semibold text-sm on the balance." },
      { name: "defaults.addressClassName", type: "ClassValue", detail: "Replaces the default text-xs font-normal on the address." },
      { name: "defaults.decimalPlaces", type: "0–20", detail: "Shared balance precision. Digits are truncated, not rounded. 0 is a real value." },
      { name: "defaults.withCurrency", type: "boolean", detail: "Shows the CKB suffix. Defaults to true when neither the provider nor the component sets it." },
      { name: "defaults.frontChars", type: "number", detail: "Characters kept at the start of the address. Built-in default is 10." },
      { name: "defaults.endChars", type: "number", detail: "Characters kept at the end of the address. Built-in default is 6." },
      { name: "defaults.buttonLabel", type: "React.ReactNode", detail: "Text of ConnectWalletButton. A children prop on that button still wins." },
    ],
  },
  {
    id: "connect",
    name: "ConnectWallet",
    summary: "Local provider for one composition. It reads the CCC signer once and shares balance, address, loading, and open() with its children.",
    example: `<ConnectWallet>
  <ConnectWalletButton />
  <ConnectWalletInfoContainer className="flex items-center gap-2">
    <ConnectWalletInfoImage />
    <ConnectWalletInfoBalance />
    <ConnectWalletInfoAddress />
  </ConnectWalletInfoContainer>
</ConnectWallet>`,
    props: [
      { name: "children", type: "React.ReactNode", detail: "The button, the connected info, and any layout you put between them. Must sit under a CCC provider." },
    ],
  },
  {
    id: "button",
    name: "ConnectWalletButton",
    summary: "Renders only while no wallet is connected. Clicking it calls open() from CCC.",
    example: `<ConnectWalletButton className="px-4">
  Connect
</ConnectWalletButton>`,
    props: [
      { name: "className", type: "ClassValue", detail: "Merged after the provider buttonClassName, so it overrides conflicting utilities on this button only." },
      { name: "children", type: "React.ReactNode", detail: "Replaces defaults.buttonLabel, then the built-in “Connect Wallet” text." },
    ],
  },
  {
    id: "container",
    name: "ConnectWalletInfoContainer",
    summary: "Renders only after a wallet is connected. The whole pill calls open() again, which is how CCC shows account actions.",
    example: `<ConnectWalletInfoContainer className="flex items-center gap-3">
  <ConnectWalletInfoImage />
  <ConnectWalletInfoBalance />
  <ConnectWalletInfoAddress />
</ConnectWalletInfoContainer>`,
    props: [
      { name: "children", type: "React.ReactNode", detail: "Your layout for the icon, balance, and address." },
      { name: "className", type: "ClassValue", detail: "Merged after defaults.infoContainerClassName." },
    ],
  },
  {
    id: "image",
    name: "ConnectWalletInfoImage",
    summary: "The wallet icon from wallet.icon. Renders nothing until a wallet is connected.",
    example: `<ConnectWalletInfoImage className="h-8 w-8" />`,
    props: [
      { name: "className", type: "ClassValue", detail: "Merged after defaults.imageClassName. The built-in size is w-6 h-6." },
    ],
  },
  {
    id: "balance",
    name: "ConnectWalletInfoBalance",
    summary: "Formats the signer balance. A set decimalPlaces value truncates instead of rounding.",
    example: `<ConnectWalletInfoBalance
  decimalPlaces={4}
  withCurrency
/>`,
    props: [
      { name: "decimalPlaces", type: "0–20", detail: "Overrides defaults.decimalPlaces. When both are omitted, the balance shows up to 10 fraction digits." },
      { name: "withCurrency", type: "boolean", detail: "Overrides defaults.withCurrency. The fallback is true, which appends CKB." },
      { name: "className", type: "ClassValue", detail: "Merged after defaults.balanceClassName." },
    ],
  },
  {
    id: "address",
    name: "ConnectWalletInfoAddress",
    summary: "Shows the recommended address, shortened with an ellipsis when it is longer than the kept ends.",
    example: `<ConnectWalletInfoAddress
  frontChars={6}
  endChars={4}
/>`,
    props: [
      { name: "frontChars", type: "number", detail: "Overrides defaults.frontChars. Built-in default is 10." },
      { name: "endChars", type: "number", detail: "Overrides defaults.endChars. Built-in default is 6." },
      { name: "className", type: "ClassValue", detail: "Merged after defaults.addressClassName." },
    ],
  },
];

function toggleCard(id: string, openId: string, setOpenId: (next: string) => void) {
  const apply = () => setOpenId(openId === id ? "" : id);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof document.startViewTransition !== "function") {
    apply();
    return;
  }
  try {
    document.startViewTransition(() => {
      flushSync(apply);
    }).finished.catch(() => { });
  } catch {
    apply();
  }
}

export function ComponentCards() {
  const [openId, setOpenId] = useState("");

  return (
    <section id="components" className="scroll-mt-24 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-semibold tracking-tight">The pieces</h2>
        <p className="max-w-2xl text-black/70 dark:text-white/70">
          Seven components, two across. Open a card for a usage example and every prop.
          A prop on one piece overrides the matching provider default.
          <code> LayoutProvider</code> is the previous name of the kit provider and is the same component. Both must sit under the app’s <code>ccc.Provider</code>.
        </p>
      </div>

      <div className="component-grid">
        {components.map((component) => {
          const open = openId === component.id;
          const panelId = `${component.id}-panel`;
          return (
            <article
              key={component.id}
              data-open={open}
              className="component-card h-full"
              style={{ viewTransitionName: `card-${component.id}` }}
            >
              <h3>
                <button
                  type="button"
                  className="flex w-full flex-col gap-3 p-5 text-left"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggleCard(component.id, openId, setOpenId)}
                >
                  <span className="flex items-start justify-between gap-4">
                    <span className="font-mono text-base font-semibold leading-6 sm:text-lg">{component.name}</span>
                    <ChevronDown aria-hidden className="component-chevron mt-0.5 h-5 w-5 shrink-0" />
                  </span>
                  <span className="text-sm font-normal leading-6 text-black/70 dark:text-white/70">{component.summary}</span>
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-black/45 dark:text-black/45 w-fit bg-white/90 rounded-md p-2">
                    {component.props.length} {component.props.length === 1 ? "prop" : "props"}
                  </span>
                </button>
              </h3>
              <div
                className="component-reveal"
                id={panelId}
                aria-hidden={!open}
                ref={(node) => {
                  if (node) node.inert = !open;
                }}
              >
                <div className="component-reveal-inner">
                  <div className="grid gap-4 px-5 pb-5">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/50 dark:text-white/50">Example</p>
                      <CodeBlock label={`${component.name}.tsx`} lang="tsx" code={component.example} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/50 dark:text-white/50">Props</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {component.props.map((prop, index) => (
                          <div
                            key={prop.name}
                            className={`flex flex-col gap-2 rounded-xl border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.06] ${component.props.length % 2 === 1 && index === component.props.length - 1 ? "sm:col-span-2" : ""}`}
                          >
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                              <code className="text-sm font-semibold">{prop.name}</code>
                              <span className="font-mono text-xs text-black/50 dark:text-white/50">{prop.type}</span>
                            </div>
                            <p className="text-sm leading-6 text-black/75 dark:text-white/75">{prop.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
