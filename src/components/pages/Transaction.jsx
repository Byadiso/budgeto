import React, { useEffect, useState } from "react";
import { isAuthenticated } from "../../firebase/Authentication";
import { Link, useParams } from "react-router-dom";
import NoAccess from "./ErrorComponents/NoAccess";
import { waitToLoad } from "../../Helpers/Helpers";
import "../../Style/Planning.css";


import { listTransactions } from "../../firebase/getTransactions";
import TransactionForm from "./TransactionForm";
import { editTransaction } from "../../firebase/Transaction";

function Transaction() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions]= useState([]);
  const {id} = useParams();
  const transactionId = parseInt(id, 10);

 

  const transaction = transactions.find(transact => transact.id === transactionId);  

  

  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
    listTransactions(setTransactions)
    waitToLoad(setLoading);
  }, [isLoggedIn]);

  return (
    <div className="main_dashboard">
      <div style={{ paddingTop: "20px", margin: "20px" }}>
        <Link to="/Dashboard"> Go back</Link>
      </div>
      <div style={{ padding: "20px", margin: "20px", color: "black" }}>   
       
        <div className="main_container_planner">          
          <TransactionForm transactions={transactions} />
        </div>
      </div>
    </div>
  );
}

export default Transaction;
