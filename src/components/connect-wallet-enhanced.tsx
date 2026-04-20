import { ccc } from "@ckb-ccc/connector-react";
import { createContext, useContext, useEffect, useState } from "react";

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
}



