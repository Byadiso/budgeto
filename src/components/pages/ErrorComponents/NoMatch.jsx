import React, { useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Layouts/Navbar";
import "../../../Style/NoMatch.css";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

// Real routes from App.js
const PAGES = [
  { to: "/Dashboard", label: "Dashboard", hint: "Your overview" },
  { to: "/Plan", label: "Planning", hint: "Monthly budgets" },
  { to: "/Reports", label: "Reports", hint: "All transactions" },
  { to: "/Archived", label: "Archive", hint: "Past months" },
];

const readPath = (pathname) => {
  try {
    return decodeURIComponent(pathname || "/");
  } catch {
    return pathname || "/";
  }
};

// small edit-distance check for the "Did you mean" suggestion
const distance = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
};

function NoMatch() {
  const location = useLocation();
  const navigate = useNavigate();
  const headingRef = useRef(null);
  const path = readPath(location.pathname);

  const suggestion = useMemo(() => {
    const typed = path.replace(/^\/+|\/+$/g, "").toLowerCase();
    if (!typed) return null;
    let best = null;
    PAGES.forEach((p) => {
      const name = p.to.slice(1).toLowerCase();
      const d = distance(typed, name);
      if (d <= 3 && (!best || d < best.d)) best = { ...p, d };
    });
    return best;
  }, [path]);

  useEffect(() => {
    const previous = document.title;
    document.title = "Page not found";
    headingRef.current?.focus();
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    // children replaces <Dashboard /> inside the Navbar's <main>
    <Navbar>
      <div className="nomatch_page">
        <div className="nomatch_card" role="alert">
          <p className="nomatch_code" aria-hidden="true">
            404
          </p>

          <h1 ref={headingRef} tabIndex={-1} className="nomatch_title">
            This page doesn't exist
          </h1>

          <p className="nomatch_text">
            There is nothing at this address. Check it for typos, or pick a
            page below.
          </p>

          <p className="nomatch_path">
            <span className="nomatch_path_label">Address</span>
            <code>{path}</code>
          </p>

          {suggestion && (
            <p className="nomatch_suggest">
              Did you mean <Link to={suggestion.to}>{suggestion.label}</Link>?
            </p>
          )}

          <div className="nomatch_actions">
            <button
              type="button"
              className="nomatch_primary"
              onClick={() => navigate(-1)}
            >
              <ArrowBackIcon fontSize="small" />
              Go back
            </button>
            <Link to="/" className="nomatch_secondary">
              <HomeOutlinedIcon fontSize="small" />
              Home page
            </Link>
          </div>

          <div className="nomatch_shortcuts">
            <p className="nomatch_shortcuts_title">Or open a page</p>
            <div className="nomatch_shortcuts_grid">
              {PAGES.map((s) => (
                <Link key={s.to} to={s.to} className="nomatch_tile">
                  <span className="nomatch_tile_label">{s.label}</span>
                  <span className="nomatch_tile_hint">{s.hint}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
}

export default NoMatch;