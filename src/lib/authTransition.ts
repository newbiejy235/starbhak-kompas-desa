import gsap from "gsap";

type StepDirection = "forward" | "back";
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Animasi keluar untuk kolom form sebelum pindah step/halaman.
 * "forward" -> konten geser ke kiri (maju).
 * "back"    -> konten geser ke kanan (mundur).
 *
 * onComplete selalu dipanggil (baik animasi jalan maupun di-skip),
 * sehingga navigasi (router.push / router.back) tidak pernah tertahan.
 */
export function animateStepExit(
  element: HTMLElement | null,
  direction: StepDirection,
  onComplete: () => void
) {
  if (!element || prefersReducedMotion()) {
    onComplete();
    return;
  }

  gsap.to(element, {
    opacity: 0,
    x: direction === "forward" ? -28 : 28,
    duration: 0.32,
    ease: "power2.in",
    onComplete,
  });
}
