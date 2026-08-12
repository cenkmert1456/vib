import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";
import { Preferences } from "@capacitor/preferences";
import { PushNotifications } from "@capacitor/push-notifications";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style as StatusBarStyle } from "@capacitor/status-bar";

/**
 * VYBE mobile platform bridge.
 *
 * All native-only behaviour is guarded by `isNative()`, so the app keeps
 * working as a normal web app when running in a browser or the preview
 * environment. On device, this module wires up:
 *
 *  - Status bar + splash screen (dark, edge-to-edge)
 *  - Keyboard handling
 *  - Deep links (custom URL scheme + universal links)
 *  - Push notifications (registration, permission, tap-to-navigate)
 *  - Haptic feedback (via src/lib/haptics.ts)
 */

const VYBE_NAVIGATE_EVENT = "vybe:navigate";
const PUSH_TOKEN_KEY = "vybe.push.token";

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/** Dispatch an internal navigation request handled by the router. */
function requestNavigate(path: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(VYBE_NAVIGATE_EVENT, { detail: path }));
}

/** Register a listener that the router uses to perform navigation. */
export function onNativeNavigate(cb: (path: string) => void): () => void {
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<string>).detail;
    if (typeof detail === "string" && detail.startsWith("/")) cb(detail);
  };
  window.addEventListener(VYBE_NAVIGATE_EVENT, handler);
  return () => window.removeEventListener(VYBE_NAVIGATE_EVENT, handler);
}

/** Extract a router path from a push payload or deep link URL. */
export function routeFromPayload(data: Record<string, unknown> | undefined): string | null {
  if (!data) return null;
  const raw = data.route ?? data.path ?? data.url;
  if (typeof raw !== "string") return null;
  try {
    // Accept both "/app/chat/..." and "vybe://app/chat/..." style values.
    const parsed = new URL(raw, "https://vybe.local");
    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return path.startsWith("/") ? path : null;
  } catch {
    return raw.startsWith("/") ? raw : null;
  }
}

/** Store the latest push token for the backend to consume. */
export async function storePushToken(token: string): Promise<void> {
  try {
    await Preferences.set({ key: PUSH_TOKEN_KEY, value: token });
  } catch {
    /* non-fatal */
  }
}

export async function getPushToken(): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key: PUSH_TOKEN_KEY });
    return value ?? null;
  } catch {
    return null;
  }
}

/**
 * Initialize native platform behaviour. Safe to call on web (no-ops).
 * Returns a cleanup function for app lifecycle listeners.
 */
export function initMobilePlatform(): () => void {
  if (!isNative()) return () => {};

  const cleanups: Array<() => void> = [];

  // Dark, edge-to-edge status bar over the deep dark app background.
  StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
  StatusBar.setStyle({ style: StatusBarStyle.Dark }).catch(() => {});
  StatusBar.setBackgroundColor({ color: "#0b0b12" }).catch(() => {});

  // Hide the splash screen once the web app is interactive.
  SplashScreen.hide({ fadeOutDuration: 250 }).catch(() => {});

  // Proper keyboard behaviour (resize the webview, avoid covering inputs).
  Keyboard.setResizeMode({ mode: KeyboardResize.Native }).catch(() => {});

  // Deep links: custom scheme (vybe://) and universal links.
  void CapacitorApp.addListener("appUrlOpen", (event) => {
    const path = routeFromPayload({ url: event.url });
    if (path) requestNavigate(path);
  });

  // Push notifications: register, ask permission, navigate on tap.
  const registerPush = async () => {
    try {
      let perm = await PushNotifications.checkPermissions();
      if (perm.receive === "prompt") {
        perm = await PushNotifications.requestPermissions();
      }
      if (perm.receive !== "granted") return;
      await PushNotifications.register();
    } catch {
      // FCM not configured (no google-services.json / APNs yet): the app
      // keeps working; only push delivery is unavailable.
      return;
    }
  };

  void PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
    const path = routeFromPayload(notification.notification.data);
    if (path) requestNavigate(path);
  });

  void PushNotifications.addListener("registration", (token) => {
    void storePushToken(token.value);
  });

  void registerPush();

  return () => {
    cleanups.forEach((off) => off());
  };
}
