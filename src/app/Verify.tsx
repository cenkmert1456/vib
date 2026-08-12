import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router";
import { useI18n, type TKey } from "@/lib/i18n";
import { ScreenHeader } from "@/components/mobile/ui";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  BadgeCheck,
  Camera,
  Check,
  Lightbulb,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Mode = "intro" | "requesting" | "live" | "analyzing" | "unavailable" | "pending" | "success" | "failed";

const TIPS: TKey[] = [
  "verify.live.tip1",
  "verify.live.tip2",
  "verify.live.tip3",
  "verify.live.tip4",
];

export default function Verify() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const status = useQuery(api.verification.myVerification);

  const startVerification = useMutation(api.verification.startVerification);
  const retryVerification = useMutation(api.verification.retryVerification);
  const submitLiveness = useMutation(api.verification.submitLiveness);
  const getVerificationStatus = useMutation(api.verification.getVerificationStatus);

  const [mode, setMode] = useState<Mode>("intro");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [providerConfigured, setProviderConfigured] = useState(false);
  const [, setResults] = useState<string[]>([]);
  const [, setCapturedAt] = useState<number[]>([]);
  const startedRef = useRef(false);

  // Entry state derived from the live verification status query.
  useEffect(() => {
    if (!status || startedRef.current) return;
    if (status.verified) {
      setMode("success");
    } else if (status.status === "not_started") {
      setMode("intro");
    } else if (status.status === "processing" || status.status === "manual_review" || status.status === "pending") {
      setMode("pending");
    } else if (status.status === "failed") {
      setMode("failed");
    }
  }, [status]);

  // Poll the authoritative status while in review (only when a provider is
  // configured — manual review is confirmed by a human reviewer).
  useEffect(() => {
    if (mode !== "pending" || !sessionId || !providerConfigured) return;
    let cancelled = false;
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts += 1;
      if (cancelled || attempts > 12) {
        clearInterval(timer);
        return;
      }
      try {
        const res = await getVerificationStatus({ sessionId: sessionId as any });
        if (res.status === "verified") {
          clearInterval(timer);
          setMode("success");
        } else if (res.status === "failed") {
          clearInterval(timer);
          setMode("failed");
        }
      } catch {
        /* transient poll errors are fine — the query re-syncs */
      }
    }, 6000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [mode, sessionId, providerConfigured, getVerificationStatus]);

  const beginSession = useCallback(
    async (useRetry: boolean) => {
      try {
        const res = useRetry
          ? await retryVerification()
          : await startVerification();
        setSessionId(res.sessionId);
        setChallenges(res.challengeSequence ?? []);
        setProviderConfigured(res.providerConfigured ?? false);
        setResults([]);
        setCapturedAt([]);
        startedRef.current = true;
        setMode("live");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t("common.error"));
        setMode("intro");
      }
    },
    [startVerification, retryVerification, t],
  );

  const finishChallenges = async (r: string[], c: number[]) => {
    if (!sessionId) return;
    setMode("analyzing");
    try {
      const res = await submitLiveness({
        sessionId: sessionId as any,
        results: r,
        capturedAt: c,
      });
      if (res.status === "verified") setMode("success");
      else if (res.status === "failed") setMode("failed");
      else setMode("pending");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
      setMode("live");
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-background">
      <ScreenHeader title={t("verify.title")} onBack={() => navigate(-1)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex flex-1 flex-col"
          >
            {mode === "intro" && (
              <IntroView
                onStart={() => void beginSession(false)}
                onBack={() => navigate(-1)}
              />
            )}
            {mode === "live" && challenges.length > 0 && (
              <CameraFlow
                challenges={challenges}
                onCancel={() => setMode("intro")}
                onComplete={(r, c) => void finishChallenges(r, c)}
              />
            )}
            {mode === "requesting" && (
              <Centered>
                <Loader2 className="size-7 animate-spin text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">{t("common.loading")}</p>
              </Centered>
            )}
            {mode === "analyzing" && (
              <Centered>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  className="flex size-16 items-center justify-center rounded-full vybe-gradient shadow-glow"
                >
                  <ShieldCheck className="size-8 text-white" />
                </motion.div>
                <p className="mt-4 font-display text-lg font-bold">
                  {t("verify.live.analyzing")}
                </p>
              </Centered>
            )}
            {mode === "unavailable" && (
              <Centered>
                <Camera className="size-10 text-muted-foreground" />
                <p className="mt-3 max-w-xs text-center text-sm text-muted-foreground">
                  {t("verify.live.deniedDesc")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setMode("intro")}
                  className="mt-5 h-11 rounded-full border-border bg-card px-6 font-semibold"
                >
                  {t("common.back")}
                </Button>
              </Centered>
            )}
            {mode === "pending" && (
              <PendingView
                onCheckAgain={() => {
                  if (sessionId) void getVerificationStatus({ sessionId: sessionId as any });
                }}
              />
            )}
            {mode === "success" && <SuccessView onDone={() => navigate(-1)} />}
            {mode === "failed" && (
              <FailedView
                onRetry={() => void beginSession(true)}
                onSupport={() => navigate("/app/settings")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      {children}
    </div>
  );
}

function IntroView({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4 pt-2">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/50 p-5">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/15 blur-3xl" />
          <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400">
            <ShieldCheck className="size-6" />
          </div>
          <h2 className="mt-3 font-display text-xl font-bold">
            {t("verify.live.title")}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {t("verify.live.subtitle")}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {TIPS.map((tip) => (
            <div
              key={tip}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/50 px-4 py-3"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Lightbulb className="size-4" />
              </div>
              <div>
                <p className="text-sm font-bold">{t(tip)}</p>
                <p className="text-xs text-muted-foreground">{t(`${tip}d` as TKey)}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 rounded-2xl border border-border/60 bg-card/40 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
          {t("verify.reviewNote")}
        </p>
      </div>
      <div className="border-t border-border/60 bg-background/90 px-5 pb-safe pt-3 backdrop-blur">
        <Button
          onClick={onStart}
          className="h-13 w-full rounded-full vybe-gradient text-base font-bold text-white shadow-glow"
        >
          <Camera className="size-5" />
          {t("verify.live.start")}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="mt-2.5 h-10 w-full text-sm font-semibold text-muted-foreground active:opacity-70"
        >
          {t("common.back")}
        </button>
      </div>
    </div>
  );
}

function CameraFlow({
  challenges,
  onCancel,
  onComplete,
}: {
  challenges: string[];
  onCancel: () => void;
  onComplete: (results: string[], capturedAt: number[]) => void;
}) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const [times, setTimes] = useState<number[]>([]);

  // Request the front camera using the native platform permission flow.
  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setPermissionDenied(true);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setReady(true);
      } catch {
        setPermissionDenied(true);
      }
    }
    void init();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    // Local proof-of-liveness frame — never uploaded or stored server-side.
    const w = 320;
    const h = Math.round((video.videoHeight / Math.max(1, video.videoWidth)) * w);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
  };

  const done = () => {
    capture();
    const nextResults = [...results, challenges[step]];
    const nextTimes = [...times, Date.now()];
    setResults(nextResults);
    setTimes(nextTimes);
    if (step + 1 >= challenges.length) {
      onComplete(nextResults, nextTimes);
    } else {
      setStep((s) => s + 1);
    }
  };

  if (permissionDenied) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <X className="size-6" />
        </div>
        <h2 className="mt-4 font-display text-lg font-bold">{t("verify.live.denied")}</h2>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          {t("verify.live.deniedDesc")}
        </p>
        <div className="mt-5 flex gap-2.5">
          <Button
            variant="outline"
            onClick={onCancel}
            className="h-11 rounded-full border-border bg-card px-5 text-sm font-semibold"
          >
            {t("common.back")}
          </Button>
          <Button
            onClick={() => setPermissionDenied(false)}
            className="h-11 rounded-full vybe-gradient px-5 text-sm font-bold text-white shadow-glow"
          >
            <RefreshCw className="size-4" />
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <Centered>
        <Loader2 className="size-7 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">{t("verify.live.permission")}</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground/70">
          {t("verify.live.permissionDesc")}
        </p>
      </Centered>
    );
  }

  const challenge = challenges[step];
  const progress = ((step) / challenges.length) * 100;

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-black">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Face guide overlay */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2">
          <div className="relative size-[240px] rounded-full border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
        </div>
        <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2">
          <div className="relative size-[236px] rounded-full border border-primary/60" />
        </div>
      </div>

      {/* Top: step progress */}
      <div className="relative z-10 px-5 pt-safe pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-white/80">
            {t("verify.live.step", { current: Math.min(step + 1, challenges.length), total: challenges.length })}
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur active:bg-black/60"
            aria-label={t("common.cancel")}
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Challenge card */}
      <div className="relative z-10 mt-auto px-5 pb-safe pb-6">
        <motion.div
          key={challenge}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="glass rounded-3xl border border-white/20 p-5 text-center shadow-2xl"
        >
          <motion.div
            key={challenge}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mx-auto flex size-12 items-center justify-center rounded-full vybe-gradient shadow-glow"
          >
            <Sparkles className="size-6 text-white" />
          </motion.div>
          <p className="mt-3 font-display text-lg font-bold text-white">
            {t(`verify.live.challenge.${challenge}` as TKey)}
          </p>
          <p className="mt-1 text-xs text-white/60">{t("verify.live.permissionDesc")}</p>
          <Button
            onClick={done}
            className="mt-4 h-12 w-full rounded-full vybe-gradient text-base font-bold text-white shadow-glow"
          >
            <Check className="size-5" />
            {t("verify.live.done")}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function PendingView({ onCheckAgain }: { onCheckAgain: () => void }) {
  const { t } = useI18n();
  const [checking, setChecking] = useState(false);
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex size-16 items-center justify-center rounded-full bg-sky-500/15 text-sky-400"
        >
          <ShieldCheck className="size-8" />
        </motion.div>
      </div>
      <h2 className="mt-4 font-display text-lg font-bold">
        {t("verify.live.pending")}
      </h2>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        {t("verify.live.pendingDesc")}
      </p>
      <Button
        variant="outline"
        disabled={checking}
        onClick={() => {
          setChecking(true);
          onCheckAgain();
          setTimeout(() => setChecking(false), 1500);
        }}
        className="mt-5 h-11 rounded-full border-border bg-card px-6 text-sm font-semibold"
      >
        {checking ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        {t("common.retry")}
      </Button>
    </div>
  );
}

function SuccessView({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="relative"
      >
        <div className="flex size-24 items-center justify-center rounded-full vybe-gradient shadow-glow">
          <BadgeCheck className="size-12 text-white" />
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.span
            key={i}
            initial={{ opacity: 1, scale: 0.4 }}
            animate={{ opacity: 0, scale: 1.6 }}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.7, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 size-2 rounded-full bg-primary"
            style={{
              transform: `rotate(${i * 60}deg) translateX(${60 + (i % 2) * 14}px)`,
            }}
          />
        ))}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-5 font-display text-2xl font-bold"
      >
        {t("verify.success.title")}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-2 max-w-xs text-sm text-muted-foreground"
      >
        {t("verify.success.desc")}
      </motion.p>
      <Button
        onClick={onDone}
        className="mt-7 h-12 rounded-full vybe-gradient px-8 font-bold text-white shadow-glow"
      >
        {t("common.done")}
      </Button>
    </div>
  );
}

function FailedView({ onRetry, onSupport }: { onRetry: () => void; onSupport: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <X className="size-7" />
      </div>
      <h2 className="mt-4 font-display text-lg font-bold">{t("verify.failed.title")}</h2>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        {t("verify.failed.desc")}
      </p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2.5">
        <Button
          onClick={onRetry}
          className="h-12 w-full rounded-full vybe-gradient font-bold text-white shadow-glow"
        >
          <RefreshCw className="size-4" />
          {t("verify.retry")}
        </Button>
        <Button
          variant="outline"
          onClick={onSupport}
          className="h-12 w-full rounded-full border-border bg-card font-semibold"
        >
          {t("verify.support")}
        </Button>
      </div>
    </div>
  );
}
