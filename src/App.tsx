import { lazy, Suspense, useEffect } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import AnimatedBackground from "./components/AnimatedBackground";
import BackButton from "./components/BackButton";
import DevPanel from "./components/DevPanel";
import MusicPlayer from "./components/MusicPlayer";
import SealedRoute from "./components/SealedRoute";
import UpdateNotice from "./components/UpdateNotice";
import { isPreview } from "./content";
import { music } from "./lib/music";
import { forceFullMotion } from "./lib/motion";
import { useSkyTheme } from "./lib/theme";

import WelcomePage from "./pages/WelcomePage";
import MainMenuPage from "./pages/MainMenuPage";
import ItineraryPage from "./pages/ItineraryPage";
import WishPage from "./pages/WishPage";
import MemoriesPage from "./pages/MemoriesPage";
import LovePage from "./pages/LovePage";

// The editor is only downloaded when someone opens /admin.
const AdminApp = lazy(() => import("./admin/AdminApp"));

export default function App() {
  const location = useLocation();
  if (location.pathname === "/admin" || location.pathname.startsWith("/admin/")) {
    return (
      <Suspense fallback={<div className="min-h-dvh bg-ivory" />}>
        <AdminApp />
      </Suspense>
    );
  }
  return <Experience />;
}

function Experience() {
  const location = useLocation();
  const dark = location.pathname === "/memories";
  const theme = useSkyTheme();

  // Day → sunset → starry night: the whole palette follows her clock.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "night" ? "#0b1024" : theme === "sunset" ? "#f3c1a4" : "#f5eee3");
    return () => {
      delete root.dataset.theme;
    };
  }, [theme]);

  // The song plays as soon as the site opens — or, where the browser insists
  // on an interaction first, on her very first tap / click / key press.
  useEffect(() => {
    music.autoStart();
  }, []);

  return (
    <MotionConfig reducedMotion={forceFullMotion ? "never" : "user"}>
      <AnimatedBackground dark={dark} theme={theme} />

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
      <UpdateNotice dark={dark} />

      {isPreview && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center">
          <span className="rounded-b-lg bg-ink/90 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gold-soft shadow-lift">
            Preview · not published
          </span>
        </div>
      )}
    </MotionConfig>
  );
}
