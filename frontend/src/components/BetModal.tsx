import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, X } from "lucide-react";

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  direction: "UP" | "DOWN";
  payout: string;
  prizePool: string;
}

export default function BetModal({
  isOpen,
  onClose,
  direction,
  payout,
  prizePool,
}: BetModalProps) {
  const [amount, setAmount] = useState(10);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleBet = () => {
    setIsConfirming(true);
    setTimeout(() => {
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsConfirming(false);
        setIsSuccess(false);
      }, 1500);
    }, 500);
  };

  if (!isOpen) return null;

  const isUp = direction === "UP";
  const bgGradient = isUp
    ? "from-green-50 to-emerald-50 border-green-200"
    : "from-red-50 to-pink-50 border-red-200";
  const buttonGradient = isUp
    ? "from-green-500 to-emerald-500"
    : "from-red-500 to-pink-500";
  const potentialWin = (amount * Number.parseFloat(payout)).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Place Your Bet</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSuccess && (
          <>
            <div
              className={`bg-gradient-to-br ${bgGradient} rounded-xl p-6 border-2 mb-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-sm font-bold ${
                    isUp
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  } px-3 py-1 rounded`}
                >
                  {direction}
                </span>
                <span
                  className={`text-2xl font-bold ${
                    isUp ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {payout}
                </span>
              </div>
              <p className="text-xs text-gray-600">Current Payout</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Bet Amount: {amount} MAS
                </label>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={amount}
                  onChange={(e) => setAmount(Number.parseInt(e.target.value))}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 MAS</span>
                  <span>1000 MAS</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAmount(Math.max(1, amount - 10))}
                  className="bg-gray-100 hover:bg-gray-200 text-foreground font-semibold py-2 rounded-lg transition"
                >
                  - 10
                </button>
                <button
                  onClick={() => setAmount(amount + 10)}
                  className="bg-gray-100 hover:bg-gray-200 text-foreground font-semibold py-2 rounded-lg transition"
                >
                  + 10
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bet Amount</span>
                <span className="font-bold">{amount} MAS</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Potential Win</span>
                <span
                  className={`font-bold ${
                    isUp ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {potentialWin} MAS
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between text-sm">
                <span className="text-gray-600">Prize Pool</span>
                <span className="font-bold">{prizePool}</span>
              </div>
            </div>

            <button
              onClick={handleBet}
              disabled={isConfirming}
              className={`w-full bg-gradient-to-r ${buttonGradient} text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isUp ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownRight className="w-5 h-5" />
              )}
              {isConfirming ? "Confirming..." : `Bet ${direction}`}
            </button>
          </>
        )}

        {isSuccess && (
          <div className="text-center py-8 animate-slide-up">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-600 mb-2">
              Bet Placed!
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              You've successfully placed a {amount} MAS bet on {direction}
            </p>
            <p className="text-lg font-bold text-foreground">
              Potential Win: {potentialWin} MAS
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
