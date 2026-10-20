import { useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { ChevronDown } from "lucide-react";
import { ccc } from "@ckb-ccc/connector-react";
import {
  ConnectWalletAddress,
  ConnectWalletBalance,
  ConnectWalletButton,
  ConnectWalletContainer,
  ConnectWalletDialog,
  ConnectWalletDialogAccount,
  ConnectWalletDialogAccountFooter,
  ConnectWalletDialogAccountHeader,
  ConnectWalletDialogClose,
  ConnectWalletDialogConnecting,
  ConnectWalletDialogOverlay,
  ConnectWalletDialogSigners,
  ConnectWalletDialogWallet,
  ConnectWalletDialogWalletList,
  ConnectWalletDialogWallets,
  ConnectWalletDialogWalletsFooter,
  ConnectWalletDialogWalletsHeader,
  ConnectWalletDialogWalletsRefresh,
  ConnectWalletDid,
  ConnectWalletDidAvatar,
  ConnectWalletDidId,
  ConnectWalletDidName,
  ConnectWalletDisconnect,
  ConnectWalletImage,
  ConnectWalletName,
  ConnectWalletSwitchNetwork,
  useConnectWallet,
} from "ckb-connect-wallet-kit";
import { CodeBlock } from "./code-block";

const joyIdClass = "border-emerald-400 bg-emerald-400/10";

function toggleRow(id: string, openId: string, setOpenId: (next: string) => void) {
  const apply = () => setOpenId(openId === id ? "" : id);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof document.startViewTransition !== "function") {
    apply();
    return;
  }
  try {
    document.startViewTransition(() => {
      flushSync(apply);
    }).finished.catch(() => {});
  } catch {
    apply();
  }
}

function ReopenDialog() {
  const { wallet, open } = useConnectWallet();
  if (!wallet) return null;
  return (
    <button
      type="button"
      className="rounded-full border border-black/20 px-4 py-2 text-sm dark:border-white/20"
      onClick={() => { open(); }}
    >
      Open dialog
    </button>
  );
}

function DialogFrame({ wallets, account }: { wallets: ReactNode; account: ReactNode }) {
  return (
    <ConnectWalletDialog>
      <ConnectWalletDialogOverlay>
        <ConnectWalletDialogWallets>
          <ConnectWalletDialogWalletsHeader>
            <h2 className="text-base font-semibold">Connect Wallet</h2>
            <ConnectWalletDialogClose />
          </ConnectWalletDialogWalletsHeader>
          {wallets}
          <ConnectWalletDialogWalletsFooter>
            <ConnectWalletDialogWalletsRefresh />
          </ConnectWalletDialogWalletsFooter>
        </ConnectWalletDialogWallets>
        <ConnectWalletDialogSigners />
        <ConnectWalletDialogConnecting />
        {account}
      </ConnectWalletDialogOverlay>
    </ConnectWalletDialog>
  );
}

function SimpleAccount() {
  return (
    <ConnectWalletDialogAccount>
      <ConnectWalletDialogAccountHeader>
        <ConnectWalletName />
        <ConnectWalletDialogClose />
      </ConnectWalletDialogAccountHeader>
      <ConnectWalletAddress />
      <ConnectWalletBalance />
    </ConnectWalletDialogAccount>
  );
}

function DialogResult({ wallets, account }: { wallets: ReactNode; account: ReactNode }) {
  return (
    <ConnectWalletContainer>
      <div className="flex flex-wrap items-center gap-3">
        <ConnectWalletButton />
        <ReopenDialog />
      </div>
      <DialogFrame wallets={wallets} account={account} />
    </ConnectWalletContainer>
  );
}

function DidPill() {
  const { open } = useConnectWallet();
  return (
    <ConnectWalletDid>
      <button type="button" className="flex items-center gap-2" onClick={() => { open(); }}>
        <ConnectWalletDidAvatar fallback={<ConnectWalletImage />} />
        <span className="flex flex-col items-start">
          <ConnectWalletDidName fallback={<ConnectWalletBalance />} />
          <ConnectWalletDidId fallback={<ConnectWalletAddress />} />
        </span>
      </button>
    </ConnectWalletDid>
  );
}

function CopyAddress() {
  const { address, wallet } = useConnectWallet();
  const [copied, setCopied] = useState(false);
  if (!wallet) return null;
  return (
    <span className="flex items-center gap-2">
      <ConnectWalletAddress />
      <button
        type="button"
        className="rounded-full border border-black/20 px-3 py-1 text-xs dark:border-white/20"
        onClick={() => {
          void navigator.clipboard.writeText(address).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          });
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}

const simpleAccountCode = `<ConnectWalletDialogAccount>
        <ConnectWalletDialogAccountHeader>
          <ConnectWalletName />
          <ConnectWalletDialogClose />
        </ConnectWalletDialogAccountHeader>
        <ConnectWalletAddress />
        <ConnectWalletBalance />
      </ConnectWalletDialogAccount>`;

function dialogCode(wallets: string, account: string) {
  return `<ConnectWalletContainer>
  <ConnectWalletButton />
  <ConnectWalletDialog>
    <ConnectWalletDialogOverlay>
      <ConnectWalletDialogWallets>
        <ConnectWalletDialogWalletsHeader>
          <h2>Connect Wallet</h2>
          <ConnectWalletDialogClose />
        </ConnectWalletDialogWalletsHeader>
        ${wallets}
        <ConnectWalletDialogWalletsFooter>
          <ConnectWalletDialogWalletsRefresh />
        </ConnectWalletDialogWalletsFooter>
      </ConnectWalletDialogWallets>
      <ConnectWalletDialogSigners />
      <ConnectWalletDialogConnecting />
      ${account}
    </ConnectWalletDialogOverlay>
  </ConnectWalletDialog>
</ConnectWalletContainer>`;
}

type UsageExample = {
  id: string;
  title: string;
  note: string;
  needs: "connected" | "disconnected";
  steps: string[];
  code: string;
  result: ReactNode;
};

const examples: UsageExample[] = [
  {
    id: "did-pill",
    title: "did:ckb pill",
    note: "Avatar, display name, and identifier. Each piece falls back when the lock has no DID or no profile.",
    needs: "connected",
    steps: [
      "Click Connect Wallet in this row and finish connecting. Skip this when a wallet is already connected.",
      "The button is replaced by the avatar, display name, and did:ckb identifier.",
      "If the lock owns no DID, the wallet icon, balance, and address render instead.",
    ],
    code: `<ConnectWalletContainer>
  <ConnectWalletButton />
  <ConnectWalletDid>
    <button type="button" onClick={() => open()}>
      <ConnectWalletDidAvatar fallback={<ConnectWalletImage />} />
      <ConnectWalletDidName fallback={<ConnectWalletBalance />} />
      <ConnectWalletDidId fallback={<ConnectWalletAddress />} />
    </button>
  </ConnectWalletDid>
</ConnectWalletContainer>`,
    result: (
      <ConnectWalletContainer>
        <ConnectWalletButton />
        <DidPill />
      </ConnectWalletContainer>
    ),
  },
  {
    id: "all-wallets",
    title: "Custom dialog, every wallet",
    note: "Omit wallets and the list shows every wallet CCC discovers.",
    needs: "disconnected",
    steps: [
      "Disconnect first if a wallet is already connected. Use the header pill, then Disconnect. A connected wallet skips this list and opens the account step.",
      "Click Connect Wallet in this row.",
      "The dialog opens on the wallet step and lists every wallet CCC discovered.",
    ],
    code: dialogCode("<ConnectWalletDialogWalletList />", simpleAccountCode),
    result: (
      <DialogResult
        wallets={<ConnectWalletDialogWalletList />}
        account={<SimpleAccount />}
      />
    ),
  },
  {
    id: "selected-wallets",
    title: "Custom dialog, selected wallets",
    note: "Pass wallet names to show only those rows, in that order.",
    needs: "disconnected",
    steps: [
      "Disconnect first if a wallet is already connected. This list only renders on the wallet step.",
      "Click Connect Wallet in this row.",
      "The dialog lists JoyID, then MetaMask. Any other wallet is omitted, and a name that is not installed is skipped.",
    ],
    code: dialogCode(`<ConnectWalletDialogWalletList wallets={["JoyID", "MetaMask"]} />`, simpleAccountCode),
    result: (
      <DialogResult
        wallets={<ConnectWalletDialogWalletList wallets={["JoyID", "MetaMask"]} />}
        account={<SimpleAccount />}
      />
    ),
  },
  {
    id: "styled-wallet",
    title: "Custom styling on one wallet",
    note: "JoyID gets its own class. MetaMask keeps the default row style.",
    needs: "disconnected",
    steps: [
      "Disconnect first if a wallet is already connected. The styled rows only render on the wallet step.",
      "Click Connect Wallet in this row.",
      "JoyID is the emerald row. MetaMask keeps the default style. A row is hidden when that wallet is not installed.",
    ],
    code: dialogCode(`<div className="flex flex-col gap-2">
          <ConnectWalletDialogWallet name="JoyID" className="${joyIdClass}" />
          <ConnectWalletDialogWallet name="MetaMask" />
        </div>`, simpleAccountCode),
    result: (
      <DialogResult
        wallets={(
          <div className="flex flex-col gap-2">
            <ConnectWalletDialogWallet name="JoyID" className={joyIdClass} />
            <ConnectWalletDialogWallet name="MetaMask" />
          </div>
        )}
        account={<SimpleAccount />}
      />
    ),
  },
  {
    id: "icon-only",
    title: "Wallet icon only",
    note: "show=\"icon\" keeps the icon and uses the wallet name as the accessible label.",
    needs: "disconnected",
    steps: [
      "Disconnect first if a wallet is already connected. Icon rows only render on the wallet step.",
      "Click Connect Wallet in this row.",
      "Each row is the wallet icon. The wallet name is the button’s accessible label.",
    ],
    code: dialogCode(`<ConnectWalletDialogWalletList show="icon" />`, simpleAccountCode),
    result: (
      <DialogResult
        wallets={<ConnectWalletDialogWalletList show="icon" />}
        account={<SimpleAccount />}
      />
    ),
  },
  {
    id: "name-only",
    title: "Wallet name only",
    note: "show=\"name\" drops the icon from each row.",
    needs: "disconnected",
    steps: [
      "Disconnect first if a wallet is already connected. Name rows only render on the wallet step.",
      "Click Connect Wallet in this row.",
      "Each row is the wallet name, with no icon.",
    ],
    code: dialogCode(`<ConnectWalletDialogWalletList show="name" />`, simpleAccountCode),
    result: (
      <DialogResult
        wallets={<ConnectWalletDialogWalletList show="name" />}
        account={<SimpleAccount />}
      />
    ),
  },
  {
    id: "dialog-did",
    title: "Account dialog with did:ckb",
    note: "The account step shows the avatar, identifier, and balance after connect.",
    needs: "connected",
    steps: [
      "Click Connect Wallet in this row and finish connecting. Skip this when a wallet is already connected.",
      "Click Open dialog in this row. The header pill opens a different dialog.",
      "The account step shows the DID avatar, identifier, and balance. Without a DID, the wallet icon and address are the fallbacks.",
    ],
    code: dialogCode("<ConnectWalletDialogWalletList />", `<ConnectWalletDialogAccount>
        <ConnectWalletDialogAccountHeader>
          <ConnectWalletName />
          <ConnectWalletDialogClose />
        </ConnectWalletDialogAccountHeader>
        <ConnectWalletDid>
          <ConnectWalletDidAvatar
            className="h-16 w-16"
            fallback={<ConnectWalletImage className="h-16 w-16 rounded-2xl" />}
          />
          <ConnectWalletDidId fallback={<ConnectWalletAddress />} />
          <ConnectWalletBalance />
        </ConnectWalletDid>
      </ConnectWalletDialogAccount>`),
    result: (
      <DialogResult
        wallets={<ConnectWalletDialogWalletList />}
        account={(
          <ConnectWalletDialogAccount>
            <ConnectWalletDialogAccountHeader>
              <ConnectWalletName />
              <ConnectWalletDialogClose />
            </ConnectWalletDialogAccountHeader>
            <ConnectWalletDid>
              <div className="flex flex-col items-center gap-2 py-1">
                <ConnectWalletDidAvatar
                  className="h-16 w-16"
                  fallback={<ConnectWalletImage className="h-16 w-16 rounded-2xl" />}
                />
                <ConnectWalletDidId fallback={<ConnectWalletAddress />} />
                <ConnectWalletBalance />
              </div>
            </ConnectWalletDid>
          </ConnectWalletDialogAccount>
        )}
      />
    ),
  },
  {
    id: "dialog-address-balance",
    title: "Account dialog with address and balance",
    note: "The account step shows the truncated address and the formatted balance.",
    needs: "connected",
    steps: [
      "Click Connect Wallet in this row and finish connecting. Skip this when a wallet is already connected.",
      "Click Open dialog in this row, not the header pill.",
      "The account step shows the wallet icon, name, truncated address, and balance.",
    ],
    code: dialogCode("<ConnectWalletDialogWalletList />", `<ConnectWalletDialogAccount>
        <ConnectWalletDialogAccountHeader>
          <ConnectWalletImage />
          <ConnectWalletName />
          <ConnectWalletDialogClose />
        </ConnectWalletDialogAccountHeader>
        <ConnectWalletAddress />
        <ConnectWalletBalance />
      </ConnectWalletDialogAccount>`),
    result: (
      <DialogResult
        wallets={<ConnectWalletDialogWalletList />}
        account={(
          <ConnectWalletDialogAccount>
            <ConnectWalletDialogAccountHeader>
              <ConnectWalletImage />
              <ConnectWalletName />
              <ConnectWalletDialogClose />
            </ConnectWalletDialogAccountHeader>
            <ConnectWalletAddress />
            <ConnectWalletBalance />
          </ConnectWalletDialogAccount>
        )}
      />
    ),
  },
  {
    id: "copy-address",
    title: "Copy address",
    note: "The kit has no copy component. This button copies useConnectWallet().address.",
    needs: "connected",
    steps: [
      "Click Connect Wallet in this row and finish connecting. Skip this when a wallet is already connected.",
      "The address and Copy button appear in this row.",
      "Click Copy. The full address is written to the clipboard.",
    ],
    code: `function CopyAddress() {
  const { address, wallet } = useConnectWallet();
  if (!wallet) return null;
  return (
    <span className="flex items-center gap-2">
      <ConnectWalletAddress />
      <button type="button" onClick={() => navigator.clipboard.writeText(address)}>
        Copy
      </button>
    </span>
  );
}

<ConnectWalletContainer>
  <ConnectWalletButton />
  <CopyAddress />
</ConnectWalletContainer>`,
    result: (
      <ConnectWalletContainer>
        <ConnectWalletButton />
        <CopyAddress />
      </ConnectWalletContainer>
    ),
  },
  {
    id: "disconnect-network",
    title: "Disconnect and switch network",
    note: "The account footer holds disconnect and the network switch.",
    needs: "connected",
    steps: [
      "Click Connect Wallet in this row and finish connecting. Skip this when a wallet is already connected.",
      "Click Open dialog in this row, not the header pill.",
      "The account footer has Disconnect and Switch network. Disconnect returns this dialog to the wallet list.",
    ],
    code: dialogCode("<ConnectWalletDialogWalletList />", `<ConnectWalletDialogAccount>
        <ConnectWalletDialogAccountHeader>
          <ConnectWalletName />
          <ConnectWalletDialogClose />
        </ConnectWalletDialogAccountHeader>
        <ConnectWalletDialogAccountFooter>
          <ConnectWalletDisconnect buttonText="Disconnect" />
          <ConnectWalletSwitchNetwork />
        </ConnectWalletDialogAccountFooter>
      </ConnectWalletDialogAccount>`),
    result: (
      <DialogResult
        wallets={<ConnectWalletDialogWalletList />}
        account={(
          <ConnectWalletDialogAccount>
            <ConnectWalletDialogAccountHeader>
              <ConnectWalletName />
              <ConnectWalletDialogClose />
            </ConnectWalletDialogAccountHeader>
            <ConnectWalletDialogAccountFooter>
              <ConnectWalletDisconnect buttonText="Disconnect" />
              <ConnectWalletSwitchNetwork />
            </ConnectWalletDialogAccountFooter>
          </ConnectWalletDialogAccount>
        )}
      />
    ),
  },
];

function ConnectionHint({ needs }: { needs: UsageExample["needs"] }) {
  const { wallet } = ccc.useCcc();
  const connected = Boolean(wallet);
  if (needs === "disconnected" && connected) {
    return (
      <p className="text-sm leading-6 text-amber-800 dark:text-amber-200">
        A wallet is connected, so Connect Wallet in this row is hidden and Open dialog shows the account step. Disconnect, then click Connect Wallet here.
      </p>
    );
  }
  if (needs === "connected" && !connected) {
    return (
      <p className="text-sm leading-6 text-amber-800 dark:text-amber-200">
        No wallet is connected. Click Connect Wallet in this row before the result can render.
      </p>
    );
  }
  return null;
}

export function UsageExamples() {
  const [openId, setOpenId] = useState("");

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-semibold tracking-tight">Usage styles</h2>
        <p className="max-w-2xl text-black/70 dark:text-white/70">
          Each row is its own composition. Follow its steps. A wallet list only appears while no wallet is connected. The header pill opens a different dialog from the one in the row.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {examples.map((example) => {
          const open = openId === example.id;
          const panelId = `${example.id}-usage`;
          return (
            <article
              key={example.id}
              data-open={open}
              className="component-card"
              style={{ viewTransitionName: `usage-${example.id}` }}
            >
              <h3>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggleRow(example.id, openId, setOpenId)}
                >
                  <span className="text-base font-semibold">{example.title}</span>
                  <ChevronDown aria-hidden className="component-chevron h-5 w-5 shrink-0" />
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
                  <div className="flex flex-col gap-4 px-5 pb-5">
                    <p className="text-sm leading-6 text-black/70 dark:text-white/70">{example.note}</p>
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/50 dark:text-white/50">Steps</p>
                      <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-black/80 dark:text-white/80">
                        {example.steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                      <ConnectionHint needs={example.needs} />
                    </div>
                    <div className="flex min-h-24 items-center border border-black/10 p-4 dark:border-white/10">
                      {example.result}
                    </div>
                    <CodeBlock label={`${example.id}.tsx`} lang="tsx" code={example.code} />
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
