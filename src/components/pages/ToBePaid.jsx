import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import { isAuthenticated } from "../../firebase/Authentication";
import { waitToLoad } from "../../Helpers/Helpers";
import { formatAmount } from "../../Helpers/formatAmount";
import { listTransactions } from "../../firebase/getTransactions";
import { filterToBePaid } from "../../firebase/Filters";
import NoAccess from "./ErrorComponents/NoAccess";
import TableData from "./TableData";
import "../../Style/ToBePaid.css";

const PERIODS = [
  { value: "all", label: "All" },
  { value: "currentMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "year", label: "This year" },
];

function ToBePaidSkeleton() {
  return (
    <div className="tobepaid_page" role="status" aria-busy="true">
      <span className="tobepaid_sr_only">Loading…</span>
      <div className="tobepaid_skel tobepaid_skel_title" />
      <div className="tobepaid_skel tobepaid_skel_summary" />
      <div className="tobepaid_skel tobepaid_skel_table" />
    </div>
  );
}

function ToBePaid() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [period, setPeriod] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
    listTransactions(setTransactions);
    waitToLoad(setLoading);
  }, []);

  const { filteredToBePaid, totalToBePaid } = useMemo(
    () => filterToBePaid(transactions, period, search),
    [transactions, period, search]
  );

  const listToBePaid = useCallback(
    (setDataList) => setDataList(filteredToBePaid),
    [filteredToBePaid]
  );

  if (loading) return <ToBePaidSkeleton />;
  if (!isLoggedIn) return <NoAccess />;

  const count = filteredToBePaid.length;
  const periodLabel = PERIODS.find((p) => p.value === period)?.label;

  return (
    <div className="tobepaid_page">
      <Link to="/Dashboard" className="tobepaid_back">
        <ArrowBackIcon fontSize="small" />
        Back to dashboard
      </Link>

      <header className="tobepaid_header">
        <h1 className="tobepaid_title">To be paid</h1>
        <p className="tobepaid_subhead">
          Money that isn't yours: credit and amounts you need to pay back.
        </p>
      </header>

      <div
        role="region"
        className="tobepaid_summary"
        aria-label={`Total to be paid, ${periodLabel}`}
      >
        <p className="tobepaid_summary_label">Total to be paid</p>
        <p
          className={`tobepaid_summary_amount${
            totalToBePaid > 0 ? " is_negative" : ""
          }`}
        >
          {formatAmount(totalToBePaid)}
        </p>
        <p className="tobepaid_summary_hint">
          {count} {count === 1 ? "entry" : "entries"} · {periodLabel}
        </p>
      </div>

      <div className="tobepaid_toolbar">
        <div className="tobepaid_chips" role="group" aria-label="Period">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`tobepaid_chip${period === p.value ? " is_active" : ""}`}
              aria-pressed={period === p.value}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <label className="tobepaid_search">
          <SearchIcon fontSize="small" />
          <span className="tobepaid_sr_only">Search by title</span>
          <input
            type="text"
            placeholder="Search title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      <div role="region" aria-labelledby="tobepaid_transactions_title">
        <div className="tobepaid_section_head">
          <h2 id="tobepaid_transactions_title" className="tobepaid_section_title">
            Transactions
          </h2>
        </div>

        {count > 0 ? (
          <div className="tobepaid_table">
            {/* key remounts TableData when filters change */}
            <TableData
              key={`${period}-${search}-${transactions.length}`}
              fetchDataFunction={listToBePaid}
            />
          </div>
        ) : (
          <div className="tobepaid_empty">
            <p>Nothing to pay back.</p>
            <span className="tobepaid_empty_sub">
              {search || period !== "all"
                ? "Try another period or clear the search."
                : "Entries marked as not yours will show up here."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ToBePaid;