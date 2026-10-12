"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type SmoothScrollControllerProps = {
  active: boolean;
};

export function SmoothScrollController({ active }: SmoothScrollControllerProps) {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!active || reducedMotion) return;

    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const lenis = new Lenis({
      anchors: true,
      autoRaf: false,
      lerp: coarsePointer ? 0.12 : 0.085,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.05,
      wheelMultiplier: 0.88,
    });

    const update = (time: number) => lenis.raf(time * 1000);
    const refresh = () => ScrollTrigger.refresh();
    const handleVisibility = () => {
      if (document.hidden) lenis.stop();
      else lenis.start();
    };

    document.documentElement.classList.add("has-smooth-scroll");
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    window.addEventListener("resize", refresh, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    window.requestAnimationFrame(refresh);

    return () => {
      document.documentElement.classList.remove("has-smooth-scroll");
      window.removeEventListener("resize", refresh);
      document.removeEventListener("visibilitychange", handleVisibility);
      gsap.ticker.remove(update);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      ScrollTrigger.refresh();
    };
  }, [active]);

  return null;
}
