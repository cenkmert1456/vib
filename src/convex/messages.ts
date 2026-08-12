import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getMyProfile, nowMs } from "./helpers";

const MESSAGES_PAGE = 40;

export const listMessages = query({
  args: {
    matchId: v.id("matches"),
    cursor: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { matchId, cursor, limit }) => {
    const me = await getMyProfile(ctx);
    if (!me) return { messages: [], hasMore: false, cursor: null };

    const match = await ctx.db.get(matchId);
    if (!match || !match.participants.includes(me._id))
      return { messages: [], hasMore: false, cursor: null };

    const pageSize = Math.min(limit ?? MESSAGES_PAGE, 60);
    const all = await ctx.db
      .query("messages")
      .withIndex("by_match", (q) => q.eq("matchId", matchId))
      .collect();

    // Newest first, skip past the cursor, take a page, then reverse to ascending.
    const sorted = all.sort((a, b) => b.createdAt - a.createdAt);
    let start = 0;
    if (cursor !== undefined) {
      const idx = sorted.findIndex((m) => m.createdAt < cursor);
      start = idx === -1 ? sorted.length : idx;
    }
    const page = sorted.slice(start, start + pageSize);
    const hasMore = start + page.length < sorted.length;
    const lastCursor = page.length ? page[page.length - 1].createdAt : null;

    return {
      messages: page.reverse(),
      hasMore,
      cursor: hasMore ? lastCursor : null,
    };
  },
});

/** Shared insert logic for text and image messages. */
async function insertMessage(
  ctx: MutationCtx,
  matchId: Id<"matches">,
  content: string,
  type: "text" | "image",
): Promise<string> {
  const me = await getMyProfile(ctx);
  if (!me) throw new Error("Complete onboarding first");

  const match = await ctx.db.get(matchId);
  if (!match || !match.participants.includes(me._id))
    throw new Error("Match not found");
  if (match.status !== "active")
    throw new Error("This conversation is closed");

  const trimmed = content.trim();
  if (type === "text" && !trimmed) throw new Error("Message is empty");
  if (type === "text" && trimmed.length > 4000)
    throw new Error("Message is too long");

  const now = nowMs();
  const id = await ctx.db.insert("messages", {
    matchId,
    senderProfileId: me._id,
    type,
    content: type === "image" ? content : trimmed,
    createdAt: now,
    deliveredAt: now,
  });

  await ctx.db.patch(matchId, {
    lastMessageAt: now,
    lastMessagePreview:
      type === "image" ? "📷 Photo" : trimmed.slice(0, 120),
    lastMessageSender: me._id,
  });

  const otherId = match.participants.find((p) => p !== me._id);
  if (otherId) {
    const other = await ctx.db.get(otherId);
    if (other && other.userId !== undefined) {
      await ctx.db.insert("activity", {
        profileId: otherId,
        type: "message",
        fromProfileId: me._id,
        matchId,
        title: `${me.firstName} sent you a message`,
        createdAt: now,
      });
    }
  }

  return id.toString();
}

export const sendMessage = mutation({
  args: {
    matchId: v.id("matches"),
    content: v.string(),
    type: v.optional(v.union(v.literal("text"), v.literal("image"))),
  },
  handler: async (ctx, { matchId, content, type }) => {
    return await insertMessage(ctx, matchId, content, type ?? "text");
  },
});

export const sendImageMessage = mutation({
  args: { matchId: v.id("matches"), storageId: v.id("_storage") },
  handler: async (ctx, { matchId, storageId }) => {
    const url = await ctx.storage.getUrl(storageId);
    if (!url) throw new Error("Upload failed");
    return await insertMessage(ctx, matchId, url, "image");
  },
});

/** Mark all messages from the other participant as read. */
export const markRead = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    const me = await getMyProfile(ctx);
    if (!me) return;
    const match = await ctx.db.get(matchId);
    if (!match || !match.participants.includes(me._id)) return;
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_match", (q) => q.eq("matchId", matchId))
      .collect();
    const now = nowMs();
    for (const msg of messages) {
      if (msg.senderProfileId !== me._id && msg.readAt === undefined) {
        await ctx.db.patch(msg._id, { readAt: now });
      }
    }
  },
});

/** Canned replies used by demo profiles so conversations feel alive. */
const DEMO_REPLIES = [
  "Haha love that 😄 What are you up to this weekend?",
  "Okay that's actually a great point. Tell me more 👀",
  "I was literally just thinking the same thing!",
  "You have the best energy. This is refreshing ✨",
  "Hmm, tough one. Coffee first, we can debate after ☕",
  "Sending you a virtual high five 🙌",
  "I'd say yes, but only if you bring snacks.",
  "You're making my day honestly. What's your favorite song right now?",
  "That sounds amazing. When are we doing it? 😏",
  "I love how you think. Also — cute photo 👀",
];

export const simulateReply = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    const match = await ctx.db.get(matchId);
    if (!match || match.status !== "active") return null;

    const me = await getMyProfile(ctx);
    if (!me) return null;
    const otherId = match.participants.find((p) => p !== me._id);
    if (!otherId) return null;
    const other = await ctx.db.get(otherId);
    if (!other || !other.isDemo) return null;

    const existing = await ctx.db
      .query("messages")
      .withIndex("by_match", (q) => q.eq("matchId", matchId))
      .collect();
    const fromMe = existing.filter((m) => m.senderProfileId === me._id).length;

    const reply =
      DEMO_REPLIES[fromMe % DEMO_REPLIES.length] ?? DEMO_REPLIES[0];

    const now = nowMs();
    await ctx.db.insert("messages", {
      matchId,
      senderProfileId: otherId,
      type: "text",
      content: reply,
      createdAt: now,
      deliveredAt: now,
    });
    await ctx.db.patch(matchId, {
      lastMessageAt: now,
      lastMessagePreview: reply,
      lastMessageSender: otherId,
    });
    await ctx.db.insert("activity", {
      profileId: me._id,
      type: "message",
      fromProfileId: otherId,
      matchId,
      title: `${other.firstName} sent you a message`,
      createdAt: now,
    });
    return reply;
  },
});
