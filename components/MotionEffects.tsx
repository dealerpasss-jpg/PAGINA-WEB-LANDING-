"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
export default function MotionEffects() {
  const path = usePathname();
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup = () => {};
    const setup = () => {
      cleanup();
      if (media.matches) return;
      const hero = document.querySelector<HTMLElement>(".hero-cinema");
      const ticker = document.querySelector<HTMLElement>(".kinetic-track");
      const progress = document.querySelector<HTMLElement>(".reading-progress");
      const artworks = Array.from(
        document.querySelectorAll<HTMLElement>(".scroll-art"),
      );
      let frame = 0,
        pointerFrame = 0,
        current: HTMLElement | null = null;
      const scroll = () => {
        frame = 0;
        const total = document.documentElement.scrollHeight - innerHeight;
        progress?.style.setProperty(
          "transform",
          `scaleX(${total > 0 ? scrollY / total : 0})`,
        );
        if (hero) {
          const r = hero.getBoundingClientRect();
          hero.style.setProperty(
            "--car-travel",
            `${Math.max(0, Math.min(100, -r.top * 0.2))}px`,
          );
          if (r.bottom > 0 && r.top < innerHeight)
            hero.style.setProperty(
              "--scene-y",
              `${Math.max(-45, Math.min(45, -r.top * 0.09))}px`,
            );
        }
        artworks.forEach((art) => {
          const r = art.getBoundingClientRect();
          if (r.bottom > 0 && r.top < innerHeight) {
            const p = (innerHeight / 2 - (r.top + r.height / 2)) / innerHeight;
            art.style.setProperty(
              "--art-y",
              `${Math.max(-24, Math.min(24, p * 48))}px`,
            );
          }
        });
        if (ticker) {
          const r = ticker.getBoundingClientRect();
          if (r.bottom > 0 && r.top < innerHeight)
            ticker.style.setProperty(
              "--ticker-x",
              `${(innerHeight - r.top) * -0.1}px`,
            );
        }
      };
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(scroll);
      };
      const reset = () => {
        if (current) {
          current.style.removeProperty("--rx");
          current.style.removeProperty("--ry");
          current.style.removeProperty("--mx");
          current.style.removeProperty("--my");
          current = null;
        }
      };
      const move = (event: PointerEvent) => {
        if (
          event.pointerType !== "mouse" ||
          !matchMedia("(hover: hover) and (pointer: fine)").matches
        )
          return;
        const target = (event.target as Element).closest<HTMLElement>(
          ".hover-scene, .academy-art, .plan-card, .experience-item",
        );
        if (target !== current) {
          reset();
          current = target;
        }
        cancelAnimationFrame(pointerFrame);
        if (!target) return;
        const x = event.clientX,
          y = event.clientY;
        pointerFrame = requestAnimationFrame(() => {
          const r = target.getBoundingClientRect();
          const px = (x - r.left) / r.width,
            py = (y - r.top) / r.height;
          target.style.setProperty("--rx", `${(py - 0.5) * -5}deg`);
          target.style.setProperty("--ry", `${(px - 0.5) * 5}deg`);
          target.style.setProperty("--mx", `${px * 100}%`);
          target.style.setProperty("--my", `${py * 100}%`);
        });
      };
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      document.addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", reset);
      scroll();
      cleanup = () => {
        cancelAnimationFrame(frame);
        cancelAnimationFrame(pointerFrame);
        reset();
        artworks.forEach((art) => art.style.removeProperty("--art-y"));
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        document.removeEventListener("pointermove", move);
        document.documentElement.removeEventListener("pointerleave", reset);
        hero?.style.removeProperty("--scene-y");
        hero?.style.removeProperty("--car-travel");
        ticker?.style.removeProperty("--ticker-x");
        progress?.style.removeProperty("transform");
      };
    };
    setup();
    media.addEventListener("change", setup);
    return () => {
      cleanup();
      media.removeEventListener("change", setup);
    };
  }, [path]);
  return <div className="reading-progress" aria-hidden="true" />;
}
