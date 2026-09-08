import React, { useEffect, useState } from "react";
import { checkIfAdmin, getLoggedUser, isAuthenticated, isAuthenticatedDetails } from "../../firebase/Authentication";
import { useNavigate } from "react-router-dom";
import NoAccess from "./ErrorComponents/NoAccess";
import { getCurrentMonthName, totalPlanBugdet, waitToLoad } from "../../Helpers/Helpers";
import CardBugdeto from "./CardBugdeto";
import "../../Style/Dashboard.css";
import { listTransactions } from "../../firebase/getTransactions";
import { filterBenefits, filterTransactionsAndCalculateTotal, filterWhatIsNotMine, listAlltransactionWithoutSuper } from "../../firebase/Filters";
import { KEYWORDS } from "../../firebase/CONSTANTS";
import { readPlans } from "../../firebase/Plan";

function Dashboard() {  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [transactions, setTransactions] = React.useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loggedUser, setLoggedUser] = useState([]);

  const { totalExpense, totalIncome } = listAlltransactionWithoutSuper(transactions, KEYWORDS); 
  const { totalBenefits } = filterBenefits(transactions);
  const { total } = filterTransactionsAndCalculateTotal(transactions, KEYWORDS);

  const {filteredWhatIsNotMine,totalWhatIsNotMine } = filterWhatIsNotMine(transactions)

  let goalAmount= 500
  let HomeExpenseAmount= 1000 

  let currentMonth= getCurrentMonthName()


 let isAdmin =  checkIfAdmin(userId)

  const fetchBudgets = async (userId) => {
    const plans = await readPlans(userId);
    const plansArray = Object.keys(plans).map(key => ({
      id: key,
      ...plans[key],
    }));
    setBudgets(plansArray);
  };

  const totalBudgetPlan= totalPlanBugdet(budgets)

  HomeExpenseAmount = HomeExpenseAmount + totalBudgetPlan

  const navigate = useNavigate();
  
  useEffect(() => {      
    isAuthenticated(setIsLoggedIn);
    getLoggedUser(setLoggedUser)
    isAuthenticatedDetails(setIsLoggedIn, setUserId);
    listTransactions(setTransactions);
    fetchBudgets(userId);
    waitToLoad(setLoading);
  }, [navigate, isLoggedIn]);

  return (
    <div className="main_dashboard">  

      {isLoggedIn && (
        <>
        
        <div className="dashboard_grid">
          <div className="dashboard_item goal_amount">
            {isLoggedIn && <CardBugdeto dataExpense={goalAmount} type={"Save Goal till 30th "+ currentMonth +" 2024"}/>}
          </div>
          {!isAdmin &&<div className="dashboard_item home_amount">
            {isLoggedIn &&  <CardBugdeto dataExpense={HomeExpenseAmount} type="Home grosseries monthly"/>}
          </div>}
          {isAdmin &&<div className="dashboard_item">
            {isLoggedIn && <CardBugdeto dataExpense={totalIncome - totalExpense} type="Bank Account"/>}
          </div>}
          {isAdmin &&<div className="dashboard_item">
            {isLoggedIn && <CardBugdeto dataExpense={totalBenefits} type="Benefit Account"/>}
          </div>}
          {isAdmin &&<div className="dashboard_item">
            {isLoggedIn &&  <CardBugdeto dataExpense={-total} type="Super Account"/>}
          </div>}
          <div className="dashboard_item">
            {isLoggedIn && <CardBugdeto dataExpense={totalBudgetPlan} type="Planned Account monthly"/>}
          </div>
          {isAdmin &&<div className="dashboard_item payback">
            {isLoggedIn && <CardBugdeto dataExpense={-totalWhatIsNotMine} type="What is not mine"/>}
          </div>}          
        </div>
        </>
        
      )}
      {!isLoggedIn && <NoAccess/>}
    </div>
  );
}

export default Dashboard;
