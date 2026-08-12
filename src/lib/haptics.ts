export type HapticType = "light" | "medium" | "success" | "error";

const PATTERNS: Record<HapticType, number | number[]> = {
  light: 8,
  medium: [10, 30, 10],
  success: [12, 40, 18, 40, 12],
  error: [40, 30, 40],
};

let lastCall = 0;

/** Fire a small device vibration. No-op on unsupported browsers. */
export function haptic(type: HapticType = "light") {
  try {
    if (typeof navigator === "undefined" || !navigator.vibrate) return;
    const now = Date.now();
    if (now - lastCall < 60) return; // debounce rapid triggers
    lastCall = now;
    navigator.vibrate(PATTERNS[type]);
  } catch {
    /* ignore */
  }
}
