"use client";

import { useEffect, useState } from "react";

/** Decorative only: never reads account data or participates in layout. */
export default function WorkspaceAtmosphere() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const syncVisibility = () => setPaused(document.visibilityState !== "visible");
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);
  return <div className="workspace-atmosphere" aria-hidden="true" data-paused={paused} />;
}
