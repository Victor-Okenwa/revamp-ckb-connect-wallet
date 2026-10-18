import React from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { ConnectWalletDefaults, ConnectWalletDefaultsContext } from "./connect-wallet";

export function ConnectWalletKitProvider({
    children,
    defaults = {},
}: {
    children: React.ReactNode;
    defaults?: ConnectWalletDefaults;
}) {
    ccc.useCcc();

    return (
        <ConnectWalletDefaultsContext.Provider value={defaults}>
            {children}
        </ConnectWalletDefaultsContext.Provider>
    );
}

export function LayoutProvider(props: React.ComponentProps<typeof ConnectWalletKitProvider>) {
    return <ConnectWalletKitProvider {...props} />;
}
