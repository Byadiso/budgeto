import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { isAuthenticated } from "../../firebase/Authentication";
import { waitToLoad } from "../../Helpers/Helpers";
import { formatAmount } from "../../Helpers/formatAmount";
import { listTransactions } from "../../firebase/getTransactions";
import { filterMotivation } from "../../firebase/Filters";
import NoAccess from "./ErrorComponents/NoAccess";
import TableData from "./TableData";
import "../../Style/Motivation.css";

const PERIODS = [
  { value: "currentMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "year", label: "This year" },
  { value: "all", label: "All" },
];

// One line per day, so the page feels fresh without being random on every render
const DAILY_LINES = [
  "Every day you show up, your work pays you back.",
  "Good work compounds. Today's effort is next month's benefit.",
  "You earned this. Keep the streak going.",
  "Small wins at work add up to big rewards.",
  "Consistency is the quiet source of every bonus.",
  "Your effort has value. These entries are the proof.",
  "Work hard now, and let the benefits do the talking later.",
];

function getDailyLine() {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now - new Date(now.getFullYear(), 0, 0)) / 86400000
  );
  return DAILY_LINES[dayOfYear % DAILY_LINES.length];
}

function getHeadline(total, periodLabel) {
  if (total <= 0) {
    return "No benefits logged yet. Your next one starts with today's work.";
  }
  return `${periodLabel}, your work has brought you ${formatAmount(total)} in benefits.`;
}

function MotivationSkeleton() {
  return (
    <div className="motivation_page" role="status" aria-busy="true">
      <span className="motivation_sr_only">Loading…</span>
      <div className="motivation_skel motivation_skel_title" />
      <div className="motivation_skel motivation_skel_summary" />
      <div className="motivation_skel motivation_skel_table" />
    </div>
  );
}

function Motivation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [period, setPeriod] = useState("currentMonth");
  const [search, setSearch] = useState("");

  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
    listTransactions(setTransactions);
    waitToLoad(setLoading);
  }, []);

  const { filteredMotivation, totalMotivation, biggest } = useMemo(
    () => filterMotivation(transactions, period, search),
    [transactions, period, search]
  );

  const listMotivation = useCallback(
    (setDataList) => setDataList(filteredMotivation),
    [filteredMotivation]
  );

  if (loading) return <MotivationSkeleton />;
  if (!isLoggedIn) return <NoAccess />;

  const count = filteredMotivation.length;
  const periodLabel = PERIODS.find((p) => p.value === period)?.label;
  const average = count > 0 ? totalMotivation / count : 0;

  return (
    <div className="motivation_page">
      <Link to="/Dashboard" className="motivation_back">
        <ArrowBackIcon fontSize="small" />
        Back to dashboard
      </Link>

      <header className="motivation_header">
        <h1 className="motivation_title">Motivation</h1>
        <p className="motivation_subhead">{getDailyLine()}</p>
      </header>

      <div
        role="region"
        className="motivation_hero"
        aria-label={`Work benefits, ${periodLabel}`}
      >
        <p className="motivation_hero_label">Work benefits</p>
        <p className="motivation_hero_amount">
          {formatAmount(totalMotivation)}
        </p>
        <p className="motivation_hero_message">
          {getHeadline(totalMotivation, periodLabel)}
        </p>
      </div>

      <div className="motivation_stats">
        <div className="motivation_stat">
          <p className="motivation_stat_label">Entries</p>
          <p className="motivation_stat_value">{count}</p>
        </div>
        <div className="motivation_stat">
          <p className="motivation_stat_label">Average</p>
          <p className="motivation_stat_value">{formatAmount(average)}</p>
        </div>
        <div className="motivation_stat">
          <p className="motivation_stat_label">Best one</p>
          <p className="motivation_stat_value">{formatAmount(biggest)}</p>
        </div>
      </div>

      <div className="motivation_toolbar">
        <div className="motivation_chips" role="group" aria-label="Period">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`motivation_chip${
                period === p.value ? " is_active" : ""
              }`}
              aria-pressed={period === p.value}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <label className="motivation_search">
          <SearchIcon fontSize="small" />
          <span className="motivation_sr_only">Search by title</span>
          <input
            type="text"
            placeholder="Search title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      <div role="region" aria-labelledby="motivation_transactions_title">
        <div className="motivation_section_head">
          <h2
            id="motivation_transactions_title"
            className="motivation_section_title"
          >
            What your work gave you
          </h2>
          {count > 0 && (
            <p className="motivation_count">
              {count} {count === 1 ? "entry" : "entries"} · {periodLabel}
            </p>
          )}
        </div>

        {count > 0 ? (
          <div className="motivation_table">
            {/* key remounts TableData when filters change */}
            <TableData
              key={`${period}-${search}-${transactions.length}`}
              fetchDataFunction={listMotivation}
            />
          </div>
        ) : (
          <div className="motivation_empty">
            <p>No benefits here yet.</p>
            <span className="motivation_empty_sub">
              {search || period !== "currentMonth"
                ? "Try another period or clear the search."
                : "Keep going. Your next bonus will show up here."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Motivation;