import "@vly-ai/integrations";
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { Gate } from "@/components/Gate";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ThemeProvider } from "next-themes";
import React, { StrictMode, lazy, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import { I18nProvider } from "@/lib/i18n";
import { LogoMark } from "@/components/Logo";
import "./index.css";

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

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
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

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <ConvexAuthProvider client={convex}>
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
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
