import { useEffect, useState } from "react";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { shortenAddress } from "../lib/utils";
import ConnectWalletModal from "./ConnectWalletModal";

export default function WalletConnect() {
  const [toggleConnectWalletModal, setToggleConnectWalletModal] =
    useState(false);
  const { connectedAccount } = useAccountStore();
  const [selectedAccount, setSelectedAccount] = useState(
    connectedAccount?.address || ""
  );

  useEffect(() => {
    setSelectedAccount(connectedAccount?.address || "");
  }, [connectedAccount, connectedAccount?.address]);

  const handleConnectClick = () => {
    setToggleConnectWalletModal(true);
  };

  return (
    <>
      {connectedAccount ? (
        <button
          className="bg-up-bg hover:bg-up-border  border-0 shadow-none text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          onClick={handleConnectClick}
        >
          {shortenAddress(selectedAccount, 4)}
        </button>
      ) : (
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          onClick={handleConnectClick}
        >
          Connect Wallet
        </button>
      )}

      <ConnectWalletModal
        toggleConnectWalletModal={toggleConnectWalletModal}
        setToggleConnectWalletModal={setToggleConnectWalletModal}
      />
    </>
  );
}
