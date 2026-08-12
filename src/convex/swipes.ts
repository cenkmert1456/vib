import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  ageFromDateOfBirth,
  distanceKm,
  getMyProfile,
  nowMs,
} from "./helpers";

export const DISCOVER_PAGE_SIZE = 10;

const PAGE_SIZE = DISCOVER_PAGE_SIZE;

/**
 * Paginated discovery deck. Excludes profiles the user already swiped,
 * blocked profiles (either direction), hidden/incomplete profiles and the
 * user's own profile. Applies age / gender / distance preferences.
 */
export const discover = query({
  args: {
    cursor: v.optional(v.id("profiles")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const me = await getMyProfile(ctx);
    if (!me || !me.onboardingCompleted || me.profileHidden) {
      return { profiles: [], cursor: null, hasMore: false };
    }

    const limit = Math.min(args.limit ?? PAGE_SIZE, 20);

    // Exclusions.
    const mySwipes = await ctx.db
      .query("swipes")
      .withIndex("by_from", (q) => q.eq("fromProfileId", me._id))
      .collect();
    const swipedIds = new Set(mySwipes.map((s) => s.toProfileId.toString()));

    const blockedByMe = await ctx.db
      .query("blocks")
      .withIndex("by_blocker", (q) => q.eq("blockerProfileId", me._id))
      .collect();
    const blockedMe = await ctx.db
      .query("blocks")
      .withIndex("by_blocked", (q) => q.eq("blockedProfileId", me._id))
      .collect();
    const blockedIds = new Set<string>();
    for (const b of blockedByMe) blockedIds.add(b.blockedProfileId.toString());
    for (const b of blockedMe) blockedIds.add(b.blockerProfileId.toString());

    const myIdStr = me._id.toString();
    const prefs = me.discoveryPrefs;
    const wantGenders = new Set(prefs.genders);
    const myGender = me.gender;

    let afterCursor = true; // skip until we pass the cursor doc
    const out: typeof me[] = [];
    let lastSeenId: string | null = null;

    const all = await ctx.db.query("profiles").order("asc").collect();
    for (const p of all) {
      const idStr = p._id.toString();
      if (args.cursor) {
        if (afterCursor) {
          if (idStr === args.cursor.toString()) afterCursor = false;
          continue;
        }
      }
      lastSeenId = idStr;

      if (idStr === myIdStr) continue;
      if (swipedIds.has(idStr)) continue;
      if (blockedIds.has(idStr)) continue;
      if (p.profileHidden || !p.onboardingCompleted || !p.showInDiscovery)
        continue;
      if (p.isDemo === false && p.userId === undefined) continue;

      const age = ageFromDateOfBirth(p.dateOfBirth);
      if (age < prefs.ageMin || age > prefs.ageMax) continue;

      // Gender preference: candidate must match my interest AND I must match theirs.
      if (wantGenders.size > 0 && !wantGenders.has(p.gender)) continue;
      if (p.interestedIn.length > 0 && !p.interestedIn.includes(myGender))
        continue;

      // Distance filter (skip when either side lacks coordinates).
      if (
        me.approxLat !== undefined &&
        me.approxLng !== undefined &&
        p.approxLat !== undefined &&
        p.approxLng !== undefined
      ) {
        const d = distanceKm(me.approxLat, me.approxLng, p.approxLat, p.approxLng);
        if (d > prefs.distanceKm) continue;
      }

      out.push(p);
      if (out.length >= limit) break;
    }

    const hasMore = out.length >= limit;
    return {
      profiles: out,
      cursor: hasMore ? out[out.length - 1]._id : null,
      hasMore,
      lastSeenId,
    };
  },
});

/**
 * The core interaction. Records the swipe and — only when the other profile
 * has already liked the swiper — atomically creates a match.
 */
export const swipe = mutation({
  args: {
    toProfileId: v.id("profiles"),
    action: v.union(v.literal("like"), v.literal("pass"), v.literal("superLike")),
  },
  handler: async (ctx, { toProfileId, action }) => {
    const me = await getMyProfile(ctx);
    if (!me || !me.onboardingCompleted)
      throw new Error("Complete onboarding first");

    const target = await ctx.db.get(toProfileId);
    if (!target) throw new Error("Profile not found");
    if (target.profileHidden || !target.showInDiscovery)
      throw new Error("Profile is not available");

    // Blocks make discovery impossible in both directions; guard anyway.
    const blockedPair = await ctx.db
      .query("blocks")
      .withIndex("by_pair", (q) =>
        q
          .eq("blockerProfileId", me._id)
          .eq("blockedProfileId", toProfileId),
      )
      .first();
    if (blockedPair) throw new Error("Profile is not available");

    const now = nowMs();

    // Prevent duplicate swipe records.
    const existing = await ctx.db
      .query("swipes")
      .withIndex("by_from_to", (q) =>
        q.eq("fromProfileId", me._id).eq("toProfileId", toProfileId),
      )
      .first();
    if (existing) {
      return { matched: false, alreadySwiped: true, matchId: null };
    }

    await ctx.db.insert("swipes", {
      fromProfileId: me._id,
      toProfileId,
      action,
      createdAt: now,
    });

    let matchId: Id<"matches"> | null = null;

    if (action === "like" || action === "superLike") {
      // Did the target already like me?
      const reverse = await ctx.db
        .query("swipes")
        .withIndex("by_from_to", (q) =>
          q.eq("fromProfileId", toProfileId).eq("toProfileId", me._id),
        )
        .first();

      if (reverse && (reverse.action === "like" || reverse.action === "superLike")) {
        // Prevent duplicate matches.
    const existingMatches = await ctx.db
      .query("matches")
      .withIndex("by_participants", (q) => q.eq("participants", [me._id]))
      .collect();
        const dup = existingMatches.find(
          (m) =>
            m.status === "active" && m.participants.includes(toProfileId),
        );
        if (!dup) {
          const id = await ctx.db.insert("matches", {
            participants: [me._id, toProfileId],
            status: "active",
            createdAt: now,
          });
          matchId = id;

          // Activity for both (demo profiles simply never read theirs).
          await ctx.db.insert("activity", {
            profileId: me._id,
            type: "match",
            fromProfileId: toProfileId,
            matchId,
            title: `You and ${target.firstName} caught the same VYBE`,
            createdAt: now,
          });
          if (target.userId !== undefined) {
            await ctx.db.insert("activity", {
              profileId: toProfileId,
              type: "match",
              fromProfileId: me._id,
              matchId,
              title: `You and ${me.firstName} caught the same VYBE`,
              createdAt: now,
            });
          }
        } else {
          matchId = dup._id;
        }
      } else {
        // Let the target know they got a like (only real users have a feed).
        if (target.userId !== undefined) {
          await ctx.db.insert("activity", {
            profileId: toProfileId,
            type: "like",
            fromProfileId: me._id,
            title:
              action === "superLike"
                ? `${me.firstName} sent you a Super VYBE ✨`
                : `${me.firstName} liked you`,
            createdAt: now,
          });
        }
      }
    }

    // Keep "last active" fresh.
    await ctx.db.patch(me._id, { lastActiveAt: now });

    return { matched: !!matchId, alreadySwiped: false, matchId };
  },
});

/** Profiles that have liked me and I have not yet responded to. */
export const likedMe = query({
  args: {},
  handler: async (ctx) => {
    const me = await getMyProfile(ctx);
    if (!me) return [];

    const incoming = await ctx.db
      .query("swipes")
      .withIndex("by_to", (q) => q.eq("toProfileId", me._id))
      .collect();
    const likes = incoming.filter(
      (s) => s.action === "like" || s.action === "superLike",
    );

    const mySwipes = await ctx.db
      .query("swipes")
      .withIndex("by_from", (q) => q.eq("fromProfileId", me._id))
      .collect();
    const responded = new Set(mySwipes.map((s) => s.toProfileId.toString()));

    const results: {
      profile: {
        _id: string;
        firstName: string;
        photos: string[];
        verified: boolean;
        city?: string;
      };
      action: "like" | "superLike";
      createdAt: number;
      responded: boolean;
    }[] = [];

    for (const s of likes) {
      const profile = await ctx.db.get(s.fromProfileId);
      if (!profile) continue;
      results.push({
        profile: {
          _id: profile._id.toString(),
          firstName: profile.firstName,
          photos: profile.photos,
          verified: profile.verified,
          city: profile.city,
        },
        action: s.action as "like" | "superLike",
        createdAt: s.createdAt,
        responded: responded.has(s.fromProfileId.toString()),
      });
    }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/** Have I already swiped this profile? (used to disable repeat actions) */
export const alreadySwiped = query({
  args: { toProfileId: v.id("profiles") },
  handler: async (ctx, { toProfileId }) => {
    const me = await getMyProfile(ctx);
    if (!me) return null;
    return await ctx.db
      .query("swipes")
      .withIndex("by_from_to", (q) =>
        q.eq("fromProfileId", me._id).eq("toProfileId", toProfileId),
      )
      .first();
  },
});
