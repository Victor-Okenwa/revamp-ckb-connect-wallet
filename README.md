# WalletConnect Compound Component

**Modern, flexible wallet connection UI for `@ckb-ccc/connector-react` (Nervos CKB)**

A clean compound component that replaces the old monolithic `ConnectWallet`.  
Full control over layout, styling, balance formatting, address truncation, and currency display — with zero prop drilling.

---

## ✨ Features

- **Compound pattern** – compose exactly the UI you want
- **No prop drilling** – everything shared via React Context
- **Optimized** – single `Promise.all` for address + balance
- **Highly customizable**
  - Balance: `decimalPlaces` (0–20), `withCurrency`, truncation
  - Address: custom `frontChars` / `endChars`
  - Full Tailwind class overrides via `className`
- **Auto hide/show** – button vs. connected info
- **Dark mode ready** + modern default styles
- **Type-safe** – TypeScript everywhere

---

## Quick Start

```tsx
import {
  WalletConnect,
  WalletConnectButton,
  WalletConnectInfoContainer,
  WalletConnectInfoImage,
  WalletConnectInfoBalance,
  WalletConnectInfoAddress,
} from './WalletConnect';

function Header() {
  return (
    <WalletConnect>
      <div className="flex items-center gap-4">
        {/* Disconnected state */}
        <WalletConnectButton className="px-6 py-2.5" />

        {/* Connected state */}
        <WalletConnectInfoContainer className="px-4">
          <WalletConnectInfoImage />
          <div className="flex flex-col">
            <WalletConnectInfoBalance decimalPlaces={4} withCurrency />
            <WalletConnectInfoAddress frontChars={6} endChars={4} />
          </div>
        </WalletConnectInfoContainer>
      </div>
    </WalletConnect>
  );
}
```

## Full Documentation
For complete architecture, API reference, data flow, migration guide, edge cases, and future extensions, see:
[View full documentation →](ARCHITECTURE.md)