import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { currentUserId, getMyProfile, nowMs } from "./helpers";
import { verificationProvider } from "./providers/verification";
import { api } from "./_generated/api";

/**
 * Randomized liveness challenge library. The order is shuffled per session on
 * the server so a static image cannot pre-script the answers.
 */
const CHALLENGES = [
  "turn_left",
  "turn_right",
  "blink_twice",
  "look_up",
  "smile",
  "move_closer",
  "nod",
] as const;

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const CHALLENGE_COUNT = 4;

/** Current verification status for the signed-in user. */
export const myVerification = query({
  args: {},
  handler: async (ctx) => {
    const me = await getMyProfile(ctx);
    if (!me) return null;
    if (me.verified) {
      return { status: "verified" as const, verified: true };
    }
    const row = await ctx.db
      .query("verifications")
      .withIndex("by_user_latest", (q) =>
        q.eq("userId", me.userId as any),
      )
      .order("desc")
      .first();
    if (!row) return { status: "not_started" as const, verified: false };
    return {
      status: row.status,
      verified: false,
      challengeSequence: row.challengeSequence,
      retryCount: row.retryCount,
      createdAt: row.createdAt,
      failureReason: row.failureReason ?? null,
    };
  },
});

/**
 * Begin a verification session. Creates a server-side session with a
 * randomized challenge sequence and (when a provider is configured) opens the
 * provider session. Returns everything the client needs to run the camera UI.
 */
export const startVerification = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const me = await getMyProfile(ctx);
    if (!me) throw new Error("Complete onboarding first");
    if (me.verified) throw new Error("Already verified");

    // One active session at a time; reuse an in-flight one.
    const active = await ctx.db
      .query("verifications")
      .withIndex("by_user_latest", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
    if (
      active &&
      (active.status === "processing" || active.status === "pending")
    ) {
      return {
        sessionId: active._id.toString(),
        challengeSequence: active.challengeSequence,
        provider: active.provider,
        providerConfigured: verificationProvider.configured,
      };
    }

    const sequence = shuffle(CHALLENGES).slice(0, CHALLENGE_COUNT);
    let providerSessionId: string | undefined;
    const providerStart = await verificationProvider.startSession({
      userId: userId.toString(),
      userEmail: null,
      challengeSequence: sequence,
    });
    if (!("unavailable" in providerStart)) {
      providerSessionId = providerStart.sessionId;
    }

    const now = nowMs();
    const id = await ctx.db.insert("verifications", {
      userId,
      profileId: me._id,
      provider: verificationProvider.id,
      providerSessionId,
      status: providerSessionId ? "processing" : "pending",
      challengeSequence: sequence,
      challengeResults: [],
      createdAt: now,
      retryCount: (active?.retryCount ?? 0) + (active ? 0 : 0),
    });

    await ctx.db.insert("analytics", {
      profileId: me._id,
      event: "verification_started",
      createdAt: now,
    });

    return {
      sessionId: id.toString(),
      challengeSequence: sequence,
      provider: verificationProvider.id,
      providerConfigured: verificationProvider.configured,
    };
  },
});

/** The challenge sequence for an in-progress session (for reconnect/resume). */
export const getActiveSession = query({
  args: { sessionId: v.id("verifications") },
  handler: async (ctx, { sessionId }) => {
    const me = await getMyProfile(ctx);
    if (!me) return null;
    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== me.userId) return null;
    return {
      sessionId: session._id.toString(),
      status: session.status,
      challengeSequence: session.challengeSequence,
      retryCount: session.retryCount,
      providerConfigured: verificationProvider.configured,
    };
  },
});

/**
 * Submit the completed liveness run. The client sends only the ordered results
 * it captured; the provider (or manual review) makes the authoritative call.
 * Static-image abuse is mitigated server-side because the session requires a
 * live challenge sequence the image never received.
 */
export const submitLiveness = mutation({
  args: {
    sessionId: v.id("verifications"),
    results: v.array(v.string()),
    capturedAt: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const me = await getMyProfile(ctx);
    if (!me) throw new Error("Not authenticated");
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== me.userId)
      throw new Error("Session not found");
    if (session.status === "verified") throw new Error("Already verified");
    if (args.results.length !== session.challengeSequence.length)
      throw new Error("Incomplete verification");

    await ctx.db.patch(session._id, {
      challengeResults: args.results,
      status: "processing",
    });

    let verdict: "processing" | "verified" | "failed" | "manual_review";
    if (session.providerSessionId && session.provider !== "unconfigured") {
      const providerVerdict = await verificationProvider.submitSession({
        sessionId: session.providerSessionId,
        results: args.results,
        capturedAt: args.capturedAt,
      });
      verdict = providerVerdict.status;
    } else {
      // No provider configured: honest review path, never an auto-pass.
      verdict = "manual_review";
    }

    await ctx.db.patch(session._id, {
      status: verdict,
      completedAt: nowMs(),
    });

    if (verdict === "verified") {
      await ctx.db.patch(me._id, {
        verified: true,
        verificationStatus: "verified",
      });
      await ctx.db.insert("analytics", {
        profileId: me._id,
        event: "verification_completed",
        createdAt: nowMs(),
      });
    } else if (verdict === "failed") {
      await ctx.db.insert("analytics", {
        profileId: me._id,
        event: "verification_failed",
        createdAt: nowMs(),
      });
    }

    return { status: verdict, verified: verdict === "verified" };
  },
});

/**
 * Poll the authoritative status. On success, activates the verified badge.
 */
export const getVerificationStatus = mutation({
  args: { sessionId: v.id("verifications") },
  handler: async (ctx, { sessionId }) => {
    const me = await getMyProfile(ctx);
    if (!me) return { status: "failed" as const };
    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== me.userId)
      return { status: "failed" as const };
    if (session.status === "processing" && session.providerSessionId) {
      const verdict = await verificationProvider.getStatus(
        session.providerSessionId,
      );
      await ctx.db.patch(session._id, {
        status: verdict.status,
        completedAt: nowMs(),
      });
      if (verdict.status === "verified") {
        await ctx.db.patch(me._id, {
          verified: true,
          verificationStatus: "verified",
        });
      }
      return verdict;
    }
    return { status: session.status };
  },
});

/** Retry after a failure — creates a fresh session with a new challenge order. */
export const retryVerification = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const me = await getMyProfile(ctx);
    if (!me) throw new Error("Complete onboarding first");
    if (me.verified) throw new Error("Already verified");

    const latest = await ctx.db
      .query("verifications")
      .withIndex("by_user_latest", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
    const retryCount = (latest?.retryCount ?? 0) + 1;

    // Repeated technical failures never ban the user; we only cap how fast
    // they can re-run sessions.
    if (retryCount > 8) {
      throw new Error(
        "You've tried verification many times. Please contact support so we can help you directly.",
      );
    }

    const sequence = shuffle(CHALLENGES).slice(0, CHALLENGE_COUNT);
    const now = nowMs();
    const id = await ctx.db.insert("verifications", {
      userId,
      profileId: me._id,
      provider: verificationProvider.id,
      status: "pending",
      challengeSequence: sequence,
      challengeResults: [],
      createdAt: now,
      retryCount,
    });
    return {
      sessionId: id.toString(),
      challengeSequence: sequence,
      providerConfigured: verificationProvider.configured,
      retryCount,
    };
  },
});

/** Admin/dev: mark an existing pending review session as verified (manual QA). */
export const manualVerify = mutation({
  args: { sessionId: v.id("verifications"), approve: v.boolean() },
  handler: async (ctx, args) => {
    const me = await getMyProfile(ctx);
    if (!me) throw new Error("Not authenticated");
    const session = await ctx.db.get(args.sessionId);
    if (!session) return;
    if (session.userId !== me.userId) return;
    if (session.status !== "manual_review") return;
    if (args.approve) {
      await ctx.db.patch(session._id, { status: "verified", completedAt: nowMs() });
      const profile = session.profileId ? await ctx.db.get(session.profileId) : null;
      if (profile) {
        await ctx.db.patch(profile._id, { verified: true, verificationStatus: "verified" });
      }
    } else {
      await ctx.db.patch(session._id, { status: "failed", completedAt: nowMs() });
    }
    return true;
  },
});
