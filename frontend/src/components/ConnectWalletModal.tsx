import * as React from "react";
import { ConnectMassaWallet, useAccountStore } from "@massalabs/react-ui-kit";
import { useEffect, useState } from "react";
import useAccountSync from "../hooks/useAccountSync";

interface ConnectWalletModalProps {
  toggleConnectWalletModal: boolean;
  setToggleConnectWalletModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  toggleConnectWalletModal,
  setToggleConnectWalletModal,
}) => {
  const {
    connectedAccount,
    currentWallet,
    setCurrentWallet,
    setConnectedAccount,
  } = useAccountStore();
  const [network, setNetwork] = useState<string | null>(null);
  const { setSavedAccount } = useAccountSync();

  useEffect(() => {
    const fetchWalletInfo = async () => {
      if (connectedAccount) {
        const networkInfo = await currentWallet?.networkInfos();
        const networkName = networkInfo?.name ?? null;
        setNetwork(networkName);
      } else {
        setNetwork(null);
      }
    };

    fetchWalletInfo();
  }, [toggleConnectWalletModal, connectedAccount]);

  const disconnectWallet = async () => {
    try {
      // bearby has disconnect methode but it doesn't work
      // if (currentWallet?.name() === WalletName.Bearby) {
      //   await currentWallet.disconnect();
      // }
      // Massa station doesn't have support disconnect methode for now we will say if it will later
      setConnectedAccount(undefined);
      setCurrentWallet(undefined);
      // Clear local storage so fammech auto reconnect
      setSavedAccount({ address: "", providerName: "" });
      setNetwork(null);
      setToggleConnectWalletModal(false);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  const closeModal = () => {
    setToggleConnectWalletModal(false);
  };

  const stopPropagation = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  if (!toggleConnectWalletModal) return null;
  return (
    <div
      className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center transition-opacity duration-300"
      onClick={closeModal}
      aria-hidden="true"
    >
      <div
        className="relative p-8 max-w-[500px] w-full mx-4 bg-white brut-card text-ink-950"
        onClick={stopPropagation}
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-6 right-6 text-ink-950 hover:text-accent-primary transition-colors duration-200"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Title */}
        <h2 id="modal-title" className="text-3xl font-bold text-ink-950 mb-2">
          Connect Wallet
        </h2>

        {/* Modal Content */}
        <div id="modal-description" className="text-ink-950/70 mb-6">
          {connectedAccount && network && (
            <div className="mb-6 flex gap-2 items-center justify-end">
              <button
                onClick={disconnectWallet}
                className="brut-btn bg-accent-primary text-ink-950 flex items-center gap-2 font-bold hover:bg-accent-primary/80 transition-colors"
                title="Disconnect Wallet"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
                Disconnect
              </button>
            </div>
          )}
          {!connectedAccount && (
            <p className="mb-6 text-lg font-medium">
              Choose your preferred wallet to connect to the platform:
            </p>
          )}
          <div className="theme-light">
            <ConnectMassaWallet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWalletModal;
