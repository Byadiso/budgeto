import React, { useEffect, useState } from "react";
import "../../../Style/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../../firebase/Authentication";
import { checkMyValue } from "../../../Helpers/Helpers";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import ProgressBar from "../../InputComonents/ProgressBar";

function Login() {
  const [user, setUser] = useState({});
  const [error, setError] = useState("");
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
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    checkMyValue(user, setError, false);
    if(user.email && user.password){
      const Auth = getAuth();
      signInWithEmailAndPassword(Auth, user.email, user.password)
        .then((userCredential) => {               
          error === "" && setSuccessMessage("Logged in successfully");
        })
        .catch((error) => {
          error = { error: error, message: "Email/password error" };        
          setError(error.message);
        });
  
    }
    
  
  };

  useEffect(() => {
    isAuthenticated(setIsLoggedIn);    
    setTimeout(() => {
      if (isLoggedIn) {
        navigate("/Dashboard");
      }  
    }, 7500);  

     }, [navigate, isLoggedIn]);

  return (
    <div>
      
      <section className={isLoggedIn ? "" : "login_main" }>
        {!isLoggedIn && (
          <div>
            <div className="login_form">
              <div>
                <p style={{color:"black"}}>Login to bugdeto.com</p>
                <p className="error">{error === null ? successMessage : error}</p>
                <input
                  type="text"
                  name="email"
                  onChange={handleChange}
                  className="email"
                  placeholder="Email address or Username or email ID"
                  id="email_login"
                />
                <input
                  type="password"
                  name="password"
                  onChange={handleChange}
                  className="password"
                  placeholder="Password"
                  id="password_login"
                />                
                <input
                    className="login"
                    onClick={handleSubmit}
                    type="submit"
                    value="login"
                    id="loginSubmit"
                  />
                <div className="login_register">
                  
                  <p>Don't have an account yet?</p>
                  <Link to="/Register" className="register_button">
                    Sign Up. It's free and takes seconds.
                  </Link>
                </div>
                <p >
                  <Link to="/" style={{color:"black", textDecoration:"none"}} className="buttonToHome"><strong>Bugdeto.com</strong></Link>
                </p>
              </div>
              
              
            </div>
          </div>
        )}
        {isLoggedIn && successMessage && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "100px",
              marginBottom: "120px",
              flexDirection: "column",
              }}
          >
            <p style={{              
              color: "green"
            }}>{successMessage}</p>
            <ProgressBar />
          </div>
        )}
      </section>
    
    </div>
  );
}

export default Login;
