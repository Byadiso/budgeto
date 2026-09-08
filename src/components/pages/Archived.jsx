import React, { useEffect, useState } from "react";
import { readArchivedPlans } from "../../firebase/ArchiveLogics";
import { isAuthenticatedDetails } from "../../firebase/Authentication";
import { Link } from "react-router-dom";
import "../../Style/Archive.css";
import NoAccess from "./ErrorComponents/NoAccess";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

// Archived Component
const ArchiveCard = () => {
  const [archives, setArchives] = useState([]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null); // Store the user ID

  useEffect(() => {
    isAuthenticatedDetails(setIsLoggedIn, setUserId);
    if (userId) {
      fetchArchivedData(userId);
    }
  }, [userId]);

  const fetchArchivedData = async (userId) => {
    const data = await readArchivedPlans(userId);
    const archiveArray = Object.keys(data).map((key) => ({
      id: key,
      ...data[key],
    }));
    setArchives(archiveArray);
  };

  // Most recently archived month first
  const sortedArchives = [...archives].reverse();

  return (
    <div className="archive_page">
      <div className="archive_topbar">
        <Link to="/Dashboard" className="archive_back">
          <ArrowBackIcon fontSize="small" />
          Go back
        </Link>
      </div>

      {isLoggedIn ? (
        <div className="archive_register">
          <header className="archive_header">
            <p className="archive_eyebrow">Archive</p>
            <h1 className="archive_title">Archived plans</h1>
          </header>

          {sortedArchives.length > 0 ? (
            <div className="archive_grid">
              {sortedArchives.map((archive, index) => (
                <div key={archive.id ?? index} className="archive_tile">
                  <span className="archive_stamp">Archived</span>

                  <h3 className="archive_month">{archive.month}</h3>

                  <p className="archive_amount_row">
                    <span className="archive_amount_label">Total amount</span>
                    <span
                      className="archive_amount"
                      style={{
                        color:
                          archive.amount < 0
                            ? "var(--negative)"
                            : "var(--positive)",
                      }}
                    >
                      {archive.amount} <span className="archive_currency">PLN</span>
                    </span>
                  </p>

                  <div className="archive_controls">
                    <button
                      type="button"
                      className="archive_icon_btn"
                      aria-label={`Edit archived plan for ${archive.month}`}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </button>
                    <button
                      type="button"
                      className="archive_icon_btn archive_icon_btn--danger"
                      aria-label={`Delete archived plan for ${archive.month}`}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="archive_empty">
              <p>No plans archived yet.</p>
              <p className="archive_empty_sub">
                Close a month on the Planning page to file it here.
              </p>
            </div>
          )}
        </div>
      ) : (
        <NoAccess />
      )}
    </div>
  );
};

export default ArchiveCard;
