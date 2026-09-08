import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import InputComponent from "../InputComonents/InputComponent";
import "../../Style/Transactions.css";
import { createTransaction } from "../../firebase/Transaction";
import { isAuthenticated } from "../../firebase/Authentication";
import { ValidateTransaction, waitToLoad } from "../../Helpers/Helpers";
import NoAccess from "./ErrorComponents/NoAccess";
import { Link, useNavigate } from "react-router-dom";  // Import useNavigate
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function AddRecord() {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false); 

  const navigate = useNavigate();  

  const style = {
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    paddingBottom: "50px",
    marginTop: "20px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    p: 4,
  };

  const handleOnClick = () => {
    let error = ValidateTransaction(data);
    setIsSubmitted(true); // Mark form as submitted
    setErrorMessage(error);
    if (!error) {
      createTransaction(data)
        .then(() => {
          setSuccessMessage("Transaction has been created successfully");

          
          setTimeout(() => {
            navigate("/Dashboard");  
          }, 1000);  
        })
        .catch((err) => {
          console.error("Error creating transaction:", err);
        });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError("");
    setData((prevRecord) => ({
      ...prevRecord,
      [name]: value,
    }));
  };

  useEffect(() => {
    isAuthenticated(setIsLoggedIn);
    waitToLoad(setLoading);
  }, []);

  return (
  
      <div style={{ display: "flex", alignItems: "center", flexDirection:"column" }}>
       
       <div
  style={{
    paddingTop: "20px",
    margin: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  }}
>
  <Link
    to="/Dashboard"
    style={{
      color: "white",
      display: "flex",
      alignItems: "center",
      textDecoration: "none", 
    }}
  >
    <ArrowBackIcon style={{ marginRight: "8px" }} /> Go back
  </Link>
</div>


     
        {isLoggedIn ? (
          <div style={style} className="Add_blog_container">
            <h2 style={{ color: "white", marginBottom: "50px" }}>
              Your Treasure!
            </h2>
            <form>
            
              <InputComponent
                name="title"
                handleChange={handleChange}
                label="Title"
              />
              <InputComponent
                name="amount"
                handleChange={handleChange}
                label="Amount"
              />

             
              <div style={{ marginTop: "20px", color: "white", width: "100%" }}>
                <select
                  name="type"
                  id="type"
                  onChange={handleChange}
                  style={{
                    padding: "10px",
                    width: "100%",
                    marginTop: "10px",
                    background: "#fff",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="">Select type</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="extra">Extra</option>
                  <option value="isNotMine">Is Not Mine</option>
                </select>
              </div>

             
              {isSubmitted && (
                <p
                  className={errorMessage ? "errorMessage" : "successMessage"}
                >
                  {successMessage ? successMessage : errorMessage}
                </p>
              )}

           
              <Button
                variant="contained"
                onClick={handleOnClick}
                style={{ marginTop: "50px" }}
              >
                Create
              </Button>
            </form>
          </div>
        ) : (
          !loading && <NoAccess />
        )}
      </div>
   
  );
}

export default AddRecord;
