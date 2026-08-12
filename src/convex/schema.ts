// VYBE database schema. The src/convex/_generated/ directory is regenerated
// from this file by `convex dev --once` (Convex codegen) and is gitignored.
import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

export const GENDERS = ["woman", "man", "nonbinary", "other"] as const;
export type Gender = (typeof GENDERS)[number];

export const SWIPE_ACTIONS = ["like", "pass", "superLike"] as const;
export type SwipeAction = (typeof SWIPE_ACTIONS)[number];

export const MATCH_STATUSES = ["active", "unmatched", "blocked"] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const MESSAGE_TYPES = ["text", "image"] as const;
export type MessageType = (typeof MESSAGE_TYPES)[number];

export const REPORT_CATEGORIES = [
  "fake_profile",
  "harassment",
  "inappropriate",
  "spam",
  "underage",
  "other",
] as const;
export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const REPORT_STATUSES = ["open", "reviewed", "resolved"] as const;

export const ACTIVITY_TYPES = [
  "like",
  "match",
  "message",
  "verify",
  "system",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const VERIFICATION_STATUSES = [
  "not_started",
  "pending",
  "processing",
  "verified",
  "failed",
  "manual_review",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

/** Status of the badge on a profile (distinct from session status). */
export const PROFILE_VERIFICATION_STATUSES = [
  "none",
  "pending",
  "verified",
  "rejected",
] as const;
export type ProfileVerificationStatus = (typeof PROFILE_VERIFICATION_STATUSES)[number];

export const PLANS = ["free", "silver", "gold", "platinum"] as const;
export type Plan = (typeof PLANS)[number];

export const SUBSCRIPTION_STATUSES = [
  "active",
  "expired",
  "canceled",
  "grace_period",
  "pending",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const MOMENT_VISIBILITY = ["matches", "public"] as const;
export type MomentVisibility = (typeof MOMENT_VISIBILITY)[number];

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // =========================================================================
    // VYBE tables
    // =========================================================================

    /**
     * A person's public-facing profile. Every participant — real signed-in
     * users (userId set) and demo profiles used for development (userId null) —
     * is represented here, so discovery, matching and messaging all operate on
     * a single entity type.
     */
    profiles: defineTable({
      userId: v.optional(v.id("users")), // set for real users only
      firstName: v.string(),
      dateOfBirth: v.number(), // ms timestamp
      gender: v.union(...GENDERS.map((g) => v.literal(g))),
      interestedIn: v.array(
        v.union(...GENDERS.map((g) => v.literal(g))),
      ),
      bio: v.string(),
      photos: v.array(v.string()), // urls
      interests: v.array(v.string()),
      languages: v.array(v.string()),
      city: v.optional(v.string()),
      // Global discovery: standardized country + city identifiers.
      countryCode: v.optional(v.string()), // ISO 3166-1 alpha-2
      countryName: v.optional(v.string()),
      cityId: v.optional(v.string()),
      approxLat: v.optional(v.number()),
      approxLng: v.optional(v.number()),
      lifestyle: v.array(v.string()),
      relationshipIntentions: v.array(v.string()),
      education: v.optional(v.string()),
      // Travel / passport mode: discover people in a future location.
      travel: v.optional(
        v.object({
          enabled: v.boolean(),
          countryCode: v.string(),
          cityName: v.string(),
          lat: v.optional(v.number()),
          lng: v.optional(v.number()),
          expiresAt: v.optional(v.number()),
        }),
      ),
      prompts: v.array(
        v.object({ question: v.string(), answer: v.string() }),
      ),
      verified: v.boolean(),
      verificationStatus: v.union(
        ...PROFILE_VERIFICATION_STATUSES.map((s) => v.literal(s)),
      ),
      verificationPhoto: v.optional(v.string()), // storage url of selfie
      showInDiscovery: v.boolean(),
      profileHidden: v.boolean(),
      onboardingCompleted: v.boolean(),
      completedAt: v.optional(v.number()),
      lastActiveAt: v.number(),
      isDemo: v.boolean(),
      discoveryPrefs: v.object({
        ageMin: v.number(),
        ageMax: v.number(),
        distanceKm: v.number(),
        genders: v.array(v.union(...GENDERS.map((g) => v.literal(g)))),
        // Advanced filters (premium): optional refinement of the deck.
        interests: v.optional(v.array(v.string())),
        languages: v.optional(v.array(v.string())),
        lifestyle: v.optional(v.array(v.string())),
        intentions: v.optional(v.array(v.string())),
        verifiedOnly: v.optional(v.boolean()),
        recentlyActiveDays: v.optional(v.number()),
      }),
      notificationPrefs: v.object({
        matches: v.boolean(),
        messages: v.boolean(),
        likes: v.boolean(),
        activity: v.boolean(),
      }),
    })
      .index("by_user", ["userId"])
      .index("by_isDemo", ["isDemo"])
      .index("by_country", ["countryCode"])
      .index("by_city", ["cityId"]),

    /** A swipe decision from one profile toward another. */
    swipes: defineTable({
      fromProfileId: v.id("profiles"),
      toProfileId: v.id("profiles"),
      action: v.union(...SWIPE_ACTIONS.map((a) => v.literal(a))),
      createdAt: v.number(),
    })
      .index("by_from", ["fromProfileId"])
      .index("by_from_to", ["fromProfileId", "toProfileId"])
      .index("by_to", ["toProfileId"]),

    /** A mutual match between two profiles. */
    matches: defineTable({
      participants: v.array(v.id("profiles")), // exactly 2, indexed for lookups
      status: v.union(...MATCH_STATUSES.map((s) => v.literal(s))),
      createdAt: v.number(),
      lastMessageAt: v.optional(v.number()),
      lastMessagePreview: v.optional(v.string()),
      lastMessageSender: v.optional(v.id("profiles")),
      unmatchedBy: v.optional(v.id("profiles")),
      blockedBy: v.optional(v.id("profiles")),
    })
      .index("by_participants", ["participants"])
      .index("by_status", ["status"]),

    /** Messages within a match. */
    messages: defineTable({
      matchId: v.id("matches"),
      senderProfileId: v.id("profiles"),
      type: v.union(...MESSAGE_TYPES.map((t) => v.literal(t))),
      content: v.string(),
      createdAt: v.number(),
      deliveredAt: v.optional(v.number()),
      readAt: v.optional(v.number()),
    })
      .index("by_match", ["matchId", "createdAt"])
      .index("by_match_read", ["matchId", "readAt"]),

    /** Safety reports. */
    reports: defineTable({
      reporterProfileId: v.id("profiles"),
      reportedProfileId: v.id("profiles"),
      category: v.union(...REPORT_CATEGORIES.map((c) => v.literal(c))),
      description: v.string(),
      createdAt: v.number(),
      status: v.union(...REPORT_STATUSES.map((s) => v.literal(s))),
    }).index("by_reporter", ["reporterProfileId"]),

    /** Blocks. Blocked users never appear in each other's discovery. */
    blocks: defineTable({
      blockerProfileId: v.id("profiles"),
      blockedProfileId: v.id("profiles"),
      createdAt: v.number(),
    })
      .index("by_blocker", ["blockerProfileId"])
      .index("by_blocked", ["blockedProfileId"])
      .index("by_pair", ["blockerProfileId", "blockedProfileId"]),

    /** In-app activity feed / notifications. */
    activity: defineTable({
      profileId: v.id("profiles"), // recipient
      type: v.union(...ACTIVITY_TYPES.map((t) => v.literal(t))),
      fromProfileId: v.optional(v.id("profiles")),
      matchId: v.optional(v.id("matches")),
      messageId: v.optional(v.id("messages")),
      title: v.string(), // localized by the client; stored text is the source string
      createdAt: v.number(),
      readAt: v.optional(v.number()),
    })
      .index("by_profile", ["profileId", "createdAt"])
      .index("by_profile_unread", ["profileId", "readAt"]),

    /** Support / in-app feedback submissions. */
    feedback: defineTable({
      profileId: v.id("profiles"),
      type: v.union(v.literal("problem"), v.literal("guidance")),
      category: v.optional(v.string()),
      message: v.string(),
      createdAt: v.number(),
    }).index("by_profile", ["profileId"]),

    // =========================================================================
    // Monetization & production features
    // =========================================================================

    /**
     * Subscriptions. The backend is the source of truth for entitlements;
     * rows are created/updated by verified provider webhooks (Stripe) or
     * platform purchase verification, never by the client directly.
     */
    subscriptions: defineTable({
      userId: v.id("users"),
      platform: v.string(), // "stripe" | "ios" | "android" | "manual"
      productId: v.optional(v.string()),
      plan: v.union(...PLANS.map((p) => v.literal(p))),
      status: v.union(...SUBSCRIPTION_STATUSES.map((s) => v.literal(s))),
      startedAt: v.optional(v.number()),
      expiresAt: v.optional(v.number()),
      autoRenew: v.boolean(),
      entitlementVersion: v.number(),
      providerSubscriptionId: v.optional(v.string()),
      providerCustomerId: v.optional(v.string()),
      lastEventAt: v.optional(v.number()),
    }).index("by_user", ["userId"]),

    /** Profile verification sessions (live liveness). */
    verifications: defineTable({
      userId: v.id("users"),
      profileId: v.optional(v.id("profiles")),
      provider: v.string(), // e.g. "passage" | "incode" | "unconfigured"
      providerSessionId: v.optional(v.string()),
      status: v.union(...VERIFICATION_STATUSES.map((s) => v.literal(s))),
      challengeSequence: v.array(v.string()),
      challengeResults: v.optional(v.array(v.string())),
      failureReason: v.optional(v.string()),
      createdAt: v.number(),
      completedAt: v.optional(v.number()),
      retryCount: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_latest", ["userId", "createdAt"]),

    /** Profile promotion: VYBE Boost. */
    boosts: defineTable({
      profileId: v.id("profiles"),
      startedAt: v.number(),
      expiresAt: v.number(),
      status: v.union(v.literal("active"), v.literal("completed")),
      baseViews: v.number(),
      endedAt: v.optional(v.number()),
      result: v.optional(
        v.object({
          views: v.number(),
          likes: v.number(),
          matches: v.number(),
        }),
      ),
    }).index("by_profile", ["profileId", "startedAt"]),

    /** Temporary VYBE Moments (expire after a configurable period). */
    moments: defineTable({
      profileId: v.id("profiles"),
      image: v.string(),
      caption: v.optional(v.string()),
      mood: v.optional(v.string()),
      visibility: v.union(...MOMENT_VISIBILITY.map((m) => v.literal(m))),
      expiresAt: v.number(),
      createdAt: v.number(),
      deleted: v.boolean(),
    })
      .index("by_profile", ["profileId", "createdAt"])
      .index("by_expiry", ["expiresAt"]),

    /** Rotating Question of the Day content (backend-managed). */
    dailyQuestions: defineTable({
      question: v.string(),
      activeDate: v.string(), // "2026-08-12"
      lang: v.string(), // "en" — English source; client renders its own copy
    }).index("by_date", ["activeDate"]),

    /** A user's answer to a daily question. */
    dailyAnswers: defineTable({
      profileId: v.id("profiles"),
      date: v.string(),
      question: v.string(),
      answer: v.string(),
      shareOnProfile: v.boolean(),
      createdAt: v.number(),
    })
      .index("by_profile_date", ["profileId", "date"])
      .index("by_profile", ["profileId"]),

    /** Privacy-conscious product analytics events. */
    analytics: defineTable({
      profileId: v.id("profiles"),
      event: v.string(),
      metadata: v.optional(v.record(v.string(), v.union(v.string(), v.number(), v.boolean()))),
      createdAt: v.number(),
    })
      .index("by_profile", ["profileId", "createdAt"])
      .index("by_event", ["event", "createdAt"]),

    /** Profile view events (used for Boost results + insights). */
    profileViews: defineTable({
      viewerProfileId: v.id("profiles"),
      viewedProfileId: v.id("profiles"),
      createdAt: v.number(),
    })
      .index("by_viewed", ["viewedProfileId", "createdAt"])
      .index("by_viewer", ["viewerProfileId", "createdAt"]),

    /**
     * Server-side usage counters for daily / monthly entitlements
     * (e.g. "rewind:2026-08-12", "superVybe:2026-08-12", "boost:2026-08").
     * The backend enforces limits here so clients cannot bypass them.
     */
    usageCounters: defineTable({
      profileId: v.id("profiles"),
      key: v.string(),
      count: v.number(),
    })
      .index("by_profile_key", ["profileId", "key"])
      .index("by_key", ["key"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
