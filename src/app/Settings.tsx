import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router";
import { useTheme } from "next-themes";
import { useI18n, LANGUAGE_NAMES, type Lang, type TKey } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { GENDERS } from "@/lib/constants";
import { ConfirmDialog } from "@/components/mobile/ConfirmDialog";
import { ScreenHeader, SectionTitle } from "@/components/mobile/ui";
import { ImageWithFallback } from "@/components/mobile/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  Ban,
  Bell,
  Check,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileText,
  Flag,
  HelpCircle,
  Languages,
  LifeBuoy,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type View =
  | "root"
  | "discovery"
  | "notifications"
  | "appearance"
  | "account"
  | "password"
  | "privacy"
  | "blocked"
  | "data"
  | "support"
  | "help"
  | "report"
  | "guidelines";

export default function Settings() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("root");

  return (
    <div className="flex h-dvh flex-col bg-background">
      <ScreenHeader
        title={t("settings.title")}
        onBack={() => (view === "root" ? navigate(-1) : setView("root"))}
      />
      {view === "root" && (
        <RootView onOpen={setView} />
      )}
      {view === "discovery" && <DiscoveryView onBack={() => setView("root")} />}
      {view === "notifications" && <NotificationsView />}
      {view === "appearance" && <AppearanceView />}
      {view === "account" && <AccountView onOpen={setView} />}
      {view === "password" && <PasswordView />}
      {view === "privacy" && <PrivacyView onOpen={setView} />}
      {view === "blocked" && <BlockedView />}
      {view === "data" && <DataView />}
      {view === "support" && <SupportView onOpen={setView} />}
      {view === "help" && <HelpView />}
      {view === "report" && <ReportView />}
      {view === "guidelines" && <GuidelinesView />}
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  onClick,
  destructive,
  right,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  destructive?: boolean;
  right?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left active:bg-muted/60",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          destructive
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-[15px] font-medium",
            destructive && "text-destructive",
          )}
        >
          {label}
        </span>
      </span>
      {value && (
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {value}
        </span>
      )}
      {right ?? <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
    </button>
  );
}

function RootView({ onOpen }: { onOpen: (v: View) => void }) {
  const { t, lang, setLang } = useI18n();
  const myProfile = useQuery(api.profiles.myProfile);
  const setShowInDiscovery = useMutation(api.profiles.setShowInDiscovery);
  const { user } = useAuth();
  const email = user?.email ?? "";

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
      <div className="mt-4 space-y-1.5">
        <SectionTitle className="px-3">{t("settings.account")}</SectionTitle>
        <div className="flex flex-col rounded-2xl border border-border/60 bg-card/50">
          <Row
            icon={<UserRound className="size-5" />}
            label={t("settings.email")}
            value={email || "—"}
            onClick={() => onOpen("account")}
          />
          <Row
            icon={<Lock className="size-5" />}
            label={t("settings.changePassword")}
            onClick={() => onOpen("password")}
          />
        </div>
      </div>

      <div className="mt-5 space-y-1.5">
        <SectionTitle className="px-3">{t("settings.discovery")}</SectionTitle>
        <div className="flex flex-col rounded-2xl border border-border/60 bg-card/50">
          <Row
            icon={<Users className="size-5" />}
            label={t("settings.discovery")}
            onClick={() => onOpen("discovery")}
          />
          <div className="flex items-center gap-3 px-3 py-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {myProfile?.showInDiscovery ? (
                <Eye className="size-5" />
              ) : (
                <EyeOff className="size-5" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium">
                {t("settings.showMe")}
              </span>
              <span className="block text-xs text-muted-foreground">
                {t("settings.showMeDesc")}
              </span>
            </span>
            <Switch
              checked={myProfile?.showInDiscovery ?? true}
              onCheckedChange={(v) => void setShowInDiscovery({ show: v })}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-1.5">
        <SectionTitle className="px-3">{t("settings.notifications")}</SectionTitle>
        <div className="flex flex-col rounded-2xl border border-border/60 bg-card/50">
          <Row
            icon={<Bell className="size-5" />}
            label={t("settings.notifications")}
            onClick={() => onOpen("notifications")}
          />
        </div>
      </div>

      <div className="mt-5 space-y-1.5">
        <SectionTitle className="px-3">{t("settings.appearance")}</SectionTitle>
        <div className="flex flex-col rounded-2xl border border-border/60 bg-card/50">
          <Row
            icon={<Palette className="size-5" />}
            label={t("settings.theme")}
            value={ThemeLabel()}
            onClick={() => onOpen("appearance")}
          />
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left active:bg-muted/60"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Languages className="size-5" />
                </span>
                <span className="min-w-0 flex-1 text-[15px] font-medium">
                  {t("settings.language")}
                </span>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {LANGUAGE_NAMES[lang]}
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl">
              <SheetTitle className="text-center font-display">
                {t("settings.language")}
              </SheetTitle>
              <div className="mt-3 flex flex-col gap-1.5 pb-safe">
                {(Object.keys(LANGUAGE_NAMES) as Lang[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className="flex min-h-12 items-center justify-between rounded-xl px-4 text-base font-medium active:bg-muted"
                  >
                    {LANGUAGE_NAMES[l]}
                    {lang === l && <Check className="size-4 text-primary" />}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mt-5 space-y-1.5">
        <SectionTitle className="px-3">{t("settings.privacy")}</SectionTitle>
        <div className="flex flex-col rounded-2xl border border-border/60 bg-card/50">
          <Row
            icon={<ShieldCheck className="size-5" />}
            label={t("settings.privacy")}
            onClick={() => onOpen("privacy")}
          />
          <Row
            icon={<Ban className="size-5" />}
            label={t("settings.blockedUsers")}
            onClick={() => onOpen("blocked")}
          />
          <Row
            icon={<WalletCards className="size-5" />}
            label={t("settings.dataPrivacy")}
            onClick={() => onOpen("data")}
          />
        </div>
      </div>

      <div className="mt-5 space-y-1.5">
        <SectionTitle className="px-3">{t("settings.support")}</SectionTitle>
        <div className="flex flex-col rounded-2xl border border-border/60 bg-card/50">
          <Row
            icon={<LifeBuoy className="size-5" />}
            label={t("settings.support")}
            onClick={() => onOpen("support")}
          />
          <Row
            icon={<FileText className="size-5" />}
            label={t("settings.guidelines")}
            onClick={() => onOpen("guidelines")}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        <LogoutButton />
        <DeleteButton />
      </div>
    </div>
  );

  function ThemeLabel() {
    const pref =
      typeof window !== "undefined"
        ? (localStorage.getItem("vybe-theme-pref") ?? "system")
        : "system";
    const key = `settings.theme${pref.charAt(0).toUpperCase() + pref.slice(1)}` as TKey;
    return t(key);
  }
}

function LogoutButton() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handle = async () => {
    setPending(true);
    try {
      await signOut();
      navigate("/", { replace: true });
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-12 w-full rounded-full border-border bg-card font-semibold"
      >
        <LogOut className="size-4" />
        {t("settings.logOut")}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t("settings.logOutTitle")}
        description={t("settings.logOutDesc")}
        confirmLabel={t("settings.logOut")}
        destructive={false}
        onConfirm={handle}
      />
    </>
  );
}

function DeleteButton() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const deleteAccount = useMutation(api.profiles.deleteAccount);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handle = async () => {
    setPending(true);
    try {
      await deleteAccount();
      await signOut();
      toast(t("settings.deletedToast"));
      navigate("/", { replace: true });
    } catch {
      toast.error(t("common.error"));
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="h-12 w-full rounded-full text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="size-4" />
        {t("settings.deleteAccount")}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t("settings.deleteTitle")}
        description={t("settings.deleteDesc")}
        confirmLabel={t("settings.deleteConfirm")}
        onConfirm={handle}
      />
    </>
  );
}

function DiscoveryView({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const myProfile = useQuery(api.profiles.myProfile);
  const update = useMutation(api.profiles.updateDiscoveryPrefs);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState(() => ({
    ageMin: 18,
    ageMax: 35,
    distanceKm: 80,
    genders: ["woman", "man", "nonbinary"] as string[],
  }));

  // sync once profile loads
  if (myProfile && values.ageMin === 18 && myProfile.discoveryPrefs.ageMin !== 18) {
    setValues({
      ageMin: myProfile.discoveryPrefs.ageMin,
      ageMax: myProfile.discoveryPrefs.ageMax,
      distanceKm: myProfile.discoveryPrefs.distanceKm,
      genders: [...myProfile.discoveryPrefs.genders],
    });
  }

  const save = async () => {
    setSaving(true);
    try {
      await update({
        ageMin: values.ageMin,
        ageMax: values.ageMax,
        distanceKm: values.distanceKm,
        genders: values.genders as any,
      });
      toast(t("settings.preferencesSaved"));
      onBack();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const toggleGender = (g: string) => {
    setValues((v) => ({
      ...v,
      genders: v.genders.includes(g)
        ? v.genders.filter((x) => x !== g)
        : [...v.genders, g],
    }));
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <div className="mt-4 rounded-2xl border border-border/70 bg-card/60 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">{t("settings.ageRange")}</p>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {values.ageMin} – {values.ageMax}
            </span>
          </div>
          <Slider
            className="mt-5"
            min={18}
            max={70}
            step={1}
            value={[values.ageMin, values.ageMax]}
            onValueChange={([a, b]) =>
              setValues((v) => ({ ...v, ageMin: a, ageMax: b }))
            }
          />
        </div>

        <div className="mt-4 rounded-2xl border border-border/70 bg-card/60 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">{t("settings.distance")}</p>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {values.distanceKm} km
            </span>
          </div>
          <Slider
            className="mt-5"
            min={10}
            max={4000}
            step={50}
            value={[values.distanceKm]}
            onValueChange={([d]) =>
              setValues((v) => ({ ...v, distanceKm: d }))
            }
          />
        </div>

        <div className="mt-4 rounded-2xl border border-border/70 bg-card/60 p-5">
          <p className="text-sm font-bold">{t("settings.showMe")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGender(g)}
                className={cn(
                  "min-h-10 rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95",
                  values.genders.includes(g)
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground",
                )}
              >
                {t(`gender.${g}` as any)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 bg-background/90 px-5 pb-safe pt-3 backdrop-blur">
        <Button
          onClick={() => void save()}
          disabled={saving || values.genders.length === 0}
          className="h-13 w-full rounded-full vybe-gradient text-base font-bold text-white shadow-glow"
        >
          {saving ? <Loader2 className="size-5 animate-spin" /> : t("common.save")}
        </Button>
      </div>
    </div>
  );
}

function NotificationsView() {
  const { t } = useI18n();
  const myProfile = useQuery(api.profiles.myProfile);
  const update = useMutation(api.profiles.updateNotificationPrefs);
  const prefs = myProfile?.notificationPrefs;

  const toggle = async (key: "matches" | "messages" | "likes" | "activity", v: boolean) => {
    await update({ [key]: v } as any);
    toast(t("settings.savedToast"));
  };

  const rows = [
    { key: "matches" as const, label: t("settings.notifMatches") },
    { key: "messages" as const, label: t("settings.notifMessages") },
    { key: "likes" as const, label: t("settings.notifLikes") },
    { key: "activity" as const, label: t("settings.notifActivity") },
  ];

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
      <div className="mt-4 flex flex-col rounded-2xl border border-border/60 bg-card/50">
        {rows.map((r, i) => (
          <div
            key={r.key}
            className={cn(
              "flex items-center justify-between px-4 py-4",
              i < rows.length - 1 && "border-b border-border/50",
            )}
          >
            <span className="text-[15px] font-medium">{r.label}</span>
            <Switch
              checked={prefs?.[r.key] ?? true}
              onCheckedChange={(v) => void toggle(r.key, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function AppearanceView() {
  const { t } = useI18n();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const options = [
    { key: "system", label: t("settings.themeSystem"), icon: <MonitorIcon /> },
    { key: "light", label: t("settings.themeLight"), icon: <Sun className="size-5" /> },
    { key: "dark", label: t("settings.themeDark"), icon: <Moon className="size-5" /> },
  ] as const;

  const pick = (key: string) => {
    setTheme(key);
    try {
      localStorage.setItem("vybe-theme-pref", key);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
      <div className="mt-4 flex flex-col gap-3">
        {options.map((o) => {
          const active = theme === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => pick(o.key)}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-2xl border px-4 text-base font-semibold transition-all active:scale-[0.99]",
                active
                  ? "border-transparent bg-primary text-primary-foreground shadow-glow"
                  : "border-border bg-card text-foreground",
              )}
            >
              {o.icon}
              {o.label}
              {active && <Check className="ml-auto size-5" />}
            </button>
          );
        })}
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {resolvedTheme === "dark" ? "🌙" : "☀️"}
        </p>
      </div>
    </div>
  );
}

function MonitorIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function AccountView({ onOpen }: { onOpen: (v: View) => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const email = user?.email ?? "—";
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
      <div className="mt-4 rounded-2xl border border-border/60 bg-card/50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {t("settings.email")}
        </p>
        <p className="mt-1 text-base font-semibold">{email}</p>
      </div>
      <div className="mt-4">
        <Row
          icon={<Lock className="size-5" />}
          label={t("settings.changePassword")}
          onClick={() => onOpen("password")}
        />
      </div>
    </div>
  );
}

function PasswordView() {
  const { t } = useI18n();
  const { user } = useAuth();
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8">
      <div className="mt-6 rounded-2xl border border-primary/25 bg-primary/5 p-5 text-center">
        <ShieldCheck className="mx-auto size-10 text-primary" />
        <p className="mt-3 text-sm leading-relaxed text-foreground">
          {t("settings.passwordNote")}
        </p>
        {user?.email && (
          <p className="mt-2 text-xs text-muted-foreground">{user.email}</p>
        )}
      </div>
    </div>
  );
}

function PrivacyView({ onOpen }: { onOpen: (v: View) => void }) {
  const { t } = useI18n();
  const myProfile = useQuery(api.profiles.myProfile);
  const setShowInDiscovery = useMutation(api.profiles.setShowInDiscovery);
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
      <div className="mt-4 flex flex-col rounded-2xl border border-border/60 bg-card/50">
        <Row
          icon={<Ban className="size-5" />}
          label={t("settings.blockedUsers")}
          onClick={() => onOpen("blocked")}
        />
        <Row
          icon={<MapPin className="size-5" />}
          label={t("settings.locationSettings")}
          onClick={() => onOpen("data")}
        />
        <div className="flex items-center gap-3 px-3 py-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {myProfile?.showInDiscovery ? (
              <Eye className="size-5" />
            ) : (
              <EyeOff className="size-5" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-medium">
              {t("settings.visibility")}
            </span>
          </span>
          <Switch
            checked={myProfile?.showInDiscovery ?? true}
            onCheckedChange={(v) => void setShowInDiscovery({ show: v })}
          />
        </div>
      </div>
    </div>
  );
}

function BlockedView() {
  const { t, formatRelativeTime } = useI18n();
  const blocked = useQuery(api.reports.blockedUsers);
  const unblock = useMutation(api.reports.unblockUser);
  const [pending, setPending] = useState<string | null>(null);

  const handle = async (id: string) => {
    setPending(id);
    try {
      await unblock({ blockedProfileId: id as any });
      toast(t("settings.unblockedToast"));
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
      <p className="mt-3 px-2 text-xs text-muted-foreground">{t("blocked.hint")}</p>
      {blocked === undefined ? (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : blocked.length === 0 ? (
        <div className="mt-10 text-center text-sm text-muted-foreground">
          {t("settings.blockedEmpty")}
        </div>
      ) : (
        <div className="mt-4 flex flex-col rounded-2xl border border-border/60 bg-card/50">
          {blocked.map((b) => (
            <div
              key={b._id}
              className="flex items-center gap-3 border-b border-border/50 px-3 py-3 last:border-b-0"
            >
              <div className="size-11 shrink-0 overflow-hidden rounded-full">
                <ImageWithFallback
                  src={b.photos[0]}
                  name={b.firstName}
                  className="h-full w-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">{b.firstName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatRelativeTime(b.blockedAt)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={pending === b._id}
                onClick={() => void handle(b._id)}
                className="h-9 rounded-full text-xs font-semibold"
              >
                {pending === b._id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  t("settings.unblock")
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DataView() {
  const { t } = useI18n();
  const myProfile = useQuery(api.profiles.myProfile);
  const { user } = useAuth();

  const exportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      account: { email: user?.email ?? null },
      profile: myProfile
        ? {
            firstName: myProfile.firstName,
            dateOfBirth: new Date(myProfile.dateOfBirth).toISOString(),
            gender: myProfile.gender,
            bio: myProfile.bio,
            interests: myProfile.interests,
            languages: myProfile.languages,
            city: myProfile.city ?? null,
            photos: myProfile.photos.length,
            verified: myProfile.verified,
            showInDiscovery: myProfile.showInDiscovery,
          }
        : null,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vybe-data.json";
    a.click();
    URL.revokeObjectURL(url);
    toast(t("settings.savedToast"));
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8">
      <div className="mt-4 rounded-2xl border border-border/70 bg-card/60 p-4">
        <div className="flex items-center gap-3">
          <MapPin className="size-5 text-primary" />
          <div>
            <p className="text-sm font-bold">{t("settings.locationSettings")}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {t("settings.locationDesc")}
            </p>
          </div>
        </div>
        {myProfile?.city && (
          <p className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-xs font-medium">
            {myProfile.city}
          </p>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-border/70 bg-card/60 p-4">
        <p className="text-sm font-bold">{t("settings.dataPrivacy")}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {t("settings.dataNote")}
        </p>
        <Button
          variant="outline"
          onClick={exportData}
          className="mt-4 h-11 w-full rounded-full text-sm font-semibold"
        >
          <Download className="size-4" />
          {t("settings.exportData")}
        </Button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          {t("settings.exportHint")}
        </p>
      </div>
    </div>
  );
}

function SupportView({ onOpen }: { onOpen: (v: View) => void }) {
  const { t } = useI18n();
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
      <div className="mt-4 flex flex-col rounded-2xl border border-border/60 bg-card/50">
        <Row
          icon={<HelpCircle className="size-5" />}
          label={t("settings.helpCenter")}
          onClick={() => onOpen("help")}
        />
        <Row
          icon={<Flag className="size-5" />}
          label={t("settings.reportProblem")}
          onClick={() => onOpen("report")}
        />
      </div>
    </div>
  );
}

function HelpView() {
  const { t } = useI18n();
  const faqs = [
    { q: "How does matching work?", a: "When you like someone and they like you back, it's a match. You'll see their conversation appear in Messages." },
    { q: "Is my location shared?", a: "Never exactly. Other people only see an approximate distance in km." },
    { q: "What does the verified badge mean?", a: "Verified profiles have confirmed their identity with a photo. It means they're more likely to be who they say they are." },
    { q: "How do I block or report someone?", a: "Open their profile or chat, tap the ⋯ menu and choose Block or Report. We review reports 24/7." },
    { q: "Can I undo a swipe?", a: "Not yet — but passes and likes stay private until it's a match." },
  ];
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
      <Accordion type="single" collapsible className="mt-4">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-b border-border/60">
            <AccordionTrigger className="text-left text-[15px] font-semibold">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function ReportView() {
  const { t } = useI18n();
  const submit = useMutation(api.feedback.submitFeedback);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const send = async () => {
    if (!message.trim() || pending) return;
    setPending(true);
    try {
      await submit({ type: "problem", category: category || undefined, message });
      setMessage("");
      setCategory("");
      toast(t("settings.problemDone"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setPending(false);
    }
  };

  const cats = ["Bug", "Billing", "Account issue", "Safety concern", "Other"];

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8">
      <div className="mt-4 flex flex-col gap-1.5">
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "flex min-h-11 items-center rounded-xl border px-3.5 text-left text-sm font-medium",
              category === c
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {c}
          </button>
        ))}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("settings.problemDesc")}
          className="mt-2 min-h-24 rounded-xl border-input bg-card px-4 py-3 text-sm"
          maxLength={3000}
        />
      </div>
      <Button
        onClick={() => void send()}
        disabled={!message.trim() || pending}
        className="mt-4 h-12 w-full rounded-full vybe-gradient font-bold text-white shadow-glow"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : t("settings.problemSubmit")}
      </Button>
    </div>
  );
}

function GuidelinesView() {
  const { t } = useI18n();
  const rules = [
    "Be kind. Respect everyone's boundaries.",
    "No nudity, sexual content, or explicit language in profiles.",
    "No harassment, hate speech, or discrimination of any kind.",
    "Be honest. No fake profiles or impersonation.",
    "Don't share contact info you're not comfortable sharing.",
    "Report anything that feels off — we're here for you 24/7.",
  ];
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8">
      <div className="mt-4 rounded-2xl border border-border/70 bg-card/60 p-5">
        <ShieldCheck className="size-8 text-primary" />
        <h2 className="mt-3 font-display text-lg font-bold">
          {t("settings.guidelines")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("safety.sosHint")}
        </p>
        <ul className="mt-4 space-y-2.5">
          {rules.map((r, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
