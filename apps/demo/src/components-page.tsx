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
      { name: "defaults.didAvatarClassName", type: "ClassValue", detail: "Replaces the default w-6 h-6 rounded-full on the DID avatar." },
      { name: "defaults.didNameClassName", type: "ClassValue", detail: "Replaces the default font-semibold text-sm on the DID display name." },
      { name: "defaults.didIdClassName", type: "ClassValue", detail: "Replaces the default text-xs font-normal on the did:ckb identifier." },
      { name: "defaults.didFrontChars", type: "number", detail: "Characters kept at the start of the did:ckb string. Built-in default is 14." },
      { name: "defaults.didEndChars", type: "number", detail: "Characters kept at the end of the did:ckb string. Built-in default is 6." },
      { name: "defaults.dialogOverlayClassName", type: "ClassValue", detail: "Replaces the built-in backdrop on ConnectWalletDialogOverlay." },
      { name: "defaults.dialogPanelClassName", type: "ClassValue", detail: "Replaces the built-in panel on ConnectWalletDialogOverlay." },
      { name: "defaults.dialogTitleClassName", type: "ClassValue", detail: "Replaces the built-in dialog title typography." },
      { name: "defaults.dialogListButtonClassName", type: "ClassValue", detail: "Replaces the built-in wallet, chain, and network buttons." },
      { name: "defaults.dialogActionClassName", type: "ClassValue", detail: "Replaces the built-in Disconnect and Try again buttons." },
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
    summary: "Renders only while no wallet is connected. Clicking it calls open(). A ConnectWalletDialog in the same ConnectWallet receives that click. Without one, CCC's popup opens.",
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
    summary: "Renders only after a wallet is connected. The whole pill calls open(). A ConnectWalletDialog in the same ConnectWallet shows the account view. Without one, CCC's popup opens.",
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
  {
    id: "dialog",
    name: "ConnectWalletDialog",
    summary: "Popup state for one composition. It renders no chrome. While it is mounted, open() from the button, the pill, and useConnectWallet() opens this dialog.",
    example: `<ConnectWallet>
  <ConnectWalletButton />
  <ConnectWalletDialog>
    <ConnectWalletDialogOverlay>
      <ConnectWalletDialogWallets />
      <ConnectWalletDialogSigners />
      <ConnectWalletDialogConnecting />
      <ConnectWalletDialogAccount />
    </ConnectWalletDialogOverlay>
  </ConnectWalletDialog>
</ConnectWallet>`,
    props: [
      { name: "children", type: "React.ReactNode", detail: "The overlay and sections, or any custom UI that calls useConnectWalletDialog()." },
    ],
  },
  {
    id: "dialog-overlay",
    name: "ConnectWalletDialogOverlay",
    summary: "Optional centered modal. Skip it when the popup should be a dropdown, drawer, or another layout.",
    example: `<ConnectWalletDialogOverlay label="Connect a wallet">
  <ConnectWalletDialogWallets />
  <ConnectWalletDialogAccount />
</ConnectWalletDialogOverlay>`,
    props: [
      { name: "children", type: "React.ReactNode", detail: "What the panel shows. Only the section for the current step renders." },
      { name: "className", type: "ClassValue", detail: "Merged onto the panel after defaults.dialogPanelClassName." },
      { name: "overlayClassName", type: "ClassValue", detail: "Merged onto the backdrop after defaults.dialogOverlayClassName." },
      { name: "label", type: "string", detail: "Accessible name of the dialog. Built-in is Wallet." },
    ],
  },
  {
    id: "dialog-wallets",
    name: "ConnectWalletDialogWallets",
    summary: "Wallet list. Renders only while the dialog is open on the wallet step. One signer connects immediately. Several signers move to the chain step.",
    example: `<ConnectWalletDialogWallets buttonClassName="rounded-none" />`,
    props: [
      { name: "className", type: "ClassValue", detail: "Merged onto the section." },
      { name: "buttonClassName", type: "ClassValue", detail: "Merged onto each wallet button after defaults.dialogListButtonClassName." },
    ],
  },
  {
    id: "dialog-signers",
    name: "ConnectWalletDialogSigners",
    summary: "Chain list for the selected wallet. Renders only on that step.",
    example: `<ConnectWalletDialogSigners />`,
    props: [
      { name: "className", type: "ClassValue", detail: "Merged onto the section." },
      { name: "buttonClassName", type: "ClassValue", detail: "Merged onto each chain button after defaults.dialogListButtonClassName." },
    ],
  },
  {
    id: "dialog-connecting",
    name: "ConnectWalletDialogConnecting",
    summary: "Opening and error state. Try again repeats the attempt.",
    example: `<ConnectWalletDialogConnecting />`,
    props: [
      { name: "className", type: "ClassValue", detail: "Merged onto the section." },
      { name: "buttonClassName", type: "ClassValue", detail: "Merged onto Try again after defaults.dialogActionClassName." },
    ],
  },
  {
    id: "dialog-account",
    name: "ConnectWalletDialogAccount",
    summary: "Connected view: wallet, address, balance, your actions, Disconnect, and network switching when ccc.Provider received clientOptions.",
    example: `<ConnectWalletDialogAccount>
  <a href="/settings">Settings</a>
</ConnectWalletDialogAccount>`,
    props: [
      { name: "children", type: "React.ReactNode", detail: "Extra actions, rendered above Disconnect." },
      { name: "className", type: "ClassValue", detail: "Merged onto the section." },
      { name: "buttonClassName", type: "ClassValue", detail: "Merged onto Disconnect and the network rows." },
    ],
  },
  {
    id: "did",
    name: "ConnectWalletDid",
    summary: "Optional. Looks up the did:ckb identities owned by the connected lock and shares the newest one with its children. Renders nothing before connect, and nothing is fetched unless you render it.",
    example: `<ConnectWalletInfoContainer className="flex items-center gap-2">
  <ConnectWalletDid>
    <ConnectWalletDidAvatar />
    <div className="flex flex-col items-start">
      <ConnectWalletDidName fallback={<ConnectWalletInfoAddress />} />
      <ConnectWalletDidId />
    </div>
  </ConnectWalletDid>
</ConnectWalletInfoContainer>`,
    props: [
      { name: "children", type: "React.ReactNode", detail: "The DID pieces, or anything that calls useConnectWalletDid()." },
      { name: "resolve", type: "DidResolver", detail: "Replace the lookup. Receives { client, signer, lock, address } and returns DidProfile[]. The default lists live did:ckb cells locked by the wallet." },
      { name: "script", type: "DidScript", detail: "Code hash and hash type of a custom did:ckb deployment. The kit ships mainnet and testnet, and uses CCC's KnownScript.DidCkb when the installed CCC has it." },
      { name: "pick", type: "(dids) => DidProfile | undefined", detail: "Choose which DID to show when the lock owns several. Default is the newest cell." },
    ],
  },
  {
    id: "did-avatar",
    name: "ConnectWalletDidAvatar",
    summary: "The avatar from services.profile.avatar in the DID document. Renders the fallback when the document has no avatar.",
    example: `<ConnectWalletDidAvatar
  className="h-8 w-8"
  fallback={<ConnectWalletInfoImage />}
/>`,
    props: [
      { name: "className", type: "ClassValue", detail: "Merged after defaults.didAvatarClassName. Built-in is w-6 h-6 rounded-full object-cover." },
      { name: "fallback", type: "React.ReactNode", detail: "Rendered when the resolved DID has no avatar. Nothing is rendered while the lookup runs." },
    ],
  },
  {
    id: "did-name",
    name: "ConnectWalletDidName",
    summary: "The display name from services.profile.displayName. Renders the fallback when the document has no name.",
    example: `<ConnectWalletDidName
  fallback={<ConnectWalletInfoAddress frontChars={6} endChars={4} />}
/>`,
    props: [
      { name: "className", type: "ClassValue", detail: "Merged after defaults.didNameClassName. Built-in is font-semibold text-sm." },
      { name: "fallback", type: "React.ReactNode", detail: "Rendered when the resolved DID has no display name." },
    ],
  },
  {
    id: "did-id",
    name: "ConnectWalletDidId",
    summary: "The did:ckb identifier, shortened with an ellipsis. The full value is in the title attribute.",
    example: `<ConnectWalletDidId
  frontChars={14}
  endChars={6}
  fallback={<ConnectWalletInfoAddress />}
/>`,
    props: [
      { name: "frontChars", type: "number", detail: "Overrides defaults.didFrontChars. Built-in default is 14, which keeps did:ckb: plus six characters." },
      { name: "endChars", type: "number", detail: "Overrides defaults.didEndChars. Built-in default is 6." },
      { name: "className", type: "ClassValue", detail: "Merged after defaults.didIdClassName." },
      { name: "fallback", type: "React.ReactNode", detail: "Rendered when the lock owns no DID." },
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
          Open a card for a usage example and every prop. The dialog pieces are optional and replace CCC's popup. The four DID pieces are optional and only fetch when rendered.
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
