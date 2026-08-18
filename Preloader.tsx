"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";

const MIN_DURATION = 1300; // ms — enough to register the brand moment without feeling slow
const FADE_DURATION = 500; // ms — must match the CSS transition duration below

export default function Preloader() {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const hideTimer = setTimeout(() => setHidden(true), MIN_DURATION);
    return () => clearTimeout(hideTimer);
  }, []);

  useEffect(() => {
    if (!hidden) return;
    document.body.style.overflow = "";
    const removeTimer = setTimeout(() => setRemoved(true), FADE_DURATION);
    return () => clearTimeout(removeTimer);
  }, [hidden]);

  if (removed) return null;

  return (
    <div
      className={`preloader-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black ${
        hidden ? "preloader-hidden" : ""
      }`}
      aria-hidden={hidden}
    >
      <div className="preloader-logo-wrap">
        <Logo variant="dark" className="h-11 sm:h-12" />
      </div>
    </div>
  );
}
