import { useMemo, useState, type ReactNode } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import {
  ConnectWalletContainer,
  ConnectWalletButton,
  ConnectWalletDid,
  ConnectWalletDidAvatar,
  ConnectWalletDidId,
  ConnectWalletDidName,
  ConnectWalletAddress,
  ConnectWalletBalance,
  ConnectWalletImage,
  useConnectWallet,
  useConnectWalletDid,
} from "ckb-connect-wallet-kit";
import { CodeBlock } from "./code-block";
import { UsageExamples } from "./usage-examples";
import { WalletDialog } from "./wallet-dialog";

type DecimalPlaces = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

function OpenAccount({ className, children }: { className: string; children: ReactNode }) {
  const { open } = useConnectWallet();
  return (
    <button type="button" className={`${className} cursor-pointer`} onClick={() => { open(); }}>
      {children}
    </button>
  );
}

function DidStatus() {
  const { dids, did, isLoading, error } = useConnectWalletDid();
  if (isLoading) return <p className="text-xs text-black/60 dark:text-white/60">Looking up did:ckb cells for this lock…</p>;
  if (error) return <p className="text-xs text-red-600 dark:text-red-400">DID lookup failed. Check the console.</p>;
  if (dids.length === 0) {
    return (
      <p className="max-w-xl text-xs leading-5 text-black/60 dark:text-white/60">
        This lock owns no did:ckb cell, so the DID pieces render their fallbacks. Create one with a did:ckb dashboard and reconnect.
      </p>
    );
  }
  return (
    <p className="max-w-xl text-xs leading-5 text-black/60 dark:text-white/60">
      {dids.length} DID{dids.length === 1 ? "" : "s"} on this lock. Showing <code>{did?.did}</code>
      {did?.displayName ? ` (${did.displayName})` : ", which has no profile name"}.
    </p>
  );
}

export function UsagePage() {
  const { wallet } = ccc.useCcc();
  const [decimalPlaces, setDecimalPlaces] = useState<DecimalPlaces>(4);
  const [withCurrency, setWithCurrency] = useState(true);
  const [frontChars, setFrontChars] = useState(6);
  const [endChars, setEndChars] = useState(4);
  const [stacked, setStacked] = useState(true);
  const [showDid, setShowDid] = useState(false);

  const containerClass = stacked ? "flex items-center gap-3" : "flex items-center gap-2";
  const textClass = stacked ? "flex flex-col items-start" : "flex items-baseline gap-2";

  const snippet = useMemo(() => {
    const balanceProps = [
      `decimalPlaces={${decimalPlaces}}`,
      withCurrency ? "withCurrency" : "withCurrency={false}",
    ].join(" ");
    const addressProps = `frontChars={${frontChars}} endChars={${endChars}}`;

    const dialog = `<ConnectWalletDialog>
    <ConnectWalletDialogOverlay>
      <ConnectWalletDialogWallets>
        <ConnectWalletDialogWalletsHeader>
          <h2>Connect Wallet</h2>
          <ConnectWalletDialogClose />
        </ConnectWalletDialogWalletsHeader>
        <ConnectWalletDialogWalletList show="both" />
        <ConnectWalletDialogWalletsFooter>
          <ConnectWalletDialogWalletsRefresh />
        </ConnectWalletDialogWalletsFooter>
      </ConnectWalletDialogWallets>
      <ConnectWalletDialogSigners />
      <ConnectWalletDialogConnecting />
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
    </ConnectWalletDialogOverlay>
  </ConnectWalletDialog>`;

    if (showDid) {
      return `<ConnectWalletContainer>
  <ConnectWalletButton />
  <button type="button" className="${containerClass}" onClick={() => open()}>
    <ConnectWalletDid>
      <ConnectWalletDidAvatar fallback={<ConnectWalletImage />} />
      <div className="${textClass}">
        <ConnectWalletDidName fallback={<ConnectWalletBalance ${balanceProps} />} />
        <ConnectWalletDidId fallback={<ConnectWalletAddress ${addressProps} />} />
      </div>
    </ConnectWalletDid>
  </button>
  ${dialog}
</ConnectWalletContainer>`;
    }

    return `<ConnectWalletContainer>
  <ConnectWalletButton />
  <button type="button" className="${containerClass}" onClick={() => open()}>
    <ConnectWalletImage />
    <div className="${textClass}">
      <ConnectWalletBalance ${balanceProps} />
      <ConnectWalletAddress ${addressProps} />
    </div>
  </button>
  ${dialog}
</ConnectWalletContainer>`;
  }, [containerClass, decimalPlaces, endChars, frontChars, showDid, textClass, withCurrency]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/55 dark:text-white/55">Usage</p>
        <h1 className="text-4xl font-semibold tracking-tight">Connect, then change the composition</h1>
        <p className="max-w-2xl text-lg leading-8 text-black/75 dark:text-white/75">
          The playground uses the same pieces the kit exports. Connect a wallet and the controls below rewrite that tree. <code>open</code> in the snippet is <code>useConnectWallet().open</code>.
        </p>
      </div>

      <ConnectWalletContainer>
        {wallet ? (
          <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
            <form className="flex flex-col gap-4 border border-black/15 p-4 dark:border-white/15" onSubmit={(event) => event.preventDefault()}>
              <label className="flex flex-col gap-1 text-sm">
                decimalPlaces
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={decimalPlaces}
                  onChange={(event) => setDecimalPlaces(Number(event.target.value) as DecimalPlaces)}
                />
                <span className="font-mono text-xs">{decimalPlaces}</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={withCurrency} onChange={(event) => setWithCurrency(event.target.checked)} />
                withCurrency
              </label>
              <label className="flex flex-col gap-1 text-sm">
                frontChars
                <input
                  className="border border-black/20 bg-transparent px-2 py-1 font-mono dark:border-white/20"
                  type="number"
                  min={0}
                  max={40}
                  value={frontChars}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (Number.isFinite(next)) setFrontChars(Math.max(0, next));
                  }}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                endChars
                <input
                  className="border border-black/20 bg-transparent px-2 py-1 font-mono dark:border-white/20"
                  type="number"
                  min={0}
                  max={40}
                  value={endChars}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (Number.isFinite(next)) setEndChars(Math.max(0, next));
                  }}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={stacked} onChange={(event) => setStacked(event.target.checked)} />
                Stack balance over address
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showDid} onChange={(event) => setShowDid(event.target.checked)} />
                Show did:ckb profile
              </label>
            </form>

            <div className="flex flex-col gap-6">
              <div className="demo-stage flex min-h-40 flex-col items-center justify-center gap-4 border border-black/15 p-8 dark:border-white/15">
                {showDid ? (
                  <ConnectWalletDid>
                    <OpenAccount className={containerClass}>
                      <ConnectWalletDidAvatar fallback={<ConnectWalletImage />} />
                      <div className={textClass}>
                        <ConnectWalletDidName fallback={<ConnectWalletBalance decimalPlaces={decimalPlaces} withCurrency={withCurrency} />} />
                        <ConnectWalletDidId fallback={<ConnectWalletAddress frontChars={frontChars} endChars={endChars} />} />
                      </div>
                    </OpenAccount>
                    <DidStatus />
                  </ConnectWalletDid>
                ) : (
                  <OpenAccount className={containerClass}>
                    <ConnectWalletImage />
                    <div className={textClass}>
                      <ConnectWalletBalance decimalPlaces={decimalPlaces} withCurrency={withCurrency} />
                      <ConnectWalletAddress frontChars={frontChars} endChars={endChars} />
                    </div>
                  </OpenAccount>
                )}
              </div>
              <CodeBlock label="The tree these controls produce" lang="tsx" code={snippet} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 border border-black/15 p-8 dark:border-white/15">
            <p className="max-w-xl text-sm leading-6">
              Connect a wallet before the playground opens. The button is <code>ConnectWalletButton</code> inside <code>ConnectWalletContainer</code>.
            </p>
            <ConnectWalletButton />
          </div>
        )}
        <WalletDialog />
      </ConnectWalletContainer>
      <UsageExamples />
    </div>
  );
}
