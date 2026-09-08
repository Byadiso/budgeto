import React, { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import "../../../Style/Style.css";
import { removeFirstLetter } from "../../../Helpers/Helpers";

function NoAccess() {
  

  const pageName = useLocation(); 
  const page = removeFirstLetter(pageName.pathname);

  return (
    <div
      className="NoAccessContainer"     
    >
      <h1 style={{ color: "black" }}> 403</h1>
      <h3 style={{ color: "black" }}> Access Denied</h3>
      <p style={{ color: "black" }}>
        {" "}
        You don't have permission to access <span style={{ color: "#29b4e2" }}>{page}</span> page!
      </p>
      <Link to="/Login">       
        <input className="login" type="submit" value="First login" id="loginSubmit" />
      </Link>
    </div>
  );
}

export default NoAccess;
