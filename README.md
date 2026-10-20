# ckb-connect-wallet-kit

**Modern, flexible wallet connection UI for `@ckb-ccc/connector-react` (Nervos CKB)**

A clean compound component with full control over layout, styling, balance formatting, address truncation, currency display, and loading states — with zero prop drilling. An optional did:ckb profile sits beside those pieces when you want it.

[Demo](https://ckb-connect-wallet-kit.vercel.app/) · [npm](https://www.npmjs.com/package/ckb-connect-wallet-kit) · [Repository](https://github.com/Victor-Okenwa/revamp-ckb-connect-wallet)

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
- **did:ckb profile** – optional avatar, display name, and identifier for the connected lock
- **Custom popup** – mount `ConnectWalletDialog` to replace CCC's modal, or render any layout from `useConnectWalletDialog()`
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

Copy these files into your app. `connect-wallet.tsx` and `utils.ts` must stay in the same folder, because the component imports `./utils`. `connect-wallet-kit-provider.tsx` imports `./connect-wallet`, so keep it in that folder too. Mount your own `ccc.Provider` around the kit provider. The copied provider does not mount CCC.

- `packages/ckb-connect-wallet-kit/src/connect-wallet.tsx` → `src/components/connect-wallet.tsx`
- `packages/ckb-connect-wallet-kit/src/utils.ts` → `src/components/utils.ts`
- `packages/ckb-connect-wallet-kit/src/connect-wallet-kit-provider.tsx` → `src/components/connect-wallet-kit-provider.tsx`

Optional, only if you want the custom popup (same folder):

- `packages/ckb-connect-wallet-kit/src/connect-wallet-dialog.tsx` → `src/components/connect-wallet-dialog.tsx`
- `packages/ckb-connect-wallet-kit/src/ccc-session.ts` → `src/components/ccc-session.ts`

Optional, only if you want the did:ckb pieces (same folder):

- `packages/ckb-connect-wallet-kit/src/did-ckb.ts` → `src/components/did-ckb.ts`
- `packages/ckb-connect-wallet-kit/src/connect-wallet-did.tsx` → `src/components/connect-wallet-did.tsx`

```bash
npm install @ckb-ccc/connector-react clsx tailwind-merge react react-dom
```

No Tailwind `@source` rule is required for this path. The classes live in your own source tree.

## Quick Start

Mount your own `ccc.Provider`. `ConnectWalletContainer` and `ConnectWalletKitProvider` both call `ccc.useCcc()`, so they must sit under that provider. The kit never mounts CCC. Leave off `className`, formatting props, and `defaults` to use the built-in styles.

The imports below are the package path. If you copied the source, import the provider from `./components/connect-wallet-kit-provider` and the pieces from `./components/connect-wallet`.

### CCC provider, no styling

```tsx
import { ccc } from "@ckb-ccc/connector-react";
import {
  ConnectWalletContainer,
  ConnectWalletButton,
  ConnectWalletImage,
  ConnectWalletBalance,
  ConnectWalletAddress,
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
      <ConnectWalletContainer>
        <ConnectWalletButton />
        <div>
          <ConnectWalletImage />
          <ConnectWalletBalance />
          <ConnectWalletAddress />
        </div>
      </ConnectWalletContainer>
    </ccc.Provider>
  );
}
```

### Kit provider, no defaults

```tsx
import { ccc } from "@ckb-ccc/connector-react";
import {
  ConnectWalletKitProvider,
  ConnectWalletContainer,
  ConnectWalletButton,
  ConnectWalletImage,
  ConnectWalletBalance,
  ConnectWalletAddress,
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
        <ConnectWalletContainer>
          <ConnectWalletButton>Connect</ConnectWalletButton>
          <div>
            <ConnectWalletImage />
            <ConnectWalletBalance decimalPlaces={4} withCurrency />
            <ConnectWalletAddress frontChars={6} endChars={4} />
          </div>
        </ConnectWalletContainer>
      </ConnectWalletKitProvider>
    </ccc.Provider>
  );
}
```

### Kit provider, with defaults

A prop on one piece overrides the matching default. `LayoutProvider` is the previous name of the kit provider and is the same component.

```tsx
import { ccc } from "@ckb-ccc/connector-react";
import {
  ConnectWalletKitProvider,
  ConnectWalletContainer,
  ConnectWalletButton,
  ConnectWalletImage,
  ConnectWalletBalance,
  ConnectWalletAddress,
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
          decimalPlaces: 4,
          withCurrency: true,
          frontChars: 6,
          endChars: 4,
          buttonLabel: "Connect Wallet",
        }}
      >
        <ConnectWalletContainer>
          <ConnectWalletButton />
          <div className="flex items-center gap-2">
            <ConnectWalletImage />
            <div className="flex flex-col items-start">
              <ConnectWalletBalance />
              <ConnectWalletAddress />
            </div>
          </div>
        </ConnectWalletContainer>
      </ConnectWalletKitProvider>
    </ccc.Provider>
  );
}
```

### did:ckb profile

`ConnectWalletDid` is optional. When rendered, it lists the live [did:ckb](https://github.com/web5fans/web5-wips/blob/master/01.md) cells owned by the connected lock and shares the newest one with its children. Nothing is fetched unless you render it, and it renders nothing before a wallet connects.

The display name and avatar come from `services.profile` in the DID document (`displayName`, `avatar`, `bio`), the convention used by did:ckb dashboards. Each piece takes a `fallback` for wallets with no DID or no profile.

```tsx
import {
  ConnectWalletContainer,
  ConnectWalletButton,
  ConnectWalletDid,
  ConnectWalletDidAvatar,
  ConnectWalletDidId,
  ConnectWalletDidName,
  ConnectWalletAddress,
  ConnectWalletImage,
} from "ckb-connect-wallet-kit";

<ConnectWalletContainer>
  <ConnectWalletButton />
  <div className="flex items-center gap-2">
    <ConnectWalletDid>
      <ConnectWalletDidAvatar fallback={<ConnectWalletImage />} />
      <div className="flex flex-col items-start">
        <ConnectWalletDidName fallback={<ConnectWalletAddress frontChars={6} endChars={4} />} />
        <ConnectWalletDidId />
      </div>
    </ConnectWalletDid>
  </div>
</ConnectWalletContainer>
```

- `resolve` replaces the lookup: `({ client, signer, lock, address }) => Promise<DidProfile[]>`.
- `script` points at a custom did:ckb deployment. Mainnet and testnet are built in, and CCC's `KnownScript.DidCkb` is used when the installed CCC has it.
- `pick` chooses the DID when the lock owns several. Default is the newest cell.
- `useConnectWalletDid()` returns `{ dids, did, isLoading, error, select }` for a custom display.
- Provider defaults: `didAvatarClassName`, `didNameClassName`, `didIdClassName`, `didFrontChars`, `didEndChars`.

Creating or editing a DID is a signed CKB transaction and is outside this kit.

## Custom popup

Mount `ConnectWalletDialog` inside `ConnectWalletContainer`. The connect button, and any element that calls `open()` from `useConnectWallet()`, opens that popup. Leave the dialog out and those calls keep opening CCC.

`ConnectWalletDialog` renders no chrome. `ConnectWalletDialogOverlay` is the optional centered modal. The wallet, chain, and connecting sections each render only on their own step. `ConnectWalletDialogAccount` is a container: put a header, close button, wallet pieces, and footer inside it.

```tsx
<ConnectWalletContainer>
  <ConnectWalletButton />
  <ConnectWalletDialog>
    <ConnectWalletDialogOverlay>
      <ConnectWalletDialogWallets />
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
  </ConnectWalletDialog>
</ConnectWalletContainer>
```

Shared classes on `ConnectWalletKitProvider` `defaults` include `dialogOverlayClassName`, `dialogPanelClassName`, `dialogTitleClassName`, `dialogListButtonClassName`, `dialogActionClassName`, `dialogAccountHeaderClassName`, `dialogAccountFooterClassName`, `dialogCloseClassName`, `nameClassName`, and `disconnectClassName`.

## Development

This repo is a Bun workspace:

- `packages/ckb-connect-wallet-kit` — the publishable library
- `apps/demo` — Vite demo that depends on the workspace package

```bash
bun install
bun run dev
```

`bun run build` builds the library, then the demo.

## Demo on Vercel

The demo is a static Vite site. On Vercel, set **Root Directory** to `apps/demo`. `apps/demo/vercel.json` installs the Bun workspace from the repository root, then runs the demo build and serves `dist`. If Project Settings has an Output Directory override, set it to `dist` or turn the override off.

Optional environment variable:

- `VITE_IS_MAINNET` — set to `true` to default CCC to mainnet. Omit it for testnet.

## License

[MIT](./LICENSE)

## Full Documentation

For architecture, API reference, data flow, migration guide, edge cases, and future extensions, see [ARCHITECTURE.md](./ARCHITECTURE.md).
