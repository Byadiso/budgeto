import React, { useEffect, useState } from "react";
import { readArchivedPlans } from "../../firebase/ArchiveLogics";
import { isAuthenticatedDetails } from "../../firebase/Authentication";
import { Link } from "react-router-dom";
import "../../Style/Archive.css";
import NoAccess from "./ErrorComponents/NoAccess";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Archived Component
const ArchiveCard = () => {
  const [archives, setArchives] = useState([]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null); // Store the user ID

  useEffect(() => {
    isAuthenticatedDetails(setIsLoggedIn, setUserId);
    if (userId) {
      fetchArchivedData(userId);
    }
  }, [userId]);

  const fetchArchivedData = async (userId) => {
    const data = await readArchivedPlans(userId);
    const archiveArray = Object.keys(data).map((key) => ({
      id: key,
      ...data[key],
    }));
    setArchives(archiveArray);
  };

  return (
    <div className="archive-container">
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
            color: "inherit",
          }}
        >
          <ArrowBackIcon style={{ marginRight: "5px" }} /> Go back
        </Link>
      </div>
      {isLoggedIn ? (
        <div
          className="bugdet_summary"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            margin: "10",
          }} /* Updated */
        >
          {archives ? (
            isLoggedIn &&
            archives
              .sort((a, b) => -1)
              .map((archive, index) => (
                <div key={index} className="archive-card">
                  <h3>Total amount for the month</h3>
                  <div className="card">
                    <h5>{archive.month}</h5>
                    <p >Amount: <span style={{color:archive.amount < 0 ? "#fa1717":"#56a256"}}>{archive.amount}PLN </span></p>
                    <div className="Archive_control">
                      <input type="button" value="edit" className="btn-edit" />
                      <input
                        type="button"
                        value="delete"
                        className="btn-remove"
                      />
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="archive-card">
              <h3>No plan archived for this user</h3>
            </div>
          )}
        </div>
      ) : (
        <NoAccess />
      )}
    </div>
  );
};

export default ArchiveCard;
