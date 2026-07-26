/**
 * Data access layer.
 *
 * Pages and components import from here — never from demo.ts
 * directly (the design-system page is the one documented
 * exception). Each accessor currently serves the deterministic
 * demo dataset; when Supabase is configured, swap the body of the
 * accessor for a query against the matching table (schema in
 * supabase/migrations/0001_init.sql) without touching any UI.
 */

import {
  DEMO_NOW,
  demoActivity,
  demoAnomalies,
  demoAutomations,
  demoDailySeries,
  demoIntegrations,
  demoMembers,
  demoMetrics,
  demoNotifications,
  demoReports,
  demoSignals,
  demoTrends,
  demoUser,
  demoWorkspaces,
  memberById,
  prioritySignals,
  severityRank,
} from "./demo";

export type * from "./types";

export const dataNow = DEMO_NOW;

export const getWorkspaces = () => demoWorkspaces;
export const getCurrentUser = () => demoUser;
export const getMembers = () => demoMembers;
export const getMemberById = memberById;
export const getSignals = () => demoSignals;
export const getPrioritySignals = () => prioritySignals;
export const getAutomations = () => demoAutomations;
export const getReports = () => demoReports;
export const getActivity = () => demoActivity;
export const getNotifications = () => demoNotifications;
export const getDailySeries = () => demoDailySeries;
export const getTrends = () => demoTrends;
export const getAnomalies = () => demoAnomalies;
export const getIntegrations = () => demoIntegrations;
export const getMetrics = () => demoMetrics;
export { severityRank };
