import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { isAuthenticated } from "../../firebase/Authentication";
import { waitToLoad } from "../../Helpers/Helpers";
import { formatAmount } from "../../Helpers/formatAmount";
import { listTransactions } from "../../firebase/getTransactions";
import { filterSuperBet } from "../../firebase/Filters";
import { KEYWORDS } from "../../firebase/CONSTANTS";
import NoAccess from "./ErrorComponents/NoAccess";
import TableData from "./TableData";
import "../../Style/SuperBet.css";

const PERIODS = [
  { value: "currentMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "year", label: "This year" },
  { value: "all", label: "All" },
];

function SuperBetSkeleton() {
  return (
    <div className="superbet_page" role="status" aria-busy="true">
      <span className="superbet_sr_only">Loading transactions…</span>
      <div className="superbet_skel superbet_skel_title" />
      <div className="superbet_skel superbet_skel_summary" />
      <div className="superbet_skel superbet_skel_table" />
    </div>
  );
}

function SuperBet() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [period, setPeriod] = useState("currentMonth");

  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
    listTransactions(setTransactions);
    waitToLoad(setLoading);
  }, []);

  const { filteredTransactions, totalSpent, totalWon, net } = useMemo(
    () => filterSuperBet(transactions, KEYWORDS, period),
    [transactions, period]
  );

  // Stable reference, so TableData doesn't see a "new" function every render
  const listSuper = useCallback(
    (setDataList) => setDataList(filteredTransactions),
    [filteredTransactions]
  );

  if (loading) {
    return <SuperBetSkeleton />;
  }

  if (!isLoggedIn) {
    return <NoAccess />;
  }

  const count = filteredTransactions.length;
  const periodLabel = PERIODS.find((p) => p.value === period)?.label;

  return (
    <div className="superbet_page">
      <Link to="/Dashboard" className="superbet_back">
        <ArrowBackIcon fontSize="small" />
        Back to dashboard
      </Link>

      <header className="superbet_header">
        <h1 className="superbet_title">SuperBet</h1>
        <p className="superbet_subhead">Entries that match this category.</p>
      </header>

      {/* Period filter */}
      <div className="superbet_chips" role="group" aria-label="Period">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            className={`superbet_chip${period === p.value ? " is_active" : ""}`}
            aria-pressed={period === p.value}
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div
        role="region"
        className="superbet_summary_grid"
        aria-label={`Summary, ${periodLabel}`}
      >
        <div className="superbet_summary">
          <p className="superbet_summary_label">Total spent</p>
          <p className="superbet_summary_amount is_negative">
            {formatAmount(totalSpent)}
          </p>
        </div>

        <div className="superbet_summary is_won">
          <p className="superbet_summary_label">Won / income</p>
          <p className="superbet_summary_amount is_positive">
            {formatAmount(totalWon)}
          </p>
        </div>

        <div className={`superbet_summary ${net < 0 ? "" : "is_won"}`}>
          <p className="superbet_summary_label">Net result</p>
          <p
            className={`superbet_summary_amount ${
              net < 0 ? "is_negative" : "is_positive"
            }`}
          >
            {formatAmount(net)}
          </p>
        </div>
      </div>

      {/* Transactions */}
      <div role="region" aria-labelledby="superbet_transactions_title">
        <div className="superbet_section_head">
          <h2
            id="superbet_transactions_title"
            className="superbet_section_title"
          >
            Transactions
          </h2>
          {count > 0 && (
            <p className="superbet_count">
              {count} {count === 1 ? "entry" : "entries"} · {periodLabel}
            </p>
          )}
        </div>

        {count > 0 ? (
          <div className="superbet_table">
            {/* key remounts TableData when the period changes */}
            <TableData key={period} fetchDataFunction={listSuper} />
          </div>
        ) : (
          <div className="superbet_empty">
            <p>No transactions for {periodLabel?.toLowerCase()}.</p>
            <span className="superbet_empty_sub">
              Try another period. Entries matching this category will show up
              here.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperBet;