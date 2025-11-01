import { ArrowUpRight, ArrowDownRight, Clock, Activity } from "lucide-react";
import { useState } from "react";

interface MarketCardProps {
  market: {
    id: string;
    status: string;
    title: string;
    currentPrice: string;
    priceChange: string;
    locked: boolean;
    upPayout: string;
    downPayout: string;
    upPrizePool: string;
    downPrizePool: string;
    lockedPrice: string;
    totalPool: string;
    nextClose: string;
  };
}

export default function MarketCard({ market }: MarketCardProps) {
  const isLive = market.status === "LIVE";
  const isNext = market.status === "Next";
  const isExpired = market.status === "Expired";
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = {
    LIVE: {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-300",
      badge: "bg-green-500",
    },
    Next: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      border: "border-purple-300",
      badge: "bg-purple-500",
    },
    Later: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-300",
      badge: "bg-gray-500",
    },
    Expired: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-300",
      badge: "bg-gray-500",
    },
  };

  const config = statusConfig[market.status as keyof typeof statusConfig];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`rounded-xl border-2 overflow-hidden transition-all duration-300 transform ${
        isExpired
          ? "bg-gray-50 border-gray-300 opacity-50"
          : isLive
          ? `bg-gradient-to-br from-white via-white to-red-50 border-green-300 shadow-lg ${
              isHovered ? "scale-105" : "scale-100"
            }`
          : `bg-white border-gray-200 ${
              isHovered ? "shadow-lg scale-105" : "shadow-sm"
            }`
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex items-center justify-between relative overflow-hidden">
        <div className="flex items-center gap-3 z-10">
          <div className="relative">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${config.bg} ${config.text} ${config.border} flex items-center gap-1`}
            >
              <span
                className={`w-2 h-2 rounded-full ${config.badge} animate-pulse`}
              ></span>
              {market.status === "LIVE"
                ? "⚫ LIVE"
                : market.status === "Next"
                ? "🔮 Next"
                : market.status}
            </span>
          </div>
          <span className="text-xs text-gray-400">{market.id}</span>
        </div>
        {isLive && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0 animate-shimmer" />
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground">{market.title}</h3>

        {!market.locked && (
          <>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-semibold">LAST PRICE</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground animate-price-bounce">
                  {market.currentPrice}
                </p>
                <span
                  className={`text-xs font-semibold flex items-center gap-1 ${
                    market.priceChange.includes("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {market.priceChange.includes("+") ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {market.priceChange}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-500 mb-1">Locked Price</p>
                <p className="font-semibold text-foreground">
                  {market.lockedPrice}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-gray-500 mb-1">Prize Pool</p>
                <p className="font-semibold text-foreground">
                  {market.totalPool}
                </p>
              </div>
            </div>

            {/* UP/DOWN Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-bold text-xs hover:shadow-lg hover:scale-105 transition duration-300 flex items-center justify-center gap-1 transform">
                <ArrowUpRight className="w-3 h-3" />
                UP
              </button>
              <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 rounded-lg font-bold text-xs hover:shadow-lg hover:scale-105 transition duration-300 flex items-center justify-center gap-1 transform">
                <ArrowDownRight className="w-3 h-3" />
                DOWN
              </button>
            </div>
          </>
        )}

        {market.locked && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Activity className="w-8 h-8 text-gray-400 animate-pulse" />
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Entry starts</p>
              <p className="text-lg font-bold text-foreground">
                {market.nextClose}
              </p>
            </div>
            <button className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg font-bold text-xs cursor-not-allowed opacity-50">
              UP (Locked)
            </button>
            <button className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg font-bold text-xs cursor-not-allowed opacity-50">
              DOWN (Locked)
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-red-50 px-5 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className="w-3 h-3" />
          <span>Closes in {market.nextClose.substring(0, 5)}</span>
        </div>
        {isLive && (
          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
}
