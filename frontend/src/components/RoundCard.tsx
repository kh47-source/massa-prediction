import { useEffect, useState } from "react";
import { Round, Position } from "../lib/types";
import { calculatePayout, formatPrice, getTimeRemaining } from "../lib/utils";
import { Circle, TrendingUp, TrendingDown, Clock, Lock } from "lucide-react";

export enum RoundStatus {
  LIVE = "LIVE",
  NEXT = "NEXT",
  LATER = "LATER",
  EXPIRED = "EXPIRED",
  CALCULATING = "CALCULATING",
}

export interface RoundCardData {
  round: Round;
  status: RoundStatus;
  epoch: bigint;
}

export interface RoundCardProps {
  roundData: RoundCardData;
  onBet: (position: Position, epoch: bigint) => void;
  formatMas: (amount: bigint) => string;
}

export default function RoundCard({
  roundData,
  onBet,
  formatMas,
}: RoundCardProps) {
  const { round, status, epoch } = roundData;
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const updateTime = () => {
      if (status === RoundStatus.LIVE) {
        setTimeRemaining(getTimeRemaining(round.lockTimestamp));
      } else if (status === RoundStatus.NEXT) {
        setTimeRemaining(getTimeRemaining(round.startTimestamp));
      } else if (status === RoundStatus.LATER) {
        setTimeRemaining(getTimeRemaining(round.startTimestamp));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [round, status]);

  const getStatusBadgeClasses = () => {
    switch (status) {
      case RoundStatus.LIVE:
        return "bg-green-500 text-white border-green-500/30";
      case RoundStatus.NEXT:
        return "bg-blue-500 text-white border-blue-500/30";
      case RoundStatus.LATER:
        return "bg-purple-500 text-white border-purple-500/30";
      case RoundStatus.CALCULATING:
        return "bg-yellow-500 text-white border-yellow-500/30";
      case RoundStatus.EXPIRED:
        return "bg-gray-500 text-white border-gray-500/30";
      default:
        return "bg-gray-400 text-white border-gray-400/30";
    }
  };

  const bullPercentage =
    Number(round.totalAmount) > 0
      ? (Number(round.bullAmount) / Number(round.totalAmount)) * 100
      : 50;
  const bearPercentage = 100 - bullPercentage;

  const isLive = status === RoundStatus.LIVE;
  const isCalculating = status === RoundStatus.CALCULATING;
  const isExpired = status === RoundStatus.EXPIRED;
  const hasResult = round.closePrice > 0n;

  const winner =
    hasResult && round.closePrice > round.lockPrice
      ? "BULL"
      : hasResult && round.closePrice < round.lockPrice
      ? "BEAR"
      : "DRAW";

  return (
    <div className="brut-card p-4 h-full flex flex-col">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors border-2 ${getStatusBadgeClasses()}`}
        >
          <Circle
            className={`h-2 w-2 fill-current ${
              isLive || isCalculating ? "animate-pulse" : ""
            }`}
          />
          <span className="uppercase">{status}</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground font-medium">
            #{epoch.toString()}
          </div>
          {(isLive || status === RoundStatus.NEXT || status === RoundStatus.LATER) && (
            <div className="font-mono-numbers text-sm font-semibold text-pink-500 mt-0.5">
              {timeRemaining}
            </div>
          )}
        </div>
      </div>

      {/* Market Pair */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">MAS/USD</h3>
        <div className="space-y-1">
          <div className="font-mono-numbers font-bold text-foreground text-xl">
            ${round.lockPrice > 0n ? formatPrice(round.lockPrice, 5) : "0.0000"}
          </div>
        </div>
      </div>

      {/* Prize Pool */}
      <div className="mb-4 flex justify-between text-xs text-muted-foreground">
        <span>Prize Pool:</span>
        <span className="font-mono-numbers font-medium text-foreground">
          {formatMas(round.totalAmount)} MAS
        </span>
      </div>

      {/* Bull/Bear Distribution - Only show if there are bets */}
      {Number(round.totalAmount) > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-green-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  UP
                </span>
                <span className="font-mono-numbers text-xs font-semibold text-foreground">
                  {bullPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${bullPercentage}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-pink-400 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  DOWN
                </span>
                <span className="font-mono-numbers text-xs font-semibold text-foreground">
                  {bearPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 transition-all duration-300"
                  style={{ width: `${bearPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-grow min-h-[20px]"></div>

      {/* Locked Price - Only show for LIVE rounds */}
      {isLive && round.lockPrice > 0n && (
        <div className="flex justify-between text-xs text-muted-foreground mb-4">
          <span>Locked:</span>
          <span className="font-mono-numbers font-medium text-foreground">
            ${formatPrice(round.lockPrice, 5)}
          </span>
        </div>
      )}

      {/* Result Display for Calculating/Expired Rounds */}
      {(isCalculating || isExpired) && hasResult && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Locked:</span>
            <span className="font-mono-numbers font-medium text-foreground">
              ${formatPrice(round.lockPrice, 5)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mb-4">
            <span>Closed:</span>
            <span className="font-mono-numbers font-medium text-foreground">
              ${formatPrice(round.closePrice, 5)}
            </span>
          </div>
          <div className="text-center mb-2">
            <div className="text-xs text-muted-foreground mb-1">
              {isCalculating ? "Detected Winner" : "Winner"}
            </div>
            <div className="flex items-center justify-center gap-2">
              {winner === "BULL" ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : winner === "BEAR" ? (
                <TrendingDown className="h-5 w-5 text-pink-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-500" />
              )}
              <div
                className={`text-xl font-bold ${
                  winner === "BULL"
                    ? "text-green-500"
                    : winner === "BEAR"
                    ? "text-pink-500"
                    : "text-gray-500"
                }`}
              >
                {winner === "BULL"
                  ? "BULL"
                  : winner === "BEAR"
                  ? "BEAR"
                  : "DRAW"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bet Buttons for LIVE rounds */}
      {isLive && (
        <>
          <div className="mb-2 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-muted-foreground">
              UP
            </span>
            <span className="font-mono-numbers text-xs font-semibold text-foreground">
              {calculatePayout(Position.Bull, round)}x Payout
            </span>
          </div>
          <button
            onClick={() => onBet(Position.Bull, epoch)}
            className="w-full bg-up-bg hover:bg-up-border text-white font-semibold rounded-lg border-0 shadow-none h-9 px-4 text-xs transition-all duration-150"
          >
            Enter UP
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-muted-foreground">
              DOWN
            </span>
            <span className="font-mono-numbers text-xs font-semibold text-foreground">
              {calculatePayout(Position.Bear, round)}x Payout
            </span>
          </div>
          <button
            onClick={() => onBet(Position.Bear, epoch)}
            className="w-full bg-down-bg hover:bg-down-border text-white font-semibold rounded-lg border-0 shadow-none h-9 px-4 text-xs transition-all duration-150"
          >
            Enter DOWN
          </button>
        </div>
      </>
    )}

    {status === RoundStatus.NEXT && (
      <div className="text-center py-3 bg-blue-500/20 rounded-xl mt-auto">
        <span className="text-sm font-semibold text-blue-300 flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Waiting to start...</span>
        </span>
      </div>
    )}

    {status === RoundStatus.LATER && (
      <div className="text-center py-6 bg-purple-500/10 rounded-xl mt-auto border-2 border-purple-400/30">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Lock className="h-6 w-6 text-purple-400" />
          </div>
        </div>
        <div className="text-sm font-semibold text-purple-300 mb-2">
          Round Locked
        </div>
        <div className="text-xs text-muted-foreground mb-1">
          Entry starts in:
        </div>
        <div className="font-mono-numbers text-sm font-bold text-purple-400">
          {timeRemaining}
        </div>
      </div>
    )}      {isCalculating && (
        <div className="text-center py-3 bg-yellow-500/20 rounded-xl mt-auto">
          <span className="text-sm font-semibold text-yellow-300 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
            <span>Calculating results...</span>
          </span>
        </div>
      )}

      {isExpired && (
        <div className="text-center py-3 bg-gray-500/30 rounded-xl mt-auto border-2 border-gray-400/30">
          <span className="text-sm font-semibold text-gray-300 flex items-center justify-center gap-2">
            <Circle className="h-4 w-4 fill-current" />
            <span>Round Ended</span>
          </span>
        </div>
      )}
    </div>
  );
}
