import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { LogoMark } from "@/components/Logo";

export function Gate({ children }: { children: ReactNode }) {
  const myProfile = useQuery(api.profiles.myProfile);

  if (myProfile === undefined) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LogoMark size={64} className="animate-[pulse_1.5s_ease-in-out_infinite]" />
          <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full vybe-gradient" />
          </div>
        </div>
      </div>
    );
  }

  if (!myProfile || !myProfile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
