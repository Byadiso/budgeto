import React, { useEffect, useState } from "react";
import "../../../Style/Register.css";

import { checkMyValue } from "../../../Helpers/Helpers";
import { isAuthenticated} from "../../../firebase/Authentication";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { app } from "../../../firebase/Firebase";
import ProgressBar from "../../InputComonents/ProgressBar";

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
     const {firstname, lastname, email, password}= user
      const Auth = getAuth();
    createUserWithEmailAndPassword(
        Auth,
        email,
        password,
        firstname,
        lastname
      ).then((userCredential) => {   
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
            setIsLoggedIn(true)
            error === "" && setSuccessMessage("Registered successfully!");           
          })
          
      }).catch((error) => {
        error = { error: error, errorMessage: error.message, }
        setError(error.errorMessage)        
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
    <div>
      
      <div
        className="register_container"
      >
        {!isLoggedIn && (        
        <>        
        <div className="register_form" id="register_form">
          <div>
            <div className="register_form_item">
              <input
                type="text"
                name="firstname"
                onChange={handleChange}
                id="firstname"
                placeholder="First Name"
              />

              <input
                type="text"
                name="lastname"
                onChange={handleChange}
                id="lastname"
                placeholder="Last Name"
              />

              <input
                type="text"
                name="email"
                onChange={handleChange}
                className="email"
                placeholder="Email"
                id="email-register"
              />

              <input
                type="password"
                name="password"
                onChange={handleChange}
                className="password"
                placeholder="Password"
                id="password-register"
              />
              <p id="error">{error === null ? successMessage : error}</p>
              <div className="login_register">
                <input
                className="register"
                  type="submit"
                  onClick={handleSubmit}
                  value="Create Your Account"                  
                />

                <div className="login_content">
                  <p >Already have an account?</p>
                  <Link to="/login" className="login_button">Login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>)}

        {isLoggedIn && successMessage && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "100px",
              flexDirection: "column",
              }}
          >
            <p style={{              
              color: "green"
            }}>{successMessage}</p>
            <ProgressBar />
          </div>
        )}
      </div>      
    </div>
  );
}

export default Register;
