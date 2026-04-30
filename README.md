# ConnectWallet Compound Component

**Modern, flexible wallet connection UI for `@ckb-ccc/connector-react` (Nervos CKB)**

A clean compound component with full control over layout, styling, balance formatting, address truncation, currency display, and loading states — with zero prop drilling.

---

## ✨ Features

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

## Quick Start

```tsx
import {
  ConnectWallet,
  ConnectWalletButton,
  ConnectWalletInfoContainer,
  ConnectWalletInfoImage,
  ConnectWalletInfoBalance,
  ConnectWalletInfoAddress,
} from './connect-wallet-enhanced';

function Header() {
  return (
    <ConnectWallet>
      <div className="flex items-center gap-4">
        {/* Disconnected state */}
        <ConnectWalletButton className="px-6 py-2.5" />

        {/* Connected state */}
        <ConnectWalletInfoContainer className="px-4">
          <ConnectWalletInfoImage />
          <div className="flex flex-col">
            <ConnectWalletInfoBalance decimalPlaces={4} withCurrency />
            <ConnectWalletInfoAddress frontChars={6} endChars={4} />
          </div>
        </ConnectWalletInfoContainer>
      </div>
    </ConnectWallet>
  );
}
```

## Full Documentation
For complete architecture, API reference, data flow, migration guide, edge cases, and future extensions, see:
[View full documentation →](./ARCHITECTURE.md)