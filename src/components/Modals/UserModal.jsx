import React, { useState } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "8px",
  p: 4,
};

const UserModal = ({ isOpen, onClose, onSave }) => {
  const [dropdownValue, setDropdownValue] = useState("");
  const [textFieldValue, setTextFieldValue] = useState("");

  const handleSave = () => {
    onSave(dropdownValue, textFieldValue);
    setDropdownValue(""); // Clear fields after saving
    setTextFieldValue("");
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Add New Goal
        </Typography>

        {/* Dropdown Field */}
        <Box sx={{ mb: 2 }}>
          <TextField
            select
            label="Choose a Setting"
            fullWidth
            value={dropdownValue}
            onChange={(e) => setDropdownValue(e.target.value)}
          >
            <MenuItem value="" disabled>
              -- Choose a Setting --
            </MenuItem>
            <MenuItem value="Option 1">Goal Amount</MenuItem>
            <MenuItem value="Option 2">Home expense Amount</MenuItem>
           
          </TextField>
        </Box>

        {/* Text Input Field */}
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Enter text"
            fullWidth
            value={textFieldValue}
            onChange={(e) => setTextFieldValue(e.target.value)}
          />
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!dropdownValue || !textFieldValue}
          >
            Save
          </Button>
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UserModal;
