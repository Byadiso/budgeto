import React, { useEffect, useState } from 'react';
import { readArchivedPlans } from '../../firebase/ArchiveLogics';
import { isAuthenticatedDetails } from '../../firebase/Authentication';
import { Link } from 'react-router-dom';
import "../../Style/Archive.css";
import { listTransactionsByMonthAndType } from '../../firebase/Filters';
import { listTransactions } from '../../firebase/getTransactions';
import NoAccess from './ErrorComponents/NoAccess';
import TableData from './TableData';
import CardBugdeto from './CardBugdeto';
import { waitToLoad } from '../../Helpers/Helpers';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CurrentTransaction = () => {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Process transactions with month tracking and fallback status
  const filtered = listTransactionsByMonthAndType(transactions, "current");
  const data = filtered.matchingTransactions || [];
  const total = (filtered.totalIncome + filtered.totalExtra) - filtered.totalExpense;
 const currentMonthLabel = filtered.currentMonthLabel || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isEmpty = filtered.isEmpty ?? data.length === 0;

  const listByMonth = (setDataList) => {
    return setDataList(data);
  };

  useEffect(() => {
    isAuthenticatedDetails(setIsLoggedIn, setUserId); 
    listTransactions(setTransactions);
    waitToLoad(setLoading);
    if (userId) {
      fetchArchivedData(userId);
    }
  }, [userId]);

  const fetchArchivedData = async (userId) => {
    const data = await readArchivedPlans(userId);    
    if (data) {
      const archiveArray = Object.keys(data).map(key => ({
        id: key,
        ...data[key],
      }));
      setArchives(archiveArray); 
    }   
  };

  return (
    <div className="main_dashboard">
      <div
        style={{
          paddingTop: "5px",
          margin: "5px",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Link
          to="/Dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <ArrowBackIcon style={{ marginRight: "5px" }} /> Go back
        </Link>
      </div>

      {!isLoggedIn ? (
        <NoAccess />
      ) : (
        <>
          <div
            className="bugdet_summary"
            style={{ display: "flex", alignItems: "center" }}
          >
            <div
              className="bugdet_summary_item"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "100%",
                padding: "20px",
              }}
            >
              <h2 style={{ marginBottom: "10px", color: "#333" }}>
                Active Period: {currentMonthLabel}
              </h2>
              <CardBugdeto dataExpense={total} type={`${currentMonthLabel} budget`} />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              padding: "5px",
            }}
          >
            <div style={{ width: "100%" }}>
              {isEmpty ? (
                <div 
                  style={{ 
                    padding: "30px", 
                    textAlign: "center", 
                    backgroundColor: "#f9f9f9", 
                    borderRadius: "8px", 
                    margin: "10px 0" 
                  }}
                >
                  <h3>No transactions found for {currentMonthLabel}</h3>
                  <p style={{ color: "#666" }}>Your recorded transactions fall outside this month's date range.</p>
                </div>
              ) : (
                <TableData fetchDataFunction={listByMonth} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CurrentTransaction;