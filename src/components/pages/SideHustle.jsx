import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { isAuthenticated } from "../../firebase/Authentication";
import { waitToLoad } from "../../Helpers/Helpers";
import { formatAmount } from "../../Helpers/formatAmount";
import { listTransactions } from "../../firebase/getTransactions";
import { filterSideHustle, toDate } from "../../firebase/Filters";
import NoAccess from "./ErrorComponents/NoAccess";
import TableData from "./TableData";
import "../../Style/SideHustle.css";

const PERIODS = [
  { value: "all", label: "All" },
  { value: "currentMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "year", label: "This year" },
];

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "largest", label: "Largest first" },
  { value: "smallest", label: "Smallest first" },
];

const amountOf = (t) => parseFloat(t.amount) || 0;
const timeOf = (t) => toDate(t.createdAt)?.getTime() || 0;

const SORTERS = {
  newest: (a, b) => timeOf(b) - timeOf(a),
  oldest: (a, b) => timeOf(a) - timeOf(b),
  largest: (a, b) => amountOf(b) - amountOf(a),
  smallest: (a, b) => amountOf(a) - amountOf(b),
};

const signed = (n) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${formatAmount(Math.abs(n))}`;

function SideHustleSkeleton() {
  return (
    <div className="sidehustle_page" role="status" aria-busy="true">
      <span className="sidehustle_sr_only">Loading…</span>
      <div className="sidehustle_skel sidehustle_skel_title" />
      <div className="sidehustle_skel sidehustle_skel_hero" />
      <div className="sidehustle_skel sidehustle_skel_table" />
    </div>
  );
}

function SideHustle() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const [period, setPeriod] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
    listTransactions(setTransactions);
    waitToLoad(setLoading);
  }, []);

  // Filtered by the chips + search (drives hero, table)
  const { filteredSideHustle, totalSideHustle, biggest } = useMemo(
    () => filterSideHustle(transactions, period, search),
    [transactions, period, search]
  );

  // All side hustle entries, ignoring filters (drives trend + comparison)
  const allRows = useMemo(
    () => filterSideHustle(transactions, "all", "").filteredSideHustle,
    [transactions]
  );

  // Last 6 months, oldest to newest
  const monthly = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(
        start.getFullYear(),
        start.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
      let total = 0;
      allRows.forEach((t) => {
        const d = toDate(t.createdAt);
        if (d && d >= start && d <= end) total += amountOf(t);
      });
      months.push({
        key: `${start.getFullYear()}-${start.getMonth()}`,
        label: start.toLocaleDateString("en-GB", { month: "short" }),
        total,
      });
    }
    return months;
  }, [allRows]);

  const thisMonth = monthly[monthly.length - 1].total;
  const lastMonth = monthly[monthly.length - 2].total;
  const monthDiff = thisMonth - lastMonth;
  const monthPct = lastMonth > 0 ? (monthDiff / lastMonth) * 100 : null;
  const maxMonth = Math.max(1, ...monthly.map((m) => m.total));

  // Top sources by title (within the selected period)
  const sources = useMemo(() => {
    const map = new Map();
    filteredSideHustle.forEach((t) => {
      const name = (t.title || "Untitled").trim();
      const key = name.toLowerCase();
      const cur = map.get(key) || { name, total: 0, count: 0 };
      cur.total += amountOf(t);
      cur.count += 1;
      map.set(key, cur);
    });
    return [...map.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  }, [filteredSideHustle]);

  const rows = useMemo(
    () => [...filteredSideHustle].sort(SORTERS[sort]),
    [filteredSideHustle, sort]
  );

  const listSideHustle = useCallback(
    (setDataList) => setDataList(rows),
    [rows]
  );

  if (loading) return <SideHustleSkeleton />;
  if (!isLoggedIn) return <NoAccess />;

  const count = rows.length;
  const average = count > 0 ? totalSideHustle / count : 0;
  const periodLabel = PERIODS.find((p) => p.value === period)?.label;
  const isFiltered = period !== "all" || search.trim() !== "";

  return (
    <div className="sidehustle_page">
      <Link to="/Dashboard" className="sidehustle_back">
        <ArrowBackIcon fontSize="small" />
        Back to dashboard
      </Link>

      <header className="sidehustle_header">
        <h1 className="sidehustle_title">Side hustle</h1>
        <p className="sidehustle_subhead">
          Everything you earned outside your main job.
        </p>
      </header>

      {/* ---------- hero ---------- */}
      <div
        className="sidehustle_hero"
        role="region"
        aria-label={`Side hustle total, ${periodLabel}`}
      >
        <p className="sidehustle_hero_label">Earned · {periodLabel}</p>
        <p className="sidehustle_hero_amount">
          {formatAmount(totalSideHustle)}
        </p>
        <div className="sidehustle_hero_stats">
          <div>
            <p className="sidehustle_hero_stat_label">Entries</p>
            <p className="sidehustle_hero_stat_value">{count}</p>
          </div>
          <div>
            <p className="sidehustle_hero_stat_label">Average</p>
            <p className="sidehustle_hero_stat_value">
              {formatAmount(average)}
            </p>
          </div>
          <div>
            <p className="sidehustle_hero_stat_label">Best entry</p>
            <p className="sidehustle_hero_stat_value">
              {formatAmount(biggest)}
            </p>
          </div>
        </div>
      </div>

      {/* ---------- month vs month ---------- */}
      <div className="sidehustle_panel" role="region" aria-label="Monthly trend">
        <div className="sidehustle_panel_head">
          <h2 className="sidehustle_panel_title">Last 6 months</h2>
          <p
            className={`sidehustle_compare ${
              monthDiff > 0 ? "is_up" : monthDiff < 0 ? "is_down" : ""
            }`}
          >
            This month {signed(monthDiff)}
            {monthPct !== null &&
              ` (${monthPct > 0 ? "+" : ""}${Math.round(monthPct)}%)`}{" "}
            vs last month
          </p>
        </div>

        <div className="sidehustle_chart">
          {monthly.map((m, i) => {
            const h = Math.max(3, Math.round((m.total / maxMonth) * 100));
            const isCurrent = i === monthly.length - 1;
            return (
              <div
                key={m.key}
                className="sidehustle_col"
                title={`${m.label}: ${formatAmount(m.total)}`}
              >
                <span className="sidehustle_col_value">
                  {m.total > 0 ? formatAmount(m.total) : ""}
                </span>
                <div className="sidehustle_col_track">
                  <span
                    className={`sidehustle_bar${isCurrent ? " is_current" : ""}${
                      m.total === 0 ? " is_empty" : ""
                    }`}
                    style={{ height: `${h}%` }}
                  />
                </div>
                <span className="sidehustle_col_label">{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------- top sources ---------- */}
      {sources.length > 0 && (
        <div className="sidehustle_panel" role="region" aria-label="Top sources">
          <h2 className="sidehustle_panel_title">Top sources · {periodLabel}</h2>
          <ul className="sidehustle_sources">
            {sources.map((s) => {
              const share =
                totalSideHustle > 0 ? (s.total / totalSideHustle) * 100 : 0;
              return (
                <li key={s.name} className="sidehustle_source">
                  <div className="sidehustle_source_top">
                    <span className="sidehustle_source_name">{s.name}</span>
                    <span className="sidehustle_source_amount">
                      {formatAmount(s.total)}
                    </span>
                  </div>
                  <div
                    className="sidehustle_share"
                    role="img"
                    aria-label={`${Math.round(share)}% of total`}
                  >
                    <span
                      className="sidehustle_share_fill"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                  <p className="sidehustle_source_meta">
                    {Math.round(share)}% · {s.count}{" "}
                    {s.count === 1 ? "entry" : "entries"}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ---------- filters ---------- */}
      <div className="sidehustle_filters" role="group" aria-label="Filter entries">
        <div className="sidehustle_filters_row">
          <label className="sidehustle_search">
            <SearchIcon fontSize="small" />
            <span className="sidehustle_sr_only">Search by title</span>
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <label className="sidehustle_select">
            <span className="sidehustle_sr_only">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="sidehustle_chips" role="group" aria-label="Period">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`sidehustle_chip${
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

      {/* ---------- entries ---------- */}
      <div role="region" aria-labelledby="sidehustle_entries_title">
        <div className="sidehustle_section_head">
          <h2 id="sidehustle_entries_title" className="sidehustle_panel_title">
            Entries
          </h2>
          <p className="sidehustle_count">
            {count} {count === 1 ? "entry" : "entries"}
            {isFiltered && (
              <button
                type="button"
                className="sidehustle_link_btn"
                onClick={() => {
                  setPeriod("all");
                  setSearch("");
                }}
              >
                Clear filters
              </button>
            )}
          </p>
        </div>

        {count > 0 ? (
          <div className="sidehustle_table">
            {/* key remounts TableData when filters change */}
            <TableData
              key={`${period}-${search}-${sort}-${transactions.length}`}
              fetchDataFunction={listSideHustle}
            />
          </div>
        ) : (
          <div className="sidehustle_empty">
            <p>
              {allRows.length === 0
                ? "No side hustle income yet."
                : "No entries match your filters."}
            </p>
            <span className="sidehustle_empty_sub">
              {allRows.length === 0
                ? "Entries with the type Side hustle will show up here."
                : "Try another period or clear the search."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default SideHustle;