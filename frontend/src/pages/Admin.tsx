import { useEffect, useState, useRef } from "react";
import { ADMIN_ADDRESS } from "../lib/const";
import { formatPrice, shortenAddress } from "../lib/utils";
import { useAccountStore } from "@massalabs/react-ui-kit";
import {
  genesisLockRound,
  genesisStartRound,
  getCurrentEpoch,
  getIsGenesisLocked,
  getIsGenesisStarted,
  getRoundDetails,
  executeRound,
} from "../lib/massa";
import type { Round } from "../lib/types";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Lock,
  CheckCircle,
  Clock,
  Flag,
  Award,
  Zap,
  FileText,
  RefreshCw,
  Play,
  Pause,
} from "lucide-react";

// Auto-refresh interval in milliseconds (default: 30 seconds)
const AUTO_REFRESH_INTERVAL = 30000;

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [isCurrentEpochLoading, setIsCurrentEpochLoading] = useState(true);
  const [genesisStarted, setGenesisStarted] = useState(false);
  const [genesisLocked, setGenesisLocked] = useState(false);
  const [isGenesisStartedLoading, setIsGenesisStartedLoading] = useState(false);
  const [isGenesisLockedLoading, setIsGenesisLockedLoading] = useState(false);
  const [isExecuteRoundLoading, setIsExecuteRoundLoading] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null);
  const [currentRoundDetails, setCurrentRoundDetails] = useState<Round | null>(
    null
  );
  const [prevRoundDetails, setPrevRoundDetails] = useState<Round | null>(null);
  const [prev2RoundDetails, setPrev2RoundDetails] = useState<Round | null>(
    null
  );
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
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

    // Fetch current round details
    const roundDetails = await getRoundDetails(
      BigInt(currentEpoch),
      connectedAccount!
    );

    console.log("Fetched current round details:", roundDetails);
    setCurrentRoundDetails(roundDetails);

    // Fetch previous round details if available
    if (currentEpoch > 1) {
      try {
        const prevRound = await getRoundDetails(
          BigInt(currentEpoch - 1),
          connectedAccount!
        );
        console.log("Fetched previous round details:", prevRound);
        setPrevRoundDetails(prevRound);
      } catch (error) {
        console.error("Error fetching previous round:", error);
        setPrevRoundDetails(null);
      }
    } else {
      setPrevRoundDetails(null);
    }

    // Fetch current - 2 round details if available
    if (currentEpoch > 2) {
      try {
        const prev2Round = await getRoundDetails(
          BigInt(currentEpoch - 2),
          connectedAccount!
        );
        console.log("Fetched current - 2 round details:", prev2Round);
        setPrev2RoundDetails(prev2Round);
      } catch (error) {
        console.error("Error fetching current - 2 round:", error);
        setPrev2RoundDetails(null);
      }
    } else {
      setPrev2RoundDetails(null);
    }

    setIsCurrentEpochLoading(false);
  };

  const refreshStatus = async () => {
    await fetchGenesisStatus();
    await fetchCurrentEpoch();
    setLastRefreshTime(new Date());
  };

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Initial fetch when account changes
  useEffect(() => {
    refreshStatus();
  }, [connectedAccount]);

  // Auto-refresh mechanism
  useEffect(() => {
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up new interval if auto-refresh is enabled and account is connected
    if (autoRefreshEnabled && connectedAccount) {
      refreshIntervalRef.current = setInterval(() => {
        console.log("Auto-refreshing admin data...");
        refreshStatus();
      }, AUTO_REFRESH_INTERVAL);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefreshEnabled, connectedAccount]);

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled((prev) => !prev);
  };

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

  const handleExecuteRound = async () => {
    if (!connectedAccount) {
      return;
    }

    setIsExecuteRoundLoading(true);

    try {
      const result = await executeRound(connectedAccount);

      if (result.success) {
        await refreshStatus();
      }
    } catch (error) {
      console.error("Error executing round:", error);
    } finally {
      setIsExecuteRoundLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        <div className="brut-card bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-6 mb-8">
          <h1 className="text-3xl font-bold text-foreground text-center">
            Current Admin Address:{" "}
            <span className="text-purple-400 break-all font-mono-numbers">
              {shortenAddress(ADMIN_ADDRESS)}
            </span>
          </h1>

          <div className="mt-6 text-center">
            <h2 className="text-xl font-semibold text-muted-foreground">
              Current Round:{" "}
              <span className="text-2xl text-purple-400 font-bold font-mono-numbers">
                {isCurrentEpochLoading ? "Loading..." : currentEpoch}
              </span>
            </h2>
          </div>
        </div>

        {/* Auto-Refresh Control Panel */}
        <div className="px-4">
          <div className="max-w-6xl mx-auto">
            <div className="brut-card bg-gradient-to-r from-emerald-500/10 to-green-500/10 p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        autoRefreshEnabled
                          ? "bg-green-500 animate-pulse"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <span className="text-sm font-semibold text-foreground">
                      Auto-Refresh
                    </span>
                  </div>
                  {lastRefreshTime && (
                    <span className="text-xs text-muted-foreground">
                      Last updated: {lastRefreshTime.toLocaleTimeString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={refreshStatus}
                    disabled={loading || isCurrentEpochLoading}
                    className="brut-btn bg-white/10 hover:bg-white/20 text-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <RefreshCw
                      className={
                        loading || isCurrentEpochLoading
                          ? "animate-spin h-4 w-4"
                          : "h-4 w-4"
                      }
                    />
                    <span>Refresh Now</span>
                  </button>

                  <button
                    onClick={toggleAutoRefresh}
                    className={`brut-btn flex items-center gap-2 ${
                      autoRefreshEnabled
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gray-500/20 hover:bg-gray-500/30 text-muted-foreground"
                    }`}
                  >
                    {autoRefreshEnabled ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    <span>
                      {autoRefreshEnabled ? "Pause" : "Resume"} Auto-Refresh
                    </span>
                  </button>
                </div>
              </div>

              {autoRefreshEnabled && (
                <div className="mt-3 text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                  <Clock className="w-3 h-3" />
                  Data refreshes automatically every{" "}
                  {AUTO_REFRESH_INTERVAL / 1000} seconds
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Round Details Section */}
        {currentRoundDetails && !isCurrentEpochLoading && (
          <div className="mt-8 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="brut-card bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-green-400" />
                    <h2 className="text-2xl font-bold text-foreground">
                      Current Round #{currentRoundDetails.epoch.toString()}
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-green-300">
                        LIVE
                      </span>
                    </div>
                  </div>

                  {/* Execute Round Button */}
                  <button
                    onClick={handleExecuteRound}
                    disabled={isExecuteRoundLoading}
                    className="brut-btn relative overflow-hidden group bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:translate-y-0 whitespace-nowrap"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isExecuteRoundLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Executing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          <span>Execute Round</span>
                        </>
                      )}
                    </span>
                    {!isExecuteRoundLoading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Total Pool */}
                  <div className="brut-card bg-white/5 p-5 hover:translate-y-[-4px] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Total Pool</span>
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground font-mono-numbers">
                      {(Number(currentRoundDetails.totalAmount) / 1e9).toFixed(
                        2
                      )}{" "}
                      <span className="text-lg text-muted-foreground">MAS</span>
                    </div>
                  </div>

                  {/* Bull Amount */}
                  <div className="brut-card bg-green-500/10 p-5 hover:translate-y-[-4px] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-300 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Bull Position</span>
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-400 font-mono-numbers">
                      {(Number(currentRoundDetails.bullAmount) / 1e9).toFixed(
                        2
                      )}{" "}
                      <span className="text-lg">MAS</span>
                    </div>
                    <div className="text-xs text-green-300/70 mt-1">
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
                  <div className="brut-card bg-pink-500/10 p-5 hover:translate-y-[-4px] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-pink-300 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        <span>Bear Position</span>
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-pink-400 font-mono-numbers">
                      {(Number(currentRoundDetails.bearAmount) / 1e9).toFixed(
                        2
                      )}{" "}
                      <span className="text-lg">MAS</span>
                    </div>
                    <div className="text-xs text-pink-300/70 mt-1">
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
                    <span className="text-sm font-semibold text-muted-foreground">
                      Pool Distribution
                    </span>
                  </div>
                  <div className="h-8 flex rounded-xl overflow-hidden brut-card">
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
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
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
                      className="bg-gradient-to-r from-pink-500 to-pink-400 flex items-center justify-center text-white font-bold text-sm transition-all duration-500"
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
                          <span className="flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" />
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
                  <div className="brut-card bg-white/5 p-5">
                    <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Lock Price</span>
                    </div>
                    <div className="text-xl font-bold text-foreground font-mono-numbers">
                      {currentRoundDetails.lockPrice > 0n
                        ? `$${formatPrice(currentRoundDetails.lockPrice, 5)}`
                        : "Not Set"}
                    </div>
                  </div>

                  <div className="brut-card bg-white/5 p-5">
                    <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Close Price</span>
                    </div>
                    <div className="text-xl font-bold text-foreground font-mono-numbers">
                      {currentRoundDetails.closePrice > 0n
                        ? `$${formatPrice(currentRoundDetails.closePrice, 5)}`
                        : "Not Set"}
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="brut-card bg-blue-500/10 p-4">
                    <div className="text-xs font-medium text-blue-300 mb-1 flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>Start Time</span>
                    </div>
                    <div className="text-sm font-semibold text-blue-200 font-mono-numbers">
                      {currentRoundDetails.startTimestamp > 0n
                        ? new Date(
                            Number(currentRoundDetails.startTimestamp)
                          ).toLocaleString()
                        : "Not Started"}
                    </div>
                  </div>

                  <div className="brut-card bg-yellow-500/10 p-4">
                    <div className="text-xs font-medium text-yellow-300 mb-1 flex items-center gap-2">
                      <Lock className="h-3 w-3" />
                      <span>Lock Time</span>
                    </div>
                    <div className="text-sm font-semibold text-yellow-200 font-mono-numbers">
                      {currentRoundDetails.lockTimestamp > 0n
                        ? new Date(
                            Number(currentRoundDetails.lockTimestamp)
                          ).toLocaleString()
                        : "Not Locked"}
                    </div>
                  </div>

                  <div className="brut-card bg-purple-500/10 p-4">
                    <div className="text-xs font-medium text-purple-300 mb-1 flex items-center gap-2">
                      <Flag className="h-3 w-3" />
                      <span>Close Time</span>
                    </div>
                    <div className="text-sm font-semibold text-purple-200 font-mono-numbers">
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
                  <div className="mt-6 brut-card bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-5">
                    <div className="text-sm font-medium text-amber-300 mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>Reward Information</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Reward Amount
                        </div>
                        <div className="text-lg font-bold text-amber-400 font-mono-numbers">
                          {(
                            Number(currentRoundDetails.rewardAmount) / 1e9
                          ).toFixed(2)}{" "}
                          MAS
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Base Calculation Amount
                        </div>
                        <div className="text-lg font-bold text-amber-400 font-mono-numbers">
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

        {/* Previous Round Details Section */}
        {prevRoundDetails && !isCurrentEpochLoading && (
          <div className="mt-8 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="brut-card bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold text-foreground">
                      Previous Round #{prevRoundDetails.epoch.toString()}
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-muted-foreground">
                        CALCULATING
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Total Pool */}
                  <div className="brut-card bg-white/5 p-5  hover:translate-y-[-4px] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Total Pool</span>
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {(Number(prevRoundDetails.totalAmount) / 1e9).toFixed(2)}{" "}
                      <span className="text-lg text-muted-foreground">MAS</span>
                    </div>
                  </div>

                  {/* Bull Amount */}
                  <div className="brut-card bg-green-500/10 p-5  hover:translate-y-[-4px] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-300" />
                        <span>Bull Position</span>
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      {(Number(prevRoundDetails.bullAmount) / 1e9).toFixed(2)}{" "}
                      <span className="text-lg">MAS</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {prevRoundDetails.totalAmount > 0n
                        ? (
                            (Number(prevRoundDetails.bullAmount) /
                              Number(prevRoundDetails.totalAmount)) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                      % of pool
                    </div>
                  </div>

                  {/* Bear Amount */}
                  <div className="brut-card bg-pink-500/10 p-5  hover:translate-y-[-4px] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-pink-300" />
                        <span>Bear Position</span>
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-pink-400">
                      {(Number(prevRoundDetails.bearAmount) / 1e9).toFixed(2)}{" "}
                      <span className="text-lg">MAS</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {prevRoundDetails.totalAmount > 0n
                        ? (
                            (Number(prevRoundDetails.bearAmount) /
                              Number(prevRoundDetails.totalAmount)) *
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
                    <span className="text-sm font-semibold text-muted-foreground">
                      Pool Distribution
                    </span>
                  </div>
                  <div className="h-8 flex rounded-xl overflow-hidden brut-card">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-center text-white font-bold text-sm transition-all duration-500"
                      style={{
                        width:
                          prevRoundDetails.totalAmount > 0n
                            ? `${
                                (Number(prevRoundDetails.bullAmount) /
                                  Number(prevRoundDetails.totalAmount)) *
                                100
                              }%`
                            : "50%",
                      }}
                    >
                      {prevRoundDetails.totalAmount > 0n &&
                        Number(prevRoundDetails.bullAmount) > 0 && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {(
                              (Number(prevRoundDetails.bullAmount) /
                                Number(prevRoundDetails.totalAmount)) *
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
                          prevRoundDetails.totalAmount > 0n
                            ? `${
                                (Number(prevRoundDetails.bearAmount) /
                                  Number(prevRoundDetails.totalAmount)) *
                                100
                              }%`
                            : "50%",
                      }}
                    >
                      {prevRoundDetails.totalAmount > 0n &&
                        Number(prevRoundDetails.bearAmount) > 0 && (
                          <span className="flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" />
                            {(
                              (Number(prevRoundDetails.bearAmount) /
                                Number(prevRoundDetails.totalAmount)) *
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
                  <div className="brut-card bg-white/5 p-5">
                    <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Lock Price</span>
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {prevRoundDetails.lockPrice > 0n
                        ? `$${formatPrice(prevRoundDetails.lockPrice, 5)}`
                        : "Not Set"}
                    </div>
                  </div>

                  <div className="brut-card bg-white/5 p-5">
                    <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Close Price</span>
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {prevRoundDetails.closePrice > 0n
                        ? `$${formatPrice(prevRoundDetails.closePrice, 5)}`
                        : "Not Set"}
                    </div>
                  </div>
                </div>

                {/* Winner Display */}
                {prevRoundDetails.closePrice > 0n &&
                  prevRoundDetails.lockPrice > 0n && (
                    <div className="mb-6 brut-card bg-white/5 p-5">
                      <div className="text-center">
                        <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center justify-center gap-2">
                          <Award className="h-4 w-4" />
                          <span>Winner</span>
                        </div>
                        <div
                          className={`text-2xl font-bold flex items-center justify-center gap-2 ${
                            prevRoundDetails.closePrice >
                            prevRoundDetails.lockPrice
                              ? "text-green-300"
                              : prevRoundDetails.closePrice <
                                prevRoundDetails.lockPrice
                              ? "text-pink-300"
                              : "text-muted-foreground"
                          }`}
                        >
                          {prevRoundDetails.closePrice >
                          prevRoundDetails.lockPrice ? (
                            <>
                              <TrendingUp className="h-6 w-6" />
                              <span>BULL</span>
                            </>
                          ) : prevRoundDetails.closePrice <
                            prevRoundDetails.lockPrice ? (
                            <>
                              <TrendingDown className="h-6 w-6" />
                              <span>BEAR</span>
                            </>
                          ) : (
                            <span>DRAW</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Price moved{" "}
                          {prevRoundDetails.closePrice >
                          prevRoundDetails.lockPrice
                            ? "up"
                            : prevRoundDetails.closePrice <
                              prevRoundDetails.lockPrice
                            ? "down"
                            : "stayed the same"}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="brut-card bg-blue-500/10 p-4">
                    <div className="text-xs font-medium text-blue-300 mb-1 flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>Start Time</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {prevRoundDetails.startTimestamp > 0n
                        ? new Date(
                            Number(prevRoundDetails.startTimestamp)
                          ).toLocaleString()
                        : "Not Started"}
                    </div>
                  </div>

                  <div className="brut-card bg-yellow-500/10 p-4">
                    <div className="text-xs font-medium text-yellow-300 mb-1 flex items-center gap-2">
                      <Lock className="h-3 w-3" />
                      <span>Lock Time</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {prevRoundDetails.lockTimestamp > 0n
                        ? new Date(
                            Number(prevRoundDetails.lockTimestamp)
                          ).toLocaleString()
                        : "Not Locked"}
                    </div>
                  </div>

                  <div className="brut-card bg-purple-500/10 p-4">
                    <div className="text-xs font-medium text-purple-300 mb-1 flex items-center gap-2">
                      <Flag className="h-3 w-3" />
                      <span>Close Time</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {prevRoundDetails.closeTimestamp > 0n
                        ? new Date(
                            Number(prevRoundDetails.closeTimestamp)
                          ).toLocaleString()
                        : "Not Closed"}
                    </div>
                  </div>
                </div>

                {/* Reward Information */}
                {(prevRoundDetails.rewardAmount > 0n ||
                  prevRoundDetails.rewardBaseCalAmount > 0n) && (
                  <div className="mt-6 brut-card bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-5">
                    <div className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>Reward Information</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Reward Amount
                        </div>
                        <div className="text-lg font-bold text-amber-400">
                          {(
                            Number(prevRoundDetails.rewardAmount) / 1e9
                          ).toFixed(2)}{" "}
                          MAS
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Base Calculation Amount
                        </div>
                        <div className="text-lg font-bold text-amber-400">
                          {(
                            Number(prevRoundDetails.rewardBaseCalAmount) / 1e9
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

        {/* Current - 2 Round Details Section */}
        {prev2RoundDetails && !isCurrentEpochLoading && (
          <div className="mt-8 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="brut-card bg-gradient-to-br from-slate-500/10 to-gray-500/10 p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Flag className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold text-foreground">
                      Round #{prev2RoundDetails.epoch.toString()}
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-muted-foreground">
                        EXPIRED
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Total Pool */}
                  <div className="brut-card bg-white/5 p-5  hover:translate-y-[-4px] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Total Pool</span>
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {(Number(prev2RoundDetails.totalAmount) / 1e9).toFixed(2)}{" "}
                      <span className="text-lg text-muted-foreground">MAS</span>
                    </div>
                  </div>

                  {/* Bull Amount */}
                  <div className="brut-card bg-green-500/10 p-5  hover:translate-y-[-4px] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-300" />
                        <span>Bull Position</span>
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      {(Number(prev2RoundDetails.bullAmount) / 1e9).toFixed(2)}{" "}
                      <span className="text-lg">MAS</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {prev2RoundDetails.totalAmount > 0n
                        ? (
                            (Number(prev2RoundDetails.bullAmount) /
                              Number(prev2RoundDetails.totalAmount)) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                      % of pool
                    </div>
                  </div>

                  {/* Bear Amount */}
                  <div className="brut-card bg-pink-500/10 p-5  hover:translate-y-[-4px] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-pink-300" />
                        <span>Bear Position</span>
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-pink-400">
                      {(Number(prev2RoundDetails.bearAmount) / 1e9).toFixed(2)}{" "}
                      <span className="text-lg">MAS</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {prev2RoundDetails.totalAmount > 0n
                        ? (
                            (Number(prev2RoundDetails.bearAmount) /
                              Number(prev2RoundDetails.totalAmount)) *
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
                    <span className="text-sm font-semibold text-muted-foreground">
                      Pool Distribution
                    </span>
                  </div>
                  <div className="h-8 flex rounded-xl overflow-hidden brut-card">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-center text-white font-bold text-sm transition-all duration-500"
                      style={{
                        width:
                          prev2RoundDetails.totalAmount > 0n
                            ? `${
                                (Number(prev2RoundDetails.bullAmount) /
                                  Number(prev2RoundDetails.totalAmount)) *
                                100
                              }%`
                            : "50%",
                      }}
                    >
                      {prev2RoundDetails.totalAmount > 0n &&
                        Number(prev2RoundDetails.bullAmount) > 0 && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {(
                              (Number(prev2RoundDetails.bullAmount) /
                                Number(prev2RoundDetails.totalAmount)) *
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
                          prev2RoundDetails.totalAmount > 0n
                            ? `${
                                (Number(prev2RoundDetails.bearAmount) /
                                  Number(prev2RoundDetails.totalAmount)) *
                                100
                              }%`
                            : "50%",
                      }}
                    >
                      {prev2RoundDetails.totalAmount > 0n &&
                        Number(prev2RoundDetails.bearAmount) > 0 && (
                          <span className="flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" />
                            {(
                              (Number(prev2RoundDetails.bearAmount) /
                                Number(prev2RoundDetails.totalAmount)) *
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
                  <div className="brut-card bg-white/5 p-5">
                    <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Lock Price</span>
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {prev2RoundDetails.lockPrice > 0n
                        ? `$${formatPrice(prev2RoundDetails.lockPrice, 5)}`
                        : "Not Set"}
                    </div>
                  </div>

                  <div className="brut-card bg-white/5 p-5">
                    <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Close Price</span>
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {prev2RoundDetails.closePrice > 0n
                        ? `$${formatPrice(prev2RoundDetails.closePrice, 5)}`
                        : "Not Set"}
                    </div>
                  </div>
                </div>

                {/* Winner Display */}
                {prev2RoundDetails.closePrice > 0n &&
                  prev2RoundDetails.lockPrice > 0n && (
                    <div className="mb-6 brut-card bg-white/5 p-5">
                      <div className="text-center">
                        <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center justify-center gap-2">
                          <Award className="h-4 w-4" />
                          <span>Winner</span>
                        </div>
                        <div
                          className={`text-2xl font-bold flex items-center justify-center gap-2 ${
                            prev2RoundDetails.closePrice >
                            prev2RoundDetails.lockPrice
                              ? "text-green-300"
                              : prev2RoundDetails.closePrice <
                                prev2RoundDetails.lockPrice
                              ? "text-pink-300"
                              : "text-muted-foreground"
                          }`}
                        >
                          {prev2RoundDetails.closePrice >
                          prev2RoundDetails.lockPrice ? (
                            <>
                              <TrendingUp className="h-6 w-6" />
                              <span>BULL</span>
                            </>
                          ) : prev2RoundDetails.closePrice <
                            prev2RoundDetails.lockPrice ? (
                            <>
                              <TrendingDown className="h-6 w-6" />
                              <span>BEAR</span>
                            </>
                          ) : (
                            <span>DRAW</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Price moved{" "}
                          {prev2RoundDetails.closePrice >
                          prev2RoundDetails.lockPrice
                            ? "up"
                            : prev2RoundDetails.closePrice <
                              prev2RoundDetails.lockPrice
                            ? "down"
                            : "stayed the same"}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="brut-card bg-blue-500/10 p-4">
                    <div className="text-xs font-medium text-blue-300 mb-1 flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>Start Time</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {prev2RoundDetails.startTimestamp > 0n
                        ? new Date(
                            Number(prev2RoundDetails.startTimestamp)
                          ).toLocaleString()
                        : "Not Started"}
                    </div>
                  </div>

                  <div className="brut-card bg-yellow-500/10 p-4">
                    <div className="text-xs font-medium text-yellow-300 mb-1 flex items-center gap-2">
                      <Lock className="h-3 w-3" />
                      <span>Lock Time</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {prev2RoundDetails.lockTimestamp > 0n
                        ? new Date(
                            Number(prev2RoundDetails.lockTimestamp)
                          ).toLocaleString()
                        : "Not Locked"}
                    </div>
                  </div>

                  <div className="brut-card bg-purple-500/10 p-4">
                    <div className="text-xs font-medium text-purple-300 mb-1 flex items-center gap-2">
                      <Flag className="h-3 w-3" />
                      <span>Close Time</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {prev2RoundDetails.closeTimestamp > 0n
                        ? new Date(
                            Number(prev2RoundDetails.closeTimestamp)
                          ).toLocaleString()
                        : "Not Closed"}
                    </div>
                  </div>
                </div>

                {/* Reward Information */}
                {(prev2RoundDetails.rewardAmount > 0n ||
                  prev2RoundDetails.rewardBaseCalAmount > 0n) && (
                  <div className="mt-6 brut-card bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-5">
                    <div className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>Reward Information</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Reward Amount
                        </div>
                        <div className="text-lg font-bold text-amber-400">
                          {(
                            Number(prev2RoundDetails.rewardAmount) / 1e9
                          ).toFixed(2)}{" "}
                          MAS
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Base Calculation Amount
                        </div>
                        <div className="text-lg font-bold text-amber-400">
                          {(
                            Number(prev2RoundDetails.rewardBaseCalAmount) / 1e9
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
            <div className="brut-card bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-indigo-500/10 p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl brut-card flex items-center justify-center text-2xl ">
                  🎮
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Genesis Controls
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Initialize and manage the prediction market
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 brut-card border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-muted-foreground font-medium">
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
                      className={`relative overflow-hidden brut-card rounded-2xl p-5 transition-all duration-300 ${
                        genesisStarted
                          ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 "
                          : "bg-white "
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {genesisStarted ? (
                            <CheckCircle className="h-6 w-6 text-green-300" />
                          ) : (
                            <Pause className="h-6 w-6 text-muted-foreground" />
                          )}
                          <span className="font-bold text-foreground">
                            Genesis Started
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                            genesisStarted
                              ? "bg-green-500 text-white border-green-700"
                              : "bg-gray-200 text-muted-foreground border-gray-400"
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
                      className={`relative overflow-hidden brut-card rounded-2xl p-5 transition-all duration-300 ${
                        genesisLocked
                          ? "bg-gradient-to-br from-amber-500/10 to-yellow-500/10 "
                          : "bg-white "
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Lock
                            className={`h-6 w-6 ${
                              genesisLocked
                                ? "text-yellow-600"
                                : "text-gray-400"
                            }`}
                          />
                          <span className="font-bold text-foreground">
                            Genesis Locked
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                            genesisLocked
                              ? "bg-amber-500 text-white border-amber-700"
                              : "bg-gray-200 text-muted-foreground border-gray-400"
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
                          ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
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
                            <CheckCircle className="h-4 w-4" />
                            <span>Already Started</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            <span>Start Genesis Round</span>
                          </>
                        )}
                      </span>
                      {!genesisStarted && !isGenesisStartedLoading && (
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      )}
                    </button>

                    {/* Lock Genesis Button */}
                    <button
                      onClick={handleLockGenesisRound}
                      disabled={isGenesisLockedLoading || genesisLocked}
                      className={`brut-btn relative overflow-hidden group ${
                        genesisLocked
                          ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:from-amber-600 hover:to-yellow-700"
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
                            <CheckCircle className="h-4 w-4" />
                            <span>Already Locked</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Lock Genesis Round</span>
                          </>
                        )}
                      </span>
                      {!genesisLocked && !isGenesisLockedLoading && (
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      )}
                    </button>
                  </div>

                  {/* Info Banner */}
                  <div className="brut-card bg-blue-500/10 p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-300 mb-1">
                          Genesis Round Setup
                        </p>
                        <p className="text-xs text-blue-200/70 leading-relaxed">
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
