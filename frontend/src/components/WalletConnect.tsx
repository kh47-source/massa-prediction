import { useEffect, useState } from "react";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { shortenAddress } from "../lib/utils";
import ConnectWalletModal from "./ConnectWalletModal";

export default function WalletConnect() {
  const [toggleConnectWalletModal, setToggleConnectWalletModal] =
    useState(false);
  const { connectedAccount, currentWallet } = useAccountStore();
  const [network, setNetwork] = useState<string | null>(null);
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
          className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition duration-300 hover:scale-105 flex items-center gap-2"
          onClick={handleConnectClick}
        >
          Connected: {shortenAddress(selectedAccount, 3)}
        </button>
      ) : (
        <button
          className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition duration-300 hover:scale-105 flex items-center gap-2"
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
