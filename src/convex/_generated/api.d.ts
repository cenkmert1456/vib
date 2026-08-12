/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activity from "../activity.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as boosts from "../boosts.js";
import type * as dailyQuestions from "../dailyQuestions.js";
import type * as entitlements from "../entitlements.js";
import type * as feedback from "../feedback.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as matchScore from "../matchScore.js";
import type * as matches from "../matches.js";
import type * as messages from "../messages.js";
import type * as moments from "../moments.js";
import type * as plans from "../plans.js";
import type * as profiles from "../profiles.js";
import type * as providers_subscriptions from "../providers/subscriptions.js";
import type * as providers_verification from "../providers/verification.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";
import type * as subscriptions from "../subscriptions.js";
import type * as swipes from "../swipes.js";
import type * as upload from "../upload.js";
import type * as users from "../users.js";
import type * as verification from "../verification.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activity: typeof activity;
  analytics: typeof analytics;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  boosts: typeof boosts;
  dailyQuestions: typeof dailyQuestions;
  entitlements: typeof entitlements;
  feedback: typeof feedback;
  helpers: typeof helpers;
  http: typeof http;
  matchScore: typeof matchScore;
  matches: typeof matches;
  messages: typeof messages;
  moments: typeof moments;
  plans: typeof plans;
  profiles: typeof profiles;
  "providers/subscriptions": typeof providers_subscriptions;
  "providers/verification": typeof providers_verification;
  reports: typeof reports;
  seed: typeof seed;
  subscriptions: typeof subscriptions;
  swipes: typeof swipes;
  upload: typeof upload;
  users: typeof users;
  verification: typeof verification;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
