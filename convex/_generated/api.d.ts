/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as attendance_mutations from "../attendance/mutations.js";
import type * as attendance_queries from "../attendance/queries.js";
import type * as attendance_validators from "../attendance/validators.js";
import type * as attendees_mutations from "../attendees/mutations.js";
import type * as attendees_queries from "../attendees/queries.js";
import type * as attendees_seed from "../attendees/seed.js";
import type * as attendees_validators from "../attendees/validators.js";
import type * as auth from "../auth.js";
import type * as eventTypes_mutations from "../eventTypes/mutations.js";
import type * as eventTypes_queries from "../eventTypes/queries.js";
import type * as eventTypes_validators from "../eventTypes/validators.js";
import type * as events_files from "../events/files.js";
import type * as events_mutations from "../events/mutations.js";
import type * as events_queries from "../events/queries.js";
import type * as events_validators from "../events/validators.js";
import type * as http from "../http.js";
import type * as myFunctions from "../myFunctions.js";
import type * as retreat_mutations from "../retreat/mutations.js";
import type * as retreat_queries from "../retreat/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "attendance/mutations": typeof attendance_mutations;
  "attendance/queries": typeof attendance_queries;
  "attendance/validators": typeof attendance_validators;
  "attendees/mutations": typeof attendees_mutations;
  "attendees/queries": typeof attendees_queries;
  "attendees/seed": typeof attendees_seed;
  "attendees/validators": typeof attendees_validators;
  auth: typeof auth;
  "eventTypes/mutations": typeof eventTypes_mutations;
  "eventTypes/queries": typeof eventTypes_queries;
  "eventTypes/validators": typeof eventTypes_validators;
  "events/files": typeof events_files;
  "events/mutations": typeof events_mutations;
  "events/queries": typeof events_queries;
  "events/validators": typeof events_validators;
  http: typeof http;
  myFunctions: typeof myFunctions;
  "retreat/mutations": typeof retreat_mutations;
  "retreat/queries": typeof retreat_queries;
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
