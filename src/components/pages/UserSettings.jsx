import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  checkIfAdmin,
  getLoggedUser,
  isAuthenticated,
  isAuthenticatedDetails,
  LogoutUser,
} from "../../firebase/Authentication";
import { readPlans } from "../../firebase/Plan";
import {
  getUsername,
  totalPlanBugdet,
  waitToLoad,
} from "../../Helpers/Helpers";
import { CURRENCY, formatAmount } from "../../Helpers/formatAmount";
import {
  DEFAULT_GOAL,
  goalDeadlineLabel,
  useSavingsGoal,
} from "../../Helpers/useSavingsGoal";
import NoAccess from "./ErrorComponents/NoAccess";
import "../../Style/UserSettings.css";

// Accepts "500", "750.50" and "750,50" (comma decimals are normal in Poland)
function parseGoal(text) {
  const cleaned = text.trim().replace(/\s/g, "").replace(",", ".");
  if (cleaned === "") return { error: "Enter an amount." };

  const n = Number(cleaned);
  if (!Number.isFinite(n)) {
    return { error: "Use numbers only, for example 500 or 750.50." };
  }
  if (n < 0) return { error: "The goal can't be negative." };
  if (n > 1_000_000_000) return { error: "That amount is too large." };

  return { value: n };
}

function SettingsSkeleton() {
  return (
    <div className="main_settings" role="status" aria-busy="true">
      <span className="settings_sr_only">Loading settings…</span>
      <div className="settings_skel settings_skel_title" />
      <div className="settings_skel settings_skel_card" />
      <div className="settings_skel settings_skel_card" />
    </div>
  );
}

function UserSettings() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const [budgets, setBudgets] = useState([]);

  const { goal, ready, saving, saveGoal, resetGoal } =
    useSavingsGoal(userId);
  const [draft, setDraft] = useState(String(goal));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const navigate = useNavigate();

  const isAdmin = checkIfAdmin(userId);
  const username = getUsername(loggedUser?.email);
  const totalBudgetPlan = totalPlanBugdet(budgets);

  // Auth + loading: once on mount. (The old effect re-ran on every login
  // change, and called readPlans(null) before the user id was known.)
  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
    isAuthenticatedDetails(setIsLoggedIn, setUserId);
    getLoggedUser(setLoggedUser);
    waitToLoad(setLoading);
  }, []);

  // Plans: only once userId exists, with error handling
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const fetchBudgets = async () => {
      try {
        const plans = await readPlans(userId);
        if (cancelled || !plans) return;
        setBudgets(
          Object.keys(plans).map((key) => ({ id: key, ...plans[key] }))
        );
      } catch (err) {
        console.error("Could not load plans:", err);
      }
    };

    fetchBudgets();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Keep the input in step when the stored goal loads in after sign-in
  useEffect(() => {
    setDraft(String(goal));
  }, [goal]);

  const parsed = parseGoal(draft);
  const isUnchanged = parsed.value === goal;

  const handleChange = (event) => {
    setDraft(event.target.value);
    setError("");
    setSaved("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = parseGoal(draft);

    if (result.error) {
      setError(result.error);
      setSaved("");
      return;
    }

    setError("");
    setSaved("");

    const outcome = await saveGoal(result.value);
    if (outcome.ok) {
      setSaved("Saved. Your dashboard now uses this goal.");
    } else {
      setError(outcome.error);
    }
  };

  const handleReset = async () => {
    setError("");
    setSaved("");

    const outcome = await resetGoal();
    if (outcome.ok) {
      setDraft(String(DEFAULT_GOAL));
      setSaved("Goal reset to the default.");
    } else {
      setError(outcome.error);
    }
  };

  const handleLogout = () => {
    LogoutUser();
    navigate("/Login");
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  if (!isLoggedIn) {
    return <NoAccess />;
  }

  return (
    <div className="main_settings">
      <Link to="/Dashboard" className="settings_back">
        <ArrowBackIcon fontSize="small" />
        Back to dashboard
      </Link>

      <header className="settings_header">
        <h1 className="settings_title">Settings</h1>
        <p className="settings_subhead">
          Manage your account and your savings goal.
        </p>
      </header>

      {/* Account */}
      <div
        className="settings_card"
        role="region"
        aria-labelledby="settings_account_title"
      >
        <h2 id="settings_account_title" className="settings_card_title">
          Account
        </h2>
        <dl className="settings_details">
          <dt>Name</dt>
          <dd>{username || "Not set"}</dd>
          <dt>Email</dt>
          <dd>{loggedUser?.email || "Not available"}</dd>
          <dt>Role</dt>
          <dd>
            <span
              className="settings_role"
              data-role={isAdmin ? "admin" : "member"}
            >
              {isAdmin ? "Admin" : "Member"}
            </span>
          </dd>
        </dl>
        <button
          type="button"
          className="settings_btn settings_btn_secondary"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>

      {/* Savings goal */}
      <div
        className="settings_card"
        role="region"
        aria-labelledby="settings_goal_title"
      >
        <h2 id="settings_goal_title" className="settings_card_title">
          Savings goal
        </h2>
        <p className="settings_goal_current">{formatAmount(goal)}</p>
        <p className="settings_goal_deadline">
          Until {goalDeadlineLabel()}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="settings_goal_input" className="settings_label">
            New goal{CURRENCY ? ` (${CURRENCY})` : ""}
          </label>
          <div className="settings_field_row">
            <input
              id="settings_goal_input"
              className="settings_input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              disabled={!ready}
              value={draft}
              onChange={handleChange}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={
                error ? "settings_goal_error" : "settings_goal_help"
              }
            />
            <button
              type="submit"
              className="settings_btn"
              disabled={!ready || saving || (isUnchanged && !error)}
            >
              {saving ? "Saving…" : "Save goal"}
            </button>
          </div>

          {error && (
            <p id="settings_goal_error" className="settings_error" role="alert">
              {error}
            </p>
          )}
          <p className="settings_saved" role="status">
            {saved}
          </p>
          <p id="settings_goal_help" className="settings_help">
            Saved to your account, so it follows you to any device.
          </p>

          {goal !== DEFAULT_GOAL && (
            <div className="settings_actions">
              <button
                type="button"
                className="settings_btn settings_btn_secondary"
                onClick={handleReset}
                disabled={saving}
              >
                Reset to {formatAmount(DEFAULT_GOAL)}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Plans */}
      <div
        className="settings_card"
        role="region"
        aria-labelledby="settings_plans_title"
      >
        <h2 id="settings_plans_title" className="settings_card_title">
          Monthly plans
        </h2>
        <div className="settings_plans">
          <div>
            <p className="settings_plans_amount">
              {formatAmount(totalBudgetPlan)}
            </p>
            <p className="settings_plans_caption">
              {budgets.length} {budgets.length === 1 ? "plan" : "plans"} in
              total
            </p>
          </div>
          <Link to="/Plan" className="settings_btn settings_btn_secondary">
            Manage plans
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserSettings;
