import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, Typography, MenuItem, FormControl, Select, InputLabel, TextField } from '@mui/material';
import { editTransaction, deleteTransaction } from '../../firebase/Transaction';

const TransactionForm = ({ open, handleClose, transaction }) => {
  const [formData, setFormData] = useState({ title: '', amount: '', type: '' });

  useEffect(() => {
    if (transaction) {
      setFormData({
        title: transaction.title || '',
        amount: transaction.amount || '',
        type: transaction.type || ''
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    editTransaction(formData, transaction.id); // Update transaction in the database
    handleClose(); // Close modal after updating
  };

  const handleDelete = () => {
    const isConfirmed = window.confirm('Are you sure you want to delete this item?');
    if (isConfirmed) {
      deleteTransaction(transaction.id);
      handleClose();
    }
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  console.log(formData.type)

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2">
          Edit Transaction: <strong>{transaction?.id}</strong>
        </Typography>
        <form onSubmit={handleSubmit}>
          <div>
            <TextField
              label="Description"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </div>
          <div>
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </div>
          <div>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Type"
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
                <MenuItem value="extra">Extra</MenuItem>
                <MenuItem value="isNotMine">Is Not Mine</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div style={{ marginTop: '20px' }}>
            <Button variant="contained" type="submit" style={{ marginRight: '10px' }}>
              Update
            </Button>
            <Button variant="outlined" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default TransactionForm;
