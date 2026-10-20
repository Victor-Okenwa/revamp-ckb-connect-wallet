import {
  ConnectWalletDialog,
  ConnectWalletDialogAccount,
  ConnectWalletDialogConnecting,
  ConnectWalletDialogOverlay,
  ConnectWalletDialogSigners,
  ConnectWalletDialogWallets,
} from "ckb-connect-wallet-kit";

export function WalletDialog() {
  return (
    <ConnectWalletDialog>
      <ConnectWalletDialogOverlay>
        <ConnectWalletDialogWallets />
        <ConnectWalletDialogSigners />
        <ConnectWalletDialogConnecting />
        <ConnectWalletDialogAccount />
      </ConnectWalletDialogOverlay>
    </ConnectWalletDialog>
  );
}
