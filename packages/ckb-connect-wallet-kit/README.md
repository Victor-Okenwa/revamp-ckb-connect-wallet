# ckb-connect-wallet-kit

Modern, flexible wallet connection UI for `@ckb-ccc/connector-react` (Nervos CKB).

## Install

React, React DOM, and `@ckb-ccc/connector-react` are peer dependencies:

```bash
npm install ckb-connect-wallet-kit @ckb-ccc/connector-react react react-dom
```

## Tailwind

The components ship Tailwind class names, not a prebuilt stylesheet. In Tailwind v4, scan the package:

```css
@import "tailwindcss";
@source "../node_modules/ckb-connect-wallet-kit/dist";
```

## Quick Start

`ConnectWalletKitProvider` sets app-wide defaults. Pass `network` to wrap the CCC provider. Leave `network` off when you already render `ccc.Provider`. `LayoutProvider` still works and defaults `network` to `"testnet"`.

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
        decimalPlaces: 4,
        frontChars: 6,
        endChars: 4,
      }}
    >
      {children}
    </ConnectWalletKitProvider>
  );
}
```

## Copy the source instead

Copy `src/connect-wallet.tsx` and `src/utils.ts` into the same folder in your app. `src/connect-wallet-kit-provider.tsx` imports `./connect-wallet`, so keep it beside those files. Omit `network` when you already render `ccc.Provider`. Install `@ckb-ccc/connector-react`, `clsx`, and `tailwind-merge`, then import from those local files. Tailwind scans your project source, so this path does not need an `@source` rule.

## License

[MIT](./LICENSE)
