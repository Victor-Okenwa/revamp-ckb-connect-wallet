import {
  ConnectWalletAddress,
  ConnectWalletBalance,
  ConnectWalletDialog,
  ConnectWalletDialogAccount,
  ConnectWalletDialogClose,
  ConnectWalletDialogAccountFooter,
  ConnectWalletDialogAccountHeader,
  ConnectWalletDialogConnecting,
  ConnectWalletDialogOverlay,
  ConnectWalletDialogSigners,
  ConnectWalletDialogWallets,
  ConnectWalletDid,
  ConnectWalletDidAvatar,
  ConnectWalletDidId,
  ConnectWalletDisconnect,
  ConnectWalletImage,
  ConnectWalletName,
  ConnectWalletSwitchNetwork,
} from "ckb-connect-wallet-kit";

export function WalletDialog() {
  return (
    <ConnectWalletDialog>
      <ConnectWalletDialogOverlay>
        <ConnectWalletDialogWallets />
        <ConnectWalletDialogSigners />
        <ConnectWalletDialogConnecting />
        <ConnectWalletDialogAccount>
          <ConnectWalletDialogAccountHeader>
            <ConnectWalletName />
            <ConnectWalletDialogClose />
          </ConnectWalletDialogAccountHeader>
          <ConnectWalletDid>
            <div className="flex flex-col items-center gap-2 py-1">
              <ConnectWalletDidAvatar
                className="h-16 w-16"
                fallback={<ConnectWalletImage className="h-16 w-16 rounded-2xl" />}
              />
              <ConnectWalletDidId fallback={<ConnectWalletAddress />} />
              <ConnectWalletBalance />
            </div>
          </ConnectWalletDid>
          <ConnectWalletDialogAccountFooter>
            <ConnectWalletDisconnect buttonText="Disconnect" />
            <ConnectWalletSwitchNetwork />
          </ConnectWalletDialogAccountFooter>
        </ConnectWalletDialogAccount>
      </ConnectWalletDialogOverlay>
    </ConnectWalletDialog>
  );
}
