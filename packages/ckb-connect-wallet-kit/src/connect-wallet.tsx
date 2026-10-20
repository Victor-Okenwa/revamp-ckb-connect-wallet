import { ccc } from "@ckb-ccc/connector-react";
import { ClassValue } from "clsx";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { cn, truncateAddress } from "./utils";

export type DecimalPlaces = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

export type ConnectWalletDefaults = {
    buttonClassName?: ClassValue;
    imageClassName?: ClassValue;
    balanceClassName?: ClassValue;
    addressClassName?: ClassValue;
    nameClassName?: ClassValue;
    disconnectClassName?: ClassValue;
    decimalPlaces?: DecimalPlaces;
    withCurrency?: boolean;
    frontChars?: number;
    endChars?: number;
    buttonLabel?: React.ReactNode;
    didAvatarClassName?: ClassValue;
    didNameClassName?: ClassValue;
    didIdClassName?: ClassValue;
    didFrontChars?: number;
    didEndChars?: number;
    dialogOverlayClassName?: ClassValue;
    dialogPanelClassName?: ClassValue;
    dialogTitleClassName?: ClassValue;
    dialogListButtonClassName?: ClassValue;
    dialogActionClassName?: ClassValue;
    dialogAccountHeaderClassName?: ClassValue;
    dialogAccountFooterClassName?: ClassValue;
    dialogCloseClassName?: ClassValue;
};

export const ConnectWalletDefaultsContext = createContext<ConnectWalletDefaults>({});

export function useConnectWalletDefaults() {
    return useContext(ConnectWalletDefaultsContext);
}

const buttonStructure = "cursor-pointer flex items-center justify-center gap-2 border border-solid border-transparent transition-colors";
const buttonAppearance = "rounded-full bg-black text-white hover:opacity-90 dark:bg-white dark:text-black text-sm font-bold sm:text-base px-5 py-3";
const balanceAppearance = "font-semibold text-sm";
const addressAppearance = "text-xs font-normal";
const nameAppearance = "text-sm font-semibold";
const disconnectAppearance = "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black";
const imageAppearance = "w-6 h-6";

interface ConnectWalletContextProps {
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    balance: string;
    setBalance: React.Dispatch<React.SetStateAction<string>>;
    address: string;
    setAddress: React.Dispatch<React.SetStateAction<string>>;
    open: () => unknown
    wallet: ccc.Wallet | undefined
}

const ConnectWalletContext = createContext<ConnectWalletContextProps | undefined>(undefined);

type DialogRegistration = (openDialog: () => void) => () => void;

const ConnectWalletDialogRegistrationContext = createContext<DialogRegistration | null>(null);

export function useConnectWallet() {
    const context = useContext(ConnectWalletContext);
    if (!context) throw new Error("useConnectWallet must be used within <ConnectWalletContainer />");
    return context;
}

export function useConnectWalletDialogRegistration() {
    const register = useContext(ConnectWalletDialogRegistrationContext);
    if (!register) throw new Error("ConnectWalletDialog must be used within <ConnectWalletContainer />");
    return register;
}

export function ConnectWalletContainer({ children }: { children: React.ReactNode }) {
    const { open: openCcc, wallet } = ccc.useCcc();
    const [balance, setBalance] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const signer = ccc.useSigner();
    const dialogRef = useRef<(() => void) | null>(null);
    const registerDialog = useCallback<DialogRegistration>((openDialog) => {
        dialogRef.current = openDialog;
        return () => {
            if (dialogRef.current === openDialog) dialogRef.current = null;
        };
    }, []);
    const open = useCallback(() => {
        if (dialogRef.current) {
            dialogRef.current();
            return;
        }
        return openCcc();
    }, [openCcc]);

    useEffect(() => {
        if (!signer) {
            return
        };
        setIsLoading(true);
        let isMounted = true;

        (async () => {
            try {
                const [address, capacity] = await Promise.all([
                    signer.getRecommendedAddress(),
                    signer.getBalance()
                ]);

                if (isMounted) {
                    setAddress(address);
                    setBalance(ccc.fixedPointToString(capacity));
                    setIsLoading(false)
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        })();

        return () => { isMounted = false; };
    }, [signer]);

    const values = {
        isLoading,
        setIsLoading,
        balance,
        setBalance,
        address,
        setAddress,
        open,
        wallet
    }

    return (
        <ConnectWalletContext.Provider value={values}>
            <ConnectWalletDialogRegistrationContext.Provider value={registerDialog}>
                {children}
            </ConnectWalletDialogRegistrationContext.Provider>
        </ConnectWalletContext.Provider>
    )
}

export function ConnectWalletButton({
    className,
    children,
}: {
    className?: ClassValue;
    children?: React.ReactNode;
}) {
    const { open, wallet, isLoading } = useConnectWallet();
    const defaults = useConnectWalletDefaults();

    if (wallet) return null;

    return (
        <button className={cn(buttonStructure, defaults.buttonClassName ?? buttonAppearance, className, {
            "animate-pulse": isLoading
        })}
            onClick={open}
        >
            {children ?? defaults.buttonLabel ?? "Connect Wallet"}
        </button>
    )
}

export function ConnectWalletImage({ className
}: {
    className?: ClassValue
}) {
    const { wallet } = useConnectWallet();
    const defaults = useConnectWalletDefaults();

    if (!wallet) return null;

    return (
        <img src={wallet.icon} alt="avatar" className={cn(defaults.imageClassName ?? imageAppearance, className)} />
    )
}

export function ConnectWalletBalance({ className,
    decimalPlaces,
    withCurrency,
}: {
    decimalPlaces?: DecimalPlaces;
    withCurrency?: boolean;
    className?: ClassValue
}) {
    const { wallet, balance } = useConnectWallet();
    const defaults = useConnectWalletDefaults();
    const places = decimalPlaces ?? defaults.decimalPlaces;
    const showCurrency = withCurrency ?? defaults.withCurrency ?? true;

    if (!wallet) return null;

    const formatter = places === undefined
        ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 10 })
        : new Intl.NumberFormat("en-US", {
            maximumFractionDigits: places,
            roundingMode: "trunc",
        });

    return (
        <h3 className={cn(defaults.balanceClassName ?? balanceAppearance, className)}>{formatter.format(Number(balance))}
            {showCurrency &&
                <span>
                    {" "}
                    CKB
                </span>}
        </h3>
    )
}

export function ConnectWalletAddress({ className,
    frontChars,
    endChars,
}: {
    className?: ClassValue;
    frontChars?: number,
    endChars?: number,
}) {
    const { wallet, address } = useConnectWallet();
    const defaults = useConnectWalletDefaults();

    if (!wallet) return null;

    return (
        <span className={cn(defaults.addressClassName ?? addressAppearance, className)}>
            {truncateAddress(address, frontChars ?? defaults.frontChars ?? 10, endChars ?? defaults.endChars ?? 6)}
        </span>
    )
}

export function ConnectWalletName({ className }: { className?: ClassValue }) {
    const { wallet } = useConnectWallet();
    const defaults = useConnectWalletDefaults();

    if (!wallet) return null;

    return (
        <span className={cn(defaults.nameClassName ?? nameAppearance, className)}>
            {wallet.name}
        </span>
    )
}

export function ConnectWalletDisconnect({
    buttonText,
    className,
}: {
    buttonText?: React.ReactNode;
    className?: ClassValue;
}) {
    const { wallet } = useConnectWallet();
    const { disconnect } = ccc.useCcc();
    const defaults = useConnectWalletDefaults();

    if (!wallet) return null;

    return (
        <button
            type="button"
            className={cn(defaults.disconnectClassName ?? disconnectAppearance, className)}
            onClick={() => { disconnect(); }}
        >
            {buttonText ?? "Disconnect"}
        </button>
    )
}
