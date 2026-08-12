import { motion } from "framer-motion";
import { LogoMark } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Apple, ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/app/discover",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

type Step = "welcome" | "email" | "otp";

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );

  const [step, setStep] = useState<Step>("welcome");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerDialog, setProviderDialog] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("email", email);
      await signIn("email-otp", formData);
      setStep("otp");
      setIsLoading(false);
    } catch (err) {
      console.error("Email sign-in error:", err);
      setError(
        err instanceof Error ? err.message : t("common.networkError"),
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("code", otp);
      await signIn("email-otp", formData);
      navigate(redirect, { replace: true });
    } catch (err) {
      console.error("OTP error:", err);
      setError(t("auth.verifyError"));
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleOAuth = (provider: "Google" | "Apple") => {
    setProviderDialog(provider);
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[90px]" />
        <div className="absolute bottom-[-40px] right-[-40px] h-56 w-56 rounded-full bg-fuchsia-600/15 blur-[90px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-safe">
        {step === "welcome" ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-1 flex-col justify-center pb-10"
          >
            <div className="mb-10 flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <LogoMark size={92} variant="mark" />
              </motion.div>
              <h1 className="mt-6 font-display text-4xl font-bold tracking-tight">
                {t("auth.findYourVibe")}
              </h1>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {t("auth.subtitle")}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="h-13 rounded-full border-border bg-card text-base font-semibold transition-transform active:scale-[0.98]"
                onClick={() => handleOAuth("Apple")}
              >
                <Apple className="size-5" />
                {t("auth.continueWithApple")}
              </Button>
              <Button
                variant="outline"
                className="h-13 rounded-full border-border bg-card text-base font-semibold transition-transform active:scale-[0.98]"
                onClick={() => handleOAuth("Google")}
              >
                <GoogleIcon />
                {t("auth.continueWithGoogle")}
              </Button>
              <Button
                className="h-13 rounded-full vybe-gradient text-base font-bold text-white shadow-glow transition-transform active:scale-[0.98]"
                onClick={() => setStep("email")}
              >
                <Mail className="size-5" />
                {t("auth.continueWithEmail")}
              </Button>
            </div>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              {t("auth.ageNote")}
            </p>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="mt-2 text-center text-sm font-semibold text-primary"
            >
              {t("auth.alreadyAccount")} {t("auth.logIn")}
            </button>
            <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground/80">
              <ShieldCheck className="size-3.5" />
              {t("auth.termsNote")}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-1 flex-col justify-center pb-10"
          >
            <button
              type="button"
              onClick={() => setStep("welcome")}
              aria-label={t("common.back")}
              className="mb-6 -ml-2 flex size-10 items-center justify-center rounded-full text-foreground active:bg-muted"
            >
              <ArrowLeft className="size-5" />
            </button>

            <div className="mb-8">
              <LogoMark size={48} variant="mark" />
              <h1 className="mt-5 font-display text-2xl font-bold">
                {step === "otp" ? t("auth.checkEmail") : t("auth.emailTitle")}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {step === "otp" ? t("auth.codeSent", { email }) : t("auth.emailSubtitle")}
              </p>
            </div>

            {step === "email" ? (
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                <div>
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("auth.emailPlaceholder")}
                    className="h-13 rounded-2xl border-input bg-card px-4 text-base"
                    disabled={isLoading}
                  />
                  {error && (
                    <p className="mt-2 text-sm text-destructive">{error}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="h-13 rounded-full vybe-gradient text-base font-bold text-white shadow-glow"
                >
                  {isLoading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    t("auth.sendCode")
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5">
                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="size-12 rounded-xl border-border bg-card text-lg font-bold"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && (
                  <p className="text-center text-sm text-destructive">{error}</p>
                )}
                <Button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="h-13 rounded-full vybe-gradient text-base font-bold text-white shadow-glow"
                >
                  {isLoading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    t("auth.verify")
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setError(null);
                  }}
                  className="text-center text-sm font-semibold text-primary"
                >
                  {t("auth.useDifferentEmail")}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </div>

      {/* Provider not-enabled dialog */}
      <Dialog open={!!providerDialog} onOpenChange={(o) => !o && setProviderDialog(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("auth.providerUnavailable")}</DialogTitle>
            <DialogDescription>
              {providerDialog &&
                t("auth.providerUnavailableDesc", { provider: providerDialog })}
            </DialogDescription>
          </DialogHeader>
          <Button
            className="h-12 rounded-full vybe-gradient text-white"
            onClick={() => {
              setProviderDialog(null);
              setStep("email");
            }}
          >
            <Mail className="size-4" />
            {t("auth.continueWithEmail")}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.1 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.1-6.71-4.94H1.29v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6v-3.1H1.29a12 12 0 0 0 0 10.8l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.6l4 3.1C6.23 6.86 8.88 4.76 12 4.76Z"
      />
    </svg>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
