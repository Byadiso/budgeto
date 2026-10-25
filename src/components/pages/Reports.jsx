import React, { useEffect, useMemo, useState } from "react";
import { isAuthenticated } from "../../firebase/Authentication";
import { Link } from "react-router-dom";
import NoAccess from "./ErrorComponents/NoAccess";
import { waitToLoad } from "../../Helpers/Helpers";
import TableData from "./TableData";
import "../../Style/Reports.css";
import { listTransactions } from "../../firebase/getTransactions";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";

// ---------- helpers ----------
const normType = (type) =>
  (type || "").toString().toLowerCase().replace(/[\s_-]/g, "");

// Works with Firestore Timestamp, seconds/ms numbers, Date or string
const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value === "object" && value.seconds) {
    return new Date(value.seconds * 1000);
  }
  if (typeof value === "number") {
    return new Date(value < 1e12 ? value * 1000 : value);
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const getRange = (period) => {
  const now = new Date();
  switch (period) {
    case "currentMonth":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      };
    case "lastMonth":
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
      };
    case "year":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
      };
    default:
      return null; // "all"
  }
};

const money = (n) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(n || 0);

const PERIODS = [
  { value: "currentMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "year", label: "This year" },
  { value: "all", label: "All" },
];

const TYPES = [
  { value: "all", label: "All types" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "extra", label: "Extra" },
  { value: "sidehustle", label: "Side hustle" },
];

// ---------- component ----------
function Reports() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const [period, setPeriod] = useState("currentMonth");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
    listTransactions(setTransactions); // <- this was missing
    waitToLoad(setLoading);
  }, [isLoggedIn]);

  // Period + search filtered list (used for the summary tiles)
  const periodFiltered = useMemo(() => {
    const range = getRange(period);
    const term = search.trim().toLowerCase();

    return [...(transactions || [])]
      .filter((t) => {
        if (normType(t.type) === "isnotmine") return false; // not my money
        if (range) {
          const d = toDate(t.createdAt);
          if (!d || d < range.start || d > range.end) return false;
        }
        if (term && !(t.title || "").toLowerCase().includes(term)) {
          return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          (toDate(b.createdAt)?.getTime() || 0) -
          (toDate(a.createdAt)?.getTime() || 0)
      );
  }, [transactions, period, search]);

  // Totals per type
  const totals = useMemo(() => {
    const sums = { income: 0, expense: 0, extra: 0, sidehustle: 0 };
    periodFiltered.forEach((t) => {
      const type = normType(t.type);
      if (type in sums) sums[type] += parseFloat(t.amount) || 0;
    });
    sums.balance = sums.income + sums.extra + sums.sidehustle - sums.expense;
    return sums;
  }, [periodFiltered]);

  // List shown in the table (also respects the type filter)
  const tableRows = useMemo(
    () =>
      typeFilter === "all"
        ? periodFiltered
        : periodFiltered.filter((t) => normType(t.type) === typeFilter),
    [periodFiltered, typeFilter]
  );

  // TableData calls this with its own setter to receive the list
  const list = (setDataList) => setDataList(tableRows);

  const tiles = [
    { key: "income", label: "Income", value: totals.income, cls: "is_income" },
    { key: "expense", label: "Expenses", value: totals.expense, cls: "is_expense" },
    { key: "extra", label: "Benefits", value: totals.extra, cls: "is_extra" },
    { key: "sidehustle", label: "Side hustle", value: totals.sidehustle, cls: "is_side" },
  ];

  return (
    <div className="reports_page">
      <div className="reports_topbar">
        <Link to="/Dashboard" className="reports_back">
          <ArrowBackIcon fontSize="small" />
          Go back
        </Link>
      </div>

      <div className="reports_register">
        <header className="reports_header">
          <p className="reports_eyebrow">Reports</p>
          <h1 className="reports_title">Transactions</h1>
        </header>

        {isLoggedIn ? (
          <>
            {/* Balance hero */}
            <section className="reports_hero">
              <p className="hero_label">Balance</p>
              <p
                className={`hero_value ${
                  totals.balance < 0 ? "is_negative" : "is_positive"
                }`}
              >
                {money(totals.balance)}
              </p>
              <p className="hero_hint">
                Income + Benefits + Side hustle − Expenses
              </p>
            </section>

            {/* Summary tiles */}
            <section className="reports_summary">
              {tiles.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`summary_tile ${t.cls} ${
                    typeFilter === t.key ? "is_active" : ""
                  }`}
                  onClick={() =>
                    setTypeFilter(typeFilter === t.key ? "all" : t.key)
                  }
                >
                  <span className="tile_label">{t.label}</span>
                  <span className="tile_value">{money(t.value)}</span>
                </button>
              ))}
            </section>

            {/* Toolbar */}
            <section className="reports_toolbar">
              <div className="chips">
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    className={`chip ${period === p.value ? "is_active" : ""}`}
                    onClick={() => setPeriod(p.value)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="toolbar_right">
                <select
                  className="toolbar_select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <label className="toolbar_search">
                  <SearchIcon fontSize="small" />
                  <input
                    type="text"
                    placeholder="Search title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
              </div>
            </section>

            <p className="reports_count">
              {tableRows.length} transaction{tableRows.length === 1 ? "" : "s"}
            </p>

            {/* Table. The key forces a refresh when filters change */}
            <div className="reports_table_panel">
              <TableData
                key={`${period}-${typeFilter}-${search}-${transactions.length}`}
                fetchDataFunction={list}
              />
            </div>
          </>
        ) : (
          !loading && <NoAccess />
        )}
      </div>
    </div>
  );
}

export default Reports;