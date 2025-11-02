import { useState } from "react";
import { X } from "lucide-react";
import { Position } from "../lib/types";

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: string) => void;
  position: Position;
  epoch: bigint;
}

export default function BetModal({
  isOpen,
  onClose,
  onConfirm,
  position,
  epoch,
}: BetModalProps) {
  const [amount, setAmount] = useState<string>("100");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(amount);
    onClose();
  };

  const isUp = position === Position.Bull;
  const bgColor = isUp ? "bg-up-bg" : "bg-down-bg";
  const hoverColor = isUp ? "hover:bg-up-border" : "hover:bg-down-border";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative brut-card p-6 w-full max-w-md">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Enter {isUp ? "UP" : "DOWN"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Round #{epoch.toString()}
          </p>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Bet Amount (MAS)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="100"
            step="10"
            className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:border-purple-light focus:outline-none text-lg font-semibold text-foreground placeholder-gray-500"
            placeholder="Enter amount"
            autoFocus
          />
          <p className="text-xs text-muted-foreground mt-2">
            Minimum bet: 100 MAS
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-foreground font-semibold rounded-lg transition-all duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!amount || Number(amount) < 100}
            className={`flex-1 px-4 py-3 ${bgColor} ${hoverColor} text-white font-semibold rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Confirm Bet
          </button>
        </div>
      </div>
    </div>
  );
}

