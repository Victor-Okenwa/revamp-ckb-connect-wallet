import { ccc } from "@ckb-ccc/connector-react";
import React, { createContext, useContext, useEffect, useState } from "react";


interface WalletConnectContextProps {
    balance: string;
    setBalance: React.Dispatch<React.SetStateAction<string>>;
    address: string;
    setAddress: React.Dispatch<React.SetStateAction<string>>;
    open: () => unknown
    wallet: ccc.Wallet | undefined
}

const initialWalletConnectState: WalletConnectContextProps = {
    balance: "",
    setBalance: () => { },
    address: "",
    setAddress: () => { },
    open: () => { },
    wallet: undefined
};


//  Context for store
const WalletConnectContext = createContext<WalletConnectContextProps>(initialWalletConnectState);

function useWalletConnect() {
    const context = useContext(WalletConnectContext);
    if (!context) throw new Error("Wallet connect components must be used within <WalletConnect />");
    return context;
}

export function WalletConnect({ children }: { children: React.ReactNode }) {
    const { open, wallet } = ccc.useCcc();
    const [balance, setBalance] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const signer = ccc.useSigner();

    useEffect(() => {
        if (!signer) {
            return;
        }
        (async () => {
            const [address, capacity] = await Promise.all([
                signer.getRecommendedAddress(),
                signer.getBalance()
            ]
            );

            setAddress(address)
            setBalance(ccc.fixedPointToString(capacity));
        })();
    }, [signer]);

    const values = {
        balance,
        setBalance,
        address,
        setAddress,
        open,
        wallet
    }

    return (
        <WalletConnectContext.Provider value={values}>
            {children}
        </WalletConnectContext.Provider>
    )
}



