import React, { useEffect, useState } from "react";
import { isAuthenticated } from "../../firebase/Authentication";
import { Link } from "react-router-dom";
import NoAccess from "./ErrorComponents/NoAccess";
import { waitToLoad } from "../../Helpers/Helpers";
import TableData from "./TableData";
import CardBugdeto from "./CardBugdeto";
import "../../Style/Reports.css";
import { listTransactions } from "../../firebase/getTransactions";
import { filterBenefits } from "../../firebase/Filters";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function Reports() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = React.useState([]);
  const [dataList, setDataList] = useState([]);

  const { filteredBenefits, totalBenefits } = filterBenefits(transactions);



  const list = (setDataList) => {
    return listTransactions(setDataList);
  };

  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
    waitToLoad(setLoading);
  }, [isLoggedIn]);

  
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
            <div className="reports_hero">
              <CardBugdeto dataExpense={totalBenefits} type="Total Benefits" />
            </div>

            <div className="reports_table_panel">
              <TableData fetchDataFunction={list} />
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
