import { ccc } from "@ckb-ccc/connector-react";

const CONNECTION_KEY = "ccc-connection-info";

export type ConnectWalletClientOption = {
    icon?: string;
    client: ccc.Client;
    name: string;
};

/**
 * Fields the kit reads from CCC's `<ccc-connector>` element.
 * `walletName`, `signerName`, and `signersControllerInner` are runtime properties
 * on the element. CCC does not publish a headless "select this signer" method,
 * and `ccc.useSigner()` only updates after this element stores the session.
 */
type CccConnectorElement = HTMLElement & {
    clientOptions?: ConnectWalletClientOption[];
    walletName?: string;
    signerName?: string;
    refreshSigner: () => void;
    signersControllerInner: {
        wallets: ccc.WalletWithSigners[];
        refresh: () => Promise<void>;
    };
};

let warnedAboutConnectorShape = false;

export function findConnector(): CccConnectorElement | null {
    if (typeof document === "undefined") return null;
    const element = document.querySelector("ccc-connector");
    if (!element) return null;

    const candidate = element as Partial<CccConnectorElement>;
    if (!candidate.signersControllerInner || typeof candidate.refreshSigner !== "function") {
        if (!warnedAboutConnectorShape) {
            warnedAboutConnectorShape = true;
            console.warn("ckb-connect-wallet-kit: the mounted ccc-connector does not expose wallet discovery, so ConnectWalletDialog cannot list wallets.");
        }
        return null;
    }

    return candidate as CccConnectorElement;
}

export function readWallets(element: CccConnectorElement): ccc.WalletWithSigners[] {
    return element.signersControllerInner.wallets.map((wallet) => ({
        name: wallet.name,
        icon: wallet.icon,
        signers: wallet.signers.slice(),
    }));
}

export function readClientOptions(element: CccConnectorElement): ConnectWalletClientOption[] {
    return (element.clientOptions ?? []).map((option) => ({ ...option }));
}

export function adoptConnection(walletName: string, signerName: string) {
    const element = findConnector();
    if (!element) {
        throw new Error("ccc-connector is not mounted. Mount ccc.Provider above ConnectWalletContainer.");
    }

    try {
        window.localStorage.setItem(CONNECTION_KEY, JSON.stringify({ signerName, walletName }));
    } catch {
        // The live session still updates. A reload may ask for the wallet again.
    }
    element.walletName = walletName;
    element.signerName = signerName;
    element.refreshSigner();
}

export function connectionErrorMessage(error: unknown): string {
    if (typeof error !== "object" || error === null) return JSON.stringify(error);
    if (!("message" in error)) return "Unknown error";
    const message = error.message;
    return typeof message === "string" ? message : JSON.stringify(message);
}
