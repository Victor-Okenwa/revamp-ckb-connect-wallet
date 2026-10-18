import React from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { CSSProperties } from "react";
import { ConnectWalletDefaults, ConnectWalletDefaultsContext } from "./connect-wallet";

export function ConnectWalletKitProvider({
    children,
    network,
    defaults = {},
}: {
    children: React.ReactNode;
    network?: "mainnet" | "testnet";
    defaults?: ConnectWalletDefaults;
}) {
    const defaultClient = React.useMemo(() => {
        if (!network) return undefined;
        return network === "mainnet"
            ? new ccc.ClientPublicMainnet()
            : new ccc.ClientPublicTestnet();
    }, [network]);

    const tree = (
        <ConnectWalletDefaultsContext.Provider value={defaults}>
            {children}
        </ConnectWalletDefaultsContext.Provider>
    );

    if (!network || !defaultClient) {
        return tree;
    }

    return (
        <ccc.Provider
            connectorProps={{
                style: {
                    "--background": "#232323",
                    "--divider": "rgba(255, 255, 255, 0.1)",
                    "--btn-primary": "#2D2F2F",
                    "--btn-primary-hover": "#515151",
                    "--btn-secondary": "#2D2F2F",
                    "--btn-secondary-hover": "#515151",
                    "--icon-primary": "#FFFFFF",
                    "--icon-secondary": "rgba(255, 255, 255, 0.6)",
                    color: "#ffffff",
                    "--tip-color": "#666",
                } as CSSProperties,
            }}
            defaultClient={defaultClient}
            clientOptions={[
                {
                    name: "CKB Testnet",
                    client: new ccc.ClientPublicTestnet(),
                },
                {
                    name: "CKB Mainnet",
                    client: new ccc.ClientPublicMainnet(),
                },
            ]}
        >
            {tree}
        </ccc.Provider>
    );
}

export function LayoutProvider({
    network = "testnet",
    ...props
}: React.ComponentProps<typeof ConnectWalletKitProvider>) {
    return <ConnectWalletKitProvider network={network} {...props} />;
}
