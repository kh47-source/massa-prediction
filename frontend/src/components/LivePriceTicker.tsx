import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceTickerProps {
  initialPrice: number;
  priceSymbol?: string;
}

export default function LivePriceTicker({
  initialPrice,
  priceSymbol = "$",
}: PriceTickerProps) {
  const [price, setPrice] = useState(initialPrice);
  const [priceHistory, setPriceHistory] = useState<number[]>([initialPrice]);
  const [isUp, setIsUp] = useState(true);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrice((prev) => {
        const change = (Math.random() - 0.48) * 0.0002;
        const newPrice = Math.max(0.00001, prev + change);
        setPriceHistory((hist) => [...hist.slice(-19), newPrice]);
        setIsUp(newPrice > prev);
        setBounce(true);
        setTimeout(() => setBounce(false), 600);
        return newPrice;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const priceChange = ((price - initialPrice) / initialPrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className="space-y-2">
      <div
        className={`flex items-baseline gap-3 ${
          bounce ? "animate-price-bounce" : ""
        }`}
      >
        <p className="text-4xl font-bold text-foreground">
          {priceSymbol}
          {price.toFixed(5)}
        </p>
        <div className="flex items-center gap-1">
          {isUp ? (
            <TrendingUp className="w-5 h-5 text-green-600" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-600" />
          )}
          <span
            className={`text-sm font-bold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {priceChange.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="flex gap-1 h-6">
        {priceHistory.map((p, i) => {
          const minPrice = Math.min(...priceHistory);
          const maxPrice = Math.max(...priceHistory);
          const range = maxPrice - minPrice || 1;
          const height = ((p - minPrice) / range) * 100;
          return (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-red-500 to-red-300 rounded-sm opacity-60 hover:opacity-100 transition"
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}
