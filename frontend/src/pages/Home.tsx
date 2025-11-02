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
import BetModal from "../components/BetModal";
import { toast } from "react-toastify";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Wallet,
  Clock,
} from "lucide-react";
import { Round } from "../lib/types";

function Home() {
  const { connectedAccount } = useAccountStore();
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [rounds, setRounds] = useState<RoundCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenesisReady, setIsGenesisReady] = useState(false);
  const [historicalRoundsCount, setHistoricalRoundsCount] = useState<number>(5);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position>(
    Position.Bull
  );
  const [selectedEpoch, setSelectedEpoch] = useState<bigint>(0n);

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

      // Fetch historical rounds (EXPIRED/CALCULATING) - fetch in parallel
      const historicalPromises = [];

      for (let i = historicalRoundsCount; i >= 1; i--) {
        const historicalEpoch = epoch - i;
        if (historicalEpoch > 0) {
          historicalPromises.push(
            getRoundDetails(BigInt(historicalEpoch), connectedAccount)
              .then((round) => {
                // Round immediately before current (epoch - 1) is CALCULATING
                // All older rounds are EXPIRED
                const status =
                  historicalEpoch === epoch - 1
                    ? RoundStatus.CALCULATING
                    : RoundStatus.EXPIRED;

                return {
                  round,
                  status,
                  epoch: BigInt(historicalEpoch),
                };
              })
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

      // Fetch next round (or create placeholder)
      let nextRoundData: RoundCardData | null = null;
      if (epoch >= 0) {
        try {
          const nextRound = await getRoundDetails(
            BigInt(epoch + 1),
            connectedAccount
          );
          nextRoundData = {
            round: nextRound,
            status: RoundStatus.NEXT,
            epoch: BigInt(epoch + 1),
          };
          roundsData.push(nextRoundData);
        } catch (error) {
          console.log("⚠️ NEXT round doesn't exist yet, creating placeholder");
          // Create placeholder NEXT round based on current round
          const currentRoundData = roundsData.find(r => r.status === RoundStatus.LIVE);
          if (currentRoundData && currentRoundData.round.lockTimestamp > 0n) {
            const roundDuration = Number(currentRoundData.round.lockTimestamp - currentRoundData.round.startTimestamp);
            const nextStartTime = currentRoundData.round.lockTimestamp;
            
            const nextRound = new Round(
              BigInt(epoch + 1),
              nextStartTime,
              nextStartTime + BigInt(roundDuration),
              nextStartTime + BigInt(roundDuration * 2),
              0n, 0n, 0n, 0n, 0n, 0n, 0n
            );
            
            nextRoundData = {
              round: nextRound,
              status: RoundStatus.NEXT,
              epoch: BigInt(epoch + 1),
            };
            roundsData.push(nextRoundData);
            console.log("✅ Created NEXT placeholder round");
          }
        }
      }

      // Create a placeholder LATER round for UX (epoch + 2)
      if (epoch >= 0 && nextRoundData) {
        console.log("🔍 Creating LATER round from NEXT round data...");
        
        try {
          // Calculate when the LATER round would start (after NEXT round completes)
          const nextRoundDuration = Number(nextRoundData.round.lockTimestamp - nextRoundData.round.startTimestamp);
          const laterStartTime = nextRoundData.round.lockTimestamp + BigInt(nextRoundDuration);
          
          console.log("⏱️ LATER round timing:", {
            nextRoundDuration,
            laterStartTime: laterStartTime.toString(),
          });
          
          // Create a mock Round instance for display purposes
          const laterRound = new Round(
            BigInt(epoch + 2), // epoch
            laterStartTime, // startTimestamp
            laterStartTime + BigInt(nextRoundDuration), // lockTimestamp
            laterStartTime + BigInt(nextRoundDuration * 2), // closeTimestamp
            0n, // lockPrice
            0n, // closePrice
            0n, // totalAmount
            0n, // bullAmount
            0n, // bearAmount
            0n, // rewardBaseCalAmount
            0n  // rewardAmount
          );
          
          roundsData.push({
            round: laterRound,
            status: RoundStatus.LATER,
            epoch: BigInt(epoch + 2),
          });
          
          console.log("✅ LATER round created! Total rounds:", roundsData.length);
        } catch (error) {
          console.error("❌ Error creating LATER placeholder:", error);
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
    const interval = setInterval(fetchRounds, 30000); // Refresh every 30 seconds
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

    // Open modal instead of betting directly
    setSelectedPosition(position);
    setSelectedEpoch(epoch);
    setIsBetModalOpen(true);
  };

  const handleConfirmBet = async (betAmount: string) => {
    if (!connectedAccount) {
      return;
    }

    if (!betAmount || isNaN(Number(betAmount)) || Number(betAmount) < 100) {
      toast.error("Please enter a valid bet amount of at least 100 MAS.");
      return;
    }

    try {
      const amount = parseMas(betAmount);
      let result;

      if (selectedPosition === Position.Bull) {
        result = await betBull(connectedAccount, selectedEpoch, amount);
      } else {
        result = await betBear(connectedAccount, selectedEpoch, amount);
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
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Prediction Markets
          </h2>
          <p className="text-gray-300">
            Trade on MAS price predictions and earn rewards
          </p>
        </div>

        {!connectedAccount ? (
          <div className="max-w-2xl mx-auto">
            <div className="brut-card p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-300 mb-8">
                Connect your Massa wallet to start predicting and earning
                rewards!
              </p>
            </div>
          </div>
        ) : !isGenesisReady ? (
          <div className="max-w-2xl mx-auto">
            <div className="brut-card p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Market Not Started
              </h2>
              <p className="text-gray-300 mb-4">
                The prediction market hasn't been initialized yet.
              </p>
              <p className="text-sm text-gray-400">
                Please contact the admin to start the genesis rounds.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Rounds Container - Horizontal Scroll */}
            <div className="relative max-w-full py-10">
              <div
                ref={scrollContainerRef}
                className="overflow-x-auto pb-4 scrollbar-hide"
              >
                <div className="flex items-stretch gap-6 px-4 min-w-max">
                  {loading && rounds.length === 0 ? (
                    // Only show skeleton if we have NO rounds yet (initial load)
                    <>
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-[300px] flex-shrink-0 brut-card p-4 animate-pulse"
                        >
                          <div className="h-8 bg-white/10 rounded-full w-20 mb-4"></div>
                          <div className="h-6 bg-white/10 rounded w-24 mb-2"></div>
                          <div className="h-8 bg-white/10 rounded w-32 mb-4"></div>
                          <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
                          <div className="h-20 bg-white/10 rounded w-full mb-4"></div>
                          <div className="h-10 bg-white/10 rounded w-full mb-2"></div>
                          <div className="h-10 bg-white/10 rounded w-full"></div>
                        </div>
                      ))}
                    </>
                  ) : (
                    // Always show rounds if we have them, even while loading
                    rounds.map((roundData) => (
                      <div
                        key={roundData.epoch.toString()}
                        className="w-[300px] flex-shrink-0 min-h-full"
                        id={`round-${roundData.epoch.toString()}`}
                      >
                        <RoundCard
                          roundData={roundData}
                          onBet={handleBet}
                          formatMas={formatMas}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Navigation Buttons - Always show if we have rounds */}
              {rounds.length > 2 && (
                <>
                  <button
                    onClick={scrollLeft}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 hover:bg-muted absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-4 h-12 w-12 rounded-full shadow-xl bg-card border-purple-light/30 hover:border-purple-light/60"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={scrollRight}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 hover:bg-muted absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-4 h-12 w-12 rounded-full shadow-xl bg-card border-purple-light/30 hover:border-purple-light/60"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Scroll Indicator */}
              {rounds.length > 3 && (
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    <span>Scroll to see more rounds</span>
                    <ChevronRight className="h-4 w-4" />
                  </p>
                </div>
              )}

              {/* Round Counter and Load More */}
              <div className="text-center mt-4 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Showing {rounds.length} round{rounds.length !== 1 ? "s" : ""}
                </p>

                {/* Load More Button */}
                {currentEpoch > 0 &&
                  historicalRoundsCount < 20 &&
                  historicalRoundsCount < currentEpoch && (
                    <button
                      onClick={loadMoreRounds}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-white hover:bg-purple-50 text-purple-600 border-2 border-purple-light/30 hover:border-purple-light/60 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>
                        Load More History (
                        {Math.min(5, currentEpoch - historicalRoundsCount)} more
                        rounds)
                      </span>
                    </button>
                  )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Bet Modal */}
      <BetModal
        isOpen={isBetModalOpen}
        onClose={() => setIsBetModalOpen(false)}
        onConfirm={handleConfirmBet}
        position={selectedPosition}
        epoch={selectedEpoch}
      />
    </div>
  );
}

export default Home;
