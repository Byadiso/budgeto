import React, { useEffect, useState } from "react";
import {
  isAuthenticated,
  isAuthenticatedDetails,
} from "../../firebase/Authentication";
import { Link } from "react-router-dom";
import "../../Style/Planning.css";

import AddIcon from "@mui/icons-material/Add";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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

      {isLoggedIn ? (
        <>
          <div style={{ padding: "35px", margin: "35px", color: "black" }}>
            <h4>
              Welcome to your Planning page for{" "}
              <span style={{ color: "green" }}> {currentMonth}</span>
            </h4>

            <div className="total-amount">
              <h2 style={getTotalStyle(totalAmount)}>
                Total: {totalAmount} PLN
              </h2>
            </div>

            <div className="main_container_planner">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  padding: "10px",
                  alignItems: "center",
                  color: "white",
                  backgroundColor: "#008DDA",
                  justifyContent: "center",
                }}
              >
                <p onClick={handleAddNewPlan} className="Add_plan">
                  Start Planning
                </p>
                <AddIcon onClick={handleAddNewPlan} className="Add_plan" />
              </div>

              <div className="budget-cards-container">
                {budgets.length > 0 ? (
                  budgets.map((budget, index) => (
                    <div
                      className="budget-card"
                      key={budget.id}
                      style={getCardStyle(budget.category)}
                    >
                      <h5>{budget.name}</h5>
                      <p>Amount: {budget.amount}PLN</p>
                      <p>Category: {budget.category}</p>
                      <button
                        onClick={() => handleEditBudget(index)}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveBudget(index)}
                        className="btn-remove"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No plans yet. Start by adding a budget.</p>
                )}
              </div>
              <div>
                <h1>Archive Plan for the Month</h1>
                <ArchivePlanButton currentTotalAmount={totalAmount} />
              </div>
            </div>
          </div>

          {isModalOpen && (
            <BudgetModal
              closeModal={() => setIsModalOpen(false)}
              addOrEditBudget={handleAddOrEditBudget}
              currentBudget={currentBudget}
            />
          )}
        </>
      ) : (
        <NoAccess />
      )}
    </div>
  );
}

export default Planning;
