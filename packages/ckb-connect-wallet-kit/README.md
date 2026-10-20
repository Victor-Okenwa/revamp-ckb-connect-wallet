# ckb-connect-wallet-kit

**Compound React wallet connection UI for [`@ckb-ccc/connector-react`](https://www.npmjs.com/package/@ckb-ccc/connector-react) (Nervos CKB).**

Compose the connect button, wallet icon, name, balance, address, and account popup yourself. Shared state lives in React context, so there is no prop drilling. A value on a single component overrides the matching provider default. Put `ConnectWalletDid` around those pieces when you also want the lock’s did:ckb avatar, display name, and identifier.

[Demo](https://ckb-connect-wallet-kit.vercel.app/) · [Repository](https://github.com/Victor-Okenwa/revamp-ckb-connect-wallet) · [Issues](https://github.com/Victor-Okenwa/revamp-ckb-connect-wallet/issues)

## Features

- **Compound pattern** — compose the exact UI you want
- **No prop drilling** — wallet, address, balance, and `open()` are shared through context
- **One fetch** — address and balance load together with `Promise.all`
- **Loading states** — the connect button pulses while data is loading. `isLoading` from `useConnectWallet()` is available for your own wrapper
- **Provider defaults** — set look and formatting once, override on any piece
- **Balance control** — `decimalPlaces` (`0`–`20`) truncates, does not round; optional `CKB` suffix
- **Address control** — keep `frontChars` and `endChars`, the middle becomes `...`
- **Auto hide / show** — `ConnectWalletButton` is gone after connect; the wallet pieces render only then
- **Custom popup** — mount `ConnectWalletDialog` to replace CCC's modal. Compose the default sections, or render any layout from `useConnectWalletDialog()`
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

Mount your own `ccc.Provider`. `ConnectWalletContainer` and `ConnectWalletKitProvider` both call `ccc.useCcc()`, so they must sit under that provider. The kit never mounts CCC.

The pieces have built-in styles. Leave off `className`, formatting props, and `defaults` to use them as-is.

### CCC provider, no styling

Your `ccc.Provider` plus the kit pieces. No `ConnectWalletKitProvider`, no `defaults`, no `className`.

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

The button uses the built-in rounded style. After connect it hides, and your element shows the icon, the full formatted balance with `CKB`, and an address truncated to 10 + 6 characters.

### Kit provider, no defaults

Same CCC tree. The kit provider only opens the defaults context. Omit `defaults` so every composition uses the built-in look. Style or format a single piece with props when you need to.

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

Set look and formatting once. A prop on one piece still wins over the matching default.

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

`className` is merged after the provider class, so conflicting Tailwind utilities on that instance win.

`LayoutProvider` is the previous name of `ConnectWalletKitProvider`. Same props. It does not mount CCC.

## How class names and defaults resolve

For appearance classes:

1. Built-in styles (used when that default is omitted)
2. `defaults.*ClassName` from `ConnectWalletKitProvider`
3. `className` on the component (merged last)

For values (`decimalPlaces`, `withCurrency`, `frontChars`, `endChars`, `didFrontChars`, `didEndChars`, button label):

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
| `imageClassName` | `ClassValue` | `w-6 h-6` | Replaces the default size of the wallet icon. |
| `balanceClassName` | `ClassValue` | `font-semibold text-sm` | Replaces the default balance typography. |
| `addressClassName` | `ClassValue` | `text-xs font-normal` | Replaces the default address typography. |
| `nameClassName` | `ClassValue` | `text-sm font-semibold` | Replaces the default wallet-name typography. |
| `disconnectClassName` | `ClassValue` | full-width black/white button | Replaces the built-in `ConnectWalletDisconnect` button. |
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
| `dialogOverlayClassName` | `ClassValue` | `fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4` | Replaces the backdrop of `ConnectWalletDialogOverlay`. |
| `dialogPanelClassName` | `ClassValue` | `flex max-h-[min(40rem,calc(100vh-2rem))] w-full max-w-sm flex-col overflow-y-auto rounded-2xl bg-white p-4 text-black shadow-2xl outline-none dark:bg-neutral-950 dark:text-white` | Replaces the panel. |
| `dialogTitleClassName` | `ClassValue` | `text-base font-semibold` | Replaces the dialog title typography. |
| `dialogListButtonClassName` | `ClassValue` | full-width rounded row with a light border | Replaces wallet, chain, and network buttons. |
| `dialogActionClassName` | `ClassValue` | `flex w-full ... rounded-xl bg-black px-3 py-3 text-sm font-semibold text-white ... dark:bg-white dark:text-black` | Replaces Try again. |
| `dialogAccountHeaderClassName` | `ClassValue` | `flex items-center justify-between gap-2` | Replaces the account header layout. |
| `dialogAccountFooterClassName` | `ClassValue` | `flex flex-col gap-2` | Replaces the account footer layout. |
| `dialogCloseClassName` | `ClassValue` | round icon button | Replaces the account close button. |

### `LayoutProvider`

Same component as `ConnectWalletKitProvider`. Same props. Must sit under the app’s `ccc.Provider`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | — | The rest of the app. |
| `defaults` | `ConnectWalletDefaults` | `{}` | Same as `ConnectWalletKitProvider`. |

### `ConnectWalletContainer`

Local provider for one composition. It reads the CCC signer once and shares balance, address, loading, `wallet`, and `open()` with its children. Must sit under the app’s `ccc.Provider`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | — | The button, the connected info, and any layout you put between them. |

### `ConnectWalletButton`

Renders only while no wallet is connected. Clicking it calls `open()`. Hidden after connect. `open()` opens `ConnectWalletDialog` when that component is mounted in the same `ConnectWalletContainer`. Otherwise it opens CCC's popup.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `ClassValue` | — | Merged after `defaults.buttonClassName`, so it overrides conflicting utilities on this button only. |
| `children` | `React.ReactNode` | `defaults.buttonLabel`, then `"Connect Wallet"` | Replaces the button label. |

### `ConnectWalletImage`

The wallet icon from `wallet.icon`. Renders nothing until a wallet is connected.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `ClassValue` | — | Merged after `defaults.imageClassName`. Built-in size is `w-6 h-6`. |

### `ConnectWalletBalance`

Formats the signer balance with `Intl.NumberFormat`. When `decimalPlaces` is set (on the component or via defaults), extra digits are **truncated**, not rounded. Renders nothing until a wallet is connected.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `decimalPlaces` | `0`–`20` | `defaults.decimalPlaces`, then up to 10 fraction digits | Overrides the provider precision for this instance. |
| `withCurrency` | `boolean` | `defaults.withCurrency`, then `true` | When `true`, appends `CKB` after the number. |
| `className` | `ClassValue` | — | Merged after `defaults.balanceClassName`. |

### `ConnectWalletAddress`

Shows the recommended address. If the address is longer than `frontChars + endChars`, the middle is replaced with `...`. Renders nothing until a wallet is connected.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `frontChars` | `number` | `defaults.frontChars`, then `10` | Characters kept at the start. |
| `endChars` | `number` | `defaults.endChars`, then `6` | Characters kept at the end. |
| `className` | `ClassValue` | — | Merged after `defaults.addressClassName`. |

### `ConnectWalletName`

The connected wallet’s name. Renders nothing until a wallet is connected. Use it in the page or in the account dialog.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `ClassValue` | — | Merged after `defaults.nameClassName`. Built-in is `text-sm font-semibold`. |

### `ConnectWalletDisconnect`

Ends the CCC session. Renders nothing until a wallet is connected.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `buttonText` | `React.ReactNode` | `"Disconnect"` | Visible label. |
| `className` | `ClassValue` | — | Merged after `defaults.disconnectClassName`. |

### `ConnectWalletDialog`

Popup state for one composition. It renders no chrome. Mount it inside `ConnectWalletContainer`. While it is mounted, `open()` from the button and `useConnectWallet()` opens this dialog. Leave it out and those calls keep opening CCC's popup.

The wallet list, chain list, and connecting state are built-in sections. The account step is a container you fill. Skip `ConnectWalletDialogOverlay` when the popup should be a dropdown, drawer, or page. `useConnectWalletDialog()` exposes the same state for a fully custom tree.

```tsx
<ConnectWalletContainer>
  <ConnectWalletButton />
  <button type="button" onClick={() => open()}>
    <ConnectWalletImage />
    <ConnectWalletBalance />
    <ConnectWalletAddress />
  </button>
  <ConnectWalletDialog>
    <ConnectWalletDialogOverlay>
      <ConnectWalletDialogWallets />
      <ConnectWalletDialogSigners />
      <ConnectWalletDialogConnecting />
      <ConnectWalletDialogAccount>
        <ConnectWalletDialogAccountHeader>
          <ConnectWalletName />
          <ConnectWalletDialogAccountClose />
        </ConnectWalletDialogAccountHeader>
        <ConnectWalletAddress />
        <ConnectWalletBalance />
        <ConnectWalletDialogAccountFooter>
          <ConnectWalletDisconnect buttonText="Disconnect" />
          <ConnectWalletSwitchNetwork />
        </ConnectWalletDialogAccountFooter>
      </ConnectWalletDialogAccount>
    </ConnectWalletDialogOverlay>
  </ConnectWalletDialog>
</ConnectWalletContainer>
```

`open` in that button comes from `useConnectWallet()`. Any element can call it. A wallet with one signer connects immediately. Several signers move to the chain step. After a successful connect the dialog stays open on the account step. Disconnect returns to the wallet list.

`useConnectWalletDialog()` returns `{ isOpen, open, close, status, wallets, walletsLoading, discoverySettled, connectorMissing, refreshWallets, selectedWallet, selectWallet, connect, connectingError, retry, back, wallet, signer, address, balance, disconnect, client, setClient, clientOptions, showNetworks }`. `status` is `"wallets" | "signers" | "connecting" | "account" | "networks"`.

```tsx
function Popup() {
  const dialog = useConnectWalletDialog();
  if (!dialog.isOpen) return null;

  if (dialog.status === "account") {
    return (
      <aside>
        <p>{dialog.address}</p>
        <button type="button" onClick={() => dialog.disconnect()}>Sign out</button>
        <button type="button" onClick={dialog.close}>Close</button>
      </aside>
    );
  }

  return (
    <ul>
      {dialog.wallets.map((wallet) => (
        <li key={wallet.name}>
          <button type="button" onClick={() => dialog.selectWallet(wallet)}>{wallet.name}</button>
        </li>
      ))}
    </ul>
  );
}
```

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | — | The overlay and sections, or any custom UI that calls `useConnectWalletDialog()`. |

### `ConnectWalletDialogOverlay`

Optional centered modal: portal, backdrop, Escape, and focus wrap. Renders nothing while the dialog is closed.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | — | Panel contents. Only the section for the current step renders. |
| `className` | `ClassValue` | — | Merged onto the panel after `defaults.dialogPanelClassName`. |
| `overlayClassName` | `ClassValue` | — | Merged onto the backdrop after `defaults.dialogOverlayClassName`. |
| `label` | `string` | `"Wallet"` | Accessible name of the dialog. |

### `ConnectWalletDialogWallets`

Wallet list. Renders only while the dialog is open on the wallet step.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `ClassValue` | — | Merged onto the section. |
| `buttonClassName` | `ClassValue` | — | Merged onto each wallet button after `defaults.dialogListButtonClassName`. |

### `ConnectWalletDialogSigners`

Chain list for the selected wallet. Renders only on that step.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `ClassValue` | — | Merged onto the section. |
| `buttonClassName` | `ClassValue` | — | Merged onto each chain button after `defaults.dialogListButtonClassName`. |

### `ConnectWalletDialogConnecting`

Opening and failure state. Try again repeats the attempt. A wallet that only offers an install link asks the user to install it.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `ClassValue` | — | Merged onto the section. |
| `buttonClassName` | `ClassValue` | — | Merged onto Try again after `defaults.dialogActionClassName`. |

### `ConnectWalletDialogAccount`

Account step container. Renders its children only while the dialog is open on the account step and a wallet is connected. It does not render a title, address, balance, or disconnect button on its own.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | — | Header, wallet pieces, DID pieces, disconnect, switch network, or anything else. |
| `className` | `ClassValue` | — | Merged onto the container. Built-in is `flex flex-col gap-3`. |

### `ConnectWalletDialogAccountHeader`

Row for the account step. A usual place for `ConnectWalletName` and the close button.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | — | Header contents. |
| `className` | `ClassValue` | — | Merged after `defaults.dialogAccountHeaderClassName`. |

### `ConnectWalletDialogAccountClose`

Closes the dialog. Renders only on the account step.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | `×` | Visible content. |
| `className` | `ClassValue` | — | Merged after `defaults.dialogCloseClassName`. |
| `label` | `string` | `"Close"` | Accessible name. |

### `ConnectWalletDialogAccountFooter`

Footer for the account step. A usual place for disconnect and switch network.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | — | Footer contents. |
| `className` | `ClassValue` | — | Merged after `defaults.dialogAccountFooterClassName`. |

### `ConnectWalletSwitchNetwork`

Shows the current network, then expands into the `clientOptions` passed to `ccc.Provider`. Renders nothing when that list is empty. Must sit inside `ConnectWalletDialog`. Choosing a network calls `setClient` and leaves the rest of the account mounted.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `ClassValue` | — | Merged onto the control. |
| `buttonClassName` | `ClassValue` | — | Merged onto each network row after `defaults.dialogListButtonClassName`. |

### `useConnectWallet`

Read the composition state, including `open()`. A custom trigger that calls `open()` follows the same dialog-or-CCC rule as the built-in button.

| Field | What it does |
| --- | --- |
| `open` | Opens `ConnectWalletDialog` when one is mounted here. Otherwise opens CCC. |
| `wallet` | The connected CCC wallet, or `undefined`. |
| `address` | Recommended address. Empty until it loads. |
| `balance` | Capacity string from CCC. Empty until it loads. |
| `isLoading` | True while address and balance are loading. |

### `ConnectWalletDid`

Optional. Place it inside `ConnectWalletContainer`. It lists the live [did:ckb](https://github.com/web5fans/web5-wips/blob/master/01.md) cells owned by the connected lock and shares the newest one with its children. Nothing is fetched unless you render it, and it renders nothing before a wallet connects.

The display name and avatar come from `services.profile` in the DID document (`displayName`, `avatar`, `bio`), the convention used by did:ckb dashboards. A DID without a profile still has an identifier.

```tsx
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
- `src/connect-wallet-dialog.tsx` and `src/ccc-session.ts` (only if you want the custom popup)
- `src/did-ckb.ts` and `src/connect-wallet-did.tsx` (only if you want the DID pieces)

`connect-wallet.tsx` imports `./utils`, and the provider imports `./connect-wallet`, so they have to stay together. Mount your own `ccc.Provider` around the kit provider. The copied provider does not mount CCC.

```bash
npm install @ckb-ccc/connector-react clsx tailwind-merge react react-dom
```

Tailwind scans your project source on this path, so you do not add an `@source` rule.

## License

[MIT](./LICENSE)
