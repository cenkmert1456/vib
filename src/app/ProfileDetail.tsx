import { motion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useNavigate, useParams } from "react-router";
import { useI18n } from "@/lib/i18n";
import { ageFromDateOfBirth, haversineKm } from "@/lib/format";
import { haptic } from "@/lib/haptics";
import { REPORT_CATEGORIES } from "@/lib/constants";
import { PhotoCarousel } from "@/components/mobile/PhotoCarousel";
import { VerifiedBadge, ScreenHeader, SectionTitle } from "@/components/mobile/ui";
import { ConfirmDialog } from "@/components/mobile/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Ban, Flag, Heart, Loader2, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ProfileDetail() {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const profile = useQuery(api.profiles.getProfile, {
    profileId: profileId as any,
  });
  const myProfile = useQuery(api.profiles.myProfile);
  const swipe = useMutation(api.swipes.swipe);
  const blockUser = useMutation(api.reports.blockUser);
  const reportUser = useMutation(api.reports.reportUser);

  const [swiping, setSwiping] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [category, setCategory] = useState<string>(REPORT_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [reporting, setReporting] = useState(false);

  if (profile === undefined || myProfile === undefined) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="flex h-dvh flex-col bg-background">
        <ScreenHeader title="—" />
        <div className="flex flex-1 items-center justify-center px-8 text-center text-sm text-muted-foreground">
          {t("common.error")}
        </div>
      </div>
    );
  }

  const age = ageFromDateOfBirth(profile.dateOfBirth);
  const sharedInterests = profile.interests.filter((i) =>
    myProfile?.interests.includes(i),
  );
  const distance = (() => {
    if (
      myProfile?.approxLat !== undefined &&
      myProfile.approxLng !== undefined &&
      profile.approxLat !== undefined &&
      profile.approxLng !== undefined
    ) {
      const km = haversineKm(
        myProfile.approxLat,
        myProfile.approxLng,
        profile.approxLat,
        profile.approxLng,
      );
      return t("common.kmAway", { km: Math.round(km) });
    }
    return profile.city ? t("common.inCity", { city: profile.city }) : null;
  })();

  const handleSwipe = async (action: "like" | "pass" | "superLike") => {
    if (swiping) return;
    setSwiping(true);
    haptic(action === "like" ? "medium" : "light");
    try {
      const result = await swipe({
        toProfileId: profile._id as any,
        action,
      });
      if (result.matched && result.matchId) {
        navigate(`/app/match/${result.matchId}`, { replace: true });
      } else {
        navigate(-1);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
      setSwiping(false);
    }
  };

  const handleBlock = async () => {
    try {
      await blockUser({ blockedProfileId: profile._id as any });
      toast(t("profile.blockedToast"));
      navigate(-1);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleReport = async () => {
    setReporting(true);
    try {
      await reportUser({
        reportedProfileId: profile._id as any,
        category: category as any,
        description,
      });
      setReportOpen(false);
      setDescription("");
      toast(t("profile.reportedToast"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-background">
      <ScreenHeader
        title=""
        onBack={() => navigate(-1)}
        right={
          <div className="flex gap-1">
            <button
              type="button"
              aria-label={t("profile.report")}
              onClick={() => setReportOpen(true)}
              className="flex size-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
            >
              <Flag className="size-5" />
            </button>
            <button
              type="button"
              aria-label={t("profile.block")}
              onClick={() => setBlockOpen(true)}
              className="flex size-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
            >
              <Ban className="size-5" />
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
        {/* Gallery */}
        <PhotoCarousel
          photos={profile.photos}
          name={profile.firstName}
          className="aspect-[4/5] w-full"
        />

        <div className="px-5 pt-4">
          {/* Identity */}
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold">
              {profile.firstName}, {age}
            </h1>
            <VerifiedBadge verified={profile.verified} status={profile.verificationStatus} size="md" />
          </div>
          {distance && (
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {distance}
            </p>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="mt-5">
              <SectionTitle>{t("profile.about")}</SectionTitle>
              <p className="mt-2 text-[15px] leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Shared interests */}
          {sharedInterests.length > 0 && (
            <div className="mt-5">
              <SectionTitle>{t("profile.shared")}</SectionTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                {sharedInterests.map((i) => (
                  <span
                    key={i}
                    className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {profile.interests.length > 0 && (
            <div className="mt-5">
              <SectionTitle>{t("profile.interests")}</SectionTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.interests.map((i) => (
                  <span
                    key={i}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Lifestyle */}
          {profile.lifestyle.length > 0 && (
            <div className="mt-5">
              <SectionTitle>{t("profile.lifestyle")}</SectionTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.lifestyle.map((i) => (
                  <span
                    key={i}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {profile.languages.length > 0 && (
            <div className="mt-5">
              <SectionTitle>{t("profile.languages")}</SectionTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                {profile.languages.join(" · ")}
              </p>
            </div>
          )}

          {/* Prompts */}
          {profile.prompts.length > 0 && (
            <div className="mt-5 space-y-3">
              <SectionTitle>{t("profile.prompts")}</SectionTitle>
              {profile.prompts.map((p, i) => (
                <div key={i} className="rounded-2xl border border-border/70 bg-card/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">
                    {p.question}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed">{p.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="border-t border-border/60 bg-background/90 px-5 pb-safe pt-3 backdrop-blur">
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label={t("discover.pass")}
            disabled={swiping}
            onClick={() => void handleSwipe("pass")}
            className="flex size-14 items-center justify-center rounded-full border-2 border-red-500/40 bg-card text-red-400 transition-all active:scale-90 disabled:opacity-50"
          >
            <X className="size-6" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label={t("discover.superVybe")}
            disabled={swiping}
            onClick={() => void handleSwipe("superLike")}
            className="flex size-14 items-center justify-center rounded-full vybe-gradient text-white shadow-glow transition-all active:scale-90 disabled:opacity-50"
          >
            <span className="text-xl">⚡</span>
          </button>
          <button
            type="button"
            aria-label={t("discover.like")}
            disabled={swiping}
            onClick={() => void handleSwipe("like")}
            className="flex size-14 items-center justify-center rounded-full border-2 border-emerald-500/40 bg-card text-emerald-400 transition-all active:scale-90 disabled:opacity-50"
          >
            <Heart className="size-6" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Block confirm */}
      <ConfirmDialog
        open={blockOpen}
        onOpenChange={setBlockOpen}
        title={t("profile.blockTitle", { name: profile.firstName })}
        description={t("profile.blockDesc")}
        confirmLabel={t("profile.block")}
        onConfirm={handleBlock}
      />

      {/* Report dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("profile.reportTitle", { name: profile.firstName })}
            </DialogTitle>
            <DialogDescription>{t("profile.reportDesc")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            {REPORT_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "flex min-h-11 items-center rounded-xl border px-3.5 text-left text-sm font-medium transition-colors",
                  category === c
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {t(`safety.cat_${c}` as any)}
              </button>
            ))}
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("profile.reportPlaceholder")}
              className="mt-2 min-h-20 rounded-xl border-border bg-card text-sm"
              maxLength={2000}
            />
            <Button
              onClick={() => void handleReport()}
              disabled={reporting}
              className="mt-2 h-12 rounded-full bg-destructive text-white"
            >
              {reporting ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("profile.reportSubmit")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
