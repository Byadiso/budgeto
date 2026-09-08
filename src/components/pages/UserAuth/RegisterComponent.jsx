import React, { useEffect, useState } from "react";
import "../../../Style/Register.css";

import { checkMyValue } from "../../../Helpers/Helpers";
import { isAuthenticated } from "../../../firebase/Authentication";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { app } from "../../../firebase/Firebase";
import ProgressBar from "../../InputComonents/ProgressBar";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

function Register() {
  const [user, setUser] = useState({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
  });
  const [error, setError] = useState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (event) => {
    if (error) {
      setError("");
    }
    if (event.target.name === "email") {
      setUser({ ...user, email: event.target.value });
    }
    if (event.target.name === "password") {
      setUser({ ...user, password: event.target.value });
    }
    if (event.target.name === "firstname") {
      setUser({ ...user, firstname: event.target.value });
    }
    if (event.target.name === "lastname") {
      setUser({ ...user, lastname: event.target.value });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    checkMyValue(user, setError, true);
    const { firstname, lastname, email, password } = user;
    const Auth = getAuth();
    createUserWithEmailAndPassword(Auth, email, password, firstname, lastname)
      .then((userCredential) => {
        const user = userCredential.user;
        const userData = {
          firstname: firstname,
          lastname: lastname,
          displayName: firstname,
          email: email,
        };
        app
          .firestore()
          .collection("users")
          .doc(user.uid)
          .set(userData)
          .then((user) => {
            setIsLoggedIn(true);
            error === "" && setSuccessMessage("Registered successfully!");
          });
      })
      .catch((error) => {
        error = { error: error, errorMessage: error.message };
        setError(error.errorMessage);
      });
  };

  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
    setTimeout(() => {
      if (isLoggedIn) {
        navigate("/");
      } else {
        navigate("/Register");
      }
    }, 6000);
  }, [navigate, isLoggedIn]);

  return (
    <div className="register_page">
      <div className="register_topbar">
        <Link to="/" className="register_back">
          <ArrowBackIcon fontSize="small" />
          Back to Bugdeto.com
        </Link>
      </div>

      {!isLoggedIn && (
        <div className="register_register">
          <header className="register_header">
            <p className="register_kicker">Get started</p>
            <h1 className="register_title">Create your account</h1>
          </header>

          <div className="register_card" id="register_form">
            {error && (
              <p className="register_message register_message--error" id="error">
                {error}
              </p>
            )}
            {!error && successMessage && (
              <p className="register_message register_message--success">
                {successMessage}
              </p>
            )}

            <form className="register_form_item" onSubmit={handleSubmit}>
              <div className="register_row">
                <div className="register_field">
                  <label htmlFor="firstname" className="register_label">
                    First name
                  </label>
                  <div className="register_input_wrap">
                    <PersonOutlineIcon fontSize="small" className="register_input_icon" />
                    <input
                      type="text"
                      name="firstname"
                      onChange={handleChange}
                      id="firstname"
                      className="register_input"
                      placeholder="First name"
                      autoComplete="given-name"
                    />
                  </div>
                </div>

                <div className="register_field">
                  <label htmlFor="lastname" className="register_label">
                    Last name
                  </label>
                  <div className="register_input_wrap">
                    <PersonOutlineIcon fontSize="small" className="register_input_icon" />
                    <input
                      type="text"
                      name="lastname"
                      onChange={handleChange}
                      id="lastname"
                      className="register_input"
                      placeholder="Last name"
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>

              <div className="register_field">
                <label htmlFor="email-register" className="register_label">
                  Email
                </label>
                <div className="register_input_wrap">
                  <MailOutlineIcon fontSize="small" className="register_input_icon" />
                  <input
                    type="text"
                    name="email"
                    onChange={handleChange}
                    className="register_input"
                    placeholder="you@example.com"
                    id="email-register"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="register_field">
                <label htmlFor="password-register" className="register_label">
                  Password
                </label>
                <div className="register_input_wrap">
                  <LockOutlinedIcon fontSize="small" className="register_input_icon" />
                  <input
                    type="password"
                    name="password"
                    onChange={handleChange}
                    className="register_input"
                    placeholder="Create a password"
                    id="password-register"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <input
                className="register_submit"
                type="submit"
                onClick={handleSubmit}
                value="Create Your Account"
              />
            </form>
          </div>

          <section className="register_signup">
            <div className="register_signup_text">
              <h4>Already have an account?</h4>
              <p>Log back in to pick up where you left off.</p>
            </div>
            <Link to="/login" className="register_signup_button">
              Login
            </Link>
          </section>
        </div>
      )}

      {isLoggedIn && successMessage && (
        <div className="register_success">
          <p className="register_success_text">{successMessage}</p>
          <ProgressBar />
        </div>
      )}
    </div>
  );
}

export default Register;