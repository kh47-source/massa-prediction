import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Header from "./components/Header";
import PredictionMarket from "./components/PredictionMarket";

function App() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <PredictionMarket />
      </main>
    </div>
  );
}

export default App;
