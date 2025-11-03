import { Link, useLocation } from "react-router-dom";
import WalletConnect from "./WalletConnect.tsx";
import { clsx } from "clsx";
import { type ReactNode } from "react";

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
        "px-4 py-2 rounded-lg font-medium transition-all duration-200 no-underline",
        active
          ? "bg-white/10 text-white"
          : "text-gray-300 hover:text-white hover:bg-white/5"
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
  return (
    <div className="min-h-screen">
      <header className="bg-[#584b9b] backdrop-blur-sm border-b-2 border-[#0f1729] sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">Massa Markets</h1>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/">Markets</NavLink>
            <NavLink to="/how-it-works">How it Works</NavLink>
            <NavLink to="/disclaimer">Disclaimer</NavLink>
            <NavLink to="/admin">Admin</NavLink>
          </nav>

          <div className="flex items-center gap-4">
            <div>
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto px-4 py-8">{children}</main>
      <footer className="mx-auto px-4 pb-8">
        <div className="p-6 text-center border-t border-white/10">
          <p className="font-semibold text-white">
            Built for Massa DeWeb · Autonomous by design
          </p>
          <p className="text-sm mt-2 text-gray-400">
            This app is under development and working on buildnet network for
            now.
          </p>
        </div>
      </footer>
    </div>
  );
}
