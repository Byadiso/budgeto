import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { isAuthenticated } from "../../firebase/Authentication";
import { listTransactions } from "../../firebase/getTransactions";
import { getPeriodRange, toDate } from "../../firebase/Filters";
import { KEYWORDS } from "../../firebase/CONSTANTS";
import { waitToLoad } from "../../Helpers/Helpers";
import { formatAmount } from "../../Helpers/formatAmount";
import NoAccess from "./ErrorComponents/NoAccess";
import TableData from "./TableData";
import "../../Style/CurrentMonth.css";

const normType = (type) =>
  (type || "").toString().toLowerCase().replace(/[\s_-]/g, "");

const amountOf = (t) => parseFloat(t.amount) || 0;
const timeOf = (t) => toDate(t.createdAt)?.getTime() || 0;

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "largest", label: "Largest first" },
  { value: "smallest", label: "Smallest first" },
];

const SORTERS = {
  newest: (a, b) => timeOf(b) - timeOf(a),
  oldest: (a, b) => timeOf(a) - timeOf(b),
  largest: (a, b) => amountOf(b) - amountOf(a),
  smallest: (a, b) => amountOf(a) - amountOf(b),
};

const TILES = [
  { key: "income", label: "Income", cls: "is_income" },
  { key: "expense", label: "Spent", cls: "is_expense" },
  { key: "extra", label: "Benefits", cls: "is_extra" },
  { key: "sidehustle", label: "Side hustle", cls: "is_side" },
];

const TYPE_CHIPS = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "extra", label: "Extra" },
  { value: "sidehustle", label: "Side hustle" },
  { value: "isnotmine", label: "Not mine" },
];

function MonthSkeleton() {
  return (
    <div className="month_page" role="status" aria-busy="true">
      <span className="month_sr_only">Loading…</span>
      <div className="month_skel month_skel_title" />
      <div className="month_skel month_skel_hero" />
      <div className="month_skel month_skel_table" />
    </div>
  );
}

function CurrentTransaction() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [includeSuper, setIncludeSuper] = useState(false);

  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
    listTransactions(setTransactions);
    waitToLoad(setLoading);
  }, []);

  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const daysLeft = daysInMonth - dayOfMonth;
  const monthPct = (dayOfMonth / daysInMonth) * 100;

  // Everything logged this month (optionally without SuperBet entries)
  const monthRows = useMemo(() => {
    const range = getPeriodRange("currentMonth");
    const kws = KEYWORDS.map((k) => k.toLowerCase());

    return (transactions || []).filter((t) => {
      const d = toDate(t.createdAt);
      if (!d || d < range.start || d > range.end) return false;
      if (!includeSuper) {
        const title = (t.title || "").toLowerCase();
        if (kws.some((k) => title.includes(k))) return false;
      }
      return true;
    });
  }, [transactions, includeSuper]);

  // Totals per type
  const totals = useMemo(() => {
    const s = { income: 0, expense: 0, extra: 0, sidehustle: 0, isnotmine: 0 };
    let biggest = null;

    monthRows.forEach((t) => {
      const type = normType(t.type);
      const amount = amountOf(t);
      if (type in s) s[type] += amount;
      if (type === "expense" && (!biggest || amount > amountOf(biggest))) {
        biggest = t;
      }
    });

    return {
      ...s,
      balance: s.income + s.extra + s.sidehustle - s.expense,
      biggest,
    };
  }, [monthRows]);

  const typeCounts = useMemo(() => {
    const counts = {};
    monthRows.forEach((t) => {
      const type = normType(t.type);
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [monthRows]);

  const dailyAvg = dayOfMonth > 0 ? totals.expense / dayOfMonth : 0;
  const projected = dailyAvg * daysInMonth;

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return monthRows
      .filter((t) => {
        if (typeFilter !== "all" && normType(t.type) !== typeFilter)
          return false;
        if (term && !(t.title || "").toLowerCase().includes(term)) return false;
        return true;
      })
      .sort(SORTERS[sort]);
  }, [monthRows, typeFilter, search, sort]);

  const listByMonth = useCallback(
    (setDataList) => setDataList(visible),
    [visible]
  );

  const clearFilters = () => {
    setTypeFilter("all");
    setSearch("");
  };

  if (loading) return <MonthSkeleton />;
  if (!isLoggedIn) return <NoAccess />;

  const count = visible.length;
  const isFiltered = typeFilter !== "all" || search.trim() !== "";
  const chips = TYPE_CHIPS.filter(
    (c) => c.value === "all" || c.value === typeFilter || typeCounts[c.value]
  );

  return (
    <div className="month_page">
      <Link to="/Dashboard" className="month_back">
        <ArrowBackIcon fontSize="small" />
        Back to dashboard
      </Link>

      <header className="month_header">
        <div>
          <p className="month_eyebrow">{monthLabel}</p>
          <h1 className="month_title">This month</h1>
        </div>
        <p className="month_daysleft">
          {daysLeft === 0
            ? "Last day"
            : `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
        </p>
      </header>

      {/* ---------- balance ---------- */}
      <div className="month_hero" role="region" aria-label="Month balance">
        <p className="month_hero_label">Balance</p>
        <p
          className={`month_hero_amount ${
            totals.balance < 0 ? "is_negative" : "is_positive"
          }`}
        >
          {formatAmount(totals.balance)}
        </p>
        <div
          className="month_progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(monthPct)}
          aria-label="Month progress"
        >
          <span
            className="month_progress_fill"
            style={{ width: `${monthPct}%` }}
          />
        </div>
        <p className="month_hero_hint">
          Day {dayOfMonth} of {daysInMonth} · {monthRows.length}{" "}
          {monthRows.length === 1 ? "entry" : "entries"}
        </p>
        <p className="month_hero_formula">
          Income + Benefits + Side hustle − Spent
        </p>
      </div>

      {/* ---------- type tiles (click to filter) ---------- */}
      <div className="month_tiles" role="group" aria-label="Totals by type">
        {TILES.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`month_tile ${t.cls}${
              typeFilter === t.key ? " is_active" : ""
            }`}
            aria-pressed={typeFilter === t.key}
            onClick={() => setTypeFilter(typeFilter === t.key ? "all" : t.key)}
          >
            <span className="month_tile_label">{t.label}</span>
            <span className="month_tile_value">
              {formatAmount(totals[t.key])}
            </span>
          </button>
        ))}
      </div>

      {/* ---------- spending pace ---------- */}
      <div className="month_pace" role="region" aria-label="Spending pace">
        <h2 className="month_pace_title">Spending pace</h2>
        <div className="month_pace_grid">
          <div className="month_pace_item">
            <p className="month_pace_label">Per day</p>
            <p className="month_pace_value">{formatAmount(dailyAvg)}</p>
          </div>
          <div className="month_pace_item">
            <p className="month_pace_label">Projected by month end</p>
            <p className="month_pace_value">{formatAmount(projected)}</p>
          </div>
          <div className="month_pace_item">
            <p className="month_pace_label">Biggest expense</p>
            <p className="month_pace_value">
              {totals.biggest ? formatAmount(amountOf(totals.biggest)) : "-"}
            </p>
            {totals.biggest && (
              <p className="month_pace_sub">{totals.biggest.title}</p>
            )}
          </div>
        </div>
      </div>

      {/* ---------- filters ---------- */}
      <div className="month_filters" role="group" aria-label="Filter entries">
        <div className="month_filters_row">
          <label className="month_search">
            <SearchIcon fontSize="small" />
            <span className="month_sr_only">Search by title</span>
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <label className="month_select">
            <span className="month_sr_only">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="month_chips" role="group" aria-label="Type">
          {chips.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`month_chip${
                typeFilter === c.value ? " is_active" : ""
              }`}
              aria-pressed={typeFilter === c.value}
              onClick={() => setTypeFilter(c.value)}
            >
              {c.label}
              <span className="month_chip_count">
                {c.value === "all" ? monthRows.length : typeCounts[c.value] || 0}
              </span>
            </button>
          ))}

          <button
            type="button"
            className={`month_chip month_chip_toggle${
              includeSuper ? " is_on" : ""
            }`}
            aria-pressed={includeSuper}
            onClick={() => setIncludeSuper((v) => !v)}
          >
            {includeSuper ? "SuperBet shown" : "SuperBet hidden"}
          </button>
        </div>
      </div>

      {/* ---------- entries ---------- */}
      <div role="region" aria-labelledby="month_entries_title">
        <div className="month_section_head">
          <h2 id="month_entries_title" className="month_section_title">
            Entries
          </h2>
          <p className="month_count">
            {count} {count === 1 ? "entry" : "entries"}
            {isFiltered && (
              <button
                type="button"
                className="month_link_btn"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </p>
        </div>

        {count > 0 ? (
          <div className="month_table">
            {/* key remounts TableData when filters change */}
            <TableData
              key={`${typeFilter}-${search}-${sort}-${includeSuper}-${transactions.length}`}
              fetchDataFunction={listByMonth}
            />
          </div>
        ) : (
          <div className="month_empty">
            <p>
              {monthRows.length === 0
                ? `Nothing logged in ${monthLabel} yet.`
                : "No entries match your filters."}
            </p>
            <span className="month_empty_sub">
              {monthRows.length === 0
                ? "New transactions will show up here as you add them."
                : "Try another type or clear the search."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CurrentTransaction;