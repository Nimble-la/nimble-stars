/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activityLog from "../activityLog.js";
import type * as candidateFiles from "../candidateFiles.js";
import type * as candidatePositions from "../candidatePositions.js";
import type * as candidates from "../candidates.js";
import type * as comments from "../comments.js";
import type * as emails from "../emails.js";
import type * as notifications from "../notifications.js";
import type * as organizations from "../organizations.js";
import type * as positions from "../positions.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activityLog: typeof activityLog;
  candidateFiles: typeof candidateFiles;
  candidatePositions: typeof candidatePositions;
  candidates: typeof candidates;
  comments: typeof comments;
  emails: typeof emails;
  notifications: typeof notifications;
  organizations: typeof organizations;
  positions: typeof positions;
  seed: typeof seed;
  users: typeof users;
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
