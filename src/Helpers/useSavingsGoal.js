// Put this file at src/Helpers/useSavingsGoal.js
//
// The savings goal is stored as one entry in your existing Settings tree:
//   Settings/{userId}/{pushId} = { name: "savingsGoal", value: 500, ... }
// using createSetting / readSetting / editSetting from your Settings file.
//
// ADJUST THE IMPORT PATH below if your Settings file has a different name.

import { useCallback, useEffect, useState } from "react";
import {
  createSetting,
  editSetting,
  readSetting,
} from "../firebase/UserSettings";

export const DEFAULT_GOAL = 500;

// The `name` this setting is stored under. If your app already uses another
// name for the goal (check the dropdown options in UserModal), change it here.
export const GOAL_SETTING_NAME = "savingsGoal";

const MAX_GOAL = 1_000_000_000;

// Cache only, so the Dashboard doesn't flash the default while Firebase loads.
// Firebase is the source of truth.
const cacheKey = (userId) => `budgeto:savingsGoalCache:${userId || "anon"}`;

function readCache(userId) {
  try {
    const raw = window.localStorage.getItem(cacheKey(userId));
    if (raw === null) return DEFAULT_GOAL;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : DEFAULT_GOAL;
  } catch {
    return DEFAULT_GOAL;
  }
}

function writeCache(userId, value) {
  try {
    window.localStorage.setItem(cacheKey(userId), String(value));
  } catch {
    /* storage blocked: not important, it's only a cache */
  }
}

// readSetting returns { pushId: { name, value, id, createdAt, updatedAt } }.
// If duplicates ever exist, the most recently touched one wins.
function findGoalEntry(settings) {
  const matches = Object.entries(settings || {})
    .filter(([, entry]) => entry && entry.name === GOAL_SETTING_NAME)
    .map(([key, entry]) => ({ ...entry, id: entry.id ?? key }));

  if (matches.length === 0) return null;

  return matches.reduce((latest, entry) => {
    const stamp = (e) => Number(e.updatedAt || e.createdAt || 0);
    return stamp(entry) > stamp(latest) ? entry : latest;
  });
}

// "31 October 2026": the real last day of the current month
export function goalDeadlineLabel(now = new Date()) {
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const month = now.toLocaleString("en-GB", { month: "long" });
  return `${lastDay} ${month} ${now.getFullYear()}`;
}

export function useSavingsGoal(userId) {
  const [goal, setGoalState] = useState(() => readCache(userId));
  const [ready, setReady] = useState(false); // true once Firebase has answered
  const [saving, setSaving] = useState(false);

  // Load from Firebase once the user id is known
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setReady(false);
    setGoalState(readCache(userId));

    (async () => {
      try {
        const entry = findGoalEntry(await readSetting(userId));
        if (cancelled) return;

        const n = entry ? Number(entry.value) : DEFAULT_GOAL;
        const value = Number.isFinite(n) && n >= 0 ? n : DEFAULT_GOAL;
        setGoalState(value);
        writeCache(userId, value);
      } catch (error) {
        console.error("Could not load savings goal:", error);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Resolves to { ok: true } or { ok: false, error }
  const saveGoal = useCallback(
    async (value) => {
      const n = Number(value);
      if (!Number.isFinite(n) || n < 0 || n > MAX_GOAL) {
        return { ok: false, error: "That isn't a valid amount." };
      }
      if (!userId) {
        return { ok: false, error: "You need to be signed in to save." };
      }

      setSaving(true);
      try {
        const existing = findGoalEntry(await readSetting(userId));

        if (existing) {
          await editSetting(userId, existing.id, {
            name: GOAL_SETTING_NAME,
            value: n,
          });
        } else {
          await createSetting(userId, { name: GOAL_SETTING_NAME, value: n });
        }

        // createSetting / editSetting catch their own errors and return
        // nothing, so a failed write looks identical to a success.
        // Read it back to be sure it really saved.
        const confirmed = findGoalEntry(await readSetting(userId));
        if (!confirmed || Number(confirmed.value) !== n) {
          return {
            ok: false,
            error: "Couldn't save. Check your connection and try again.",
          };
        }

        setGoalState(n);
        writeCache(userId, n);
        return { ok: true };
      } catch (error) {
        console.error("Could not save savings goal:", error);
        return {
          ok: false,
          error: "Couldn't save. Check your connection and try again.",
        };
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  const resetGoal = useCallback(() => saveGoal(DEFAULT_GOAL), [saveGoal]);

  return { goal, ready, saving, saveGoal, resetGoal };
}
