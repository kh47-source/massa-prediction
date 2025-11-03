import * as React from "react";
import { createPortal } from "react-dom";
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

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex justify-center items-center transition-opacity duration-300"
      onClick={closeModal}
      aria-hidden="true"
    >
      <div
        className="relative p-8 max-w-[500px] w-full mx-4 brut-card"
        onClick={stopPropagation}
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors duration-200"
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
        <h2
          id="modal-title"
          className="text-3xl font-bold text-foreground mb-2"
        >
          Connect Wallet
        </h2>

        {/* Modal Content */}
        <div id="modal-description" className="text-muted-foreground mb-6">
          {connectedAccount && network && (
            <div className="mb-6 flex gap-2 items-center justify-end">
              <button
                onClick={disconnectWallet}
                className="p-2.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all duration-150 group"
                title="Disconnect Wallet"
                aria-label="Disconnect Wallet"
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
                  className="transition-transform duration-150 group-hover:rotate-90"
                >
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                  <line x1="12" y1="2" x2="12" y2="12"></line>
                </svg>
              </button>
            </div>
          )}
          {!connectedAccount && (
            <p className="mb-6 text-lg font-medium text-foreground">
              Choose your preferred wallet to connect to the platform:
            </p>
          )}
          <div className="massa-wallet-wrapper">
            <ConnectMassaWallet />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConnectWalletModal;
