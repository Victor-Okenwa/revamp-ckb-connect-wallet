import { useMemo, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import {
  ConnectWallet,
  ConnectWalletButton,
  ConnectWalletInfoAddress,
  ConnectWalletInfoBalance,
  ConnectWalletInfoContainer,
  ConnectWalletInfoImage,
} from "ckb-connect-wallet-kit";
import { CodeBlock } from "./code-block";

type DecimalPlaces = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

export function DemoPage() {
  const { wallet } = ccc.useCcc();
  const [decimalPlaces, setDecimalPlaces] = useState<DecimalPlaces>(4);
  const [withCurrency, setWithCurrency] = useState(true);
  const [frontChars, setFrontChars] = useState(6);
  const [endChars, setEndChars] = useState(4);
  const [stacked, setStacked] = useState(true);

  const snippet = useMemo(() => {
    const container = stacked
      ? "flex items-center gap-3"
      : "flex items-center gap-2";
    const balanceProps = [
      `decimalPlaces={${decimalPlaces}}`,
      withCurrency ? "withCurrency" : "withCurrency={false}",
    ].join(" ");
    return `<ConnectWallet>
  <ConnectWalletButton />
  <ConnectWalletInfoContainer className="${container}">
    <ConnectWalletInfoImage />
    <div className="${stacked ? "flex flex-col items-start" : "flex items-baseline gap-2"}">
      <ConnectWalletInfoBalance ${balanceProps} />
      <ConnectWalletInfoAddress frontChars={${frontChars}} endChars={${endChars}} />
    </div>
  </ConnectWalletInfoContainer>
</ConnectWallet>`;
  }, [decimalPlaces, endChars, frontChars, stacked, withCurrency]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/55 dark:text-white/55">Demo</p>
        <h1 className="text-4xl font-semibold tracking-tight">Connect, then change the composition</h1>
        <p className="max-w-2xl text-lg leading-8 text-black/75 dark:text-white/75">
          The playground uses the same component tree the kit expects. Connect a wallet and the controls below rewrite that tree.
        </p>
      </div>

      <ConnectWallet>
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
            </form>

            <div className="flex flex-col gap-6">
              <div className="demo-stage flex min-h-40 items-center justify-center border border-black/15 p-8 dark:border-white/15">
                <ConnectWalletInfoContainer className={stacked ? "flex items-center gap-3" : "flex items-center gap-2"}>
                  <ConnectWalletInfoImage />
                  <div className={stacked ? "flex flex-col items-start" : "flex items-baseline gap-2"}>
                    <ConnectWalletInfoBalance decimalPlaces={decimalPlaces} withCurrency={withCurrency} />
                    <ConnectWalletInfoAddress frontChars={frontChars} endChars={endChars} />
                  </div>
                </ConnectWalletInfoContainer>
              </div>
              <CodeBlock label="The tree these controls produce" lang="tsx" code={snippet} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 border border-black/15 p-8 dark:border-white/15">
            <p className="max-w-xl text-sm leading-6">
              Connect a wallet before the playground opens. The button is <code>ConnectWalletButton</code> inside <code>ConnectWallet</code>.
            </p>
            <ConnectWalletButton />
          </div>
        )}
      </ConnectWallet>
    </div>
  );
}
