import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Header from "./components/Header";
import PredictionMarket from "./components/PredictionMarket";
import MarketCard from "./components/MarketCard";

function App() {
  const [markets, setMarkets] = useState<any[]>([]);

  useEffect(() => {
    // Mock market data with realistic prediction market structure
    setMarkets([
      {
        id: "#426108",
        status: "LIVE",
        title: "MAS/USD Price Prediction",
        currentPrice: "$0.01351",
        priceChange: "+0.16%",
        locked: false,
        upPayout: "1.93x",
        downPayout: "2.07x",
        upPrizePool: "2,142.5 MAS",
        downPrizePool: "2,882.9 MAS",
        lockedPrice: "$0.01348",
        totalPool: "$4,850 USD",
        nextClose: "~05:00",
      },
      {
        id: "#426109",
        status: "Next",
        title: "MAS/USD Higher Close",
        currentPrice: "$0.01351",
        priceChange: "-0.05%",
        locked: false,
        upPayout: "0x",
        downPayout: "0x",
        upPrizePool: "<0.0001 MAS",
        downPrizePool: "2,882.9 MAS",
        lockedPrice: "$0.01351",
        totalPool: "$3,500 USD",
        nextClose: "Entry starts ~04:50",
      },
      {
        id: "#426110",
        status: "Later",
        title: "MAS Volatility Bet",
        currentPrice: "$0.01351",
        priceChange: "+0.25%",
        locked: true,
        upPayout: "0x",
        downPayout: "0x",
        upPrizePool: "0.0000 MAS",
        downPrizePool: "0.0000 MAS",
        lockedPrice: "$0.01348",
        totalPool: "$2,100 USD",
        nextClose: "Entry starts ~09:50",
      },
      {
        id: "#426111",
        status: "Later",
        title: "MAS Price Floor",
        currentPrice: "$0.01351",
        priceChange: "+0.10%",
        locked: true,
        upPayout: "0x",
        downPayout: "0x",
        upPrizePool: "0.0000 MAS",
        downPrizePool: "0.0000 MAS",
        lockedPrice: "$0.01348",
        totalPool: "$1,800 USD",
        nextClose: "Entry starts ~09:50",
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <PredictionMarket />

        {/* Active Markets */}
        <section className="mt-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Active Markets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {markets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
