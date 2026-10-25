import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { readArchivedPlans } from "../../firebase/ArchiveLogics";
import { isAuthenticatedDetails } from "../../firebase/Authentication";
import { waitToLoad } from "../../Helpers/Helpers";
import { formatAmount } from "../../Helpers/formatAmount";
import NoAccess from "./ErrorComponents/NoAccess";
import "../../Style/Archive.css";

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest", label: "Most kept" },
  { value: "lowest", label: "Most overspent" },
];

const FILTERS = [
  { value: "all", label: "All" },
  { value: "kept", label: "Kept money" },
  { value: "over", label: "Overspent" },
];

const amountOf = (a) => parseFloat(a.amount) || 0;
const shortMonth = (m) => (m || "").toString().slice(0, 3);
const signed = (n) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${formatAmount(Math.abs(n))}`;

function ArchiveSkeleton() {
  return (
    <div className="archive_page" role="status" aria-busy="true">
      <span className="archive_sr_only">Loading archive…</span>
      <div className="archive_register">
        <div className="archive_skel archive_skel_title" />
        <div className="archive_skel archive_skel_stats" />
        <div className="archive_skel archive_skel_chart" />
      </div>
    </div>
  );
}

const ArchiveCard = () => {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  const [sort, setSort] = useState("newest");
  const [filter, setFilter] = useState("all");
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  useEffect(() => {
    isAuthenticatedDetails(setIsLoggedIn, setUserId);
    waitToLoad(setLoading);
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      try {
        const data = (await readArchivedPlans(userId)) || {};
        if (cancelled) return;
        setArchives(Object.keys(data).map((key) => ({ id: key, ...data[key] })));
      } catch (error) {
        console.error("Could not load archive:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  /* ---------- derived data (archived order = oldest to newest) ---------- */

  const rows = useMemo(
    () =>
      archives.map((a, i) => {
        const value = amountOf(a);
        const prev = i > 0 ? amountOf(archives[i - 1]) : null;
        return {
          ...a,
          index: i,
          value,
          delta: prev === null ? null : value - prev,
        };
      }),
    [archives]
  );

  const stats = useMemo(() => {
    if (rows.length === 0) return null;

    const total = rows.reduce((s, r) => s + r.value, 0);
    const average = total / rows.length;
    const best = rows.reduce((b, r) => (r.value > b.value ? r : b), rows[0]);
    const worst = rows.reduce((w, r) => (r.value < w.value ? r : w), rows[0]);
    const overCount = rows.filter((r) => r.value < 0).length;

    let trend = null;
    if (rows.length >= 4) {
      const recent = rows.slice(-3);
      const earlier = rows.slice(0, -3);
      const recentAvg = recent.reduce((s, r) => s + r.value, 0) / recent.length;
      const earlierAvg = earlier.reduce((s, r) => s + r.value, 0) / earlier.length;
      trend = recentAvg - earlierAvg;
    }

    return { total, average, best, worst, overCount, trend };
  }, [rows]);

  const insights = useMemo(() => {
    if (!stats) return [];
    const lines = [];
    const last = rows[rows.length - 1];
    const prev = rows.length > 1 ? rows[rows.length - 2] : null;

    if (prev) {
      const diff = last.value - prev.value;
      if (diff === 0) {
        lines.push(`${last.month} ended exactly like ${prev.month}.`);
      } else {
        lines.push(
          `${last.month} was ${formatAmount(Math.abs(diff))} ${
            diff > 0 ? "better" : "worse"
          } than ${prev.month}.`
        );
      }
    }

    if (rows.length > 1) {
      const vsAvg = last.value - stats.average;
      lines.push(
        vsAvg >= 0
          ? `${last.month} is ${formatAmount(vsAvg)} above your monthly average.`
          : `${last.month} is ${formatAmount(Math.abs(vsAvg))} below your monthly average.`
      );
    }

    if (stats.overCount > 0) {
      lines.push(
        `${stats.overCount} of ${rows.length} ${
          rows.length === 1 ? "month" : "months"
        } ended over budget. Your worst was ${stats.worst.month} (${formatAmount(
          stats.worst.value
        )}).`
      );
    } else {
      lines.push(`Every archived month ended within budget. Nice consistency.`);
    }

    if (stats.trend !== null) {
      if (Math.abs(stats.trend) < 1) {
        lines.push("Your last 3 months are in line with the earlier ones.");
      } else {
        lines.push(
          stats.trend > 0
            ? `Your last 3 months keep ${formatAmount(stats.trend)} more per month than before. Keep it up.`
            : `Your last 3 months keep ${formatAmount(Math.abs(stats.trend))} less per month than before. Worth a look.`
        );
      }
    }

    if (stats.average !== 0) {
      lines.push(
        `At your average pace, a year works out to about ${formatAmount(
          stats.average * 12
        )}.`
      );
    }

    return lines;
  }, [rows, stats]);

  const chartRows = useMemo(() => rows.slice(-12), [rows]);
  const maxAbs = useMemo(
    () => Math.max(1, ...chartRows.map((r) => Math.abs(r.value))),
    [chartRows]
  );
  const hasNegative = chartRows.some((r) => r.value < 0);

  const visible = useMemo(() => {
    const list = rows.filter((r) => {
      if (filter === "kept") return r.value >= 0;
      if (filter === "over") return r.value < 0;
      return true;
    });
    const sorters = {
      newest: (a, b) => b.index - a.index,
      oldest: (a, b) => a.index - b.index,
      highest: (a, b) => b.value - a.value,
      lowest: (a, b) => a.value - b.value,
    };
    return list.sort(sorters[sort]);
  }, [rows, filter, sort]);

  // compare: defaults to the two latest months
  const defaultA = rows.length > 1 ? rows[rows.length - 2].id : rows[0]?.id || "";
  const defaultB = rows.length > 0 ? rows[rows.length - 1].id : "";
  const rowA = rows.find((r) => r.id === (compareA || defaultA));
  const rowB = rows.find((r) => r.id === (compareB || defaultB));
  const compareDiff = rowA && rowB ? rowB.value - rowA.value : null;
  const comparePct =
    rowA && rowA.value !== 0 && compareDiff !== null
      ? (compareDiff / Math.abs(rowA.value)) * 100
      : null;

  /* ---------- render ---------- */

  if (loading) return <ArchiveSkeleton />;

  if (!isLoggedIn) {
    return (
      <div className="archive_page">
        <NoAccess />
      </div>
    );
  }

  return (
    <div className="archive_page">
      <div className="archive_topbar">
        <Link to="/Dashboard" className="archive_back">
          <ArrowBackIcon fontSize="small" />
          Go back
        </Link>
      </div>

      <div className="archive_register">
        <header className="archive_header">
          <p className="archive_eyebrow">Archive</p>
          <h1 className="archive_title">Archived plans</h1>
          <p className="archive_subhead">
            Every closed month in one place, so you can see where you kept
            money and where you overspent.
          </p>
        </header>

        {rows.length === 0 ? (
          <div className="archive_empty">
            <p>No plans archived yet.</p>
            <p className="archive_empty_sub">
              Close a month on the Planning page to file it here.
            </p>
          </div>
        ) : (
          <>
            {/* ---------- summary ---------- */}
            <div className="archive_stats" role="group" aria-label="Summary">
              <div className="archive_stat">
                <p className="archive_stat_label">Total kept</p>
                <p
                  className={`archive_stat_value ${
                    stats.total < 0 ? "is_negative" : "is_positive"
                  }`}
                >
                  {formatAmount(stats.total)}
                </p>
                <p className="archive_stat_sub">
                  over {rows.length} {rows.length === 1 ? "month" : "months"}
                </p>
              </div>
              <div className="archive_stat">
                <p className="archive_stat_label">Average per month</p>
                <p
                  className={`archive_stat_value ${
                    stats.average < 0 ? "is_negative" : ""
                  }`}
                >
                  {formatAmount(stats.average)}
                </p>
              </div>
              <div className="archive_stat">
                <p className="archive_stat_label">Best month</p>
                <p className="archive_stat_value is_positive">
                  {formatAmount(stats.best.value)}
                </p>
                <p className="archive_stat_sub">{stats.best.month}</p>
              </div>
              <div className="archive_stat">
                <p className="archive_stat_label">Worst month</p>
                <p
                  className={`archive_stat_value ${
                    stats.worst.value < 0 ? "is_negative" : ""
                  }`}
                >
                  {formatAmount(stats.worst.value)}
                </p>
                <p className="archive_stat_sub">{stats.worst.month}</p>
              </div>
            </div>

            {/* ---------- chart ---------- */}
            <div className="archive_panel" role="region" aria-label="Monthly trend">
              <div className="archive_panel_head">
                <h2 className="archive_panel_title">Month by month</h2>
                <p className="archive_legend">
                  <span className="archive_legend_dot is_pos" /> Kept
                  <span className="archive_legend_dot is_neg" /> Overspent
                </p>
              </div>

              <div className="archive_chart_scroll">
                <div
                  className="archive_chart"
                  style={{ minWidth: chartRows.length * 52 }}
                >
                  {chartRows.map((r) => {
                    const h = Math.max(
                      3,
                      Math.round((Math.abs(r.value) / maxAbs) * 100)
                    );
                    return (
                      <div
                        key={r.id}
                        className="archive_col"
                        title={`${r.month}: ${formatAmount(r.value)}`}
                      >
                        <div className="archive_col_pos">
                          {r.value >= 0 && (
                            <span
                              className="archive_bar is_pos"
                              style={{ height: `${h}%` }}
                            />
                          )}
                        </div>
                        {hasNegative && (
                          <div className="archive_col_neg">
                            {r.value < 0 && (
                              <span
                                className="archive_bar is_neg"
                                style={{ height: `${h}%` }}
                              />
                            )}
                          </div>
                        )}
                        <span className="archive_col_label">
                          {shortMonth(r.month)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {rows.length > 12 && (
                <p className="archive_note">Showing the last 12 months.</p>
              )}
            </div>

            {/* ---------- insights ---------- */}
            <div className="archive_panel" role="region" aria-label="Insights">
              <h2 className="archive_panel_title">What this tells you</h2>
              <ul className="archive_insights">
                {insights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            {/* ---------- compare ---------- */}
            {rows.length > 1 && (
              <div className="archive_panel" role="region" aria-label="Compare two months">
                <h2 className="archive_panel_title">Compare two months</h2>

                <div className="archive_compare_pick">
                  <label className="archive_select">
                    <span className="archive_sr_only">First month</span>
                    <select
                      value={compareA || defaultA}
                      onChange={(e) => setCompareA(e.target.value)}
                    >
                      {rows.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.index + 1}. {r.month}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span className="archive_vs">vs</span>
                  <label className="archive_select">
                    <span className="archive_sr_only">Second month</span>
                    <select
                      value={compareB || defaultB}
                      onChange={(e) => setCompareB(e.target.value)}
                    >
                      {rows.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.index + 1}. {r.month}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {rowA && rowB && (
                  <div className="archive_compare_result">
                    <div className="archive_compare_side">
                      <p className="archive_stat_label">{rowA.month}</p>
                      <p
                        className={`archive_stat_value ${
                          rowA.value < 0 ? "is_negative" : "is_positive"
                        }`}
                      >
                        {formatAmount(rowA.value)}
                      </p>
                    </div>
                    <div className="archive_compare_diff">
                      <p
                        className={`archive_diff_value ${
                          compareDiff > 0
                            ? "is_up"
                            : compareDiff < 0
                            ? "is_down"
                            : ""
                        }`}
                      >
                        {signed(compareDiff)}
                      </p>
                      <p className="archive_stat_sub">
                        {comparePct !== null
                          ? `${comparePct > 0 ? "+" : ""}${Math.round(comparePct)}%`
                          : "difference"}
                      </p>
                    </div>
                    <div className="archive_compare_side">
                      <p className="archive_stat_label">{rowB.month}</p>
                      <p
                        className={`archive_stat_value ${
                          rowB.value < 0 ? "is_negative" : "is_positive"
                        }`}
                      >
                        {formatAmount(rowB.value)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------- month list ---------- */}
            <div role="region" aria-labelledby="archive_list_title">
              <div className="archive_list_head">
                <h2 id="archive_list_title" className="archive_panel_title">
                  All months
                </h2>
                <label className="archive_select">
                  <span className="archive_sr_only">Sort by</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    {SORTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="archive_chips" role="group" aria-label="Filter months">
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    className={`archive_chip${
                      filter === f.value ? " is_active" : ""
                    }`}
                    aria-pressed={filter === f.value}
                    onClick={() => setFilter(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {visible.length > 0 ? (
                <div className="archive_grid">
                  {visible.map((r) => {
                    const vsAvg = r.value - stats.average;
                    return (
                      <div key={r.id} className="archive_tile">
                        <div className="archive_tile_top">
                          <h3 className="archive_month">{r.month}</h3>
                          <span
                            className={`archive_badge ${
                              r.value < 0 ? "is_over" : "is_kept"
                            }`}
                          >
                            {r.value < 0 ? "Overspent" : "Kept"}
                          </span>
                        </div>

                        <p
                          className={`archive_amount ${
                            r.value < 0 ? "is_negative" : "is_positive"
                          }`}
                        >
                          {r.amount} <span className="archive_currency">PLN</span>
                        </p>

                        <ul className="archive_deltas">
                          <li>
                            <span>vs previous</span>
                            {r.delta === null ? (
                              <b>first month</b>
                            ) : (
                              <b
                                className={
                                  r.delta > 0
                                    ? "is_up"
                                    : r.delta < 0
                                    ? "is_down"
                                    : ""
                                }
                              >
                                {signed(r.delta)}
                              </b>
                            )}
                          </li>
                          <li>
                            <span>vs average</span>
                            <b
                              className={
                                vsAvg > 0 ? "is_up" : vsAvg < 0 ? "is_down" : ""
                              }
                            >
                              {signed(vsAvg)}
                            </b>
                          </li>
                        </ul>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="archive_empty">
                  <p>No months match this filter.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ArchiveCard;