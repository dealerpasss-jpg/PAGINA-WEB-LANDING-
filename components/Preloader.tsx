"use client";

import { useEffect, useState } from "react";

const FADE_DURATION = 500; // ms — must match the CSS transition duration below
const MAX_DURATION = 8000; // ms — safety fallback in case the video fails to load or play

export default function Preloader() {
  // null = still deciding, true = show (mobile, has video), false = skip (desktop, no video yet)
  const [shouldShow, setShouldShow] = useState<boolean | null>(null);
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    // Desktop preload video isn't ready yet — only show on mobile-sized viewports for now.
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    setShouldShow(isMobile);
    if (isMobile) {
      document.body.style.overflow = "hidden";
    }
  }, []);

  useEffect(() => {
    if (!shouldShow) return;
    const safetyTimer = setTimeout(() => setHidden(true), MAX_DURATION);
    return () => clearTimeout(safetyTimer);
  }, [shouldShow]);

  useEffect(() => {
    if (!hidden) return;
    document.body.style.overflow = "";
    const removeTimer = setTimeout(() => setRemoved(true), FADE_DURATION);
    return () => clearTimeout(removeTimer);
  }, [hidden]);

  if (!shouldShow || removed) return null;

  return (
    <div
      className={`preloader-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black ${
        hidden ? "preloader-hidden" : ""
      }`}
      aria-hidden={hidden}
    >
      <video
        src="/preloader-mobile.mp4"
        autoPlay
        muted
        playsInline
        onEnded={() => setHidden(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
