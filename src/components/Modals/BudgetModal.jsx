import React, { useState, useEffect } from "react";
import "../../Style/Modal.css"; 

function BudgetModal({ closeModal, addOrEditBudget, currentBudget }) {
  const [budget, setBudget] = useState({
    name: "",
    amount: "",
    category: "Income", 
  });

  useEffect(() => {
    // If there's a current budget (i.e., we're editing), set the form values to it
    if (currentBudget) {
      setBudget(currentBudget);
    }
  }, [currentBudget]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBudget({
      ...budget,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addOrEditBudget(budget); 
    setBudget({ name: "", amount: "", category: "Income" }); 
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{currentBudget ? "Edit Budget" : "Plan Your Budget"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group bugdet_name ">
            <label>Budget Name:</label>
            <input
              type="text"
              name="name"
              value={budget.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Amount:</label>
            <input
              type="number"
              name="amount"
              value={budget.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <select
              name="category"
              value={budget.category}
              onChange={handleChange}
              required
            >
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
              <option value="Extra">Extra</option>
              <option value="IsNotMine">Is Not Mine</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="submit">
              {currentBudget ? "Update Budget" : "Add Budget"}
            </button>
            <button type="button" onClick={closeModal}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BudgetModal;
