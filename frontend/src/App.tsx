import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Header from "./components/Header";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-red-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        {/* <PredictionMarket /> */}
      </main>
    </div>
  );
}

export default App;
