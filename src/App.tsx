import { useEffect } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import AnimatedBackground from "./components/AnimatedBackground";
import BackButton from "./components/BackButton";
import DevPanel from "./components/DevPanel";
import MusicPlayer from "./components/MusicPlayer";
import SealedRoute from "./components/SealedRoute";
import { music } from "./lib/music";
import { forceFullMotion } from "./lib/motion";

import WelcomePage from "./pages/WelcomePage";
import MainMenuPage from "./pages/MainMenuPage";
import ItineraryPage from "./pages/ItineraryPage";
import WishPage from "./pages/WishPage";
import MemoriesPage from "./pages/MemoriesPage";
import LovePage from "./pages/LovePage";

export default function App() {
  const location = useLocation();
  const dark = location.pathname === "/memories";

  // The song plays as soon as the site opens — or, where the browser insists
  // on an interaction first, on her very first tap / click / key press.
  useEffect(() => {
    music.autoStart();
  }, []);

  return (
    <MotionConfig reducedMotion={forceFullMotion ? "never" : "user"}>
      <AnimatedBackground dark={dark} />

      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/menu" element={<MainMenuPage />} />
          <Route path="/itinerary" element={<SealedRoute card="itinerary"><ItineraryPage /></SealedRoute>} />
          <Route path="/wish" element={<SealedRoute card="wish"><WishPage /></SealedRoute>} />
          <Route path="/memories" element={<SealedRoute card="memories"><MemoriesPage /></SealedRoute>} />
          <Route path="/love" element={<SealedRoute card="love"><LovePage /></SealedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      <BackButton />
      <MusicPlayer dark={dark} />
      <DevPanel />
    </MotionConfig>
  );
}
