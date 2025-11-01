import { useEffect, useState } from "react";
import { Round, Position } from "../lib/types";
import { calculatePayout, formatPrice, getTimeRemaining } from "../lib/utils";
import { formatUnits } from "@massalabs/massa-web3";
import { PRICE_FORMAT_DECIMALS } from "../lib/const";

export enum RoundStatus {
  LIVE = "LIVE",
  NEXT = "NEXT",
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
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [round, status]);

  const getStatusColor = () => {
    switch (status) {
      case RoundStatus.LIVE:
        return "bg-green-500";
      case RoundStatus.NEXT:
        return "bg-blue-500";
      case RoundStatus.CALCULATING:
        return "bg-yellow-500";
      case RoundStatus.EXPIRED:
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case RoundStatus.LIVE:
        return "from-green-50 to-emerald-50";
      case RoundStatus.NEXT:
        return "from-blue-50 to-cyan-50";
      case RoundStatus.CALCULATING:
        return "from-yellow-50 to-amber-50";
      case RoundStatus.EXPIRED:
        return "from-gray-50 to-slate-50";
      default:
        return "from-gray-50 to-gray-100";
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
    <div
      className={`brut-card bg-gradient-to-br ${getStatusBg()} p-6 hover:translate-y-[-4px] transition-all duration-300 h-full`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 ${getStatusColor()} rounded-full ${
              isLive || isCalculating ? "animate-pulse" : ""
            }`}
          ></div>
          <span className="text-sm font-bold text-gray-700">{status}</span>
        </div>
        <div className="text-lg font-bold text-gray-800">
          #{epoch.toString()}
        </div>
      </div>

      {/* Timer */}
      {(isLive || status === RoundStatus.NEXT) && (
        <div className="mb-4 text-center">
          <div className="text-xs text-gray-600 mb-1">
            {isLive ? "Closes in" : "Starts in"}
          </div>
          <div className="text-2xl font-bold text-purple-600 font-mono">
            {timeRemaining}
          </div>
        </div>
      )}

      {/* Prize Pool */}
      <div className="mb-4 text-center bg-white rounded-xl p-4 border-3 border-gray-200">
        <div className="text-xs text-gray-600 mb-1">Prize Pool</div>
        <div className="text-3xl font-bold text-gray-800">
          {formatMas(round.totalAmount)}{" "}
          <span className="text-lg text-gray-600">MAS</span>
        </div>
      </div>

      {/* Result Display for Calculating/Expired Rounds */}
      {(isCalculating || isExpired) && hasResult && (
        <div
          className={`mb-4 p-4 bg-white rounded-xl border-3 ${
            isCalculating ? "border-yellow-300" : "border-gray-200"
          }`}
        >
          <div className="text-center mb-2">
            <div className="text-xs text-gray-600 mb-1">
              {isCalculating ? "Detected Winner" : "Winner"}
            </div>
            <div
              className={`text-2xl font-bold ${
                winner === "BULL"
                  ? "text-green-600"
                  : winner === "BEAR"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {winner === "BULL"
                ? "🐂 BULL"
                : winner === "BEAR"
                ? "🐻 BEAR"
                : "🤝 DRAW"}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-gray-600">Lock Price</div>
              <div className="font-bold">${formatPrice(round.lockPrice)}</div>
            </div>
            <div>
              <div className="text-gray-600">Close Price</div>
              <div className="font-bold">${formatPrice(round.closePrice)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Bull/Bear Distribution */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>🐂 Bull: {bullPercentage.toFixed(1)}%</span>
          <span>🐻 Bear: {bearPercentage.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
            style={{ width: `${bullPercentage}%` }}
          ></div>
          <div
            className="bg-gradient-to-r from-red-400 to-red-600 transition-all duration-500"
            style={{ width: `${bearPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Payout Info */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-green-100 rounded-lg p-2 text-center border-2 border-green-300">
          <div className="text-xs text-green-700 font-semibold">
            Bull Payout
          </div>
          <div className="text-lg font-bold text-green-800">
            {calculatePayout(Position.Bull, round)}x
          </div>
        </div>
        <div className="bg-red-100 rounded-lg p-2 text-center border-2 border-red-300">
          <div className="text-xs text-red-700 font-semibold">Bear Payout</div>
          <div className="text-lg font-bold text-red-800">
            {calculatePayout(Position.Bear, round)}x
          </div>
        </div>
      </div>

      {/* Bet Buttons */}
      {isLive && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onBet(Position.Bull, epoch)}
            className="brut-btn bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 py-3 font-bold text-sm"
          >
            <span className="flex items-center justify-center gap-1">
              <span>🐂</span>
              <span>UP</span>
            </span>
          </button>
          <button
            onClick={() => onBet(Position.Bear, epoch)}
            className="brut-btn bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 py-3 font-bold text-sm"
          >
            <span className="flex items-center justify-center gap-1">
              <span>🐻</span>
              <span>DOWN</span>
            </span>
          </button>
        </div>
      )}

      {status === RoundStatus.NEXT && (
        <div className="text-center py-3 bg-blue-100 rounded-xl border-2 border-blue-300">
          <span className="text-sm font-semibold text-blue-800">
            ⏳ Waiting to start...
          </span>
        </div>
      )}

      {isCalculating && (
        <div className="text-center py-3 bg-yellow-100 rounded-xl border-2 border-yellow-400 animate-pulse">
          <span className="text-sm font-semibold text-yellow-800 flex items-center justify-center gap-2">
            <span className="inline-block animate-spin">⚙️</span>
            <span>Calculating results...</span>
          </span>
        </div>
      )}

      {isExpired && (
        <div className="text-center py-3 bg-gray-100 rounded-xl border-2 border-gray-300">
          <span className="text-sm font-semibold text-gray-700">
            ✅ Round Ended
          </span>
        </div>
      )}
    </div>
  );
}
