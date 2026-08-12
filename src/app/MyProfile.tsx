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
import { toast } from "sonner";
import { Camera, Loader2, Settings, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function MyProfile() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const myProfile = useQuery(api.profiles.myProfile);
  const requestVerification = useMutation(api.profiles.requestVerification);
  const { uploading, uploadAndGetUrl } = usePhotoUpload();

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyPhoto, setVerifyPhoto] = useState<string | null>(null);
  const [submittingVerify, setSubmittingVerify] = useState(false);
  const verifyFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (myProfile?.verificationStatus === "pending") setVerifyOpen(false);
  }, [myProfile?.verificationStatus]);

  if (!myProfile) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const completion = profileCompletion(myProfile);
  const age = ageFromDateOfBirth(myProfile.dateOfBirth);
  const needsVerify = myProfile.verificationStatus === "none" && !myProfile.verified;

  const submitVerify = async () => {
    if (!verifyPhoto || submittingVerify) return;
    setSubmittingVerify(true);
    try {
      await requestVerification({ photoUrl: verifyPhoto });
      setVerifyPhoto(null);
      toast(t("onboard.verifySubmitted"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("verify.error"));
    } finally {
      setSubmittingVerify(false);
    }
  };

  const pickVerify = async (file: File) => {
    try {
      const url = await uploadAndGetUrl(file);
      setVerifyPhoto(url);
    } catch {
      toast.error(t("verify.error"));
    }
  };

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

          {/* Completion */}
          {completion < 100 && (
            <button
              type="button"
              onClick={() => navigate("/app/edit")}
              className="mt-4 w-full rounded-2xl border border-primary/25 bg-primary/5 p-4 text-left"
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
              onClick={() => setVerifyOpen(true)}
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

      {/* Verification dialog */}
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("verify.title")}</DialogTitle>
            <DialogDescription>{t("verify.desc")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {verifyPhoto ? (
              <div className="relative overflow-hidden rounded-2xl border border-border/60">
                <img
                  src={verifyPhoto}
                  alt="Selfie"
                  className="aspect-[4/3] w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setVerifyPhoto(null)}
                  className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => verifyFileRef.current?.click()}
                className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground"
              >
                {uploading ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <Camera className="size-7" />
                )}
                <span className="text-sm font-medium">{t("verify.upload")}</span>
              </button>
            )}
            <input
              ref={verifyFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void pickVerify(f);
                e.target.value = "";
              }}
            />
            <Button
              disabled={!verifyPhoto || submittingVerify}
              onClick={() => void submitVerify()}
              className="h-12 rounded-full vybe-gradient font-bold text-white"
            >
              {submittingVerify ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                t("verify.submit")
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
