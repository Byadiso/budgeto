import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  checkIfAdmin,
  isAuthenticated,
  isAuthenticatedDetails,
} from "../../firebase/Authentication";
import {
  getCurrentMonthName,
  totalPlanBugdet,
  waitToLoad,
} from "../../Helpers/Helpers";
import NoAccess from "./ErrorComponents/NoAccess";
import "../../Style/Dashboard.css";
import { listTransactions } from "../../firebase/getTransactions";
import {
  filterBenefits,
  filterSuperBet,
  filterWhatIsNotMine,
  listAlltransactionWithoutSuper,
  summarizePeriod,
  toDate,
} from "../../firebase/Filters";
import { KEYWORDS } from "../../firebase/CONSTANTS";
import { readPlans } from "../../firebase/Plan";
import { formatAmount } from "../../Helpers/formatAmount";
import { goalDeadlineLabel, useSavingsGoal } from "../../Helpers/useSavingsGoal";

const INITIAL_HOME_EXPENSE_AMOUNT = 1000;

const PERIODS = [
  { value: "currentMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
];

// Adjust the paths if your routes are named differently
const QUICK_LINKS = [
  { to: "/Planning", label: "Planning", hint: "Monthly budgets" },
  { to: "/Reports", label: "Reports", hint: "All transactions", adminOnly: true },
  { to: "/Super", label: "Super", hint: "Super account", adminOnly: true },
  { to: "/SideHustle", label: "Side hustle", hint: "Extra income", adminOnly: true },
  { to: "/Motivation", label: "Motivation", hint: "Work benefits", adminOnly: true },
  { to: "/ToBePaid", label: "To be paid", hint: "Not your money", adminOnly: true },
];

/**
 * One account or plan figure.
 * `signed` colors negative amounts red (use for balances, not for plans).
 */
function StatCard({ label, caption, amount, accent, signed = false }) {
  const isNegative = signed && Number(amount) < 0;

  return (
    <div role="group" className="dashboard_stat" data-accent={accent}>
      <h3 className="dashboard_stat_label">{label}</h3>
      <p
        className={`dashboard_stat_amount${isNegative ? " is_negative" : ""}`}
      >
        {formatAmount(amount)}
      </p>
      {caption && <p className="dashboard_stat_caption">{caption}</p>}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="main_dashboard" role="status" aria-busy="true">
      <span className="dashboard_sr_only">Loading dashboard…</span>
      <div className="dashboard_skel dashboard_skel_title" />
      <div className="dashboard_skel dashboard_skel_goal" />
      <div className="dashboard_skel_row">
        <div className="dashboard_skel dashboard_skel_card" />
        <div className="dashboard_skel dashboard_skel_card" />
        <div className="dashboard_skel dashboard_skel_card" />
        <div className="dashboard_skel dashboard_skel_card" />
      </div>
    </div>
  );
}

const formatDate = (value) => {
  const d = toDate(value);
  return d
    ? d.toLocaleDateString("pl-PL", { day: "2-digit", month: "short" })
    : "";
};

const normType = (type) =>
  (type || "").toString().toLowerCase().replace(/[\s_-]/g, "");

function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [period, setPeriod] = useState("currentMonth");

  // Set on the Settings page (was a hard-coded 500)
  const { goal } = useSavingsGoal(userId);

  // Account totals (all time)
  const { totalExpense, totalIncome } = listAlltransactionWithoutSuper(
    transactions,
    KEYWORDS
  );
  const { totalBenefits } = filterBenefits(transactions);
  const { net: superNet } = useMemo(
    () => filterSuperBet(transactions, KEYWORDS, "all"),
    [transactions]
  );
  const { totalWhatIsNotMine } = filterWhatIsNotMine(transactions);

  // Month overview
  const summary = useMemo(
    () => summarizePeriod(transactions, KEYWORDS, period),
    [transactions, period]
  );
  const lastMonthSummary = useMemo(
    () => summarizePeriod(transactions, KEYWORDS, "lastMonth"),
    [transactions]
  );

  // Last 5 transactions
  const recent = useMemo(
    () =>
      [...transactions]
        .sort(
          (a, b) =>
            (toDate(b.createdAt)?.getTime() || 0) -
            (toDate(a.createdAt)?.getTime() || 0)
        )
        .slice(0, 5),
    [transactions]
  );

  const currentMonth = getCurrentMonthName();
  const currentYear = new Date().getFullYear();
  const isAdmin = checkIfAdmin(userId);

  const totalBudgetPlan = totalPlanBugdet(budgets);
  const homeExpenseAmount = INITIAL_HOME_EXPENSE_AMOUNT + totalBudgetPlan;

  // Goal progress, based on the bank account balance
  const bankBalance = totalIncome - totalExpense;
  const goalNumber = Number(goal) || 0;
  const goalPct =
    goalNumber > 0
      ? Math.min(100, Math.max(0, (bankBalance / goalNumber) * 100))
      : 0;
  const goalLeft = Math.max(0, goalNumber - bankBalance);

  // Spending vs last month (only shown for "This month")
  const spentDiff = summary.expense - lastMonthSummary.expense;
  const showCompare = period === "currentMonth" && lastMonthSummary.expense > 0;

  // Initial data fetching
  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
    isAuthenticatedDetails(setIsLoggedIn, setUserId);
    listTransactions(setTransactions);
    waitToLoad(setLoading);
  }, []);

  // Fetch budgets once userId is known
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
      } catch (error) {
        console.error("Could not load plans:", error);
      }
    };

    fetchBudgets();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!isLoggedIn) {
    return <NoAccess />;
  }

  const periodLabel = PERIODS.find((p) => p.value === period)?.label;

  return (
    <div className="main_dashboard">
      <header className="dashboard_header">
        <h1>Dashboard</h1>
        <p className="dashboard_period">
          {currentMonth} {currentYear}
        </p>
      </header>

      {/* ---------- savings goal ---------- */}
      <div role="region" className="dashboard_goal" aria-label="Savings goal">
        <div className="dashboard_goal_top">
          <div>
            <p className="dashboard_goal_label">Savings goal</p>
            <p className="dashboard_goal_deadline">
              Until {goalDeadlineLabel()}
            </p>
          </div>
          <p className="dashboard_goal_amount">{formatAmount(goal)}</p>
        </div>

        {isAdmin && goalNumber > 0 && (
          <>
            <div
              className="dashboard_progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(goalPct)}
              aria-label="Progress towards savings goal"
            >
              <span
                className="dashboard_progress_fill"
                style={{ width: `${goalPct}%` }}
              />
            </div>
            <p className="dashboard_progress_text">
              {Math.round(goalPct)}% reached ·{" "}
              {goalLeft > 0
                ? `${formatAmount(goalLeft)} to go`
                : "Goal reached 🎉"}
            </p>
          </>
        )}
      </div>

      {/* ---------- month overview ---------- */}
      {isAdmin && (
        <div
          role="region"
          className="dashboard_section"
          aria-labelledby="dashboard_overview_title"
        >
          <div className="dashboard_section_head">
            <h2
              id="dashboard_overview_title"
              className="dashboard_section_title"
            >
              Overview
            </h2>
            <div className="dashboard_chips" role="group" aria-label="Period">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`dashboard_chip${
                    period === p.value ? " is_active" : ""
                  }`}
                  aria-pressed={period === p.value}
                  onClick={() => setPeriod(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard_grid">
            <StatCard
              label="Income"
              caption={periodLabel}
              amount={summary.income}
              accent="bank"
            />
            <StatCard
              label="Spent"
              caption={
                showCompare
                  ? `${formatAmount(Math.abs(spentDiff))} ${
                      spentDiff > 0 ? "more" : "less"
                    } than last month`
                  : periodLabel
              }
              amount={summary.expense}
              accent="super"
            />
            <StatCard
              label="Net"
              caption={
                summary.savingsRate === null
                  ? "No income logged"
                  : `${Math.round(summary.savingsRate)}% of income kept`
              }
              amount={summary.net}
              accent="benefits"
              signed
            />
            <StatCard
              label="Side hustle"
              caption={periodLabel}
              amount={summary.sidehustle}
              accent="others"
            />
          </div>
        </div>
      )}

      {/* ---------- accounts ---------- */}
      {isAdmin && (
        <div
          role="region"
          className="dashboard_section"
          aria-labelledby="dashboard_accounts_title"
        >
          <h2 id="dashboard_accounts_title" className="dashboard_section_title">
            Accounts
          </h2>
          <div className="dashboard_grid dashboard_grid_accounts">
            <StatCard
              label="Bank account"
              caption="Income minus expenses"
              amount={bankBalance}
              accent="bank"
              signed
            />
            <StatCard
              label="Benefit account"
              caption="Reimbursements, kept apart"
              amount={totalBenefits}
              accent="benefits"
              signed
            />
            <StatCard
              label="Super account"
              caption="Won minus spent"
              amount={superNet}
              accent="super"
              signed
            />
            <StatCard
              label="What is not mine"
              caption="Fronted for others"
              amount={-totalWhatIsNotMine}
              accent="others"
              signed
            />
          </div>
        </div>
      )}

      {/* ---------- monthly plans ---------- */}
      <div
        role="region"
        className="dashboard_section"
        aria-labelledby="dashboard_plans_title"
      >
        <h2 id="dashboard_plans_title" className="dashboard_section_title">
          Monthly plans
        </h2>
        <div className="dashboard_grid">
          {!isAdmin && (
            <StatCard
              label="Home groceries"
              caption="Base amount plus your plans"
              amount={homeExpenseAmount}
              accent="plan"
            />
          )}
          <StatCard
            label="Remaining after spending"
            caption="Total of What remains in your monthly plans"
            amount={totalBudgetPlan}
            accent="plan"
          />
        </div>
      </div>

      {/* ---------- recent activity ---------- */}
      {isAdmin && (
        <div
          role="region"
          className="dashboard_section"
          aria-labelledby="dashboard_recent_title"
        >
          <div className="dashboard_section_head">
            <h2 id="dashboard_recent_title" className="dashboard_section_title">
              Recent activity
            </h2>
            <Link to="/Reports" className="dashboard_link">
              View all
            </Link>
          </div>

          {recent.length > 0 ? (
            <ul className="dashboard_recent">
              {recent.map((t, i) => {
                const type = normType(t.type);
                const isExpense = type === "expense";
                return (
                  <li key={t.id || i} className="dashboard_recent_item">
                    <div className="dashboard_recent_main">
                      <p className="dashboard_recent_title">{t.title}</p>
                      <p className="dashboard_recent_meta">
                        {formatDate(t.createdAt)} · {t.type}
                      </p>
                    </div>
                    <p
                      className={`dashboard_recent_amount${
                        isExpense ? " is_negative" : ""
                      }`}
                    >
                      {isExpense ? "−" : ""}
                      {formatAmount(t.amount)}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="dashboard_recent_empty">
              No transactions yet.
            </div>
          )}
        </div>
      )}

      {/* ---------- quick links ---------- */}
      <div
        role="region"
        className="dashboard_section"
        aria-labelledby="dashboard_links_title"
      >
        <h2 id="dashboard_links_title" className="dashboard_section_title">
          Go to
        </h2>
        <div className="dashboard_links">
          {QUICK_LINKS.filter((l) => isAdmin || !l.adminOnly).map((l) => (
            <Link key={l.to} to={l.to} className="dashboard_tile">
              <span className="dashboard_tile_label">{l.label}</span>
              <span className="dashboard_tile_hint">{l.hint}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;