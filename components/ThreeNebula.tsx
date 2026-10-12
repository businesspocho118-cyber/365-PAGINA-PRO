"use client";

import { useEffect, useRef } from "react";
import type * as THREE from "three";

export function ThreeNebula() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower =
      window.matchMedia("(max-width: 720px)").matches ||
      (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4);

    if (!canvas || reduceMotion) {
      return;
    }

    let frameId = 0;
    let disposed = false;

    async function setup() {
      const THREE = await import("three");

      if (!canvas || disposed) {
        return;
      }

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !lowPower,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(lowPower ? 1 : Math.min(window.devicePixelRatio, 1.5));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.set(0, 0, 8.5);

      // 1. Deep space starry field (background star dust spanning entire screen)
      const starCount = lowPower ? 420 : 980;
      const starPositions = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount; i += 1) {
        // Distribute wide to cover ultra-wide & tall aspect ratios seamlessly
        if (i < starCount * 0.45) {
          // Perimeter & edge stardust spanning wide across viewport
          starPositions[i * 3] = (Math.random() - 0.5) * 34.0;
          starPositions[i * 3 + 1] = (Math.random() - 0.5) * 22.0;
          starPositions[i * 3 + 2] = (Math.random() - 0.5) * 12.0;
        } else {
          // Ambient cosmic ring / swirl near center & mid-distance
          const radius = 1.5 + Math.random() * 15.0;
          const angle = Math.random() * Math.PI * 2;
          const depth = (Math.random() - 0.5) * 10.0;
          starPositions[i * 3] = Math.cos(angle) * radius;
          starPositions[i * 3 + 1] = Math.sin(angle) * radius * 0.75;
          starPositions[i * 3 + 2] = depth;
        }

        const rand = Math.random();
        if (rand > 0.68) {
          // Warm gold star
          starColors[i * 3] = 1.0;
          starColors[i * 3 + 1] = 0.88;
          starColors[i * 3 + 2] = 0.72;
        } else if (rand > 0.32) {
          // Ethereal violet
          starColors[i * 3] = 0.78;
          starColors[i * 3 + 1] = 0.55;
          starColors[i * 3 + 2] = 1.0;
        } else {
          // Cyan shimmer
          starColors[i * 3] = 0.45;
          starColors[i * 3 + 1] = 0.95;
          starColors[i * 3 + 2] = 0.9;
        }
      }

      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
      starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

      const starMaterial = new THREE.PointsMaterial({
        size: 0.038,
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      // 2. CELESTIAL SPHERE & ORBITAL ARMILLARY SYSTEM
      const celestialGroup = new THREE.Group();
      scene.add(celestialGroup);

      // A) The Glowing Celestial Sphere Core (Custom Fresnel / Iridescent Shader)
      const sphereGeometry = new THREE.SphereGeometry(1.36, lowPower ? 32 : 64, lowPower ? 32 : 64);
      const sphereMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying vec3 vViewPosition;

          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          precision highp float;
          uniform float uTime;
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying vec3 vViewPosition;

          void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);

            // Fresnel rim glow
            float NdotV = max(dot(normal, viewDir), 0.0);
            float fresnel = pow(1.0 - NdotV, 2.7);

            // Shifting cosmic aura colors along the rim
            vec3 royalViolet = vec3(0.55, 0.22, 1.0);
            vec3 celestialGold = vec3(1.0, 0.84, 0.62);
            vec3 cyanGlow = vec3(0.28, 0.95, 0.85);

            float colorCycle = sin(uTime * 0.7 + vPosition.y * 1.8) * 0.5 + 0.5;
            vec3 rimColor = mix(royalViolet, celestialGold, colorCycle);
            rimColor = mix(rimColor, cyanGlow, pow(fresnel, 2.0) * 0.4);

            // Deep obsidian interior with subtle inner nebula pulse
            vec3 innerCore = vec3(0.045, 0.015, 0.08);
            float innerPulse = sin(vPosition.x * 2.5 + uTime * 0.45) * cos(vPosition.y * 2.5 + uTime * 0.35);
            innerCore += royalViolet * (innerPulse * 0.08 + 0.08);

            vec3 finalColor = mix(innerCore, rimColor, fresnel);
            float alpha = clamp(0.28 + fresnel * 0.65, 0.0, 0.92);

            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
      });

      const celestialSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      celestialGroup.add(celestialSphere);

      // B) Inner Geometric Lattice (adds intricate depth inside the sphere)
      const latticeGeometry = new THREE.IcosahedronGeometry(1.42, 2);
      const latticeMaterial = new THREE.MeshBasicMaterial({
        color: 0xdfc0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
      });
      const coreLattice = new THREE.Mesh(latticeGeometry, latticeMaterial);
      celestialGroup.add(coreLattice);

      // C) Armillary Orbital Rings (3 concentric gyroscope rings)
      // Ring 1: Equatorial Golden Ring
      const ring1Geom = new THREE.TorusGeometry(2.15, 0.016, 16, 120);
      const ring1Mat = new THREE.MeshBasicMaterial({
        color: 0xffd6a5,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
      ring1.rotation.x = Math.PI * 0.35;
      ring1.rotation.y = Math.PI * 0.12;
      celestialGroup.add(ring1);

      // Ring 2: Inclined Cyan Ring
      const ring2Geom = new THREE.TorusGeometry(2.38, 0.014, 16, 120);
      const ring2Mat = new THREE.MeshBasicMaterial({
        color: 0x87ffe2,
        transparent: true,
        opacity: 0.68,
        blending: THREE.AdditiveBlending,
      });
      const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
      ring2.rotation.x = -Math.PI * 0.28;
      ring2.rotation.z = Math.PI * 0.45;
      celestialGroup.add(ring2);

      // Ring 3: Outer Violet Celestial Meridian
      const ring3Geom = new THREE.TorusGeometry(2.65, 0.012, 16, 120);
      const ring3Mat = new THREE.MeshBasicMaterial({
        color: 0xb984ff,
        transparent: true,
        opacity: 0.58,
        blending: THREE.AdditiveBlending,
      });
      const ring3 = new THREE.Mesh(ring3Geom, ring3Mat);
      ring3.rotation.y = Math.PI * 0.55;
      ring3.rotation.z = -Math.PI * 0.2;
      celestialGroup.add(ring3);

      // D) Orbiting Stardust Belt (particles swirling around the sphere)
      const beltCount = lowPower ? 70 : 160;
      const beltPositions = new Float32Array(beltCount * 3);
      const beltColors = new Float32Array(beltCount * 3);

      for (let i = 0; i < beltCount; i += 1) {
        const theta = Math.random() * Math.PI * 2;
        const r = 2.1 + (Math.random() - 0.5) * 0.35;
        beltPositions[i * 3] = Math.cos(theta) * r;
        beltPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.25;
        beltPositions[i * 3 + 2] = Math.sin(theta) * r;

        if (i % 2 === 0) {
          beltColors[i * 3] = 1.0;
          beltColors[i * 3 + 1] = 0.85;
          beltColors[i * 3 + 2] = 0.65;
        } else {
          beltColors[i * 3] = 0.52;
          beltColors[i * 3 + 1] = 1.0;
          beltColors[i * 3 + 2] = 0.88;
        }
      }

      const beltGeom = new THREE.BufferGeometry();
      beltGeom.setAttribute("position", new THREE.BufferAttribute(beltPositions, 3));
      beltGeom.setAttribute("color", new THREE.BufferAttribute(beltColors, 3));
      const beltMat = new THREE.PointsMaterial({
        size: 0.038,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const orbitalDust = new THREE.Points(beltGeom, beltMat);
      orbitalDust.rotation.x = Math.PI * 0.35;
      celestialGroup.add(orbitalDust);

      // 3. Subtle background cosmic aura plane
      const pointerTarget = new THREE.Vector2(0, 0);
      const pointerCurrent = new THREE.Vector2(0, 0);
      let scrollTarget = 0;
      let scrollCurrent = 0;

      const auraMaterial = lowPower
        ? null
        : new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms: {
              uTime: { value: 0 },
              uScroll: { value: 0 },
              uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            },
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              precision highp float;
              uniform float uTime;
              uniform float uScroll;
              uniform vec2 uResolution;
              varying vec2 vUv;

              void main() {
                vec2 p = vUv - 0.5;
                p.x *= uResolution.x / max(uResolution.y, 1.0);

                float t = uTime * 0.03 + uScroll * 1.5;
                float w1 = sin(p.x * 2.4 + t * 0.5) * cos(p.y * 2.2 + t * 0.4);
                float w2 = cos(length(p) * 3.2 - t * 0.45);
                float aura = smoothstep(-0.9, 0.9, w1 * 0.6 + w2 * 0.4);

                vec3 spaceBlack = vec3(0.02, 0.006, 0.04);
                vec3 violetAura = vec3(0.26, 0.06, 0.46);
                vec3 softCyan = vec3(0.08, 0.38, 0.42);

                vec3 col = mix(spaceBlack, violetAura, aura * 0.65);
                col = mix(col, softCyan, clamp(w2 * 0.35, 0.0, 1.0) * aura);

                float vignette = smoothstep(2.8, 0.3, length(p));
                float alpha = clamp((0.04 + aura * 0.16) * vignette, 0.0, 0.3);

                gl_FragColor = vec4(col, alpha);
              }
            `,
          });

      const auraPlane = auraMaterial ? new THREE.Mesh(new THREE.PlaneGeometry(54, 36), auraMaterial) : null;
      if (auraPlane) {
        auraPlane.position.z = -3.2;
        scene.add(auraPlane);
      }

      function onPointerMove(event: PointerEvent) {
        pointerTarget.set((event.clientX / window.innerWidth) * 2 - 1, 1 - (event.clientY / window.innerHeight) * 2);
      }

      function onScroll() {
        const distance = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        scrollTarget = Math.min(Math.max(window.scrollY / distance, 0), 1);
      }

      function resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        auraMaterial?.uniforms.uResolution.value.set(width, height);
      }

      function render(time: number) {
        const seconds = time / 1000;

        // Background stars gentle drift
        stars.rotation.z = seconds * 0.008;
        stars.rotation.y = Math.sin(seconds * 0.09) * 0.03;

        // Smooth lerping for cursor and scroll
        pointerCurrent.lerp(pointerTarget, 0.045);
        scrollCurrent += (scrollTarget - scrollCurrent) * 0.055;

        // Update shader uniforms
        sphereMaterial.uniforms.uTime.value = seconds;
        if (auraMaterial) {
          auraMaterial.uniforms.uTime.value = seconds;
          auraMaterial.uniforms.uScroll.value = scrollCurrent;
        }

        // ==========================================
        // 3D CELESTIAL SPHERE SCROLL TRAJECTORY
        // Wide-ranging motion traversing the entire screen with scroll
        // ==========================================
        const t = scrollCurrent;

        const isMobileScreen = window.innerWidth <= 768;
        // On mobile, keep displacement centered and narrower so it doesn't block text
        const targetX = isMobileScreen
          ? Math.sin(t * Math.PI * 2.0) * 0.6
          : Math.sin(t * Math.PI * 3.2) * 4.6 + Math.cos(t * Math.PI * 1.5) * 1.5 + pointerCurrent.x * 0.7;
        const targetY = isMobileScreen
          ? Math.cos(t * Math.PI * 2.0) * 1.0 - (t * 0.8) + 0.3
          : Math.cos(t * Math.PI * 2.6) * 2.3 - (t * 1.3) + pointerCurrent.y * 0.52;
        const targetZ = isMobileScreen ? -1.4 : Math.sin(t * Math.PI * 2.2) * 1.35;
        // Scale down celestial armillary sphere on mobile so it's a subtle backdrop, not an overpowering obstacle
        const mobileScaleMultiplier = isMobileScreen ? 0.48 : 1.0;
        const targetScale = (1.34 + Math.sin(t * Math.PI * 3.0) * 0.36) * mobileScaleMultiplier;

        celestialGroup.position.x += (targetX - celestialGroup.position.x) * 0.065;
        celestialGroup.position.y += (targetY - celestialGroup.position.y) * 0.065;
        celestialGroup.position.z += (targetZ - celestialGroup.position.z) * 0.065;
        celestialGroup.scale.setScalar(targetScale);

        // Soften ring opacities on mobile
        ring1Mat.opacity = isMobileScreen ? 0.28 : 0.75;
        ring2Mat.opacity = isMobileScreen ? 0.24 : 0.68;
        ring3Mat.opacity = isMobileScreen ? 0.20 : 0.58;

        // Continuous rotational spin + scroll-driven acceleration
        celestialGroup.rotation.y = seconds * 0.16 + scrollCurrent * 6.5;
        celestialGroup.rotation.x = Math.sin(seconds * 0.18) * 0.22 + scrollCurrent * 2.4;

        coreLattice.rotation.x = seconds * 0.1 - scrollCurrent * 2.8;
        coreLattice.rotation.y = seconds * 0.14 + scrollCurrent * 3.4;

        ring1.rotation.z = seconds * 0.25 + scrollCurrent * 4.6;
        ring2.rotation.x = -seconds * 0.22 - scrollCurrent * 3.8;
        ring3.rotation.y = seconds * 0.18 + scrollCurrent * 3.2;
        orbitalDust.rotation.z = -seconds * 0.2 - scrollCurrent * 5.2;

        // Subtle camera parallax
        camera.position.x += (pointerCurrent.x * 0.12 - camera.position.x) * 0.03;
        camera.position.y += (pointerCurrent.y * 0.08 - camera.position.y) * 0.03;

        renderer.render(scene, camera);
        frameId = window.requestAnimationFrame(render);
      }

      resize();
      onScroll();
      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      frameId = window.requestAnimationFrame(render);

      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("scroll", onScroll);
        window.cancelAnimationFrame(frameId);

        starGeometry.dispose();
        starMaterial.dispose();
        sphereGeometry.dispose();
        sphereMaterial.dispose();
        latticeGeometry.dispose();
        latticeMaterial.dispose();
        ring1Geom.dispose();
        ring1Mat.dispose();
        ring2Geom.dispose();
        ring2Mat.dispose();
        ring3Geom.dispose();
        ring3Mat.dispose();
        beltGeom.dispose();
        beltMat.dispose();
        auraPlane?.geometry.dispose();
        auraMaterial?.dispose();
        renderer.dispose();
      };
    }

    let cleanup: (() => void) | undefined;
    setup()
      .then((dispose) => {
        cleanup = dispose;
        if (disposed) cleanup?.();
      })
      .catch(() => {});

    return () => {
      disposed = true;
      cleanup?.();
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas aria-hidden="true" className="ambient-canvas" ref={canvasRef} />;
}
