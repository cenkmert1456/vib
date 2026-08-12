import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Globe2,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router";
import { LogoMark } from "@/components/Logo";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

/** Splash: VYBE logo with a subtle animated entrance, shown once per session. */
function SplashScreen({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1900);
    return () => window.clearTimeout(timer);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[100px]" />
      </div>
      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <LogoMark size={96} className="shadow-glow rounded-[1.75rem]" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative mt-7 font-display text-2xl font-bold tracking-[0.24em]"
      >
        VYBE
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.65 }}
        className="relative mt-2 text-[13px] font-medium text-muted-foreground"
      >
        {t("landing.splashTagline")}
      </motion.p>
    </motion.div>
  );
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

function MiniProfileCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 4 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-56"
    >
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-b from-violet-500/25 via-fuchsia-500/15 to-transparent blur-2xl" />
      <div className="relative aspect-[3/4.2] overflow-hidden rounded-[1.75rem] border border-white/10 shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80"
          alt="Profile preview"
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-1.5">
            <p className="font-display text-lg font-bold text-white">Maya, 26</p>
          </div>
          <p className="mt-0.5 text-xs text-white/75">Istanbul · 3 km away</p>
          <div className="mt-2.5 flex gap-1.5">
            {["📷", "☕", "✈️"].map((e) => (
              <span
                key={e}
                className="rounded-full bg-white/15 px-2 py-0.5 text-xs backdrop-blur"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ repeat: Infinity, duration: 3, repeatDelay: 1.5 }}
          className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-white/90 shadow-lg"
        >
          <HeartHandshake className="size-5 text-fuchsia-600" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const { t } = useI18n();
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(() => {
    try {
      if (sessionStorage.getItem("vybe-splash-seen")) return false;
      sessionStorage.setItem("vybe-splash-seen", "1");
      return true;
    } catch {
      return false;
    }
  });

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <AnimatePresence>
        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      </AnimatePresence>

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[90px]" />
        <div className="absolute right-[-80px] top-1/3 h-64 w-64 rounded-full bg-fuchsia-600/15 blur-[90px]" />
        <div className="absolute bottom-[-60px] left-[-60px] h-64 w-64 rounded-full bg-sky-500/10 blur-[90px]" />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 lg:max-w-5xl lg:px-10">
        {/* Nav */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between pt-safe py-5"
        >
          <div className="flex items-center gap-2.5">
            <LogoMark size={34} />
            <span className="font-display text-xl font-bold tracking-[0.2em]">
              VYBE
            </span>
          </div>
          {isAuthenticated && !isLoading ? (
            <Link
              to="/app/discover"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              {t("landing.openApp")}
            </Link>
          ) : (
            <Link
              to="/auth"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              {t("auth.logIn")}
            </Link>
          )}
        </motion.header>

        {/* Hero */}
        <section className="flex flex-1 flex-col items-center py-10 lg:flex-row lg:gap-16 lg:py-16">
          <div className="flex flex-col items-center text-center lg:flex-1 lg:items-start lg:text-left">
            <motion.span
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary"
            >
              <Globe2 className="size-3.5" />
              {t("landing.eyebrow")}
            </motion.span>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="font-display text-5xl font-bold leading-[1.02] tracking-tight lg:text-6xl"
            >
              Find your
              <br />
              <span className="vybe-gradient-text">vibe.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-5 max-w-sm text-base leading-relaxed text-muted-foreground"
            >
              {t("landing.subheadline")}
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-8 flex w-full max-w-sm flex-col gap-3"
            >
              <Link
                to="/auth"
                className="group flex min-h-13 items-center justify-center gap-2 rounded-full vybe-gradient px-6 py-3.5 text-base font-bold text-white shadow-glow transition-transform active:scale-[0.98]"
              >
                {t("landing.cta")}
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <p className="text-center text-xs text-muted-foreground">
                {t("auth.ageNote")}
              </p>
            </motion.div>
          </div>

          {/* Phone preview */}
          <div className="mt-14 lg:mt-0 lg:flex-1">
            <MiniProfileCard />
          </div>
        </section>

        {/* Features */}
        <section className="grid gap-4 pb-10 sm:grid-cols-3 lg:gap-6">
          {[
            {
              icon: <HeartHandshake className="size-5" />,
              title: t("landing.feature1Title"),
              desc: t("landing.feature1Desc"),
            },
            {
              icon: <Globe2 className="size-5" />,
              title: t("landing.feature2Title"),
              desc: t("landing.feature2Desc"),
            },
            {
              icon: <ShieldCheck className="size-5" />,
              title: t("landing.feature3Title"),
              desc: t("landing.feature3Desc"),
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              custom={i}
              className="rounded-3xl border border-border/80 bg-card/70 p-5 backdrop-blur"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-primary">
                {f.icon}
              </div>
              <h3 className="font-display text-base font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </section>

        {/* Stats */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "1M+", label: t("landing.statsUsers") },
              { value: "3s", label: t("landing.statsMatches") },
              { value: "120+", label: t("landing.statsCountries") },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl font-bold vybe-gradient-text">
                  {s.value}
                </p>
                <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        <footer className="pb-safe pb-8 pt-2 text-center text-xs text-muted-foreground">
          <p>{t("landing.footer")}</p>
          <p className="mt-1 opacity-70">{t("app.tagline")}</p>
        </footer>
      </div>
    </div>
  );
}
