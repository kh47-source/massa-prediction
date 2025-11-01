import { Link, useLocation } from "react-router-dom";
import WalletConnect from "./WalletConnect.tsx";
import { clsx } from "clsx";
import { useState, type ReactNode } from "react";
import { Bell, Settings, TrendingUp } from "lucide-react";

interface NavLinkProps {
  to: string;
  children: ReactNode;
}

const NavLink = ({ to, children }: NavLinkProps) => {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={clsx(
        "brut-btn bg-white text-ink-950 no-underline text-foreground hover:text-red-600 font-medium transition duration-300 hover:scale-105",
        active && "bg-accent-yellow"
      )}
    >
      {children}
    </Link>
  );
};

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [balance, setBalance] = useState("$12,450.50");

  return (
    <div className="min-h-screen bg-white text-gray-600">
      <header className="bg-white border-b-2 border-red-200 sticky top-0 z-50 shadow-sm">
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
            <NavLink to="/">Home</NavLink>
            <NavLink to="/admin">Admin</NavLink>
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
            <div>
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>
      <main className=" mx-auto px-4 py-8">{children}</main>
      <footer className="mx-auto px-4 pb-4">
        <div className="p-2  border-red-300 text-center border-t-2 text-gray-600">
          <p className="font-bold">
            Built for Massa DeWeb · Autonomous by design
          </p>
          <p className="text-sm mt-1">
            This app is under developement and working on buildnet network for
            now.
          </p>
        </div>
      </footer>
    </div>
  );
}
