import React, { useEffect, useState } from "react";
import {
  isAuthenticated,
  isAuthenticatedDetails,
} from "../../firebase/Authentication";
import { Link } from "react-router-dom";
import "../../Style/Planning.css";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BudgetModal from "../Modals/BudgetModal";
import {
  createPlan,
  readPlans,
  editPlan,
  deletePlan,
} from "../../firebase/Plan";
import {
  getCardStyle,
  getCurrentMonthName,
  getTotalStyle,
  totalPlanBugdet,
} from "../../Helpers/Helpers";
import ArchivePlanButton from "./ArchivePlans";
import NoAccess from "./ErrorComponents/NoAccess";

function Planning() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  let currentMonth = getCurrentMonthName();

  useEffect(() => {
    isAuthenticatedDetails(setIsLoggedIn, setUserId);
  }, [isLoggedIn]);

  useEffect(() => {
    if (userId) {
      fetchBudgets(userId);
    }
  }, [userId]);

  const fetchBudgets = async (userId) => {
    const plans = await readPlans(userId);
    const plansArray = Object.keys(plans).map((key) => ({
      id: key,
      ...plans[key],
    }));
    setBudgets(plansArray);
  };

  const handleAddNewPlan = () => {
    setCurrentBudget(null);
    setEditIndex(null);
    setIsModalOpen(true);
  };

  const handleEditBudget = (index) => {
    setCurrentBudget(budgets[index]);
    setEditIndex(index);
    setIsModalOpen(true);
  };

  const handleAddOrEditBudget = async (newBudget) => {
    if (editIndex !== null) {
      await editPlan(userId, budgets[editIndex].id, newBudget);
      const updatedBudgets = budgets.map((budget, index) =>
        index === editIndex
          ? { ...newBudget, id: budgets[editIndex].id }
          : budget
      );
      setBudgets(updatedBudgets);
    } else {
      await createPlan(userId, newBudget);
      setBudgets([
        ...budgets,
        { ...newBudget, id: Math.floor(Math.random() * 1000000) },
      ]);
    }
    setIsModalOpen(false);
  };

  const handleRemoveBudget = async (index) => {
    await deletePlan(userId, budgets[index].id);
    const updatedBudgets = budgets.filter((_, i) => i !== index);
    setBudgets(updatedBudgets);
  };

  const totalAmount = totalPlanBugdet(budgets);

  return (
    <div className="ledger_page">
      <div className="ledger_topbar">
        <Link to="/Dashboard" className="ledger_back">
          <ArrowBackIcon fontSize="small" />
          Go back
        </Link>
      </div>

      {isLoggedIn ? (
        <div className="ledger_register">
          <header className="ledger_header">
            <p className="ledger_month">{currentMonth}</p>
            <h1 className="ledger_title">Planning</h1>
          </header>

          <div className="ledger_balance">
            <span className="ledger_balance_label">Total planned</span>
            <h2 className="ledger_balance_amount" style={getTotalStyle(totalAmount)}>
              {totalAmount} <span className="ledger_currency">PLN</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={handleAddNewPlan}
            className="ledger_add_row"
          >
            <span className="ledger_add_icon">
              <AddIcon fontSize="small" />
            </span>
            Add a new budget
          </button>

          <section className="ledger_entries" aria-label="Budget entries">
            {budgets.length > 0 ? (
              budgets.map((budget, index) => (
                <article className="ledger_entry" key={budget.id}>
                  <span
                    className="ledger_entry_stripe"
                    style={getCardStyle(budget.category)}
                  />
                  <div className="ledger_entry_main">
                    <h3 className="ledger_entry_name">{budget.name}</h3>
                    <span
                      className="ledger_entry_category"
                      style={getCardStyle(budget.category)}
                    >
                      {budget.category}
                    </span>
                  </div>

                  <span className="ledger_entry_amount">
                    {budget.amount} <span className="ledger_currency">PLN</span>
                  </span>

                  <div className="ledger_entry_actions">
                    <button
                      type="button"
                      onClick={() => handleEditBudget(index)}
                      className="ledger_icon_btn"
                      aria-label={`Edit ${budget.name}`}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveBudget(index)}
                      className="ledger_icon_btn ledger_icon_btn--danger"
                      aria-label={`Remove ${budget.name}`}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="ledger_empty">
                <p>No budgets yet.</p>
                <p className="ledger_empty_sub">
                  Add your first entry to start planning {currentMonth}.
                </p>
              </div>
            )}
          </section>

          <section className="ledger_archive">
            <div className="ledger_archive_text">
              <h4>Close the books</h4>
              <p>Archive this month's plan to start fresh next month.</p>
            </div>
            <ArchivePlanButton currentTotalAmount={totalAmount} />
          </section>
        </div>
      ) : (
        <NoAccess />
      )}

      {isModalOpen && (
        <BudgetModal
          closeModal={() => setIsModalOpen(false)}
          addOrEditBudget={handleAddOrEditBudget}
          currentBudget={currentBudget}
        />
      )}
    </div>
  );
}

export default Planning;
