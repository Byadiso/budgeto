import React from "react";
import "../Style/Style.css";
import SignalWifiBadIcon from "@mui/icons-material/SignalWifiBad";

function NoConnection(props) {
 
  return (
    <div
      className="NoConnection"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginLeft: "100px",
        marginTop: "100px",
        justifyContent: "center",
      }}
    >
      <p style={{ color: "black" }}>
        <SignalWifiBadIcon style={{ color: "black" }} /> {props.errorMessage}
      </p>
    </div>
  );
}

export default NoConnection;
