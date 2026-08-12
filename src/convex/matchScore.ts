import { v } from "convex/values";
import { query } from "./_generated/server";
import { distanceKm, getMyProfile } from "./helpers";

/**
 * VYBE Match Score — an original compatibility indicator.
 *
 * Transparent methodology (no false scientific claims): the score is a plain
 * weighted overlap of shared interests, languages, lifestyle, relationship
 * intentions and city proximity. Copy is deliberately soft ("You share a
 * strong VYBE"), never "93% scientifically compatible".
 */
export const matchScore = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, { profileId }) => {
    const me = await getMyProfile(ctx);
    if (!me) return null;
    if (me._id === profileId) return null;
    const other = await ctx.db.get(profileId);
    if (!other) return null;

    const sharedInterests = me.interests.filter((i) =>
      other.interests.includes(i),
    );
    const sharedLanguages = me.languages.filter((l) =>
      other.languages.includes(l),
    );
    const sharedLifestyle = me.lifestyle.filter((l) =>
      other.lifestyle.includes(l),
    );
    const sharedIntentions = me.relationshipIntentions.filter((i) =>
      other.relationshipIntentions.includes(i),
    );

    let proximity = 0;
    let sameCity = false;
    if (
      me.approxLat !== undefined &&
      me.approxLng !== undefined &&
      other.approxLat !== undefined &&
      other.approxLng !== undefined
    ) {
      const km = distanceKm(me.approxLat, me.approxLng, other.approxLat, other.approxLng);
      sameCity = me.city !== undefined && me.city === other.city;
      proximity = sameCity ? 1 : km < 100 ? 1 : km < 400 ? 0.5 : 0;
    }

    const maxInterests = Math.max(1, Math.max(me.interests.length, other.interests.length));
    const maxLangs = Math.max(1, Math.max(me.languages.length, other.languages.length));
    const maxLifestyle = Math.max(1, Math.max(me.lifestyle.length, other.lifestyle.length));

    const interestScore = Math.min(1, sharedInterests.length / Math.min(6, maxInterests));
    const langScore = Math.min(1, sharedLanguages.length / Math.min(2, maxLangs));
    const lifestyleScore = Math.min(1, sharedLifestyle.length / Math.min(4, maxLifestyle));
    const intentionScore = sharedIntentions.length > 0 ? 1 : me.relationshipIntentions.length === 0 && other.relationshipIntentions.length === 0 ? 0.5 : 0;

    // Weights: interests are the strongest signal.
    const raw =
      interestScore * 0.5 +
      langScore * 0.2 +
      lifestyleScore * 0.15 +
      intentionScore * 0.1 +
      proximity * 0.05;

    const score = Math.round(Math.min(100, Math.max(18, raw * 100)));

    const factors: { label: string; value: number; positive: boolean }[] = [
      { label: "Shared interests", value: sharedInterests.length, positive: sharedInterests.length > 0 },
      { label: "Shared languages", value: sharedLanguages.length, positive: sharedLanguages.length > 0 },
      { label: "Shared lifestyle", value: sharedLifestyle.length, positive: sharedLifestyle.length > 0 },
      { label: "Relationship intentions", value: sharedIntentions.length, positive: sharedIntentions.length > 0 },
      { label: "Nearby", value: sameCity ? 1 : proximity > 0 ? 1 : 0, positive: sameCity || proximity > 0 },
    ];

    const level =
      score >= 70 ? "strong" : score >= 45 ? "good" : "open";
    const summary =
      level === "strong"
        ? "You share a strong VYBE."
        : level === "good"
          ? "You have a lot in common."
          : "Plenty of room to discover each other.";

    return {
      score,
      level,
      summary,
      factors,
      sharedInterests: sharedInterests.slice(0, 6),
      sharedLanguages: sharedLanguages.slice(0, 3),
      sameCity,
      note: "Based on your shared interests, languages, lifestyle, intentions and location — a light indicator, not a scientific claim.",
    };
  },
});
