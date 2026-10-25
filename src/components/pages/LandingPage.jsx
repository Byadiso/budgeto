import "../../Style/LandingPage.css";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PaymentsIcon from "@mui/icons-material/Payments";
import { isAuthenticated } from "../../firebase/Authentication";

// Sample data only. Balances match the rows below (2,450.00 − 86.40 − 650.00).
const BALANCES = [
  { label: "Bank", value: "1,713.60" },
  { label: "Benefits", value: "120.00" },
  { label: "For others", value: "45.00" },
];

const RECENT = [
  { date: "03 Sep", entry: "Salary", amount: "+2,450.00", sign: "up" },
  { date: "04 Sep", entry: "Groceries", amount: "\u221286.40", sign: "down" },
  { date: "06 Sep", entry: "Rent", amount: "\u2212650.00", sign: "down" },
];

const FEATURES = [
  {
    title: "Bank and benefits, kept apart",
    body: "Reimbursements sit in their own column, so your bank balance tells the truth about what's actually yours.",
  },
  {
    title: "Plans that adjust the total",
    body: "Set a monthly budget once and it feeds straight into your groceries number \u2014 no spreadsheet to keep in sync.",
  },
  {
    title: "A line for what isn't yours",
    body: "Money you're fronting for someone else gets its own account, so it never quietly inflates your total.",
  },
];

function LandingPage() {
  // null = still checking, so we don't flash "Sign in" for logged-in users
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    isAuthenticated(setIsLoggedIn);

    // Fallback: if the auth check never answers, treat as signed out
    const timer = setTimeout(() => {
      setIsLoggedIn((prev) => (prev === null ? false : prev));
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const pending = isLoggedIn === null ? " landing_pending" : "";

  return (
    <div className="main_Landing">
      <header className="landing_topbar">
        <Link to="/" className="landing_mark">
          <PaymentsIcon fontSize="small" />
          <span>Budgeto</span>
        </Link>
        <nav aria-label="Primary">
          <Link
            to="/Dashboard"
            className={`landing_topbar_cta${pending}`}
          >
            {isLoggedIn ? "Dashboard" : "Sign in"}
          </Link>
        </nav>
      </header>

      <main className="landing_hero">
        <div className="landing_hero_copy">
          <h1>Every cent, accounted for.</h1>
          <p className="landing_hero_sub">
            A quiet ledger for income, benefits, and planned spending
            {"\u2014"}each kept where it belongs.
          </p>
          <Link
            to="/Dashboard"
            className={`landing_primary_cta${pending}`}
          >
            {isLoggedIn ? "Open your ledger" : "Get started"}
          </Link>
          <span className="landing_hero_note">
            Free while in beta · no card required
          </span>
        </div>

        <div className="landing_recent" aria-hidden="true">
          <div className="landing_balances">
            {BALANCES.map((b) => (
              <div key={b.label}>
                <span className="landing_recent_label">{b.label}</span>
                <strong>{b.value}</strong>
              </div>
            ))}
          </div>

          <span className="landing_recent_label">Example</span>
          {RECENT.map((row) => (
            <div className="landing_recent_row" key={row.entry}>
              <span className="landing_recent_date">{row.date}</span>
              <span className="landing_recent_entry">{row.entry}</span>
              <span className={`landing_recent_amount landing_${row.sign}`}>
                {row.amount}
              </span>
            </div>
          ))}
        </div>
      </main>

      <section className="landing_features" aria-label="Features">
        {FEATURES.map((feature) => (
          <div className="landing_feature" key={feature.title}>
            <h2>{feature.title}</h2>
            <p>{feature.body}</p>
          </div>
        ))}
      </section>

      <footer className="landing_footer">Budgeto.com</footer>
    </div>
  );
}

export default LandingPage;
