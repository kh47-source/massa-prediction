import { useEffect, useState } from "react";
import { ADMIN_ADDRESS } from "../lib/const";
import { shortenAddress } from "../lib/utils";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { getIsGenesisLocked, getIsGenesisStarted } from "../lib/massa";
import { toast } from "react-toastify";

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<null | "started" | "lock">(null);
  const [genesisStarted, setGenesisStarted] = useState(false);
  const [genesisLocked, setGenesisLocked] = useState(false);
  const { connectedAccount } = useAccountStore();

  const fetchGenesisStatus = async () => {
    if (!connectedAccount) {
      return;
    }

    setLoading(true);
    const isGenesisStarted = await getIsGenesisStarted(connectedAccount!);
    const isGenesisLocked = await getIsGenesisLocked(connectedAccount!);

    console.log("Fetched genesis status:", {
      isGenesisStarted,
      isGenesisLocked,
    });

    setGenesisStarted(isGenesisStarted);
    setGenesisLocked(isGenesisLocked);

    setLoading(false);
  };

  useEffect(() => {
    fetchGenesisStatus();
  }, [connectedAccount]);

  const toggleStarted = async () => {
    setUpdating("started");
    await new Promise((r) => setTimeout(r, 300));
    const next = !genesisStarted;
    localStorage.setItem("pm_genesis_started", String(next));
    setGenesisStarted(next);
    setUpdating(null);
  };

  const toggleLock = async () => {
    setUpdating("lock");
    await new Promise((r) => setTimeout(r, 300));
    const next = !genesisLocked;
    localStorage.setItem("pm_genesis_lock", String(next));
    setGenesisLocked(next);
    setUpdating(null);
  };

  return (
    <div className="min-h-screen bg-white text-gray-500">
      <div className="container mx-auto rounded-lg border-2 border-red-200 py-5">
        <h1 className="text-3xl font-bold text-foreground text-center">
          Current Admin Address:{" "}
          <span className=" text-red-600 break-all">
            {shortenAddress(ADMIN_ADDRESS)}
          </span>
        </h1>

        <div className="mt-8 px-4">
          <div className="rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Genesis Controls
            </h2>

            {loading ? (
              <div className="animate-pulse text-gray-400">Loading status…</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div className="text-sm text-gray-600">genesisStarted</div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      genesisStarted
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {genesisStarted ? "true" : "false"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div className="text-sm text-gray-600">genesisLocked</div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      genesisLocked
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {genesisLocked ? "true" : "false"}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={toggleStarted}
                disabled={loading || updating !== null}
                className="inline-flex items-center justify-center rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating === "started"
                  ? "Updating…"
                  : genesisStarted
                  ? "Unset genesisStarted"
                  : "Set genesisStarted"}
              </button>

              <button
                onClick={toggleLock}
                disabled={loading || updating !== null}
                className="inline-flex items-center justify-center rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating === "lock"
                  ? "Updating…"
                  : genesisLocked
                  ? "Unset genesisLock"
                  : "Set genesisLock"}
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Using localStorage as mock state. You can wire these actions to
              your contract later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
