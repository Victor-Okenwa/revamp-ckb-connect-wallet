import { ccc } from "@ckb-ccc/connector-react";
import { ClassValue } from "clsx";
import React, { createContext, useContext, useEffect, useState } from "react";
import { cn, truncateAddress } from "../utils/utils";

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
    className = ""
}: {
    className?: ClassValue
}) {
    const { open, wallet, isLoading } = useConnectWallet();

    if (wallet) return null;

    return (
        <button className={cn("cursor-pointer rounded-full border border-solid border-transparent transition-colors flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black hover:opacity-90  text-sm sm:text-base font-bold  px-5 py-3", className, {
            "animate-pulse": isLoading
        })}
            onClick={open}
        >
            Connect Wallet
        </button>
    )
}

export function ConnectWalletInfoContainer({ children, className = ""
}: {
    children: React.ReactNode;
    className?: ClassValue
}) {
    const { open, wallet, isLoading } = useConnectWallet();

    if (!wallet) return null;
    return (
        <button className={cn("cursor-pointer rounded-full border border-solid border-transparent transition-colors bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-sm sm:text-base font-bold px-5 py-3", className, {
            "animate-pulse": isLoading
        })}
            onClick={open}>
            {children}
        </button>
    )
}

export function ConnectWalletInfoImage({ className = ""
}: {
    className?: ClassValue
}) {
    const { wallet } = useConnectWallet();

    if (!wallet) return null;

    return (
        <img src={wallet.icon} alt="avatar" className={cn("w-6 h-6", className)} />
    )
}

type DecimalPlaces = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

export function ConnectWalletInfoBalance({ className = "",
    decimalPlaces,
    withCurrency = true
}: {
    decimalPlaces?: DecimalPlaces;
    withCurrency?: boolean;
    className?: ClassValue
}) {
    const { wallet, balance } = useConnectWallet();

    if (!wallet) return null;

    let formatter;

    if (decimalPlaces) {
        formatter = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: decimalPlaces, // Controls decimal places
            roundingMode: 'trunc',    // Forces it to cut off instead of rounding up
        });
    } else {
        formatter = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 10
        });
    }

    return (
        <h3 className={cn("font-semibold text-sm", className)}>{formatter.format(Number(balance))}
            {withCurrency &&
                <span>
                    {" "}
                    CKB
                </span>}
        </h3>
    )
}

export function ConnectWalletInfoAddress({ className = "",
    frontChars = 10,
    endChars = 6,
}: {
    className?: ClassValue;
    frontChars?: number,
    endChars?: number,
}) {
    const { wallet, address } = useConnectWallet();

    if (!wallet) return null;

    return (
        <span className={cn("text-xs font-normal", className)}>
            {truncateAddress(address, frontChars, endChars)}
        </span>
    )
}
