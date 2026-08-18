"use client";

import { useEffect } from "react";

/**
 * Mounted once in the root layout. Tracks the pointer globally and, whenever it's
 * over an element with the `.card` class, updates that card's --mx / --my CSS
 * variables so the radial-gradient spotlight defined in globals.css follows the cursor.
 */
export default function CardSpotlight() {
  useEffect(() => {
    function handleMove(e: PointerEvent) {
      const target = (e.target as HTMLElement | null)?.closest?.(".card") as HTMLElement | null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      target.style.setProperty("--mx", `${x}%`);
      target.style.setProperty("--my", `${y}%`);
    }
    document.addEventListener("pointermove", handleMove, { passive: true });
    return () => document.removeEventListener("pointermove", handleMove);
  }, []);

  return null;
}
