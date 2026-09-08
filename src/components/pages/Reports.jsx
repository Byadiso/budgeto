import React, { useEffect, useState } from "react";
import { isAuthenticated } from "../../firebase/Authentication";
import { Link } from "react-router-dom";
import NoAccess from "./ErrorComponents/NoAccess";
import { waitToLoad } from "../../Helpers/Helpers";
import TableData from "./TableData";
import CardBugdeto from "./CardBugdeto";
import "../../Style/Dashboard.css";
import { listTransactions } from "../../firebase/getTransactions";
import { filterBenefits} from "../../firebase/Filters";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


function Reports() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = React.useState([]);
  
  const { filteredBenefits, totalBenefits } = filterBenefits(
    transactions
  );


  const list = (setDataList) => {
    return  listTransactions(setDataList);;
  };

  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
    waitToLoad(setLoading);
  }, [isLoggedIn]);

  return (
    <div className="main_dashboard">
      <div
        style={{
          paddingTop: "5px",
          paddingBottom: "140px",
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
     
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          padding: "5px",
          
        }}
      >
        <div style={{  width: "100%"}}>
          {isLoggedIn ? (
            <TableData fetchDataFunction={list} />
          ) : (
            !loading && <NoAccess />
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
