"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

type Loader365Props = {
  onComplete: () => void;
};

const targetDigits = ["3", "6", "5"];

export function Loader365({ onComplete }: Loader365Props) {
  const [digits, setDigits] = useState(["0", "0", "0"]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hasCompletedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const complete = () => {
      if (hasCompletedRef.current) return;

      hasCompletedRef.current = true;
      onCompleteRef.current();
    };

    if (prefersReducedMotion) {
      setDigits(targetDigits);
      const timeout = window.setTimeout(complete, 500);
      return () => window.clearTimeout(timeout);
    }

    const intervals = targetDigits.map((target, index) => {
      let tick = 0;
      return window.setInterval(() => {
        tick += 1;
        setDigits((current) => {
          const next = [...current];
          next[index] = tick > 12 + index * 5 ? target : String(Math.floor(Math.random() * 10));
          return next;
        });
      }, 70 + index * 24);
    });

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: complete,
    });

    // Never leave the interface hidden if animation frames are throttled or GSAP stalls.
    const safetyTimeout = window.setTimeout(complete, 4_000);

    tl.fromTo(
      ".loader-digit",
      { y: 70, autoAlpha: 0, rotateX: -34 },
      { y: 0, autoAlpha: 1, rotateX: 0, duration: 0.8, stagger: 0.12 },
    )
      .to(".loader-digit", {
        y: -8,
        duration: 0.24,
        stagger: 0.08,
        repeat: 3,
        yoyo: true,
        ease: "sine.inOut",
      })
      .to(rootRef.current, { autoAlpha: 0, scale: 1.03, duration: 0.55 }, "+=0.25");

    return () => {
      intervals.forEach(window.clearInterval);
      window.clearTimeout(safetyTimeout);
      tl.kill();
    };
  }, [prefersReducedMotion]);

  return (
    <div className="loader" ref={rootRef} role="status" aria-live="polite">
      <div className="loader-inner">
        <div className="loader-number-row" aria-label="Loading 365">
          {digits.map((digit, index) => (
            <span className="loader-digit" key={`${index}-${targetDigits[index]}`}>
              {digit}
            </span>
          ))}
        </div>
        <span className="loader-caption">Alineando 365 THE BEGINNING</span>
      </div>
    </div>
  );
}
