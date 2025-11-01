import { useEffect, useState, useRef } from "react";
import { useAccountStore } from "@massalabs/react-ui-kit";
import {
  getCurrentEpoch,
  getRoundDetails,
  betBull,
  betBear,
  getIsGenesisStarted,
  getIsGenesisLocked,
} from "../lib/massa";
import { Position } from "../lib/types";
import { formatMas, parseMas } from "@massalabs/massa-web3";
import type { RoundCardData } from "../components/RoundCard";
import RoundCard, { RoundStatus } from "../components/RoundCard";

function Home() {
  const { connectedAccount } = useAccountStore();
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [rounds, setRounds] = useState<RoundCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState<string>("1");
  const [isGenesisReady, setIsGenesisReady] = useState(false);
  const [historicalRoundsCount, setHistoricalRoundsCount] = useState<number>(5);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchRounds = async () => {
    if (!connectedAccount) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Check genesis status
      const isStarted = await getIsGenesisStarted(connectedAccount);
      const isLocked = await getIsGenesisLocked(connectedAccount);
      setIsGenesisReady(isStarted && isLocked);

      if (!isStarted || !isLocked) {
        setLoading(false);
        return;
      }

      const epoch = await getCurrentEpoch(connectedAccount);
      setCurrentEpoch(epoch);

      const roundsData: RoundCardData[] = [];

      // Fetch historical rounds (EXPIRED) - fetch in parallel
      const historicalPromises = [];

      for (let i = historicalRoundsCount; i >= 1; i--) {
        const historicalEpoch = epoch - i;
        if (historicalEpoch > 0) {
          historicalPromises.push(
            getRoundDetails(BigInt(historicalEpoch), connectedAccount)
              .then((round) => ({
                round,
                status: RoundStatus.EXPIRED,
                epoch: BigInt(historicalEpoch),
              }))
              .catch((error) => {
                console.error(
                  `Error fetching round ${historicalEpoch}:`,
                  error
                );
                return null;
              })
          );
        }
      }

      const historicalResults = await Promise.all(historicalPromises);
      roundsData.push(
        ...(historicalResults.filter((r) => r !== null) as RoundCardData[])
      );

      // Fetch current round (LIVE)
      if (epoch > 0) {
        try {
          const currentRound = await getRoundDetails(
            BigInt(epoch),
            connectedAccount
          );
          roundsData.push({
            round: currentRound,
            status: RoundStatus.LIVE,
            epoch: BigInt(epoch),
          });
        } catch (error) {
          console.error("Error fetching current round:", error);
        }
      }

      // Fetch next round
      if (epoch >= 0) {
        try {
          const nextRound = await getRoundDetails(
            BigInt(epoch + 1),
            connectedAccount
          );
          roundsData.push({
            round: nextRound,
            status: RoundStatus.NEXT,
            epoch: BigInt(epoch + 1),
          });
        } catch (error) {
          console.error("Error fetching next round:", error);
        }
      }

      setRounds(roundsData);
    } catch (error) {
      console.error("Error fetching rounds:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
    const interval = setInterval(fetchRounds, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [connectedAccount, historicalRoundsCount]);

  // Auto-scroll to live round when rounds are loaded
  useEffect(() => {
    if (rounds.length > 0 && scrollContainerRef.current) {
      const liveRoundIndex = rounds.findIndex(
        (r) => r.status === RoundStatus.LIVE
      );
      if (liveRoundIndex !== -1) {
        const cardWidth = 380 + 24; // card width + gap
        const scrollPosition =
          liveRoundIndex * cardWidth -
          (scrollContainerRef.current.clientWidth / 2 - cardWidth / 2);
        scrollContainerRef.current.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: "smooth",
        });
      }
    }
  }, [rounds]);

  const handleBet = async (position: Position, epoch: bigint) => {
    if (!connectedAccount) {
      return;
    }

    try {
      const amount = parseMas(betAmount);
      let result;

      if (position === Position.Bull) {
        result = await betBull(connectedAccount, epoch, amount);
      } else {
        result = await betBear(connectedAccount, epoch, amount);
      }

      if (result.success) {
        // Refresh rounds after successful bet
        await fetchRounds();
      }
    } catch (error) {
      console.error("Error placing bet:", error);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: "smooth",
      });
    }
  };

  const loadMoreRounds = () => {
    setHistoricalRoundsCount((prev) => Math.min(prev + 5, 20)); // Load 5 more, max 20 historical rounds
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            🔮 Massa Prediction Market
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Predict MAS price movements and win rewards!
          </p>
          <p className="text-sm text-gray-500">
            Powered by Dusa DEX Price Feeds
          </p>
        </div>

        {!connectedAccount ? (
          <div className="max-w-2xl mx-auto">
            <div className="brut-card bg-white p-12 text-center">
              <div className="text-6xl mb-6">🔌</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 mb-8">
                Connect your Massa wallet to start predicting and earning
                rewards!
              </p>
              <div className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold">
                Use the wallet button in the header →
              </div>
            </div>
          </div>
        ) : !isGenesisReady ? (
          <div className="max-w-2xl mx-auto">
            <div className="brut-card bg-gradient-to-br from-yellow-50 to-orange-50 p-12 text-center">
              <div className="text-6xl mb-6">⏳</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Market Not Started
              </h2>
              <p className="text-gray-600 mb-4">
                The prediction market hasn't been initialized yet.
              </p>
              <p className="text-sm text-gray-500">
                Please contact the admin to start the genesis rounds.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading rounds...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Bet Amount Input */}
            <div className="max-w-md mx-auto mb-8">
              <div className="brut-card bg-white p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bet Amount (MAS)
                </label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="1"
                  step="0.1"
                  className="w-full px-4 py-3 border-3 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg font-semibold"
                  placeholder="Enter amount"
                />
                <p className="text-xs text-gray-500 mt-2">Minimum bet: 1 MAS</p>
              </div>
            </div>

            {/* Rounds Container - Horizontal Scroll */}
            <div className="relative max-w-full">
              {/* Navigation Buttons */}
              {rounds.length > 2 && (
                <>
                  <button
                    onClick={scrollLeft}
                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-white border-3 border-gray-800 rounded-full shadow-lg hover:bg-purple-50 transition-all hover:scale-110"
                    aria-label="Scroll left"
                  >
                    <span className="text-2xl">←</span>
                  </button>
                  <button
                    onClick={scrollRight}
                    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-white border-3 border-gray-800 rounded-full shadow-lg hover:bg-purple-50 transition-all hover:scale-110"
                    aria-label="Scroll right"
                  >
                    <span className="text-2xl">→</span>
                  </button>
                </>
              )}

              <div
                ref={scrollContainerRef}
                className="overflow-x-auto pb-4 scrollbar-hide"
              >
                <div className="flex items-stretch gap-6 px-4 min-w-max py-10">
                  {rounds.map((roundData) => (
                    <div
                      key={roundData.epoch.toString()}
                      className="w-[380px] flex-shrink-0 min-h-full"
                      id={`round-${roundData.epoch.toString()}`}
                    >
                      <RoundCard
                        roundData={roundData}
                        onBet={handleBet}
                        formatMas={formatMas}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Scroll Indicator */}
              {rounds.length > 3 && (
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                    <span>←</span>
                    <span>Scroll to see more rounds</span>
                    <span>→</span>
                  </p>
                </div>
              )}

              {/* Round Counter and Load More */}
              <div className="text-center mt-4 space-y-3">
                <p className="text-xs text-gray-400">
                  Showing {rounds.length} round{rounds.length !== 1 ? "s" : ""}
                </p>

                {/* Load More Button */}
                {currentEpoch > 0 &&
                  historicalRoundsCount < 20 &&
                  historicalRoundsCount < currentEpoch && (
                    <button
                      onClick={loadMoreRounds}
                      disabled={loading}
                      className="brut-btn bg-white hover:bg-purple-50 text-purple-600 border-purple-500 px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      📜 Load More History (
                      {Math.min(5, currentEpoch - historicalRoundsCount)} more
                      rounds)
                    </button>
                  )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Home;
