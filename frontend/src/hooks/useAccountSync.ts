import { useCallback, useEffect, useRef } from "react";
import { useAccountStore } from "@massalabs/react-ui-kit/src/lib/ConnectMassaWallets";
import { useLocalStorage } from "@massalabs/react-ui-kit/src/lib/util/hooks/useLocalStorage";
import { getWallets } from "@massalabs/wallet-provider";

const useAccountSync = () => {
  type SavedAccount = {
    address: string;
    providerName: string;
  };

  const EMPTY_ACCOUNT: SavedAccount = {
    address: "",
    providerName: "",
  };

  const { connectedAccount, setCurrentWallet } = useAccountStore();

  const [savedAccount, setSavedAccount] = useLocalStorage<SavedAccount>(
    "saved-account",
    EMPTY_ACCOUNT
  );

  const getStoredAccount = useCallback(async (address: string) => {
    const wallets = await getWallets();
    for (const wallet of wallets) {
      const accounts = await wallet.accounts();
      const matchingAccount = accounts.find((a) => a.address === address);
      if (matchingAccount) {
        return { account: matchingAccount, wallet, wallets };
      }
    }
  }, []);

  const setAccountFromSaved = useCallback(async () => {
    if (!savedAccount.address) return;

    const stored = await getStoredAccount(savedAccount.address);
    if (stored) {
      setCurrentWallet(stored.wallet, stored.account);
    }
  }, [savedAccount.address, getStoredAccount, setCurrentWallet]);

  useEffect(() => {
    const shouldUpdateSavedAccount =
      connectedAccount && connectedAccount.address !== savedAccount.address;

    if (shouldUpdateSavedAccount) {
      const { address, providerName } = connectedAccount;
      setSavedAccount({ address, providerName });
    }
  }, [connectedAccount, setSavedAccount, savedAccount.address]);

  const initializedRef = useRef(false);

  console.log("useAccountSync initializedRef:", initializedRef.current);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setAccountFromSaved();
    }
  }, [setAccountFromSaved]);

  return { setSavedAccount };
};

export default useAccountSync;
