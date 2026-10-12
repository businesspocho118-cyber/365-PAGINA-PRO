"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ScrollChoreographyProps = {
  active: boolean;
  contentVersion?: number;
};

export function ScrollChoreography({ active, contentVersion = 0 }: ScrollChoreographyProps) {
  useGSAP(
    () => {
      if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        // En móviles, aseguramos opacidad completa para evitar texto o libros lavados/transparentes
        gsap.utils.toArray<HTMLElement>("[data-scroll-reveal]").forEach((target) => {
          gsap.set(target, { autoAlpha: 1, y: 0 });
        });
        ScrollTrigger.refresh();
        return;
      }

      const lowPower =
        (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4);

      gsap.utils.toArray<HTMLElement>("[data-scroll-section]").forEach((section) => {
        const revealTargets = section.querySelectorAll<HTMLElement>("[data-scroll-reveal]");
        if (!revealTargets.length) return;

        gsap.fromTo(
          revealTargets,
          { y: lowPower ? 24 : 52, autoAlpha: 0.22 },
          {
            y: 0,
            autoAlpha: 1,
            stagger: lowPower ? 0.035 : 0.07,
            ease: lowPower ? "power2.out" : "none",
            scrollTrigger: {
              trigger: section,
              start: "top 88%",
              end: lowPower ? "top 62%" : "top 48%",
              scrub: lowPower ? false : 0.72,
              toggleActions: lowPower ? "play none none reverse" : undefined,
            },
          },
        );
      });

      if (!lowPower) {
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
          const distance = Number(element.dataset.parallax ?? 8);
          gsap.fromTo(
            element,
            { yPercent: -distance },
            {
              yPercent: distance,
              ease: "none",
              scrollTrigger: {
                trigger: element.closest("[data-scroll-section]") ?? element,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.1,
              },
            },
          );
        });
      }

      ScrollTrigger.refresh();
    },
    { dependencies: [active, contentVersion], revertOnUpdate: true },
  );

  return null;
}
