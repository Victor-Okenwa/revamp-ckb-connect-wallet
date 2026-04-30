# ARCHITECTURE.md

**ConnectWallet Compound Component – Full Architecture & Documentation**
**Version:** 1.1
**Date:** April 30, 2026
**Library:** `@ckb-ccc/connector-react` (Nervos CKB ecosystem)
**Pattern:** Compound Component + Context API  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Why Compound Components?](#2-why-compound-components)
3. [Architecture Diagram](#3-architecture-diagram)
4. [Core Files](#4-core-files)
5. [API Reference](#5-api-reference)
    - 5.1 [Provider – `ConnectWallet`](#51-provider---connectwallet)
    - 5.2 [Hook – `useConnectWallet`](#52-hook---useconnectwallet)
    - 5.3 [Sub-Components](#53-sub-components)
6. [Feature Deep Dive](#6-feature-deep-dive)  
   - 6.1 [Balance Number Formatting](#61-balance-number-formatting)  
   - 6.2 [Currency Control](#62-currency-control)  
   - 6.3 [Address Truncation](#63-address-truncation)  
   - 6.4 [Styling & ClassName Customization](#64-styling--classname-customization)  
7. [Data Flow & Performance](#7-data-flow--performance)  
8. [State Management](#8-state-management)  
9. [Migration Guide](#9-migration-guide)  
10. [Example Usage](#10-example-usage)  
11. [Edge Cases & Error Handling](#11-edge-cases--error-handling)  
12. [Accessibility & Best Practices](#12-accessibility--best-practices)  
13. [Future Extensions](#13-future-extensions)  
14. [Testing Recommendations](#14-testing-recommendations)  

---

## 1. Overview

This module provides a modern **compound component pattern** built on React Context. It delivers a flexible, reusable, and highly customizable wallet connection UI for any Nervos CKB dApp using `@ckb-ccc/connector-react`.

**Core objectives of the redesign:**
- Complete layout and styling freedom (no more fixed JSX)
- Zero prop drilling
- Granular, composable sub-components
- Optimized data fetching with `Promise.all`
- Rich, type-safe customization for balance formatting, currency display, address truncation, and Tailwind classes
- Clear separation of disconnected vs. connected states
- Easy extension for future features

---

## 2. Why Compound Components?

| Aspect                     | Old Monolithic `ConnectWallet`                  | New Compound `ConnectWallet`                          | Benefit |
|---------------------------|------------------------------------------------|-------------------------------------------------------|---------|
| Styling / Layout          | Hard-coded JSX                                 | Fully composable children + `className`               | Any UI design possible |
| Reusability               | Single component only                          | Multiple sub-components + hook                        | Use in header, modal, dropdown, etc. |
| State Management          | Internal `useState` + duplicated logic         | Shared via Context + `useConnectWallet()`             | No duplication |
| Data Fetching             | Two separate async calls                       | Single `Promise.all`                                  | Fewer re-renders, cleaner code |
| Extensibility             | Difficult to customize parts                   | Granular exports + hook for custom components         | Future-proof |
| Bundle / Tree-shaking     | Everything always included                     | Only imported sub-components                          | Better performance |
| Developer Experience      | Limited customization                          | Type-safe props, clear separation of concerns         | Faster iteration |

---

## 3. Architecture Diagram (text)
<pre>
ConnectWallet (Provider)
├── Context (ConnectWalletContext)

├── useConnectWallet() hook

├── ConnectWalletButton          → renders only when disconnected
├── ConnectWalletInfoContainer   → renders only when connected
│     ├── ConnectWalletInfoImage
│     ├── ConnectWalletInfoBalance   (formatting options)
│     └── ConnectWalletInfoAddress   (truncation options)

└── (Users can add their own custom sub-components using the hook)
</pre>


All sub-components read from the shared context automatically. The provider handles all CCC integration and state.

---

## 4. Core Files

- **`connect-wallet-enhanced.tsx`** – Provider + all sub-components (single file, easy to maintain)
- **`../utils/utils.ts`** – `cn` (clsx + tailwind-merge) and `truncateAddress` (unchanged)

No additional files or dependencies beyond what you already have.

---

## 5. API Reference

### 5.1 Provider – `ConnectWallet`

```tsx
<ConnectWallet>
  {/* All sub-components must be children of this provider */}
</ConnectWallet>
```

__Responsibilities:__

- Manages balance, address, signer, and loading state
- Fetches data with Promise.all when signer is available
- Automatically re-fetches on wallet change / reconnect
- Provides context to all children
- Handles loading states during data fetching

### 5.2 Hook – `useConnectWallet()`

```tsx
const { isLoading, balance, setBalance, address, setAddress, open, wallet } = useConnectWallet();
```

- Must be used inside `<ConnectWallet>`
- Throws clear error if used outside
- Exposes everything for advanced custom components
- Includes loading state for UI feedback during data fetching

### 5.3 Sub-Components
__ConnectWalletButton__

- Renders only when not connected
- Default modern black/white styling with dark mode
- onClick={open} from CCC
- Accepts className?: ClassValue
- Shows loading animation when fetching data

__ConnectWalletInfoContainer__

- Renders only when connected
- Clickable wallet pill `(onClick={open})`
- Wraps your custom connected UI
- Accepts className?: ClassValue
- Shows loading animation when fetching data

__ConnectWalletInfoImage__

Renders wallet icon (wallet.icon)
Accepts className?: ClassValue

__ConnectWalletInfoBalance__

```tsx
<ConnectWalletInfoBalance
  decimalPlaces={4}        // 0–20 (type-safe)
  withCurrency={true}      // show/hide " CKB"
  className="text-lg font-bold"
/>
```

__ConnectWalletInfoAddress__

```tsx
<ConnectWalletInfoAddress
  frontChars={8}
  endChars={6}
  className="font-mono"
/>
```

## 6. Feature Deep Dive
### 6.1 Balance Number Formatting

- Uses `Intl.NumberFormat('en-US', { maximumFractionDigits, roundingMode: 'trunc' })
decimalPlaces?: DecimalPlaces (type 0 | 1 | ... | 20)`
- If `undefined`: shows raw string from `ccc.fixedPointToString()` (full precision)
- Always *truncates*, never rounds up (critical for crypto accuracy)

### 6.2 Currency Control

- withCurrency?: boolean (default true)
- When true, appends " CKB" after the formatted number
- Easy to disable for minimal UIs

### 6.3 Address Truncation

- Uses existing truncateAddress(address, frontChars, endChars)
- Defaults: frontChars=10, endChars=6 (matches old component)
- Fully customizable per usage (header vs. modal vs. mobile)

### 6.4 Styling & ClassName Customization

- Every component accepts className?: ClassValue
- Uses cn() utility for safe Tailwind merging
- Default styles are clean, modern, and dark-mode ready
- No hard-coded colors in logic

### 6.5 Loading State

- `isLoading` state managed in context, set to true during data fetching
- Button and info container components show `animate-pulse` when loading
- Automatically handled during address and balance fetching
- Provides visual feedback to users during async operations

## 7. Data Flow & Performance

- User clicks button → open() from CCC
- CCC provides new signer
- Loading state set to true
- useEffect triggers Promise.all([getRecommendedAddress(), getBalance()])
- State updates are batched → single re-render (including loading: false)
- All sub-components re-render only when needed via Context

__Benefits:__

- Minimal network calls
- No race conditions
- Clean cleanup (no intervals or listeners)

## 8. State Management

- Internal state (balance, address, isLoading) lives only in the Provider
- CCC state (open, wallet, signer) comes from ccc.useCcc() and ccc.useSigner()
- Context value is recreated only when state actually changes
- Loading state managed separately for UI feedback during async operations

## 9. Migration Guide (Old → New)
__Old (monolithic):__
```tsx
<ConnectWallet />
```

__New (compound):__
```tsx
<ConnectWallet>
  <ConnectWalletButton className="..." />

  <ConnectWalletInfoContainer className="...">
    <ConnectWalletInfoImage />
    <div className="flex flex-col items-start">
      <ConnectWalletInfoBalance decimalPlaces={4} withCurrency />
      <ConnectWalletInfoAddress frontChars={6} endChars={4} />
    </div>
  </ConnectWalletInfoContainer>
</ConnectWallet>
```

10. Example Usage (Real-world Header)

```tsx
import {
  ConnectWallet,
  ConnectWalletButton,
  ConnectWalletInfoContainer,
  ConnectWalletInfoImage,
  ConnectWalletInfoBalance,
  ConnectWalletInfoAddress,
} from './connect-wallet-enhanced';

export default function Header() {
  return (
    <ConnectWallet>
      <div className="flex items-center gap-4">
        <ConnectWalletButton className="px-6 py-2.5" />

        <ConnectWalletInfoContainer className="px-4 gap-3">
          <ConnectWalletInfoImage className="mr-1" />
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

## 11. Edge Cases & Error Handling

- No signer → nothing fetched, components gracefully hide
- Wallet disconnect → automatically switches to ConnectWalletButton
- Invalid decimalPlaces → TypeScript prevents it at compile time
- Empty balance/address → safe fallbacks
- Context misuse → clear runtime error with helpful message
- Loading state handled during data fetching, with visual feedback

## 12. Accessibility & Best Practices

- All buttons have proper cursor-pointer and hover states
- Semantic HTML (button, h3, span)
- Alt text on image
- Dark mode support built-in
- No layout shifts during connect/disconnect
- Responsive by default (Tailwind sm: prefixes used)

## 13. Future Extensions (Suggested)

- ConnectWalletBalanceOnly (standalone balance badge)
- Copy-to-clipboard address button
- Network badge / chain indicator
- Enhanced loading skeleton states
- Custom formatBalance prop for advanced formatters
- Balance refresh button / interval option

