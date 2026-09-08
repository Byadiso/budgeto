import React from "react";
import Navbar from "../Layouts/Navbar";
import Footer from "../Layouts/Footer";
import { Link } from "react-router-dom";

function NoMatch() {
  return (
    <div>
      <Navbar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "150px",
        }}
      >
        <p style={{ color: "black" }}> 404 No Match found!</p>
        <Link to="/Dashboard">
          <p style={{ color: "black" }}>Click to return to Dashboard Page</p>
        </Link>
      </div>

      <Footer />
    </div>
  );
}

export default NoMatch;
