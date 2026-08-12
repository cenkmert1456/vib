import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  ageFromDateOfBirth,
  currentUserId,
  getMyProfile,
  nowMs,
} from "./helpers";
import { entitlementsForUser } from "./entitlements";
import { api } from "./_generated/api";

const MIN_AGE = 18;

type GenderValue = "woman" | "man" | "nonbinary" | "other";

const defaultDiscoveryPrefs = {
  ageMin: 18,
  ageMax: 38,
  distanceKm: 4000,
  genders: ["woman", "man", "nonbinary"] as GenderValue[],
};

const defaultNotificationPrefs = {
  matches: true,
  messages: true,
  likes: true,
  activity: true,
};

/** The signed-in user's own full profile (with private fields). */
export const myProfile = query({
  args: {},
  handler: async (ctx) => {
    const profile = await getMyProfile(ctx);
    if (!profile) return null;
    return profile;
  },
});

/** Public profile view for another person. */
export const getProfile = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, { profileId }) => {
    const me = await getMyProfile(ctx);
    if (!me) return null;
    const profile = await ctx.db.get(profileId);
    if (!profile) return null;
    if (me._id === profile._id) return profile;

    // Blocked profiles are never surfaced.
    const blocked = await ctx.db
      .query("blocks")
      .withIndex("by_pair", (q) =>
        q.eq("blockerProfileId", me._id).eq("blockedProfileId", profile._id),
      )
      .first();
    if (blocked) return null;

    return profile;
  },
});

/**
 * Complete onboarding. Creates (or updates) the user's profile and seeds demo
 * data so the app has people to discover and match with.
 */
export const completeOnboarding = mutation({
  args: {
    firstName: v.string(),
    dateOfBirth: v.number(),
    gender: v.union(
      v.literal("woman"),
      v.literal("man"),
      v.literal("nonbinary"),
      v.literal("other"),
    ),
    interestedIn: v.array(
      v.union(
        v.literal("woman"),
        v.literal("man"),
        v.literal("nonbinary"),
        v.literal("other"),
      ),
    ),
    bio: v.optional(v.string()),
    photos: v.array(v.string()),
    interests: v.array(v.string()),
    languages: v.array(v.string()),
    city: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    countryName: v.optional(v.string()),
    cityId: v.optional(v.string()),
    approxLat: v.optional(v.number()),
    approxLng: v.optional(v.number()),
    lifestyle: v.optional(v.array(v.string())),
    relationshipIntentions: v.optional(v.array(v.string())),
    education: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const age = ageFromDateOfBirth(args.dateOfBirth);
    if (age < MIN_AGE) throw new Error("You must be at least 18 years old.");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const now = nowMs();
    let profileId: Id<"profiles">;
    if (existing) {
      profileId = existing._id;
      await ctx.db.patch(existing._id, {
        firstName: args.firstName,
        dateOfBirth: args.dateOfBirth,
        gender: args.gender,
        interestedIn: args.interestedIn,
        bio: args.bio ?? existing.bio,
        photos: args.photos.length ? args.photos : existing.photos,
        interests: args.interests,
        languages: args.languages,
        city: args.city ?? existing.city,
        countryCode: args.countryCode ?? existing.countryCode,
        countryName: args.countryName ?? existing.countryName,
        cityId: args.cityId ?? existing.cityId,
        approxLat: args.approxLat ?? existing.approxLat,
        approxLng: args.approxLng ?? existing.approxLng,
        lifestyle: args.lifestyle ?? existing.lifestyle,
        relationshipIntentions: args.relationshipIntentions ?? existing.relationshipIntentions,
        education: args.education ?? existing.education,
        onboardingCompleted: true,
        completedAt: existing.completedAt ?? now,
        lastActiveAt: now,
      });
    } else {
      profileId = await ctx.db.insert("profiles", {
          userId,
          firstName: args.firstName,
          dateOfBirth: args.dateOfBirth,
          gender: args.gender,
          interestedIn: args.interestedIn,
          bio: args.bio ?? "",
          photos: args.photos,
          interests: args.interests,
          languages: args.languages,
          city: args.city,
          countryCode: args.countryCode,
          countryName: args.countryName,
          cityId: args.cityId,
          approxLat: args.approxLat,
          approxLng: args.approxLng,
          lifestyle: args.lifestyle ?? [],
          relationshipIntentions: args.relationshipIntentions ?? [],
          education: args.education,
          prompts: [],
          verified: false,
          verificationStatus: "none",
          showInDiscovery: true,
          profileHidden: false,
          onboardingCompleted: true,
          completedAt: now,
          lastActiveAt: now,
          isDemo: false,
          discoveryPrefs: defaultDiscoveryPrefs,
          notificationPrefs: defaultNotificationPrefs,
        });
    }

    // Make sure demo profiles exist and seed the user's initial likes + one
    // conversation so every screen has content to show.
    await ctx.runMutation(api.seed.seedDemoProfiles);
    await ctx.runMutation(api.seed.seedInitialSocial, { profileId });
    await ctx.runMutation(api.dailyQuestions.seedDailyQuestions);

    return { profileId };
  },
});

/** Update editable profile fields (bio, interests, photos, ...). */
export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    bio: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())),
    lifestyle: v.optional(v.array(v.string())),
    city: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    countryName: v.optional(v.string()),
    cityId: v.optional(v.string()),
    relationshipIntentions: v.optional(v.array(v.string())),
    education: v.optional(v.string()),
    prompts: v.optional(
      v.array(v.object({ question: v.string(), answer: v.string() })),
    ),
  },
  handler: async (ctx, args) => {
    const me = await getMyProfile(ctx);
    if (!me) throw new Error("Complete onboarding first");

    const patch: Record<string, unknown> = { lastActiveAt: nowMs() };
    if (args.firstName !== undefined) patch.firstName = args.firstName;
    if (args.bio !== undefined) patch.bio = args.bio;
    if (args.interests !== undefined) patch.interests = args.interests;
    if (args.languages !== undefined) patch.languages = args.languages;
    if (args.lifestyle !== undefined) patch.lifestyle = args.lifestyle;
    if (args.city !== undefined) patch.city = args.city;
    if (args.countryCode !== undefined) patch.countryCode = args.countryCode;
    if (args.countryName !== undefined) patch.countryName = args.countryName;
    if (args.cityId !== undefined) patch.cityId = args.cityId;
    if (args.relationshipIntentions !== undefined)
      patch.relationshipIntentions = args.relationshipIntentions;
    if (args.education !== undefined) patch.education = args.education;
    if (args.prompts !== undefined) patch.prompts = args.prompts;

    await ctx.db.patch(me._id, patch);
    return true;
  },
});

export const updateDiscoveryPrefs = mutation({
  args: {
    ageMin: v.number(),
    ageMax: v.number(),
    distanceKm: v.number(),
    genders: v.array(
      v.union(
        v.literal("woman"),
        v.literal("man"),
        v.literal("nonbinary"),
        v.literal("other"),
      ),
    ),
    interests: v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())),
    lifestyle: v.optional(v.array(v.string())),
    intentions: v.optional(v.array(v.string())),
    verifiedOnly: v.optional(v.boolean()),
    recentlyActiveDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const me = await getMyProfile(ctx);
    if (!me) throw new Error("Not found");
    if (args.ageMin < 18 || args.ageMax > 100 || args.ageMin > args.ageMax)
      throw new Error("Invalid age range");

    // Advanced filters are paid entitlements — enforce on the backend.
    const advanced = {
      interests: args.interests,
      languages: args.languages,
      lifestyle: args.lifestyle,
      intentions: args.intentions,
      verifiedOnly: args.verifiedOnly,
      recentlyActiveDays: args.recentlyActiveDays,
    };
    const hasAdvanced = Object.values(advanced).some(
      (val) => val !== undefined && (Array.isArray(val) ? val.length > 0 : val),
    );
    if (hasAdvanced) {
      const ent = await entitlementsForUser(ctx, me.userId);
      if (!ent?.entitlements.advancedFilters) {
        throw new Error("Advanced filters require a paid membership");
      }
    }

    await ctx.db.patch(me._id, {
      discoveryPrefs: {
        ageMin: args.ageMin,
        ageMax: args.ageMax,
        distanceKm: args.distanceKm,
        genders: args.genders,
        interests: args.interests ?? me.discoveryPrefs.interests,
        languages: args.languages ?? me.discoveryPrefs.languages,
        lifestyle: args.lifestyle ?? me.discoveryPrefs.lifestyle,
        intentions: args.intentions ?? me.discoveryPrefs.intentions,
        verifiedOnly: args.verifiedOnly ?? me.discoveryPrefs.verifiedOnly,
        recentlyActiveDays:
          args.recentlyActiveDays ?? me.discoveryPrefs.recentlyActiveDays,
      },
    });
    return true;
  },
});

export const updateNotificationPrefs = mutation({
  args: {
    matches: v.optional(v.boolean()),
    messages: v.optional(v.boolean()),
    likes: v.optional(v.boolean()),
    activity: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const me = await getMyProfile(ctx);
    if (!me) throw new Error("Not found");
    await ctx.db.patch(me._id, {
      notificationPrefs: {
        matches: args.matches ?? me.notificationPrefs.matches,
        messages: args.messages ?? me.notificationPrefs.messages,
        likes: args.likes ?? me.notificationPrefs.likes,
        activity: args.activity ?? me.notificationPrefs.activity,
      },
    });
    return true;
  },
});

export const setShowInDiscovery = mutation({
  args: { show: v.boolean() },
  handler: async (ctx, { show }) => {
    const me = await getMyProfile(ctx);
    if (!me) throw new Error("Not found");
    await ctx.db.patch(me._id, { showInDiscovery: show, lastActiveAt: nowMs() });
    return true;
  },
});

export const setLocation = mutation({
  args: {
    city: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    countryName: v.optional(v.string()),
    cityId: v.optional(v.string()),
    approxLat: v.optional(v.number()),
    approxLng: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const me = await getMyProfile(ctx);
    if (!me) throw new Error("Not found");
    const patch: Record<string, unknown> = { lastActiveAt: nowMs() };
    if (args.city !== undefined) patch.city = args.city;
    if (args.countryCode !== undefined) patch.countryCode = args.countryCode;
    if (args.countryName !== undefined) patch.countryName = args.countryName;
    if (args.cityId !== undefined) patch.cityId = args.cityId;
    if (args.approxLat !== undefined) patch.approxLat = args.approxLat;
    if (args.approxLng !== undefined) patch.approxLng = args.approxLng;
    await ctx.db.patch(me._id, patch);
    return true;
  },
});

/** Travel (passport) mode: discover people in a future location. */
export const setTravelMode = mutation({
  args: {
    enabled: v.boolean(),
    countryCode: v.optional(v.string()),
    cityName: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const me = await getMyProfile(ctx);
    if (!me) throw new Error("Not found");
    if (args.enabled) {
      const ent = await entitlementsForUser(ctx, me.userId);
      if (!ent?.entitlements.travelMode) {
        throw new Error("Travel mode requires VYBE Platinum");
      }
    }
    await ctx.db.patch(me._id, {
      travel: {
        enabled: args.enabled,
        countryCode: args.countryCode ?? me.travel?.countryCode ?? "",
        cityName: args.cityName ?? me.travel?.cityName ?? "",
        lat: args.lat ?? me.travel?.lat,
        lng: args.lng ?? me.travel?.lng,
        expiresAt: args.expiresAt ?? me.travel?.expiresAt,
      },
      lastActiveAt: nowMs(),
    });
    if (args.enabled) {
      await ctx.db.insert("analytics", {
        profileId: me._id,
        event: "travel_mode_enabled",
        metadata: { countryCode: args.countryCode ?? "" },
        createdAt: nowMs(),
      });
    }
    return true;
  },
});

export const touchActive = mutation({
  args: {},
  handler: async (ctx) => {
    const me = await getMyProfile(ctx);
    if (!me) return;
    await ctx.db.patch(me._id, { lastActiveAt: nowMs() });
  },
});

/** Request profile verification with a selfie. */
export const requestVerification = mutation({
  args: { photoUrl: v.string() },
  handler: async (ctx, { photoUrl }) => {
    const me = await getMyProfile(ctx);
    if (!me) throw new Error("Not found");
    await ctx.db.patch(me._id, {
      verificationStatus: "pending",
      verificationPhoto: photoUrl,
      lastActiveAt: nowMs(),
    });
    await ctx.db.insert("activity", {
      profileId: me._id,
      type: "verify",
      title: "Verification submitted",
      createdAt: nowMs(),
    });
    return true;
  },
});

/** Delete the signed-in user's profile and related data. */
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const me = await getMyProfile(ctx);
    if (!me) throw new Error("Not found");

    // Remove references: swipes, matches, messages, activity, reports, blocks.
    const swipes = await ctx.db
      .query("swipes")
      .withIndex("by_from", (q) => q.eq("fromProfileId", me._id))
      .collect();
    for (const s of swipes) await ctx.db.delete(s._id);

    const matches = await ctx.db
      .query("matches")
      .withIndex("by_participants", (q) => q.eq("participants", [me._id]))
      .collect();
    for (const m of matches) {
      const msgs = await ctx.db
        .query("messages")
        .withIndex("by_match", (q) => q.eq("matchId", m._id))
        .collect();
      for (const msg of msgs) await ctx.db.delete(msg._id);
      await ctx.db.delete(m._id);
    }

    const blocks = await ctx.db
      .query("blocks")
      .withIndex("by_blocker", (q) => q.eq("blockerProfileId", me._id))
      .collect();
    for (const b of blocks) await ctx.db.delete(b._id);
    const blockedBy = await ctx.db
      .query("blocks")
      .withIndex("by_blocked", (q) => q.eq("blockedProfileId", me._id))
      .collect();
    for (const b of blockedBy) await ctx.db.delete(b._id);

    const activity = await ctx.db
      .query("activity")
      .withIndex("by_profile", (q) => q.eq("profileId", me._id))
      .collect();
    for (const a of activity) await ctx.db.delete(a._id);

    await ctx.db.delete(me._id);
    return true;
  },
});
