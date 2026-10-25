import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../../Style/NoAccess.css";
import { isAuthenticatedDetails } from "../../../firebase/Authentication";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CircularProgress from "@mui/material/CircularProgress";

// "/Side%20Hustle" -> "Side Hustle", "/" -> "this page"
const getPageName = (pathname) => {
  try {
    const clean = decodeURIComponent(pathname || "")
      .replace(/^\/+|\/+$/g, "")
      .replace(/[-_]+/g, " ")
      .trim();
    return clean || "this page";
  } catch {
    return "this page";
  }
};

function NoAccess({ children }) {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const headingRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const page = getPageName(location.pathname);

  useEffect(() => {
    let active = true;

    // Second argument is a no-op so "setUserId is not a function" can't happen
    isAuthenticatedDetails(
      (status) => {
        if (!active) return;
        setIsLoggedIn(status);
        setLoading(false);
      },
      () => {}
    );

    return () => {
      active = false;
    };
  }, []);

  // Move focus to the message so keyboard and screen reader users land on it
  useEffect(() => {
    if (!loading && !isLoggedIn) headingRef.current?.focus();
  }, [loading, isLoggedIn]);

  // 1. Checking: spinner (prevents a flash of the denied screen)
  if (loading) {
    return (
      <div className="noaccess_page" role="status" aria-busy="true">
        <div className="noaccess_loading">
          <CircularProgress size={36} />
          <p>Checking your access…</p>
        </div>
      </div>
    );
  }

  // 2. Signed in: show the protected content
  if (isLoggedIn) {
    return <>{children}</>;
  }

  // 3. Signed out: friendly sign-in prompt
  return (
    <div className="noaccess_page">
      <div className="noaccess_card" role="alert">
        <div className="noaccess_icon" aria-hidden="true">
          <LockOutlinedIcon fontSize="medium" />
        </div>

        <p className="noaccess_eyebrow">Members only</p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="noaccess_title"
        >
          Sign in to continue
        </h1>
        <p className="noaccess_text">
          <span className="noaccess_page_name">{page}</span> is private. Sign
          in to see your budgets, plans and reports.
        </p>

        <div className="noaccess_actions">
          <Link
            to="/Login"
            state={{ from: location.pathname }}
            className="noaccess_primary"
            id="loginSubmit"
          >
            Sign in
          </Link>

          <div className="noaccess_secondary_row">
            <button
              type="button"
              className="noaccess_secondary"
              onClick={() => navigate(-1)}
            >
              <ArrowBackIcon fontSize="small" />
              Go back
            </button>
            <Link to="/" className="noaccess_secondary">
              <HomeOutlinedIcon fontSize="small" />
              Bugdeto.com
            </Link>
          </div>
        </div>

        <p className="noaccess_hint">
          Think you should have access? Try signing in again with the account
          you used to register.
        </p>
      </div>
    </div>
  );
}

export default NoAccess;