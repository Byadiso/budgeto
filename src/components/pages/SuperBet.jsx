import React, { useEffect, useState, useMemo } from "react";
import { isAuthenticated } from "../../firebase/Authentication";
import { Link } from "react-router-dom";
import NoAccess from "./ErrorComponents/NoAccess";
import { waitToLoad } from "../../Helpers/Helpers";
import TableData from "./TableData";
import CardBugdeto from "./CardBugdeto";
import "../../Style/SuperBet.css";
import { listTransactions } from "../../firebase/getTransactions";
import { filterTransactionsAndCalculateTotal } from "../../firebase/Filters";
import { KEYWORDS } from "../../firebase/CONSTANTS";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function SuperBet() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
  }, []);

  useEffect(() => {
    listTransactions(setTransactions);
    waitToLoad(setLoading);
  }, []);

  const { filteredTransactions, total } = useMemo(
    () => filterTransactionsAndCalculateTotal(transactions, KEYWORDS),
    [transactions]
  );

  const listSuper = (setDataList) => setDataList(filteredTransactions);

  return (
    <div className="superbet_page">
      <div className="superbet_topbar">
        <Link to="/Dashboard" className="superbet_back">
          <ArrowBackIcon fontSize="small" />
          Go back
        </Link>
      </div>

      <div className="superbet_register">
        <header className="superbet_header">
          <p className="superbet_eyebrow">Category</p>
          <h1 className="superbet_title">SuperBet</h1>
        </header>

        <div className="superbet_summary">
          <span className="superbet_summary_label">Total spent</span>
          <div className="superbet_summary_amount">
            <CardBugdeto dataExpense={-total} />
          </div>
        </div>

        {loading ? (
          <div className="superbet_empty">
            <p>Loading transactions…</p>
          </div>
        ) : isLoggedIn ? (
          filteredTransactions.length > 0 ? (
            <div className="superbet_table">
              <TableData fetchDataFunction={listSuper} />
            </div>
          ) : (
            <div className="superbet_empty">
              <p>No transactions yet.</p>
              <span className="superbet_empty_sub">
                Entries matching this category will show up here.
              </span>
            </div>
          )
        ) : (
          <NoAccess />
        )}
      </div>
    </div>
  );
}

export default SuperBet;