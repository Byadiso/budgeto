import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  checkIfAdmin,
  getLoggedUser,
  isAuthenticated,
  isAuthenticatedDetails,
} from "../../firebase/Authentication";
import {
  getCurrentMonthName,
  totalPlanBugdet,
  waitToLoad,
} from "../../Helpers/Helpers";
import CardBugdeto from "./CardBugdeto";
import NoAccess from "./ErrorComponents/NoAccess";
import "../../Style/Dashboard.css";
import { listTransactions } from "../../firebase/getTransactions";
import {
  filterBenefits,
  filterTransactionsAndCalculateTotal,
  filterWhatIsNotMine,
  listAlltransactionWithoutSuper,
} from "../../firebase/Filters";
import { KEYWORDS } from "../../firebase/CONSTANTS";
import { readPlans } from "../../firebase/Plan";

function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loggedUser, setLoggedUser] = useState(null);

  const navigate = useNavigate();

  // Calculations
  const { totalExpense, totalIncome } = listAlltransactionWithoutSuper(
    transactions,
    KEYWORDS
  );
  const { totalBenefits } = filterBenefits(transactions);
  const { total } = filterTransactionsAndCalculateTotal(
    transactions,
    KEYWORDS
  );
  const { totalWhatIsNotMine } = filterWhatIsNotMine(transactions);

  const goalAmount = 500;
  const initialHomeExpenseAmount = 1000;
  const currentMonth = getCurrentMonthName();
  const currentYear = new Date().getFullYear();
  const isAdmin = checkIfAdmin(userId);

  const totalBudgetPlan = totalPlanBugdet(budgets);
  const homeExpenseAmount = initialHomeExpenseAmount + totalBudgetPlan;

  // Initial Data Fetching
  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
    getLoggedUser(setLoggedUser);
    isAuthenticatedDetails(setIsLoggedIn, setUserId);
    listTransactions(setTransactions);
    waitToLoad(setLoading);
  }, []);

  // Fetch Budgets when userId is set
  useEffect(() => {
    if (userId) {
      const fetchBudgets = async () => {
        const plans = await readPlans(userId);
        if (plans) {
          const plansArray = Object.keys(plans).map((key) => ({
            id: key,
            ...plans[key],
          }));
          setBudgets(plansArray);
        }
      };
      fetchBudgets();
    }
  }, [userId]);

  if (loading) {
    return <div className="dashboard_loading">Loading dashboard…</div>;
  }

  if (!isLoggedIn) {
    return <NoAccess />;
  }

  return (
    <div className="main_dashboard">
      <header className="dashboard_header">
        <p className="dashboard_eyebrow">
          {currentMonth} {currentYear}
        </p>
        <h1>Dashboard</h1>
      </header>

      <div className="dashboard_hero dashboard_item goal_amount">
        <CardBugdeto
          dataExpense={goalAmount}
          type={`Save Goal till 30th ${currentMonth} ${currentYear}`}
        />
      </div>

      <div className="dashboard_grid">
        {!isAdmin && (
          <div className="dashboard_item home_amount">
            <CardBugdeto
              dataExpense={homeExpenseAmount}
              type="Home Groceries Monthly"
            />
          </div>
        )}

        {isAdmin && (
          <>
            <div className="dashboard_item bank_account">
              <CardBugdeto
                dataExpense={totalIncome - totalExpense}
                type="Bank Account"
              />
            </div>

            <div className="dashboard_item benefit_account">
              <CardBugdeto
                dataExpense={totalBenefits}
                type="Benefit Account"
              />
            </div>

            <div className="dashboard_item super_account">
              <CardBugdeto dataExpense={-total} type="Super Account" />
            </div>
          </>
        )}

        <div className="dashboard_item planned_account">
          <CardBugdeto
            dataExpense={totalBudgetPlan}
            type="Planned Account Monthly"
          />
        </div>

        {isAdmin && (
          <div className="dashboard_item payback">
            <CardBugdeto
              dataExpense={-totalWhatIsNotMine}
              type="What Is Not Mine"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
