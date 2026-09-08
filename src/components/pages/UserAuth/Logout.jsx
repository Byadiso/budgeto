import React, { useEffect, useState } from "react";
import "../../../Style/user.css";
import Navbar from "../Layouts/Navbar";
import Footer from "../Layouts/Footer";
import { Link, useNavigate } from "react-router-dom";
import { LogoutUser, isAuthenticated } from "../../../firebase/Authentication";

function Logout() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const HandleLogOut = () => {
    LogoutUser();
  };

  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
    if (!isLoggedIn) {
      navigate("/");
    } else {
      navigate("/Logout");
    }
  }, [navigate, isLoggedIn]);

  return (
    <div>
      <Navbar />

      <div>
        {" "}
        <h2>Are you sure you want to log out ?</h2>
        <div className="logout_button">
          <button id="logout" onClick={HandleLogOut}>
            Yes
          </button>
          <button id="return">
            <Link to="/">Return Home</Link>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Logout;
