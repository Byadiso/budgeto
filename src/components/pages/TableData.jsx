import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableHead from '@mui/material/TableHead';
import TablePaginationActions from './TablePaginationActions'; 
import { formatTime } from '../../Helpers/Helpers';
import TransactionForm from './TransactionForm'; 


const typeColors = {
  income: '#D4EDDA', 
  expense: '#F8D7DA', 
  extra: '#E2E3E5', 
  isNotMine: '#CFE2FF', 
};

export default function TableData({ fetchDataFunction }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [data, setData] = React.useState([]);
  const [openModal, setOpenModal] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState(null);

  // Fetch data when the component mounts or fetchDataFunction changes
  React.useEffect(() => {
    fetchDataFunction(setData);
  }, [fetchDataFunction]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate empty rows for pagination
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  // Handle row click to open the modal
  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTransaction(null);
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 300 }} aria-label="custom pagination table">
          <TableHead>
            <TableRow>
              <TableCell>Transaction</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : data
            ).map((row, index) => {
              const normalizedType = (row.type || '').toLowerCase();
              return (
                <TableRow
                  key={index}
                  onClick={() => handleRowClick(row)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell component="th" scope="row">
                    {row.title}
                  </TableCell>
                  <TableCell>{row.createdAt ? formatTime(row.createdAt) : 'N/A'}</TableCell>
                  <TableCell>{row.amount || 'N/A'} PLN</TableCell>
                  <TableCell
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      backgroundColor: typeColors[normalizedType] || '#FFFFFF', 
                      color: '#000000', 
                    }}
                    align="right"
                  >
                    {row.type || 'N/A'}
                  </TableCell>
                </TableRow>
              );
            })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={4} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={4}
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      {selectedTransaction && (
        <TransactionForm
          open={openModal}
          handleClose={handleCloseModal}
          transaction={selectedTransaction}
        />
      )}
    </div>
  );
}
