"use client";

import { useEffect, useRef, useState } from "react";

const FADE_DURATION = 500; // ms — must match the CSS transition duration below
const PLAY_START_GRACE = 1500; // ms — if playback hasn't started by then, bail out
const MAX_DURATION = 8000; // ms — absolute safety fallback

const MOBILE_BREAKPOINT = "(max-width: 767px)";

export default function Preloader() {
  // null = still deciding, true = show, false = skip
  const [shouldShow, setShouldShow] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT);
    setIsMobile(mql.matches);
    setShouldShow(true);
    document.body.style.overflow = "hidden";

    // If the viewport crosses the breakpoint before the preloader has
    // finished (e.g. device rotation, window resize on load), swap sources
    // rather than get stuck showing the wrong orientation.
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!shouldShow) return;

    // If actual playback hasn't started shortly after mount (autoplay blocked,
    // slow decode, etc.), don't leave the visitor staring at a black screen.
    const graceTimer = setTimeout(() => {
      if (!startedRef.current) setHidden(true);
    }, PLAY_START_GRACE);

    const safetyTimer = setTimeout(() => setHidden(true), MAX_DURATION);
    return () => {
      clearTimeout(graceTimer);
      clearTimeout(safetyTimer);
    };
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
        key={isMobile ? "mobile" : "desktop"}
        ref={videoRef}
        src={isMobile ? "/preloader-mobile.mp4" : "/preloader-desktop.mp4"}
        autoPlay
        muted
        playsInline
        onPlaying={() => {
          startedRef.current = true;
        }}
        onEnded={() => setHidden(true)}
        onError={() => setHidden(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
