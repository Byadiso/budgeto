import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import InputComponent from "../InputComonents/InputComponent";
import "../../Style/Transactions.css";
import { createTransaction } from "../../firebase/Transaction";
import { isAuthenticated } from "../../firebase/Authentication";
import { ValidateTransaction, waitToLoad } from "../../Helpers/Helpers";
import NoAccess from "./ErrorComponents/NoAccess";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function AddRecord() {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  const handleOnClick = () => {
    let error = ValidateTransaction(data);
    setIsSubmitted(true);
    setErrorMessage(error);
    if (!error) {
      setIsSaving(true);
      createTransaction(data)
        .then(() => {
          setSuccessMessage("Transaction has been created successfully");
          setTimeout(() => {
            navigate("/Dashboard");
          }, 1000);
        })
        .catch((err) => {
          console.error("Error creating transaction:", err);
          setIsSaving(false);
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
    <div className="record_page">
      <div className="record_topbar">
        <Link to="/Dashboard" className="record_back">
          <ArrowBackIcon fontSize="small" />
          Go back
        </Link>
      </div>

      {isLoggedIn ? (
        <div className="record_register">
          <header className="record_header">
            <p className="record_kicker">New entry</p>
            <h1 className="record_title">Add a transaction</h1>
          </header>

          <div className="record_card Add_blog_container">
            <form className="record_form_item">
              <div className="record_field">
                <InputComponent
                  name="title"
                  handleChange={handleChange}
                  label="Title"
                />
              </div>

              <div className="record_field">
                <InputComponent
                  name="amount"
                  handleChange={handleChange}
                  label="Amount"
                />
              </div>

              <div className="record_field">
                <label htmlFor="type" className="record_label">
                  Type
                </label>
                <select
                  name="type"
                  id="type"
                  onChange={handleChange}
                  className="record_select"
                >
                  <option value="">Select type</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="extra">Extra</option>
                  <option value="isNotMine">Is Not Mine</option>
                </select>
              </div>

              {isSubmitted && (errorMessage || successMessage) && (
                <p
                  className={
                    errorMessage
                      ? "record_message record_message--error"
                      : "record_message record_message--success"
                  }
                >
                  {successMessage ? successMessage : errorMessage}
                </p>
              )}

              <Button
                variant="contained"
                onClick={handleOnClick}
                disabled={isSaving}
                className="record_submit"
                disableElevation
              >
                {isSaving ? "Saving…" : "Create"}
              </Button>
            </form>
          </div>
        </div>
      ) : (
        !loading && <NoAccess />
      )}
    </div>
  );
}

export default AddRecord;