# ckb-connect-wallet-kit

**Compound React wallet connection UI for [`@ckb-ccc/connector-react`](https://www.npmjs.com/package/@ckb-ccc/connector-react) (Nervos CKB).**

Compose the connect button, wallet icon, balance, and address yourself. Shared state lives in React context, so there is no prop drilling. A value on a single component overrides the matching provider default.

[Repository](https://github.com/Victor-Okenwa/revamp-ckb-connect-wallet) · [Issues](https://github.com/Victor-Okenwa/revamp-ckb-connect-wallet/issues)

## Features

- **Compound pattern** — compose the exact UI you want
- **No prop drilling** — wallet, address, balance, and `open()` are shared through context
- **One fetch** — address and balance load together with `Promise.all`
- **Loading states** — the button and connected pill pulse while data is loading
- **Provider defaults** — set look and formatting once, override on any piece
- **Balance control** — `decimalPlaces` (`0`–`20`) truncates, does not round; optional `CKB` suffix
- **Address control** — keep `frontChars` and `endChars`, the middle becomes `...`
- **Auto hide / show** — `ConnectWalletButton` is gone after connect; the info pieces render only then
- **did:ckb profile** — optional avatar, display name, and identifier for the connected lock
- **TypeScript** — exported types for defaults, `DecimalPlaces`, and `DidProfile`

## Install

React, React DOM, and `@ckb-ccc/connector-react` are peer dependencies:

```bash
npm install ckb-connect-wallet-kit @ckb-ccc/connector-react react react-dom
```

The components ship Tailwind class names, not a prebuilt stylesheet. Tailwind v4 does not scan `node_modules` unless you point it at the package:

```css
@import "tailwindcss";
@source "../node_modules/ckb-connect-wallet-kit/dist";
```

## Quick start

Mount your own `ccc.Provider`. `ConnectWallet` and `ConnectWalletKitProvider` both call `ccc.useCcc()`, so they must sit under that provider. The kit never mounts CCC.

The pieces have built-in styles. Leave off `className`, formatting props, and `defaults` to use them as-is.

### CCC provider, no styling

Your `ccc.Provider` plus the kit pieces. No `ConnectWalletKitProvider`, no `defaults`, no `className`.

```tsx
import { ccc } from "@ckb-ccc/connector-react";
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
}
```

The button uses the built-in pill. After connect it hides, and the container shows the icon, the full formatted balance with `CKB`, and an address truncated to 10 + 6 characters.

### Kit provider, no defaults

Same CCC tree. The kit provider only opens the defaults context. Omit `defaults` so every composition uses the built-in look. Style or format a single piece with props when you need to.

```tsx
import { ccc } from "@ckb-ccc/connector-react";
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
}
```

### Kit provider, with defaults

Set look and formatting once. A prop on one piece still wins over the matching default.

```tsx
import { ccc } from "@ckb-ccc/connector-react";
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
}
```

`className` is merged after the provider class, so conflicting Tailwind utilities on that instance win.

`LayoutProvider` is the previous name of `ConnectWalletKitProvider`. Same props. It does not mount CCC.

## How class names and defaults resolve

For appearance classes:

1. Built-in styles (used when that default is omitted)
2. `defaults.*ClassName` from `ConnectWalletKitProvider`
3. `className` on the component (merged last)

For values (`decimalPlaces`, `withCurrency`, `frontChars`, `endChars`, button label):

1. Built-in fallback
2. `defaults.*` from the provider
3. The prop on the component (wins)

`ClassValue` is the [`clsx`](https://www.npmjs.com/package/clsx) input type: a string, array, or conditional object of class names.

## API

### `ConnectWalletKitProvider`

Sit this under the app’s `ccc.Provider`. It only stores shared defaults. It calls `ccc.useCcc()`, so it throws if CCC is missing. It never mounts `ccc.Provider`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | — | The rest of the app. |
| `defaults` | `ConnectWalletDefaults` | `{}` | Shared look and formatting for every composition under the provider. |

#### `defaults`

| Key | Type | Default when omitted | What it does |
| --- | --- | --- | --- |
| `buttonClassName` | `ClassValue` | `rounded-full bg-black text-white hover:opacity-90 dark:bg-white dark:text-black text-sm font-bold sm:text-base px-5 py-3` | Replaces the built-in colors, radius, and padding on `ConnectWalletButton`. Include `dark:` utilities if the button should keep that color in dark mode. |
| `infoContainerClassName` | `ClassValue` | Same built-in appearance as the button | Same role for the connected wallet pill (`ConnectWalletInfoContainer`). |
| `imageClassName` | `ClassValue` | `w-6 h-6` | Replaces the default size of the wallet icon. |
| `balanceClassName` | `ClassValue` | `font-semibold text-sm` | Replaces the default balance typography. |
| `addressClassName` | `ClassValue` | `text-xs font-normal` | Replaces the default address typography. |
| `decimalPlaces` | `0`–`20` (`DecimalPlaces`) | unset (up to 10 fraction digits) | Shared balance precision. Digits are **truncated**, not rounded. `0` is a valid value. |
| `withCurrency` | `boolean` | `true` | When `true`, appends a `CKB` suffix after the balance. |
| `frontChars` | `number` | `10` | Characters kept at the start of the truncated address. |
| `endChars` | `number` | `6` | Characters kept at the end of the truncated address. |
| `buttonLabel` | `React.ReactNode` | `"Connect Wallet"` | Label of `ConnectWalletButton`. A `children` prop on that button still wins. |
| `didAvatarClassName` | `ClassValue` | `w-6 h-6 rounded-full object-cover` | Replaces the default size and shape of `ConnectWalletDidAvatar`. |
| `didNameClassName` | `ClassValue` | `font-semibold text-sm` | Replaces the default typography of `ConnectWalletDidName`. |
| `didIdClassName` | `ClassValue` | `text-xs font-normal` | Replaces the default typography of `ConnectWalletDidId`. |
| `didFrontChars` | `number` | `14` | Characters kept at the start of the truncated `did:ckb:` string. |
| `didEndChars` | `number` | `6` | Characters kept at the end of the truncated `did:ckb:` string. |

### `LayoutProvider`

Same component as `ConnectWalletKitProvider`. Same props. Must sit under the app’s `ccc.Provider`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | — | The rest of the app. |
| `defaults` | `ConnectWalletDefaults` | `{}` | Same as `ConnectWalletKitProvider`. |

### `ConnectWallet`

Local provider for one composition. It reads the CCC signer once and shares balance, address, loading, `wallet`, and `open()` with its children. Must sit under the app’s `ccc.Provider`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | — | The button, the connected info, and any layout you put between them. |

### `ConnectWalletButton`

Renders only while no wallet is connected. Clicking it calls CCC `open()`. Hidden after connect.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `ClassValue` | — | Merged after `defaults.buttonClassName`, so it overrides conflicting utilities on this button only. |
| `children` | `React.ReactNode` | `defaults.buttonLabel`, then `"Connect Wallet"` | Replaces the button label. |

### `ConnectWalletInfoContainer`

Renders only after a wallet is connected. The whole pill calls `open()` again, which is how CCC shows account actions.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | — | Your layout for the icon, balance, and address. |
| `className` | `ClassValue` | — | Merged after `defaults.infoContainerClassName`. |

### `ConnectWalletInfoImage`

The wallet icon from `wallet.icon`. Renders nothing until a wallet is connected.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `ClassValue` | — | Merged after `defaults.imageClassName`. Built-in size is `w-6 h-6`. |

### `ConnectWalletInfoBalance`

Formats the signer balance with `Intl.NumberFormat`. When `decimalPlaces` is set (on the component or via defaults), extra digits are **truncated**, not rounded. Renders nothing until a wallet is connected.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `decimalPlaces` | `0`–`20` | `defaults.decimalPlaces`, then up to 10 fraction digits | Overrides the provider precision for this instance. |
| `withCurrency` | `boolean` | `defaults.withCurrency`, then `true` | When `true`, appends `CKB` after the number. |
| `className` | `ClassValue` | — | Merged after `defaults.balanceClassName`. |

### `ConnectWalletInfoAddress`

Shows the recommended address. If the address is longer than `frontChars + endChars`, the middle is replaced with `...`. Renders nothing until a wallet is connected.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `frontChars` | `number` | `defaults.frontChars`, then `10` | Characters kept at the start. |
| `endChars` | `number` | `defaults.endChars`, then `6` | Characters kept at the end. |
| `className` | `ClassValue` | — | Merged after `defaults.addressClassName`. |

### `ConnectWalletDid`

Optional. Place it inside `ConnectWallet`. It lists the live [did:ckb](https://github.com/web5fans/web5-wips/blob/master/01.md) cells owned by the connected lock and shares the newest one with its children. Nothing is fetched unless you render it, and it renders nothing before a wallet connects.

The display name and avatar come from `services.profile` in the DID document (`displayName`, `avatar`, `bio`), the convention used by did:ckb dashboards. A DID without a profile still has an identifier.

```tsx
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
```

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | — | The DID pieces, or anything that calls `useConnectWalletDid()`. |
| `resolve` | `DidResolver` | lists live did:ckb cells locked by the wallet | Replace the lookup. Receives `{ client, signer, lock, address }` and returns `DidProfile[]`. |
| `script` | `DidScript` | mainnet or testnet by client prefix | Code hash and hash type of a custom did:ckb deployment. CCC's `KnownScript.DidCkb` is used when the installed CCC has it. |
| `pick` | `(dids: DidProfile[]) => DidProfile \| undefined` | newest cell | Choose which DID to show when the lock owns several. |

`useConnectWalletDid()` returns `{ dids, did, isLoading, error, select }` for a custom display. `listDidsByLock`, `decodeDidCell`, `extractDidProfile`, `argsToDid`, and `DID_CKB_SCRIPTS` are exported for use outside React.

Creating or editing a DID is a signed CKB transaction and is outside this kit.

### `ConnectWalletDidAvatar`

The avatar from `services.profile.avatar`. Renders nothing while the lookup runs, and the `fallback` when the DID has no avatar.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `ClassValue` | — | Merged after `defaults.didAvatarClassName`. Built-in is `w-6 h-6 rounded-full object-cover`. |
| `fallback` | `React.ReactNode` | `null` | Rendered when there is no avatar. |

### `ConnectWalletDidName`

The display name from `services.profile.displayName`. Renders the `fallback` when the DID has no name.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `ClassValue` | — | Merged after `defaults.didNameClassName`. Built-in is `font-semibold text-sm`. |
| `fallback` | `React.ReactNode` | `null` | Rendered when there is no display name. |

### `ConnectWalletDidId`

The `did:ckb:` identifier, shortened with `...`. The full value is in the `title` attribute.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `frontChars` | `number` | `defaults.didFrontChars`, then `14` | Characters kept at the start. |
| `endChars` | `number` | `defaults.didEndChars`, then `6` | Characters kept at the end. |
| `className` | `ClassValue` | — | Merged after `defaults.didIdClassName`. |
| `fallback` | `React.ReactNode` | `null` | Rendered when the lock owns no DID. |

## Copy the source instead

Copy these files into the same folder in your app:

- `src/connect-wallet.tsx`
- `src/utils.ts`
- `src/connect-wallet-kit-provider.tsx`
- `src/did-ckb.ts` and `src/connect-wallet-did.tsx` (only if you want the DID pieces)

`connect-wallet.tsx` imports `./utils`, and the provider imports `./connect-wallet`, so they have to stay together. Mount your own `ccc.Provider` around the kit provider. The copied provider does not mount CCC.

```bash
npm install @ckb-ccc/connector-react clsx tailwind-merge react react-dom
```

Tailwind scans your project source on this path, so you do not add an `@source` rule.

## License

[MIT](./LICENSE)
