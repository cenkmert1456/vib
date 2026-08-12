import "@vly-ai/integrations";
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { Gate } from "@/components/Gate";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { InstrumentationProvider } from "./instrumentation.tsx";
import { ThemeProvider } from "next-themes";
import React, { StrictMode, lazy, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import { I18nProvider } from "@/lib/i18n";
import { LogoMark } from "@/components/Logo";
import { initMobilePlatform, onNativeNavigate } from "@/lib/mobile";
import "./index.css";

// Native-only setup (status bar, splash, deep links, push notifications).
// No-ops when running as a plain web app.
initMobilePlatform();

const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AppShell = lazy(() =>
  import("@/components/mobile/AppShell").then((m) => ({ default: m.AppShell })),
);
const Discover = lazy(() => import("./app/Discover.tsx"));
const Matches = lazy(() => import("./app/Matches.tsx"));
const Messages = lazy(() => import("./app/Messages.tsx"));
const Activity = lazy(() => import("./app/Activity.tsx"));
const MyProfile = lazy(() => import("./app/MyProfile.tsx"));
const ProfileDetail = lazy(() => import("./app/ProfileDetail.tsx"));
const MatchMoment = lazy(() => import("./app/MatchMoment.tsx"));
const Chat = lazy(() => import("./app/Chat.tsx"));
const EditProfile = lazy(() => import("./app/EditProfile.tsx"));
const Settings = lazy(() => import("./app/Settings.tsx"));
const Premium = lazy(() => import("./app/Premium.tsx"));
const Verify = lazy(() => import("./app/Verify.tsx"));

function RouteLoading() {
  return (
    <div className="flex h-dvh items-center justify-center bg-background">
      <LogoMark size={56} className="animate-[pulse_1.5s_ease-in-out_infinite]" />
    </div>
  );
}

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in WebContainer environment). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[WebContainer preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-muted-foreground/80 max-h-40 overflow-auto rounded border border-border/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Create the Convex client defensively. A missing or invalid
 * VITE_CONVEX_URL must never crash startup: instead of throwing at module
 * scope (which no error boundary can catch and leaves a blank screen), we
 * return null and render a friendly retry screen.
 */
function createConvexClient(): ConvexReactClient | null {
  const url = import.meta.env.VITE_CONVEX_URL;
  if (typeof url !== "string" || !url.trim()) return null;
  try {
    return new ConvexReactClient(url.trim());
  } catch (err) {
    console.error("[VYBE] Convex client initialization failed:", err);
    return null;
  }
}

/** Branded offline/backend-unavailable screen with a retry action. */
function BackendUnavailable() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-background px-8 text-center">
      <LogoMark size={76} variant="mark" className="opacity-90" />
      <h1 className="mt-7 font-display text-xl font-bold">
        VYBE can&apos;t connect right now
      </h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
        The app needs a connection to the VYBE backend to start. Check your
        connection and try again.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-7 flex h-12 items-center justify-center rounded-full vybe-gradient px-8 text-sm font-bold text-white shadow-glow transition-transform active:scale-[0.98]"
      >
        Try again
      </button>
    </div>
  );
}

/**
 * Provides Convex only when the client initializes successfully, so startup
 * always renders something instead of crashing with a blank screen.
 */
function ConvexGate({ children }: { children: React.ReactNode }) {
  const [client] = useState(createConvexClient);
  if (!client) return <BackendUnavailable />;
  return <ConvexAuthProvider client={client}>{children}</ConvexAuthProvider>;
}

function RouteSyncer() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Deep links + push notification taps on native platforms.
  useEffect(() => onNativeNavigate((path) => navigate(path)), [navigate]);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <InstrumentationProvider>
        <ToolbarErrorBoundary>
          <VlyToolbar />
        </ToolbarErrorBoundary>
        <ConvexGate>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <I18nProvider>
              <BrowserRouter>
                <RouteSyncer />
                <Suspense fallback={<RouteLoading />}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                  <Route
                    path="/auth"
                    element={<AuthPage redirectAfterAuth="/app/discover" />}
                  />
                  <Route
                    path="/onboarding"
                    element={
                      <RequireAuth>
                        <Onboarding />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/app"
                    element={
                      <RequireAuth>
                        <Gate>
                          <AppShell />
                        </Gate>
                      </RequireAuth>
                    }
                  >
                    <Route index element={<Navigate to="/app/discover" replace />} />
                    <Route path="discover" element={<Discover />} />
                    <Route path="matches" element={<Matches />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="activity" element={<Activity />} />
                    <Route path="profile" element={<MyProfile />} />
                  </Route>
                  <Route
                    path="/app/chat/:matchId"
                    element={
                      <RequireAuth>
                        <Gate>
                          <Chat />
                        </Gate>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/app/match/:matchId"
                    element={
                      <RequireAuth>
                        <Gate>
                          <MatchMoment />
                        </Gate>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/app/profile/:profileId"
                    element={
                      <RequireAuth>
                        <Gate>
                          <ProfileDetail />
                        </Gate>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/app/edit"
                    element={
                      <RequireAuth>
                        <Gate>
                          <EditProfile />
                        </Gate>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/app/settings"
                    element={
                      <RequireAuth>
                        <Gate>
                          <Settings />
                        </Gate>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/app/premium"
                    element={
                      <RequireAuth>
                        <Gate>
                          <Premium />
                        </Gate>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/app/verify"
                    element={
                      <RequireAuth>
                        <Gate>
                          <Verify />
                        </Gate>
                      </RequireAuth>
                    }
                  />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
              <Toaster position="top-center" />
            </I18nProvider>
          </ThemeProvider>
        </ConvexGate>
      </InstrumentationProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
