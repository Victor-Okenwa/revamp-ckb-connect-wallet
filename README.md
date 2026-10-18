# ckb-connect-wallet-kit

**Modern, flexible wallet connection UI for `@ckb-ccc/connector-react` (Nervos CKB)**

A clean compound component with full control over layout, styling, balance formatting, address truncation, currency display, and loading states — with zero prop drilling.

---

## Features

- **Compound pattern** – compose exactly the UI you want
- **No prop drilling** – everything shared via React Context
- **Optimized** – single `Promise.all` for address + balance
- **Loading states** – visual feedback during data fetching
- **Highly customizable**
  - Balance: `decimalPlaces` (0–20), `withCurrency`, truncation
  - Address: custom `frontChars` / `endChars`
  - Full Tailwind class overrides via `className`
- **Auto hide/show** – button vs. connected info
- **Dark mode ready** + modern default styles
- **Type-safe** – TypeScript everywhere

---

## Install

Use either path. The package tracks releases. Copying the source puts the component in your repository.

### Package

React, React DOM, and `@ckb-ccc/connector-react` are peer dependencies. Install them alongside the package:

```bash
npm install ckb-connect-wallet-kit @ckb-ccc/connector-react react react-dom
```

The components ship Tailwind class names, not a prebuilt stylesheet. Tailwind v4 does not scan `node_modules` unless you point it at the package:

```css
@import "tailwindcss";
@source "../node_modules/ckb-connect-wallet-kit/dist";
```

### Copy the source

Copy these files into your app. `connect-wallet.tsx` and `utils.ts` must stay in the same folder, because the component imports `./utils`. `connect-wallet-kit-provider.tsx` imports `./connect-wallet`, so keep it in that folder too. Omit `network` on the provider when the app already renders `ccc.Provider`.

- `packages/ckb-connect-wallet-kit/src/connect-wallet.tsx` → `src/components/connect-wallet.tsx`
- `packages/ckb-connect-wallet-kit/src/utils.ts` → `src/components/utils.ts`
- `packages/ckb-connect-wallet-kit/src/connect-wallet-kit-provider.tsx` → `src/components/connect-wallet-kit-provider.tsx`

```bash
npm install @ckb-ccc/connector-react clsx tailwind-merge react react-dom
```

No Tailwind `@source` rule is required for this path. The classes live in your own source tree.

## Quick Start

`ConnectWalletKitProvider` sits at the root. `defaults` sets the shared button classes, balance formatting, and address truncation. A prop on one piece overrides that default. Pass `network` to also mount the CCC provider. `LayoutProvider` is the previous name and still defaults `network` to `"testnet"`. The import below is the package path. If you copied the source, import the provider from `./components/connect-wallet-kit-provider`.

```tsx
import {
  ConnectWalletKitProvider,
  ConnectWallet,
  ConnectWalletButton,
  ConnectWalletInfoContainer,
  ConnectWalletInfoImage,
  ConnectWalletInfoBalance,
  ConnectWalletInfoAddress,
} from "ckb-connect-wallet-kit";

function AppRoot({ children }: { children: React.ReactNode }) {
  return (
    <ConnectWalletKitProvider
      network="testnet"
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
      {children}
    </ConnectWalletKitProvider>
  );
}
```

## Development

This repo is a Bun workspace:

- `packages/ckb-connect-wallet-kit` — the publishable library
- `apps/demo` — Vite demo that depends on the workspace package

```bash
bun install
bun run dev
```

`bun run build` builds the library, then the demo.

## License

[MIT](./LICENSE)

## Full Documentation

For architecture, API reference, data flow, migration guide, edge cases, and future extensions, see [ARCHITECTURE.md](./ARCHITECTURE.md).
