import { createContext, useContext, useEffect, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react"

//  Context for store
const WalletConnectContext = createContext(undefined);

function useWalletConnect() {
    const context = useContext(WalletConnectContext);
    if (!context) throw new Error("Wallet connect components must be used within <WalletConnect />");
    return context;
}

export function WalletConnect({ children }) {
    const { open, wallet } = ccc.useCcc();
    const [balance, setBalance] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const signer = ccc.useSigner();

useEffect(()=> )
}



