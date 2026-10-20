import { ccc } from "@ckb-ccc/connector-react";
import { ClassValue } from "clsx";
import React, { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
    adoptConnection,
    connectionErrorMessage,
    ConnectWalletClientOption,
    findConnector,
    readClientOptions,
    readWallets,
} from "./ccc-session";
import {
    useConnectWallet,
    useConnectWalletDefaults,
    useConnectWalletDialogRegistration,
} from "./connect-wallet";
import { cn } from "./utils";

const dialogOverlayAppearance = "fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4";
const dialogPanelAppearance = "flex max-h-[min(40rem,calc(100vh-2rem))] w-full max-w-sm flex-col overflow-y-auto rounded-2xl bg-white p-4 text-black shadow-2xl outline-none dark:bg-neutral-950 dark:text-white";
const dialogTitleAppearance = "text-base font-semibold";
const dialogListButtonAppearance = "flex w-full cursor-pointer items-center gap-3 rounded-xl border border-black/10 bg-black/[0.03] px-3 py-3 text-left text-sm font-semibold transition-colors hover:bg-black/[0.06] disabled:cursor-default disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]";
const dialogActionAppearance = "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-60 dark:bg-white dark:text-black";
const dialogIconButtonAppearance = "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-lg leading-none text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10";
const dialogMutedAppearance = "text-center text-xs leading-5 text-black/60 dark:text-white/60";
const dialogAccountHeaderAppearance = "flex items-center justify-between gap-2";
const dialogAccountFooterAppearance = "flex flex-col gap-2";
const switchNetworkAppearance = "cursor-pointer text-center text-xs leading-5 text-black/60 underline-offset-2 hover:underline dark:text-white/60";

let scrollLocks = 0;

function lockPageScroll() {
    if (scrollLocks === 0) {
        document.body.dataset.ckbConnectWalletOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
    }
    scrollLocks += 1;
    return () => {
        scrollLocks = Math.max(0, scrollLocks - 1);
        if (scrollLocks === 0) {
            document.body.style.overflow = document.body.dataset.ckbConnectWalletOverflow ?? "";
            delete document.body.dataset.ckbConnectWalletOverflow;
        }
    };
}

export type ConnectWalletDialogStatus = "wallets" | "signers" | "connecting" | "account" | "networks";

export type ConnectWalletDialogState = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    /** Which default section should be on screen. */
    status: ConnectWalletDialogStatus;
    wallets: ccc.WalletWithSigners[];
    walletsLoading: boolean;
    /** False until CCC has had a moment to publish its wallet list. */
    discoverySettled: boolean;
    connectorMissing: boolean;
    refreshWallets: () => void;
    selectedWallet: ccc.WalletWithSigners | undefined;
    /** Connects immediately when the wallet has one signer. Several signers move to the chain step. */
    selectWallet: (wallet: ccc.WalletWithSigners) => void;
    connect: (signer: ccc.SignerInfo) => Promise<void>;
    connectingError: string | undefined;
    retry: () => void;
    back: () => void;
    wallet: ccc.Wallet | undefined;
    signer: ccc.Signer | undefined;
    address: string;
    balance: string;
    disconnect: () => void;
    client: ccc.Client;
    setClient: (client: ccc.Client) => void;
    clientOptions: ConnectWalletClientOption[];
    showNetworks: () => void;
};

const ConnectWalletDialogContext = createContext<ConnectWalletDialogState | undefined>(undefined);

export function useConnectWalletDialog() {
    const context = useContext(ConnectWalletDialogContext);
    if (!context) throw new Error("useConnectWalletDialog must be used within <ConnectWalletDialog />");
    return context;
}

function walletsChanged(current: ccc.WalletWithSigners[], next: ccc.WalletWithSigners[]) {
    if (current.length !== next.length) return true;
    return current.some((wallet, index) => {
        const other = next[index];
        if (wallet.name !== other.name || wallet.icon !== other.icon || wallet.signers.length !== other.signers.length) return true;
        return wallet.signers.some((signer, signerIndex) => {
            const otherSigner = other.signers[signerIndex];
            return signer.name !== otherSigner?.name || signer.signer !== otherSigner?.signer;
        });
    });
}

function clientsChanged(current: ConnectWalletClientOption[], next: ConnectWalletClientOption[]) {
    if (current.length !== next.length) return true;
    return current.some((option, index) => {
        const other = next[index];
        return option.name !== other?.name || option.icon !== other?.icon || option.client !== other?.client;
    });
}

/**
 * Popup state for one composition. Renders no chrome.
 * While this is mounted, `open()` from the button and `useConnectWallet()` opens this dialog.
 * Leave it out and those clicks keep opening CCC's popup.
 */
export function ConnectWalletDialog({ children }: { children?: React.ReactNode }) {
    const { address, balance, wallet } = useConnectWallet();
    const registerDialog = useConnectWalletDialogRegistration();
    const { client, disconnect, setClient } = ccc.useCcc();
    const signer = ccc.useSigner();

    const [isOpen, setIsOpen] = useState(false);
    const [wallets, setWallets] = useState<ccc.WalletWithSigners[]>([]);
    const [clientOptions, setClientOptions] = useState<ConnectWalletClientOption[]>([]);
    const [walletsLoading, setWalletsLoading] = useState(false);
    const [connectorMissing, setConnectorMissing] = useState(false);
    const [discoverySettled, setDiscoverySettled] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState<ccc.WalletWithSigners | undefined>(undefined);
    const [phase, setPhase] = useState<"idle" | "connecting" | "error">("idle");
    const [connectingError, setConnectingError] = useState<string | undefined>(undefined);
    const [selectingClient, setSelectingClient] = useState(false);
    const pendingRef = useRef<{ walletName: string; signerName: string } | null>(null);
    const attemptRef = useRef(0);
    const refreshId = useRef(0);

    const syncFromConnector = useCallback(() => {
        const element = findConnector();
        if (!element) {
            setConnectorMissing(true);
            return;
        }
        setConnectorMissing(false);
        const nextWallets = readWallets(element);
        const nextClients = readClientOptions(element);
        setWallets((current) => walletsChanged(current, nextWallets) ? nextWallets : current);
        setClientOptions((current) => clientsChanged(current, nextClients) ? nextClients : current);
    }, []);

    useEffect(() => {
        const element = findConnector();
        if (!element) {
            setConnectorMissing(true);
            return;
        }
        setConnectorMissing(false);
        syncFromConnector();
        element.addEventListener("willUpdate", syncFromConnector);
        return () => element.removeEventListener("willUpdate", syncFromConnector);
    }, [syncFromConnector]);

    const refreshWallets = useCallback(() => {
        const element = findConnector();
        if (!element) {
            setConnectorMissing(true);
            return;
        }
        const id = ++refreshId.current;
        setConnectorMissing(false);
        setWalletsLoading(true);
        void element.signersControllerInner.refresh().finally(() => {
            if (id !== refreshId.current) return;
            syncFromConnector();
            setWalletsLoading(false);
        });
    }, [syncFromConnector]);

    useEffect(() => {
        const timer = window.setTimeout(() => setDiscoverySettled(true), 800);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        setSelectedWallet((current) => {
            if (!current) return current;
            return wallets.find((item) => item.name === current.name) ?? current;
        });
    }, [wallets]);

    useEffect(() => {
        if (!wallet) return;
        setPhase("idle");
        setConnectingError(undefined);
        setSelectedWallet(undefined);
    }, [wallet]);

    const close = useCallback(() => {
        setIsOpen(false);
        setPhase("idle");
        setConnectingError(undefined);
        setSelectedWallet(undefined);
        setSelectingClient(false);
    }, []);

    const open = useCallback(() => {
        setIsOpen(true);
    }, []);

    useEffect(() => registerDialog(open), [open, registerDialog]);

    const connect = useCallback(async (signerInfo: ccc.SignerInfo) => {
        const attempt = ++attemptRef.current;
        const element = findConnector();
        const live = element ? readWallets(element) : wallets;
        const clickedOwner = live.find((item) => item.signers.some((entry) => entry === signerInfo || entry.signer === signerInfo.signer))
            ?? wallets.find((item) => item.signers.some((entry) => entry === signerInfo || entry.signer === signerInfo.signer));
        if (!clickedOwner) {
            setConnectingError("That wallet is no longer available.");
            setPhase("error");
            return;
        }
        const walletMatch = live.find((item) => item.name === clickedOwner.name) ?? clickedOwner;
        const liveSigner = walletMatch.signers.find((entry) => entry.signer === signerInfo.signer)
            ?? walletMatch.signers.find((entry) => entry.name === signerInfo.name)
            ?? signerInfo;

        pendingRef.current = { walletName: walletMatch.name, signerName: liveSigner.name };
        setSelectedWallet(walletMatch);
        setSelectingClient(false);
        setConnectingError(undefined);
        setPhase("connecting");

        try {
            await liveSigner.signer.connect();
            if (attempt !== attemptRef.current) return;
            if (!(await liveSigner.signer.isConnected())) {
                const installLink = liveSigner.signer instanceof ccc.SignerOpenLink;
                setConnectingError(installLink ? "Install the wallet, then try again." : "Unknown connection status");
                setPhase("error");
                return;
            }
            adoptConnection(walletMatch.name, liveSigner.name);
        } catch (error) {
            if (attempt !== attemptRef.current) return;
            setConnectingError(connectionErrorMessage(error));
            setPhase("error");
        }
    }, [wallets]);

    const selectWallet = useCallback((next: ccc.WalletWithSigners) => {
        setConnectingError(undefined);
        setPhase("idle");
        if (next.signers.length === 0) return;
        if (next.signers.length === 1) {
            void connect(next.signers[0]);
            return;
        }
        setSelectedWallet(next);
    }, [connect]);

    const retry = useCallback(() => {
        const pending = pendingRef.current;
        if (!pending) {
            refreshWallets();
            return;
        }
        const element = findConnector();
        const fresh = (element ? readWallets(element) : wallets).find((item) => item.name === pending.walletName);
        const signerInfo = fresh?.signers.find((item) => item.name === pending.signerName);
        if (!signerInfo) {
            setConnectingError("That wallet is no longer available.");
            setPhase("error");
            return;
        }
        void connect(signerInfo);
    }, [connect, refreshWallets, wallets]);

    const back = useCallback(() => {
        if (selectingClient) {
            setSelectingClient(false);
            return;
        }
        if (phase === "connecting" || phase === "error") {
            attemptRef.current += 1;
            setPhase("idle");
            setConnectingError(undefined);
            setSelectedWallet((current) => current && current.signers.length > 1 ? current : undefined);
            return;
        }
        setSelectedWallet(undefined);
    }, [phase, selectingClient]);

    const showNetworks = useCallback(() => {
        setSelectingClient(true);
    }, []);

    const status: ConnectWalletDialogStatus = selectingClient && wallet
        ? "networks"
        : wallet && phase === "idle"
            ? "account"
            : phase === "connecting" || phase === "error"
                ? "connecting"
                : selectedWallet && selectedWallet.signers.length > 1
                    ? "signers"
                    : "wallets";

    const value = useMemo<ConnectWalletDialogState>(() => ({
        isOpen,
        open,
        close,
        status,
        wallets,
        walletsLoading,
        discoverySettled,
        connectorMissing,
        refreshWallets,
        selectedWallet,
        selectWallet,
        connect,
        connectingError,
        retry,
        back,
        wallet,
        signer,
        address,
        balance,
        disconnect,
        client,
        setClient,
        clientOptions,
        showNetworks,
    }), [
        address,
        back,
        balance,
        client,
        clientOptions,
        close,
        connect,
        connectingError,
        connectorMissing,
        discoverySettled,
        disconnect,
        isOpen,
        open,
        refreshWallets,
        retry,
        selectWallet,
        selectedWallet,
        setClient,
        showNetworks,
        signer,
        status,
        wallet,
        wallets,
        walletsLoading,
    ]);

    return (
        <ConnectWalletDialogContext.Provider value={value}>
            {children}
        </ConnectWalletDialogContext.Provider>
    );
}

function DialogFrame({
    title,
    onBack,
    className,
    children,
}: {
    title: string;
    onBack?: () => void;
    className?: ClassValue;
    children: React.ReactNode;
}) {
    const { close } = useConnectWalletDialog();
    const defaults = useConnectWalletDefaults();
    const titleId = useId();

    return (
        <div className={cn("flex flex-col gap-3", className)}>
            <div className="grid grid-cols-[2rem_1fr_2rem] items-center gap-2">
                {onBack ? (
                    <button type="button" className={dialogIconButtonAppearance} onClick={onBack} aria-label="Back">
                        ←
                    </button>
                ) : <span aria-hidden />}
                <h2 id={titleId} className={cn("text-center", defaults.dialogTitleClassName ?? dialogTitleAppearance)}>
                    {title}
                </h2>
                <button type="button" className={dialogIconButtonAppearance} onClick={close} aria-label="Close">
                    ×
                </button>
            </div>
            {children}
        </div>
    );
}

function listButtonClass(buttonClassName: ClassValue | undefined, defaultsClassName: ClassValue | undefined) {
    return cn(defaultsClassName ?? dialogListButtonAppearance, buttonClassName);
}

/**
 * Centered modal for the dialog state. Skip it when the popup should be a dropdown, drawer, or page.
 */
export function ConnectWalletDialogOverlay({
    children,
    className,
    overlayClassName,
    label = "Wallet",
}: {
    children?: React.ReactNode;
    /** Merged onto the panel, after `defaults.dialogPanelClassName`. */
    className?: ClassValue;
    /** Merged onto the backdrop, after `defaults.dialogOverlayClassName`. */
    overlayClassName?: ClassValue;
    /** Accessible name for the dialog. */
    label?: string;
}) {
    const { isOpen, close } = useConnectWalletDialog();
    const defaults = useConnectWalletDefaults();
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const unlockScroll = lockPageScroll();

        const panel = panelRef.current;
        panel?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                close();
                return;
            }
            if (event.key !== "Tab" || !panel) return;
            const focusable = [...panel.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")];
            if (focusable.length === 0) return;
            const firstItem = focusable[0];
            const lastItem = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === firstItem) {
                event.preventDefault();
                lastItem.focus();
            } else if (!event.shiftKey && document.activeElement === lastItem) {
                event.preventDefault();
                firstItem.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            unlockScroll();
            previouslyFocused?.focus();
        };
    }, [close, isOpen]);

    if (!isOpen || typeof document === "undefined") return null;

    return createPortal(
        <div
            className={cn(defaults.dialogOverlayClassName ?? dialogOverlayAppearance, overlayClassName)}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) close();
            }}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={label}
                tabIndex={-1}
                className={cn(defaults.dialogPanelClassName ?? dialogPanelAppearance, className)}
            >
                {children}
            </div>
        </div>,
        document.body,
    );
}

export function ConnectWalletDialogWallets({
    className,
    buttonClassName,
}: {
    className?: ClassValue;
    /** Merged onto each wallet button, after `defaults.dialogListButtonClassName`. */
    buttonClassName?: ClassValue;
}) {
    const dialog = useConnectWalletDialog();
    const defaults = useConnectWalletDefaults();
    if (!dialog.isOpen || dialog.status !== "wallets") return null;

    const buttonClass = listButtonClass(buttonClassName, defaults.dialogListButtonClassName);

    return (
        <DialogFrame title="Connect Wallet" className={className}>
            {dialog.connectorMissing ? (
                <p className={dialogMutedAppearance}>Mount ccc.Provider above this dialog to list wallets.</p>
            ) : dialog.wallets.length === 0 ? (
                <p className={dialogMutedAppearance}>
                    {dialog.walletsLoading || !dialog.discoverySettled ? "Looking for wallets…" : "No wallets found."}
                </p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {dialog.wallets.map((wallet) => (
                        <li key={wallet.name}>
                            <button type="button" className={buttonClass} onClick={() => dialog.selectWallet(wallet)}>
                                <img src={wallet.icon} alt="" className="h-8 w-8 shrink-0 rounded-lg" />
                                <span className="min-w-0 truncate">{wallet.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <button
                type="button"
                className={cn(dialogMutedAppearance, "cursor-pointer underline-offset-2 hover:underline")}
                onClick={dialog.refreshWallets}
            >
                Refresh wallets
            </button>
        </DialogFrame>
    );
}

export function ConnectWalletDialogSigners({
    className,
    buttonClassName,
}: {
    className?: ClassValue;
    buttonClassName?: ClassValue;
}) {
    const dialog = useConnectWalletDialog();
    const defaults = useConnectWalletDefaults();
    const wallet = dialog.selectedWallet;
    if (!dialog.isOpen || dialog.status !== "signers" || !wallet) return null;

    const buttonClass = listButtonClass(buttonClassName, defaults.dialogListButtonClassName);

    return (
        <DialogFrame title="Select a Chain" onBack={dialog.back} className={className}>
            <div className="flex flex-col items-center gap-2">
                <img src={wallet.icon} alt="" className="h-16 w-16 rounded-2xl" />
                <p className="text-sm font-semibold">{wallet.name}</p>
            </div>
            <ul className="flex flex-col gap-2">
                {wallet.signers.map((signer, index) => (
                    <li key={`${signer.name}-${index}`}>
                        <button type="button" className={buttonClass} onClick={() => void dialog.connect(signer)}>
                            <span className="min-w-0 truncate">{signer.name}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </DialogFrame>
    );
}

export function ConnectWalletDialogConnecting({
    className,
    buttonClassName,
}: {
    className?: ClassValue;
    buttonClassName?: ClassValue;
}) {
    const dialog = useConnectWalletDialog();
    const defaults = useConnectWalletDefaults();
    if (!dialog.isOpen || dialog.status !== "connecting") return null;

    const wallet = dialog.selectedWallet;
    const failed = dialog.connectingError !== undefined;
    const installLink = dialog.connectingError === "Install the wallet, then try again.";

    return (
        <DialogFrame title={wallet?.name ?? "Wallet"} onBack={dialog.back} className={className}>
            <div className="flex flex-col items-center gap-2 py-2">
                {wallet ? <img src={wallet.icon} alt="" className="h-20 w-20 rounded-2xl" /> : null}
                <p className="text-sm font-semibold">
                    {installLink
                        ? "This wallet is not installed"
                        : failed
                            ? `Failed to open ${wallet?.name ?? "the wallet"}`
                            : `Opening ${wallet?.name ?? "the wallet"}…`}
                </p>
                <p className={dialogMutedAppearance}>
                    {dialog.connectingError ?? "Confirm the connection in the wallet."}
                </p>
            </div>
            <button
                type="button"
                className={cn(defaults.dialogActionClassName ?? dialogActionAppearance, buttonClassName)}
                onClick={dialog.retry}
            >
                Try again
            </button>
        </DialogFrame>
    );
}

function accountStep(status: ConnectWalletDialogStatus) {
    return status === "account" || status === "networks";
}

/** Account step shell. Put the header, close button, wallet pieces, and footer inside it. */
export function ConnectWalletDialogAccount({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: ClassValue;
}) {
    const dialog = useConnectWalletDialog();
    if (!dialog.isOpen || !accountStep(dialog.status) || !dialog.wallet) return null;

    return (
        <div className={cn("flex flex-col gap-3", className)}>
            {children}
        </div>
    );
}

export function ConnectWalletDialogAccountHeader({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: ClassValue;
}) {
    const dialog = useConnectWalletDialog();
    const defaults = useConnectWalletDefaults();
    if (!dialog.isOpen || !accountStep(dialog.status)) return null;

    return (
        <header className={cn(defaults.dialogAccountHeaderClassName ?? dialogAccountHeaderAppearance, className)}>
            {children}
        </header>
    );
}

export function ConnectWalletDialogAccountClose({
    children,
    className,
    label = "Close",
}: {
    children?: React.ReactNode;
    className?: ClassValue;
    /** Accessible name when the visible content is an icon. */
    label?: string;
}) {
    const dialog = useConnectWalletDialog();
    const defaults = useConnectWalletDefaults();
    if (!dialog.isOpen || !accountStep(dialog.status)) return null;

    return (
        <button
            type="button"
            className={cn(defaults.dialogCloseClassName ?? dialogIconButtonAppearance, className)}
            aria-label={label}
            onClick={dialog.close}
        >
            {children ?? "×"}
        </button>
    );
}

export function ConnectWalletDialogAccountFooter({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: ClassValue;
}) {
    const dialog = useConnectWalletDialog();
    const defaults = useConnectWalletDefaults();
    if (!dialog.isOpen || !accountStep(dialog.status)) return null;

    return (
        <footer className={cn(defaults.dialogAccountFooterClassName ?? dialogAccountFooterAppearance, className)}>
            {children}
        </footer>
    );
}

export function ConnectWalletSwitchNetwork({
    className,
    buttonClassName,
}: {
    className?: ClassValue;
    /** Merged onto each network row after `defaults.dialogListButtonClassName`. */
    buttonClassName?: ClassValue;
}) {
    const dialog = useConnectWalletDialog();
    const defaults = useConnectWalletDefaults();
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!dialog.isOpen) setExpanded(false);
    }, [dialog.isOpen]);

    if (!dialog.isOpen || !accountStep(dialog.status) || !dialog.wallet || dialog.clientOptions.length === 0) return null;

    const current = dialog.clientOptions.find((option) => option.client === dialog.client)
        ?? dialog.clientOptions.find((option) => option.client.addressPrefix === dialog.client.addressPrefix);
    const networkName = current?.name
        ?? (dialog.client.addressPrefix === "ckb" ? "Mainnet" : dialog.client.addressPrefix === "ckt" ? "Testnet" : dialog.client.addressPrefix);

    if (!expanded) {
        return (
            <button
                type="button"
                className={cn(switchNetworkAppearance, className)}
                onClick={() => setExpanded(true)}
            >
                {networkName} · Switch network
            </button>
        );
    }

    const listClass = listButtonClass(buttonClassName, defaults.dialogListButtonClassName);

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <ul className="flex flex-col gap-2">
                {dialog.clientOptions.map((option) => {
                    const selected = option === current;
                    return (
                        <li key={option.name}>
                            <button
                                type="button"
                                className={listClass}
                                aria-current={selected ? "true" : undefined}
                                onClick={() => {
                                    dialog.setClient(option.client);
                                    setExpanded(false);
                                }}
                            >
                                {option.icon ? <img src={option.icon} alt="" className="h-8 w-8 shrink-0 rounded-lg" /> : null}
                                <span className="min-w-0 flex-1 truncate">{option.name}</span>
                                {selected ? <span className="text-xs font-normal">Current</span> : null}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
