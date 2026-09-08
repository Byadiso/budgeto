import React, { useEffect, useState } from "react";
import {
  checkIfAdmin,
  getLoggedUser,
  isAuthenticated,
  isAuthenticatedDetails,
} from "../../firebase/Authentication";
import { Link, useNavigate } from "react-router-dom";
import NoAccess from "./ErrorComponents/NoAccess";
import { totalPlanBugdet, waitToLoad } from "../../Helpers/Helpers";
import CardBugdeto from "./CardBugdeto";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Navbar from "./Layouts/Navbar";
import AddIcon from "@mui/icons-material/Add";
import UserModal from "../Modals/UserModal"; 
import SettingsIcon from '@mui/icons-material/Settings';

function UserSettings() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [transactions, setTransactions] = React.useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loggedUser, setLoggedUser] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
    getLoggedUser(setLoggedUser);
    isAuthenticatedDetails(setIsLoggedIn, setUserId);
    listTransactions(setTransactions);
    fetchBudgets(userId);
    waitToLoad(setLoading);
  }, [navigate, isLoggedIn]);

  const fetchBudgets = async (userId) => {
    const plans = await readPlans(userId);
    const plansArray = Object.keys(plans).map((key) => ({
      id: key,
      ...plans[key],
    }));
    setBudgets(plansArray);
  };

  const handleAddNewPlan = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveData = (dropdownValue, textFieldValue) => {
    // Handle the save logic here
    console.log("Saved data:", { dropdownValue, textFieldValue });
    setIsModalOpen(false);
  };

  return (
    <div className="main_dashboard">
      {isLoggedIn && (
        <>
          <div
            style={{
              paddingTop: "5px",
              paddingBottom: "20px",
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
                color: "black",
              }}
            >
              <ArrowBackIcon style={{ marginRight: "5px" }} /> Go back
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              padding: "5px",
              marginBottom:"100px",
              alignItems: "center",
              color: "white",
              backgroundColor: "#008DDA",
              justifyContent: "center",
            }}
          >
            <p onClick={handleAddNewPlan} className="Add_plan">
              Change Settings
            </p>
            <SettingsIcon onClick={handleAddNewPlan} className="Add_plan" />
          </div>

          <div className="dashboard_grid">
            <div className="dashboard_item goal_amount">
              {isLoggedIn && (
                <CardBugdeto
                  dataExpense={500} // Replace with dynamic goalAmount
                  type="Save Goal till 30th December 2024"
                />
              )}
            </div>
            <div className="dashboard_item goal_amount">
              <p>
                On this page you will be able to change goal settings and more
                settings
              </p>
            </div>
          </div>

          

          {isModalOpen && (
            <UserModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSave={handleSaveData}
            />
          )}
        </>
      )}
      {!isLoggedIn && <NoAccess />}
    </div>
  );
}

export default UserSettings;
