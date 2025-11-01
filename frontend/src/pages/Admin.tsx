import { useEffect, useState } from "react";
import { ADMIN_ADDRESS } from "../lib/const";
import { shortenAddress } from "../lib/utils";
import { useAccountStore } from "@massalabs/react-ui-kit";
import {
  genesisLockRound,
  genesisStartRound,
  getCurrentEpoch,
  getIsGenesisLocked,
  getIsGenesisStarted,
  getRoundDetails,
} from "../lib/massa";
import { toast } from "react-toastify";
import type { Round } from "../lib/types";

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [isCurrentEpochLoading, setIsCurrentEpochLoading] = useState(true);
  const [genesisStarted, setGenesisStarted] = useState(false);
  const [genesisLocked, setGenesisLocked] = useState(false);
  const [isGenesisStartedLoading, setIsGenesisStartedLoading] = useState(false);
  const [isGenesisLockedLoading, setIsGenesisLockedLoading] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null);
  const [currentRoundDetails, setCurrentRoundDetails] = useState<Round | null>(
    null
  );
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

  const fetchCurrentEpoch = async () => {
    if (!connectedAccount) {
      return;
    }

    setIsCurrentEpochLoading(true);
    const currentEpoch = await getCurrentEpoch(connectedAccount!);
    setCurrentEpoch(currentEpoch);

    const roundDetails = await getRoundDetails(
      BigInt(currentEpoch),
      connectedAccount!
    );

    console.log("Fetched round details:", roundDetails);
    setCurrentRoundDetails(roundDetails);

    setIsCurrentEpochLoading(false);
  };

  const refreshStatus = async () => {
    await fetchGenesisStatus();
    await fetchCurrentEpoch();
  };

  useEffect(() => {
    refreshStatus();
  }, [connectedAccount]);

  const handleStartGenesisRound = async () => {
    if (!connectedAccount) {
      return;
    }

    setIsGenesisStartedLoading(true);

    try {
      const result = await genesisStartRound(connectedAccount);

      if (result.success) {
        await refreshStatus();
      }
    } catch (error) {
      console.error("Error starting genesis round:", error);
    } finally {
      setIsGenesisStartedLoading(false);
    }
  };

  const handleLockGenesisRound = async () => {
    if (!connectedAccount) {
      return;
    }

    setIsGenesisLockedLoading(true);

    try {
      const result = await genesisLockRound(connectedAccount);

      if (result.success) {
        await refreshStatus();
      }
    } catch (error) {
      console.error("Error locking genesis round:", error);
    } finally {
      setIsGenesisLockedLoading(false);
    }
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

        <div className="mt-8 px-4 text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 gap-5">
            Current Round:{" "}
            <span className="text-xl text-red-600 font-bold">
              {isCurrentEpochLoading ? "Loading..." : currentEpoch}
            </span>
          </h2>
        </div>

        {/* Current Round Details Section */}
        {currentRoundDetails && !isCurrentEpochLoading && (
          <div className="mt-8 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="brut-card bg-gradient-to-br from-red-50 to-orange-50 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-ink-950">
                    📊 Round #{currentRoundDetails.epoch.toString()} Details
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-700">
                      Live
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Total Pool */}
                  <div className="bg-white border-3 border-ink-950 rounded-2xl p-5 shadow-brut hover:translate-y-[-4px] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        💰 Total Pool
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-ink-950">
                      {(Number(currentRoundDetails.totalAmount) / 1e9).toFixed(
                        2
                      )}{" "}
                      <span className="text-lg text-gray-600">MAS</span>
                    </div>
                  </div>

                  {/* Bull Amount */}
                  <div className="bg-gradient-to-br from-green-100 to-green-50 border-3 border-ink-950 rounded-2xl p-5 shadow-brut hover:translate-y-[-4px] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        🐂 Bull Position
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {(Number(currentRoundDetails.bullAmount) / 1e9).toFixed(
                        2
                      )}{" "}
                      <span className="text-lg">MAS</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {currentRoundDetails.totalAmount > 0n
                        ? (
                            (Number(currentRoundDetails.bullAmount) /
                              Number(currentRoundDetails.totalAmount)) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                      % of pool
                    </div>
                  </div>

                  {/* Bear Amount */}
                  <div className="bg-gradient-to-br from-red-100 to-red-50 border-3 border-ink-950 rounded-2xl p-5 shadow-brut hover:translate-y-[-4px] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        🐻 Bear Position
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-red-700">
                      {(Number(currentRoundDetails.bearAmount) / 1e9).toFixed(
                        2
                      )}{" "}
                      <span className="text-lg">MAS</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {currentRoundDetails.totalAmount > 0n
                        ? (
                            (Number(currentRoundDetails.bearAmount) /
                              Number(currentRoundDetails.totalAmount)) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                      % of pool
                    </div>
                  </div>
                </div>

                {/* Visual Pool Distribution */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Pool Distribution
                    </span>
                  </div>
                  <div className="h-8 flex rounded-xl overflow-hidden border-3 border-ink-950 shadow-brut">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-center text-white font-bold text-sm transition-all duration-500"
                      style={{
                        width:
                          currentRoundDetails.totalAmount > 0n
                            ? `${
                                (Number(currentRoundDetails.bullAmount) /
                                  Number(currentRoundDetails.totalAmount)) *
                                100
                              }%`
                            : "50%",
                      }}
                    >
                      {currentRoundDetails.totalAmount > 0n &&
                        Number(currentRoundDetails.bullAmount) > 0 && (
                          <span>
                            🐂{" "}
                            {(
                              (Number(currentRoundDetails.bullAmount) /
                                Number(currentRoundDetails.totalAmount)) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        )}
                    </div>
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-400 flex items-center justify-center text-white font-bold text-sm transition-all duration-500"
                      style={{
                        width:
                          currentRoundDetails.totalAmount > 0n
                            ? `${
                                (Number(currentRoundDetails.bearAmount) /
                                  Number(currentRoundDetails.totalAmount)) *
                                100
                              }%`
                            : "50%",
                      }}
                    >
                      {currentRoundDetails.totalAmount > 0n &&
                        Number(currentRoundDetails.bearAmount) > 0 && (
                          <span>
                            🐻{" "}
                            {(
                              (Number(currentRoundDetails.bearAmount) /
                                Number(currentRoundDetails.totalAmount)) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                {/* Price Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white border-3 border-ink-950 rounded-2xl p-5">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      🔒 Lock Price
                    </div>
                    <div className="text-xl font-bold text-ink-950">
                      {currentRoundDetails.lockPrice > 0n
                        ? `$${(Number(currentRoundDetails.lockPrice) / 1e8).toFixed(5)}`
                        : "Not Set"}
                    </div>
                  </div>

                  <div className="bg-white border-3 border-ink-950 rounded-2xl p-5">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      ✅ Close Price
                    </div>
                    <div className="text-xl font-bold text-ink-950">
                      {currentRoundDetails.closePrice > 0n
                        ? `$${(Number(currentRoundDetails.closePrice) / 1e8).toFixed(5)}`
                        : "Not Set"}
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="text-xs font-medium text-blue-700 mb-1">
                      ⏰ Start Time
                    </div>
                    <div className="text-sm font-semibold text-ink-950">
                      {currentRoundDetails.startTimestamp > 0n
                        ? new Date(
                            Number(currentRoundDetails.startTimestamp)
                          ).toLocaleString()
                        : "Not Started"}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <div className="text-xs font-medium text-yellow-700 mb-1">
                      🔐 Lock Time
                    </div>
                    <div className="text-sm font-semibold text-ink-950">
                      {currentRoundDetails.lockTimestamp > 0n
                        ? new Date(
                            Number(currentRoundDetails.lockTimestamp)
                          ).toLocaleString()
                        : "Not Locked"}
                    </div>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                    <div className="text-xs font-medium text-purple-700 mb-1">
                      🏁 Close Time
                    </div>
                    <div className="text-sm font-semibold text-ink-950">
                      {currentRoundDetails.closeTimestamp > 0n
                        ? new Date(
                            Number(currentRoundDetails.closeTimestamp)
                          ).toLocaleString()
                        : "Not Closed"}
                    </div>
                  </div>
                </div>

                {/* Reward Information */}
                {(currentRoundDetails.rewardAmount > 0n ||
                  currentRoundDetails.rewardBaseCalAmount > 0n) && (
                  <div className="mt-6 bg-gradient-to-r from-yellow-100 to-amber-100 border-3 border-ink-950 rounded-2xl p-5">
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      🏆 Reward Information
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-600">
                          Reward Amount
                        </div>
                        <div className="text-lg font-bold text-amber-700">
                          {(
                            Number(currentRoundDetails.rewardAmount) / 1e9
                          ).toFixed(2)}{" "}
                          MAS
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">
                          Base Calculation Amount
                        </div>
                        <div className="text-lg font-bold text-amber-700">
                          {(
                            Number(currentRoundDetails.rewardBaseCalAmount) /
                            1e9
                          ).toFixed(2)}{" "}
                          MAS
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Genesis Controls Section */}
        <div className="mt-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="brut-card bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl border-3 border-ink-950 flex items-center justify-center text-2xl shadow-brut">
                  🎮
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-ink-950">
                    Genesis Controls
                  </h2>
                  <p className="text-sm text-gray-600">
                    Initialize and manage the prediction market
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-3 border-ink-950 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 font-medium">
                      Loading status...
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Status Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Genesis Started Status */}
                    <div
                      className={`relative overflow-hidden border-3 border-ink-950 rounded-2xl p-5 transition-all duration-300 ${
                        genesisStarted
                          ? "bg-gradient-to-br from-green-100 to-emerald-50 shadow-brut"
                          : "bg-white shadow-brut"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {genesisStarted ? "✅" : "⏸️"}
                          </span>
                          <span className="font-bold text-ink-950">
                            Genesis Started
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                            genesisStarted
                              ? "bg-green-500 text-white border-green-700"
                              : "bg-gray-200 text-gray-700 border-gray-400"
                          }`}
                        >
                          {genesisStarted ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                      {/* Decorative corner */}
                      {genesisStarted && (
                        <div className="absolute -top-8 -right-8 w-24 h-24 bg-green-400 opacity-20 rounded-full blur-2xl"></div>
                      )}
                    </div>

                    {/* Genesis Locked Status */}
                    <div
                      className={`relative overflow-hidden border-3 border-ink-950 rounded-2xl p-5 transition-all duration-300 ${
                        genesisLocked
                          ? "bg-gradient-to-br from-amber-100 to-yellow-50 shadow-brut"
                          : "bg-white shadow-brut"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {genesisLocked ? "🔒" : "🔓"}
                          </span>
                          <span className="font-bold text-ink-950">
                            Genesis Locked
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                            genesisLocked
                              ? "bg-amber-500 text-white border-amber-700"
                              : "bg-gray-200 text-gray-700 border-gray-400"
                          }`}
                        >
                          {genesisLocked ? "LOCKED" : "UNLOCKED"}
                        </span>
                      </div>
                      {/* Decorative corner */}
                      {genesisLocked && (
                        <div className="absolute -top-8 -right-8 w-24 h-24 bg-amber-400 opacity-20 rounded-full blur-2xl"></div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Start Genesis Button */}
                    <button
                      onClick={handleStartGenesisRound}
                      disabled={isGenesisStartedLoading || genesisStarted}
                      className={`brut-btn relative overflow-hidden group ${
                        genesisStarted
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                      } disabled:opacity-60 disabled:cursor-not-allowed disabled:active:translate-y-0`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isGenesisStartedLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Starting...</span>
                          </>
                        ) : genesisStarted ? (
                          <>
                            <span>✓</span>
                            <span>Already Started</span>
                          </>
                        ) : (
                          <>
                            <span>🚀</span>
                            <span>Start Genesis Round</span>
                          </>
                        )}
                      </span>
                      {!genesisStarted && !isGenesisStartedLoading && (
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      )}
                    </button>

                    {/* Lock Genesis Button */}
                    <button
                      onClick={handleLockGenesisRound}
                      disabled={isGenesisLockedLoading || genesisLocked}
                      className={`brut-btn relative overflow-hidden group ${
                        genesisLocked
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-black"
                      } disabled:opacity-60 disabled:cursor-not-allowed disabled:active:translate-y-0`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isGenesisLockedLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Locking...</span>
                          </>
                        ) : genesisLocked ? (
                          <>
                            <span>✓</span>
                            <span>Already Locked</span>
                          </>
                        ) : (
                          <>
                            <span>🔐</span>
                            <span>Lock Genesis Round</span>
                          </>
                        )}
                      </span>
                      {!genesisLocked && !isGenesisLockedLoading && (
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      )}
                    </button>
                  </div>

                  {/* Info Banner */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">ℹ️</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Genesis Round Setup
                        </p>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          Start the genesis round to initialize the prediction
                          market, then lock it to begin accepting predictions.
                          These actions are required before the market can
                          operate.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
