import { ccc } from "@ckb-ccc/connector-react";
import { ClassValue } from "clsx";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useConnectWallet, useConnectWalletDefaults } from "./connect-wallet";
import { createDidResolver, DidProfile, DidResolver, DidScript } from "./did-ckb";
import { cn, truncateString } from "./utils";

const didAvatarAppearance = "w-6 h-6 rounded-full object-cover";
const didNameAppearance = "font-semibold text-sm";
const didIdAppearance = "text-xs font-normal";

interface ConnectWalletDidContextProps {
    /** Every DID owned by the connected lock, newest first. */
    dids: DidProfile[];
    /** The DID the pieces display. */
    did: DidProfile | undefined;
    isLoading: boolean;
    error: unknown;
    /** Switch the displayed DID. */
    select: (did: DidProfile | undefined) => void;
}

const ConnectWalletDidContext = createContext<ConnectWalletDidContextProps | undefined>(undefined);

/**
 * Read the resolved DID state. Use this to build a custom DID display.
 * Must be rendered inside <ConnectWalletDid />.
 */
export function useConnectWalletDid() {
    const context = useContext(ConnectWalletDidContext);
    if (!context) throw new Error("useConnectWalletDid must be used within <ConnectWalletDid />");
    return context;
}

export function ConnectWalletDid({
    children,
    resolve,
    script,
    pick,
}: {
    children: React.ReactNode;
    /** Replace the lookup. Receives the CCC client, signer, lock, and address. */
    resolve?: DidResolver;
    /** did:ckb type script for a custom deployment. */
    script?: DidScript;
    /** Choose which DID to display when the lock owns several. Defaults to the newest. */
    pick?: (dids: DidProfile[]) => DidProfile | undefined;
}) {
    const { wallet } = useConnectWallet();
    const signer = ccc.useSigner();
    const [dids, setDids] = useState<DidProfile[]>([]);
    const [selected, setSelected] = useState<DidProfile | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(undefined);

    const resolver = useMemo(() => resolve ?? createDidResolver({ script }), [resolve, script]);

    useEffect(() => {
        if (!signer) {
            setDids([]);
            setSelected(undefined);
            return;
        }

        let isMounted = true;
        setIsLoading(true);
        setError(undefined);

        (async () => {
            try {
                const [address, addressObj] = await Promise.all([
                    signer.getRecommendedAddress(),
                    signer.getRecommendedAddressObj(),
                ]);
                const found = await resolver({
                    client: signer.client,
                    signer,
                    lock: addressObj.script,
                    address,
                });
                if (!isMounted) return;
                setDids(found);
                setSelected(pick ? pick(found) : found[0]);
            } catch (caught) {
                if (!isMounted) return;
                console.error("Failed to resolve did:ckb:", caught);
                setError(caught);
                setDids([]);
                setSelected(undefined);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [signer, resolver, pick]);

    const value = useMemo<ConnectWalletDidContextProps>(() => ({
        dids,
        did: selected,
        isLoading,
        error,
        select: setSelected,
    }), [dids, selected, isLoading, error]);

    if (!wallet) return null;

    return (
        <ConnectWalletDidContext.Provider value={value}>
            {children}
        </ConnectWalletDidContext.Provider>
    );
}

export function ConnectWalletDidAvatar({
    className,
    fallback = null,
}: {
    className?: ClassValue;
    /** Rendered when the DID has no avatar. */
    fallback?: React.ReactNode;
}) {
    const { did, isLoading } = useConnectWalletDid();
    const defaults = useConnectWalletDefaults();

    if (!did?.avatar) return isLoading ? null : <>{fallback}</>;

    return (
        <img
            src={did.avatar}
            alt={did.displayName ?? did.did}
            className={cn(defaults.didAvatarClassName ?? didAvatarAppearance, className)}
        />
    );
}

export function ConnectWalletDidName({
    className,
    fallback = null,
}: {
    className?: ClassValue;
    /** Rendered when the DID has no display name. */
    fallback?: React.ReactNode;
}) {
    const { did, isLoading } = useConnectWalletDid();
    const defaults = useConnectWalletDefaults();

    if (!did?.displayName) return isLoading ? null : <>{fallback}</>;

    return (
        <span className={cn(defaults.didNameClassName ?? didNameAppearance, className)}>
            {did.displayName}
        </span>
    );
}

export function ConnectWalletDidId({
    className,
    frontChars,
    endChars,
    fallback = null,
}: {
    className?: ClassValue;
    frontChars?: number;
    endChars?: number;
    /** Rendered when the lock owns no DID. */
    fallback?: React.ReactNode;
}) {
    const { did, isLoading } = useConnectWalletDid();
    const defaults = useConnectWalletDefaults();

    if (!did) return isLoading ? null : <>{fallback}</>;

    return (
        <span className={cn(defaults.didIdClassName ?? didIdAppearance, className)} title={did.did}>
            {truncateString(did.did, frontChars ?? defaults.didFrontChars ?? 14, endChars ?? defaults.didEndChars ?? 6)}
        </span>
    );
}
