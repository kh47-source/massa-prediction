import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home.tsx";
import Admin from "./pages/Admin.tsx";
import HowItWorks from "./pages/HowItWorks.tsx";
import Disclaimer from "./pages/Disclaimer.tsx";
import AppLayout from "./components/AppLayout.tsx";
import useAccountSync from "./hooks/useAccountSync.ts";

export default function App() {
  useAccountSync();

  return (
    <>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
        </Routes>
      </AppLayout>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="mt-16"
        aria-label="Toast notifications"
      />
    </>
  );
}
