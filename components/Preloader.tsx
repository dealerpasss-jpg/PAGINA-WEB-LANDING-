"use client";

import { useEffect, useRef, useState } from "react";

const FADE_DURATION = 500; // ms — must match the CSS transition duration below
const PLAY_START_GRACE = 1500; // ms — if playback hasn't started by then, bail out
const MAX_DURATION = 8000; // ms — absolute safety fallback

export default function Preloader() {
  // null = still deciding, true = show (mobile, has video), false = skip (desktop, no video yet)
  const [shouldShow, setShouldShow] = useState<boolean | null>(null);
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startedRef = useRef(false);

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
        ref={videoRef}
        src="/preloader-mobile.mp4"
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
