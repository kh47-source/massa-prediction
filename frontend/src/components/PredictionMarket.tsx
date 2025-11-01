import { useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import BetModal from "./BetModal";
import LivePriceTicker from "./LivePriceTicker";
import CountdownTimer from "./CountdownTimer";

export default function PredictionMarket() {
  const [activeModal, setActiveModal] = useState<"UP" | "DOWN" | null>(null);
  const [roundCount, setRoundCount] = useState(426108);

  const closeTime = Date.now() + 5 * 60 * 1000 + 30 * 1000;

  return (
    <>
      <div className="bg-white rounded-2xl border-2 border-red-100 p-8 shadow-lg hover:shadow-xl transition duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Live Prediction
            </h2>
            <p className="text-sm text-gray-600 mt-1">Round #{roundCount}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 hover:shadow-lg transition duration-300">
              Prediction
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Price Info Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
              <p className="text-sm font-semibold text-red-600 mb-4">
                CURRENT PRICE
              </p>
              <LivePriceTicker initialPrice={0.01351} priceSymbol="$" />
            </div>

            <div className="bg-white border-2 border-red-100 rounded-xl p-6">
              <p className="text-sm font-semibold text-gray-500 mb-3">
                CLOSES IN
              </p>
              <CountdownTimer endTime={closeTime} size="lg" />
              <p className="text-xs text-gray-500 mt-4">
                Next round starts automatically
              </p>
            </div>
          </div>

          {/* UP/DOWN Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* UP Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 hover:shadow-lg transition duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded">
                    UP
                  </span>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">1.93x</p>
                    <p className="text-xs text-green-600">Payout</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="bg-white/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Prize Pool</p>
                    <p className="text-lg font-bold text-foreground">
                      2,142.5 MAS
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal("UP")}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition duration-300 flex items-center justify-center gap-2 hover:scale-105 transform"
                >
                  <ArrowUpRight className="w-5 h-5" />
                  Enter UP
                </button>
              </div>

              {/* DOWN Card */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border-2 border-red-200 hover:shadow-lg transition duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-red-700 bg-red-100 px-3 py-1 rounded">
                    DOWN
                  </span>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-red-600">2.07x</p>
                    <p className="text-xs text-red-600">Payout</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="bg-white/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Prize Pool</p>
                    <p className="text-lg font-bold text-foreground">
                      2,882.9 MAS
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal("DOWN")}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition duration-300 flex items-center justify-center gap-2 hover:scale-105 transform"
                >
                  <ArrowDownRight className="w-5 h-5" />
                  Enter DOWN
                </button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-gray-50 to-red-50 rounded-xl p-6 border border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-2">Total Prize Pool</p>
                  <p className="text-2xl font-bold text-foreground">$4,850</p>
                </div>
                <div className="border-l border-r border-gray-300">
                  <p className="text-xs text-gray-600 mb-2 text-center">
                    Your Potential Win
                  </p>
                  <p className="text-2xl font-bold text-center text-green-600">
                    +$245
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-2">Next Round</p>
                  <p className="text-2xl font-bold text-foreground">04:58</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Betting Modal */}
      <BetModal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        direction={activeModal || "UP"}
        payout={activeModal === "UP" ? "1.93x" : "2.07x"}
        prizePool={activeModal === "UP" ? "2,142.5 MAS" : "2,882.9 MAS"}
      />
    </>
  );
}
