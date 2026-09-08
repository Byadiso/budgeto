import React, { useEffect, useState } from "react";
import "../../../Style/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../../firebase/Authentication";
import { checkMyValue } from "../../../Helpers/Helpers";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import ProgressBar from "../../InputComonents/ProgressBar";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Login() {
  const [user, setUser] = useState({});
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (event) => {
    if (error) {
      setError("");
    }
    const { name, value } = event.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    checkMyValue(user, setError, false);

    if (!user.email || !user.password) return;

    setIsSubmitting(true);
    const Auth = getAuth();

    try {
      await signInWithEmailAndPassword(Auth, user.email, user.password);
      setSuccessMessage("Logged in successfully");
    } catch (err) {
      setError("Email/password error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keep auth state in sync
  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
  }, []);

  // Redirect as soon as we know the user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      const timeout = setTimeout(() => {
        navigate("/Dashboard");
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="login_page">
      <div className="login_topbar">
        <Link to="/" className="login_back">
          <ArrowBackIcon fontSize="small" />
          Back to Bugdeto.com
        </Link>
      </div>

      {!isLoggedIn ? (
        <div className="login_register">
          <header className="login_header">
            <p className="login_kicker">Welcome back</p>
            <h1 className="login_title">Log in</h1>
          </header>

          <div className="login_card">
            {error && (
              <p className="login_message login_message--error">{error}</p>
            )}
            {!error && successMessage && (
              <p className="login_message login_message--success">
                {successMessage}
              </p>
            )}

            <form className="login_form" onSubmit={handleSubmit}>
              <div className="login_field">
                <label htmlFor="email_login" className="login_label">
                  Email or username
                </label>
                <div className="login_input_wrap">
                  <MailOutlineIcon fontSize="small" className="login_input_icon" />
                  <input
                    type="text"
                    name="email"
                    onChange={handleChange}
                    className="login_input"
                    placeholder="you@example.com"
                    id="email_login"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="login_field">
                <label htmlFor="password_login" className="login_label">
                  Password
                </label>
                <div className="login_input_wrap">
                  <LockOutlinedIcon fontSize="small" className="login_input_icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    onChange={handleChange}
                    className="login_input"
                    placeholder="Enter your password"
                    id="password_login"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login_input_toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="login_submit"
                id="loginSubmit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in…" : "Log in"}
              </button>
            </form>
          </div>

          <section className="login_signup">
            <div className="login_signup_text">
              <h4>New to Bugdeto?</h4>
              <p>Create a free account — it takes seconds.</p>
            </div>
            <Link to="/Register" className="login_signup_button">
              Sign up
            </Link>
          </section>
        </div>
      ) : (
        <div className="login_success">
          <p className="login_success_text">{successMessage}</p>
          <ProgressBar />
        </div>
      )}
    </div>
  );
}

export default Login;