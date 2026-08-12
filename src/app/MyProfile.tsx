import { motion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router";
import { useI18n } from "@/lib/i18n";
import { ageFromDateOfBirth, profileCompletion } from "@/lib/format";
import { usePhotoUpload } from "@/components/mobile/PhotoUpload";
import { PhotoCarousel } from "@/components/mobile/PhotoCarousel";
import { VerifiedBadge, SectionTitle } from "@/components/mobile/ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Camera,
  Check,
  Clock,
  Crown,
  Flame,
  ImagePlus,
  Loader2,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MOODS } from "@/lib/constants";

export default function MyProfile() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const myProfile = useQuery(api.profiles.myProfile);
  const ent = useQuery(api.plans.myEntitlements);
  const verification = useQuery(api.verification.myVerification);

  if (!myProfile) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const completion = profileCompletion(myProfile);
  const age = ageFromDateOfBirth(myProfile.dateOfBirth);
  const needsVerify = verification?.status === "not_started";

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-5 pt-safe pb-2 pt-4">
        <h1 className="font-display text-[26px] font-bold leading-none">
          {t("nav.profile")}
        </h1>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label={t("profile.settings")}
            onClick={() => navigate("/app/settings")}
            className="flex size-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
          >
            <Settings className="size-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
        {/* Photos */}
        <div className="px-4">
          <PhotoCarousel
            photos={myProfile.photos}
            name={myProfile.firstName}
            className="aspect-[4/4.6] w-full rounded-3xl"
          />
        </div>

        <div className="px-5 pt-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold">
              {myProfile.firstName}, {age}
            </h2>
            <VerifiedBadge
              verified={myProfile.verified}
              status={myProfile.verificationStatus}
              size="md"
            />
          </div>
          {myProfile.city && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("common.inCity", { city: myProfile.city })}
            </p>
          )}

          {/* Membership */}
          <PremiumCard plan={ent?.plan ?? "free"} planName={ent?.planName ?? t("premium.free")} />

          {/* Completion */}
          {completion < 100 && (
            <button
              type="button"
              onClick={() => navigate("/app/edit")}
              className="mt-3 w-full rounded-2xl border border-primary/25 bg-primary/5 p-4 text-left"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">
                  {t("profile.completion", { pct: completion })}
                </p>
                <Sparkles className="size-4 text-primary" />
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full rounded-full vybe-gradient"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t("profile.completionHint")}
              </p>
            </button>
          )}

          {/* Verify */}
          {needsVerify && (
            <button
              type="button"
              onClick={() => navigate("/app/verify")}
              className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 text-left active:bg-muted/60"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-400">
                <ShieldCheck className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{t("profile.verify")}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("profile.verifyDesc")}
                </p>
              </div>
              <span className="text-xs font-bold text-primary">{t("common.continue")} →</span>
            </button>
          )}

          {/* Boost */}
          <BoostCard />

          {/* Actions */}
          <div className="mt-4 flex gap-2.5">
            <Button
              onClick={() => navigate("/app/edit")}
              className="h-12 flex-1 rounded-full vybe-gradient text-sm font-bold text-white shadow-glow"
            >
              <SlidersHorizontal className="size-4" />
              {t("profile.edit")}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/app/settings")}
              className="h-12 flex-1 rounded-full border-border bg-card text-sm font-semibold"
            >
              <Settings className="size-4" />
              {t("profile.settings")}
            </Button>
          </div>

          {/* Question of the day */}
          <QotdCard />

          {/* Moments */}
          <MomentsSection />

          {/* Bio */}
          <div className="mt-6">
            <SectionTitle>{t("profile.bio")}</SectionTitle>
            <p className="mt-2 text-[15px] leading-relaxed">
              {myProfile.bio || (
                <span className="text-muted-foreground">{t("profile.bioEmpty")}</span>
              )}
            </p>
          </div>

          {/* Interests */}
          <div className="mt-6">
            <SectionTitle>{t("profile.interests")}</SectionTitle>
            {myProfile.interests.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {myProfile.interests.map((i) => (
                  <span
                    key={i}
                    className="rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary"
                  >
                    {i}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {t("profile.interestsEmpty")}
              </p>
            )}
          </div>

          {/* Languages */}
          {myProfile.languages.length > 0 && (
            <div className="mt-6">
              <SectionTitle>{t("profile.languages")}</SectionTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                {myProfile.languages.join(" · ")}
              </p>
            </div>
          )}

          {/* Prompts */}
          <div className="mt-6 space-y-3">
            <SectionTitle>{t("profile.prompts")}</SectionTitle>
            {myProfile.prompts.length ? (
              myProfile.prompts.map((p, i) => (
                <div key={i} className="rounded-2xl border border-border/70 bg-card/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">
                    {p.question}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed">{p.answer}</p>
                </div>
              ))
            ) : (
              <button
                type="button"
                onClick={() => navigate("/app/edit")}
                className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground active:bg-muted/60"
              >
                {t("profile.promptsEmpty")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumCard({ plan, planName }: { plan: string; planName: string }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const paid = plan !== "free";
  return (
    <button
      type="button"
      onClick={() => navigate("/app/premium")}
      className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 text-left active:bg-muted/60"
    >
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full",
          paid ? "vybe-gradient shadow-glow" : "bg-primary/10 text-primary",
        )}
      >
        {paid ? <Crown className="size-5 text-white" /> : <Sparkles className="size-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{t("profile.premium")}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {paid ? planName : t("profile.premiumDesc")}
        </p>
      </div>
      <span className="text-xs font-bold text-primary">
        {paid ? t("premium.manage") : t("profile.goPremium")} →
      </span>
    </button>
  );
}

function useNow(intervalMs = 15000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function BoostCard() {
  const { t } = useI18n();
  const boost = useQuery(api.boosts.boostStatus);
  const activate = useMutation(api.boosts.activateBoost);
  const sweep = useMutation(api.boosts.sweepExpiredBoost);
  useNow(15000);
  const sweptRef = useRef(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (sweptRef.current) return;
    sweptRef.current = true;
    void sweep();
  }, [sweep]);

  if (!boost) return null;

  const active = boost.active ? Math.max(0, Math.ceil(boost.active.remainingMs / 60000)) : 0;
  const hasCredits = boost.credits > 0;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-rose-500/10 p-4">
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            active > 0 ? "bg-orange-500 text-white shadow-glow" : "bg-orange-500/15 text-orange-400",
          )}
        >
          <Flame className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{t("boost.title")}</p>
          {active > 0 ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-orange-400">
              <Clock className="size-3" />
              {t("boost.remaining", { min: active })}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("boost.credits", { n: boost.credits })}
            </p>
          )}
        </div>
        <Button
          size="sm"
          disabled={pending || active > 0 || !hasCredits}
          onClick={async () => {
            setPending(true);
            try {
              await activate();
              toast.success(t("boost.activeNow"));
            } catch (e) {
              toast.error(e instanceof Error ? e.message : t("common.error"));
            } finally {
              setPending(false);
            }
          }}
          className="h-9 rounded-full bg-orange-500 px-4 text-xs font-bold text-white shadow-glow hover:bg-orange-500/90"
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : active > 0 ? (
            t("boost.active")
          ) : (
            t("boost.activate")
          )}
        </Button>
      </div>

      {boost.lastResult && (
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-black/10 p-3 dark:bg-white/5">
          <Metric label={t("boost.views")} value={boost.lastResult.views} />
          <Metric label={t("boost.likes")} value={boost.lastResult.likes} />
          <Metric label={t("boost.matches")} value={boost.lastResult.matches} />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-base font-bold">{value}</p>
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function QotdCard() {
  const { t } = useI18n();
  const qotd = useQuery(api.dailyQuestions.todayQuestion);
  const save = useMutation(api.dailyQuestions.saveDailyAnswer);
  const track = useMutation(api.analytics.track);
  const [answer, setAnswer] = useState("");
  const [share, setShare] = useState(true);
  const [pending, setPending] = useState(false);

  if (!qotd) return null;

  const submit = async () => {
    if (!answer.trim() || pending) return;
    setPending(true);
    try {
      await save({
        date: qotd.date,
        question: qotd.question,
        answer: answer.trim(),
        shareOnProfile: share,
      });
      await track({ event: "daily_question_answered" });
      toast.success(t("qotd.answered"));
      setAnswer("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("qotd.error"));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
        <Sparkles className="size-3.5" />
        {t("qotd.title")}
      </p>
      <p className="mt-1.5 text-sm font-semibold leading-relaxed">{qotd.question}</p>

      {qotd.answered ? (
        <p className="mt-2 rounded-xl bg-background/60 px-3 py-2.5 text-sm">
          {qotd.answer}
          <span className="mt-1 block text-[11px] text-muted-foreground">
            {t("qotd.answered")}
          </span>
        </p>
      ) : (
        <>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={t("qotd.placeholder")}
            maxLength={300}
            className="mt-2.5 min-h-20 rounded-xl border-input bg-card px-3.5 py-2.5 text-sm"
          />
          <div className="mt-2.5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShare((s) => !s)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all",
                share
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              <Check className="size-3" />
              {t("qotd.shareOnProfile")}
            </button>
            <Button
              size="sm"
              disabled={pending || !answer.trim()}
              onClick={() => void submit()}
              className="h-9 rounded-full vybe-gradient px-4 text-xs font-bold text-white shadow-glow"
            >
              {pending ? <Loader2 className="size-3.5 animate-spin" /> : t("qotd.submit")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function MomentsSection() {
  const { t } = useI18n();
  const moments = useQuery(api.moments.myMoments);
  const create = useMutation(api.moments.createMoment);
  const remove = useMutation(api.moments.deleteMoment);
  const track = useMutation(api.analytics.track);
  const { uploading, uploadAndGetUrl } = usePhotoUpload();

  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [mood, setMood] = useState<string>(MOODS[0]);
  const [visibility, setVisibility] = useState<"matches" | "public">("matches");
  const [pending, setPending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (moments === undefined) return null;

  const pick = async (file: File) => {
    try {
      const url = await uploadAndGetUrl(file);
      setPhoto(url);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const submit = async () => {
    if (!photo || pending) return;
    setPending(true);
    try {
      await create({
        image: photo,
        caption: caption.trim() || undefined,
        mood,
        visibility,
      });
      await track({ event: "moment_created" });
      toast.success(t("moment.added"));
      setOpen(false);
      setPhoto(null);
      setCaption("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("moment.photoRequired"));
    } finally {
      setPending(false);
    }
  };

  const removeMoment = async (id: string) => {
    try {
      await remove({ momentId: id as any });
      toast(t("moment.deleted"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <SectionTitle>{t("moment.title")}</SectionTitle>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary active:bg-primary/20"
        >
          <ImagePlus className="size-3.5" />
          {t("moment.add")}
        </button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{t("moment.desc")}</p>

      {moments.length === 0 ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 w-full rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground active:bg-muted/60"
        >
          {t("moment.empty")}
        </button>
      ) : (
        <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {moments.map((m) => (
            <div key={m._id} className="relative w-28 shrink-0 overflow-hidden rounded-2xl">
              <img src={m.image} alt={m.caption || "Moment"} className="aspect-[3/4] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
              <span className="absolute left-1.5 top-1.5 text-sm">{m.mood}</span>
              {m.caption && (
                <p className="absolute inset-x-1.5 bottom-1.5 line-clamp-2 text-[10px] font-semibold text-white">
                  {m.caption}
                </p>
              )}
              <span className="absolute right-1.5 top-1.5 rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] font-bold text-white/80">
                {Math.max(1, Math.ceil((m.expiresAt - Date.now()) / 3600000))}h
              </span>
              <button
                type="button"
                aria-label={t("moment.delete")}
                onClick={() => void removeMoment(m._id)}
                className="absolute bottom-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/50 text-white active:bg-black/70"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("moment.add")}</DialogTitle>
            <DialogDescription>{t("moment.desc")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {photo ? (
              <div className="relative overflow-hidden rounded-2xl border border-border/60">
                <img src={photo} alt="Moment" className="aspect-[4/3] w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground"
              >
                {uploading ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <Camera className="size-7" />
                )}
                <span className="text-sm font-medium">{t("moment.addPhoto")}</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void pick(f);
                e.target.value = "";
              }}
            />
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t("moment.captionPlaceholder")}
              maxLength={160}
              className="min-h-16 rounded-xl border-input bg-card px-3.5 py-2.5 text-sm"
            />
            <div>
              <p className="text-xs font-semibold text-muted-foreground">{t("moment.mood")}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full border text-lg transition-all",
                      mood === m
                        ? "border-primary bg-primary/15"
                        : "border-border bg-card",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">{t("moment.visibility")}</p>
              <div className="mt-1.5 flex gap-2">
                {(["matches", "public"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibility(v)}
                    className={cn(
                      "flex-1 rounded-full border py-2 text-xs font-semibold transition-all",
                      visibility === v
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {v === "matches" ? t("moment.vis.matches") : t("moment.vis.public")}
                  </button>
                ))}
              </div>
            </div>
            <Button
              disabled={!photo || pending}
              onClick={() => void submit()}
              className="h-12 rounded-full vybe-gradient font-bold text-white"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : t("moment.add")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
