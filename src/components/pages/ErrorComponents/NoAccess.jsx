import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../../Style/Style.css";
import { removeFirstLetter } from "../../../Helpers/Helpers";
import { isAuthenticatedDetails } from "../../../firebase/Authentication";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircularProgress from "@mui/material/CircularProgress";

function NoAccess({ children }) {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const pageName = useLocation();
  const page = removeFirstLetter(pageName.pathname);

  useEffect(() => {
    // Pass two arguments to match isAuthenticatedDetails(setIsloggedState, setUserId)
    isAuthenticatedDetails(
      (status) => {
        setIsLoggedIn(status);
        setLoading(false); // Stop loading once auth state resolves
      },
      () => {} // Dummy callback prevents "setUserId is not a function"
    );
  }, []);

  // 1. WHILE CHECKING: Show spinner (prevents 403 flash)
  if (loading) {
    return (
      <div 
        className="no_access_page" 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "60vh" 
        }}
      >
        <CircularProgress size={40} style={{ marginBottom: "15px" }} />
        <p style={{ color: "#666", fontSize: "0.95rem" }}>Loading...</p>
      </div>
    );
  }

  // 2. WHEN LOGGED IN: Render the protected page content
  if (isLoggedIn) {
    return <>{children}</>;
  }

  // 3. WHEN FAILED: Render 403 Access Denied
  return (
    <div className="no_access_page">
      <div className="no_access_card">
        <div className="no_access_icon">
          <LockOutlinedIcon fontSize="medium" />
        </div>

        <p className="no_access_code">403</p>
        <h1 className="no_access_title">Access denied</h1>
        <p className="no_access_text">
          You don't have permission to access{" "}
          <span className="no_access_page_name">{page}</span>.
        </p>

        <div className="no_access_actions">
          <Link to="/Login" className="no_access_primary" id="loginSubmit">
            Log in to continue
          </Link>
          <Link to="/" className="no_access_secondary">
            <ArrowBackIcon fontSize="small" />
            Back to Bugdeto.com
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NoAccess;