import { useState } from "react";

type PropDoc = {
  name: string;
  type: string;
  detail: string;
};

type ComponentDoc = {
  id: string;
  name: string;
  summary: string;
  props: PropDoc[];
};

const components: ComponentDoc[] = [
  {
    id: "provider",
    name: "ConnectWalletKitProvider",
    summary: "Place this at the root, around the app. It stores the shared defaults. When network is set, it also mounts ccc.Provider.",
    props: [
      { name: "children", type: "React.ReactNode", detail: "The rest of the app." },
      { name: "network", type: '"mainnet" | "testnet"', detail: "When set, creates the matching public CCC client and renders ccc.Provider. Omit it when the app already has a CCC provider. The component then only supplies defaults." },
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
    props: [
      { name: "children", type: "React.ReactNode", detail: "The button, the connected info, and any layout you put between them. Must sit under a CCC provider." },
    ],
  },
  {
    id: "button",
    name: "ConnectWalletButton",
    summary: "Renders only while no wallet is connected. Clicking it calls open() from CCC.",
    props: [
      { name: "className", type: "ClassValue", detail: "Merged after the provider buttonClassName, so it overrides conflicting utilities on this button only." },
      { name: "children", type: "React.ReactNode", detail: "Replaces defaults.buttonLabel, then the built-in “Connect Wallet” text." },
    ],
  },
  {
    id: "container",
    name: "ConnectWalletInfoContainer",
    summary: "Renders only after a wallet is connected. The whole pill calls open() again, which is how CCC shows account actions.",
    props: [
      { name: "children", type: "React.ReactNode", detail: "Your layout for the icon, balance, and address." },
      { name: "className", type: "ClassValue", detail: "Merged after defaults.infoContainerClassName." },
    ],
  },
  {
    id: "image",
    name: "ConnectWalletInfoImage",
    summary: "The wallet icon from wallet.icon. Renders nothing until a wallet is connected.",
    props: [
      { name: "className", type: "ClassValue", detail: "Merged after defaults.imageClassName. The built-in size is w-6 h-6." },
    ],
  },
  {
    id: "balance",
    name: "ConnectWalletInfoBalance",
    summary: "Formats the signer balance. A set decimalPlaces value truncates instead of rounding.",
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
    props: [
      { name: "frontChars", type: "number", detail: "Overrides defaults.frontChars. Built-in default is 10." },
      { name: "endChars", type: "number", detail: "Overrides defaults.endChars. Built-in default is 6." },
      { name: "className", type: "ClassValue", detail: "Merged after defaults.addressClassName." },
    ],
  },
];

export function ComponentsPage() {
  const [openId, setOpenId] = useState(components[0].id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-16">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/55 dark:text-white/55">Reference</p>
        <h1 className="text-4xl font-semibold tracking-tight">Each piece, and what it accepts</h1>
        <p className="text-lg leading-8 text-black/75 dark:text-white/75">
          Start with the provider. A prop on a single component overrides the matching default.
          <code> LayoutProvider</code> is the previous name of the provider and still defaults <code>network</code> to <code>"testnet"</code>.
        </p>
      </div>

      <div className="border-t border-black/15 dark:border-white/15">
        {components.map((component) => {
          const open = openId === component.id;
          return (
            <div key={component.id} className="border-b border-black/15 dark:border-white/15">
              <h2>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? "" : component.id)}
                >
                  <span className="font-mono text-base font-semibold sm:text-lg">{component.name}</span>
                  <span aria-hidden className="text-xl leading-none">{open ? "–" : "+"}</span>
                </button>
              </h2>
              {open && (
                <div className="flex flex-col gap-4 pb-6">
                  <p className="text-sm leading-6 text-black/75 dark:text-white/75">{component.summary}</p>
                  <ul className="flex flex-col gap-3">
                    {component.props.map((prop) => (
                      <li key={prop.name} className="grid gap-1 border border-black/10 p-3 dark:border-white/10 sm:grid-cols-[14rem_1fr]">
                        <div>
                          <code className="text-sm font-semibold">{prop.name}</code>
                          <div className="mt-1 font-mono text-xs text-black/55 dark:text-white/55">{prop.type}</div>
                        </div>
                        <p className="text-sm leading-6">{prop.detail}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
