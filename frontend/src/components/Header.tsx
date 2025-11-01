import { Wallet, Settings, Bell, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const [balance, setBalance] = useState("$12,450.50");
  const [balanceChange, setBalanceChange] = useState("+$1,245.00");

  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 100;
      const isPositive = change > 0;
      setBalanceChange(
        `${isPositive ? "+" : ""}$${Math.abs(change).toFixed(2)}`
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b-2 border-red-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center animate-pulse-glow">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Prediction Market
            </h1>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#"
            className="text-foreground hover:text-red-600 font-medium transition duration-300 hover:scale-105"
          >
            Trade
          </a>
          <a
            href="#"
            className="text-foreground hover:text-red-600 font-medium transition duration-300 hover:scale-105"
          >
            Markets
          </a>
          <a
            href="#"
            className="text-foreground hover:text-red-600 font-medium transition duration-300 hover:scale-105"
          >
            Portfolio
          </a>
          <a
            href="#"
            className="text-foreground hover:text-red-600 font-medium transition duration-300 hover:scale-105"
          >
            Leaderboard
          </a>
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
            <TrendingUp className="w-4 h-4 text-red-600" />
            <div className="text-right">
              <p className="text-xs text-gray-600">Balance</p>
              <p className="text-sm font-bold text-foreground">{balance}</p>
            </div>
          </div>

          <button className="p-2 hover:bg-red-50 rounded-lg transition duration-300 hover:scale-110 relative">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
          </button>
          <button className="p-2 hover:bg-red-50 rounded-lg transition duration-300 hover:scale-110">
            <Settings className="w-5 h-5 text-foreground" />
          </button>
          <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition duration-300 hover:scale-105 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Connect
          </button>
        </div>
      </div>
    </header>
  );
}
