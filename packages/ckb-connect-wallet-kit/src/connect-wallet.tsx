import { ccc } from "@ckb-ccc/connector-react";
import { ClassValue } from "clsx";
import React, { createContext, useContext, useEffect, useState } from "react";
import { cn, truncateAddress } from "./utils";

export type DecimalPlaces = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

export type ConnectWalletDefaults = {
    buttonClassName?: ClassValue;
    infoContainerClassName?: ClassValue;
    imageClassName?: ClassValue;
    balanceClassName?: ClassValue;
    addressClassName?: ClassValue;
    decimalPlaces?: DecimalPlaces;
    withCurrency?: boolean;
    frontChars?: number;
    endChars?: number;
    buttonLabel?: React.ReactNode;
};

export const ConnectWalletDefaultsContext = createContext<ConnectWalletDefaults>({});

function useConnectWalletDefaults() {
    return useContext(ConnectWalletDefaultsContext);
}

const buttonStructure = "cursor-pointer flex items-center justify-center gap-2 border border-solid border-transparent transition-colors";
const buttonAppearance = "rounded-full bg-black text-white hover:opacity-90 dark:bg-white dark:text-black text-sm font-bold sm:text-base px-5 py-3";
const balanceAppearance = "font-semibold text-sm";
const addressAppearance = "text-xs font-normal";
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

const initialWalletConnectState: ConnectWalletContextProps = {
    isLoading: true,
    setIsLoading: () => { },
    balance: "",
    setBalance: () => { },
    address: "",
    setAddress: () => { },
    open: () => { },
    wallet: undefined
};


//  Context for store
const ConnectWalletContext = createContext<ConnectWalletContextProps>(initialWalletConnectState);

function useConnectWallet() {
    const context = useContext(ConnectWalletContext);
    if (!context) throw new Error("Wallet connect components must be used within <WalletConnect />");
    return context;
}

export function ConnectWallet({ children }: { children: React.ReactNode }) {
    const { open, wallet } = ccc.useCcc();
    const [balance, setBalance] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const signer = ccc.useSigner();

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
            {children}
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

export function ConnectWalletInfoContainer({ children, className
}: {
    children: React.ReactNode;
    className?: ClassValue
}) {
    const { open, wallet, isLoading } = useConnectWallet();
    const defaults = useConnectWalletDefaults();

    if (!wallet) return null;
    return (
        <button className={cn(buttonStructure, defaults.infoContainerClassName ?? buttonAppearance, className, {
            "animate-pulse": isLoading
        })}
            onClick={open}>
            {children}
        </button>
    )
}

export function ConnectWalletInfoImage({ className
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

export function ConnectWalletInfoBalance({ className,
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

export function ConnectWalletInfoAddress({ className,
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
