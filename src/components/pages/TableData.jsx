import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TablePaginationActions from "./TablePaginationActions";
import { formatTime } from "../../Helpers/Helpers";
import { formatAmount } from "../../Helpers/formatAmount";
import TransactionForm from "./TransactionForm";

// Budgeto ledger palette
const ink = "#1C2B29";
const paperCard = "#FFFFFF";
const tealDeep = "#0B646C";
const line = "#DDE3D7";
const muted = "#4D5F55";

// Keys are lower-case because the lookup lower-cases the row's type.
// (The old map used "isNotMine", which could never match a lower-cased
// "isnotmine", so those rows never got their blue background.)
const TYPE_STYLES = {
  income: { label: "Income", bg: "#E3F1E6", fg: "#1F5A38" },
  expense: { label: "Expense", bg: "#F8E3E0", fg: "#8C2B21" },
  extra: { label: "Extra", bg: "#E9ECE6", fg: "#3F4B45" },
  isnotmine: { label: "Not mine", bg: "#E1ECF7", fg: "#1F4E7A" },
};

const fontSans = '"Inter", -apple-system, BlinkMacSystemFont, sans-serif';
const fontMono = '"IBM Plex Mono", ui-monospace, monospace';

const cellSx = {
  fontFamily: fontSans,
  fontSize: "0.9rem",
  color: ink,
  borderBottom: `1px solid ${line}`,
  py: 1.5,
};

const headCellSx = {
  ...cellSx,
  py: 1.25,
  fontSize: "0.8rem",
  fontWeight: 600,
  color: muted,
  backgroundColor: "#F6F8F3",
  whiteSpace: "nowrap",
};

// Hidden on phones; that information moves under the title instead
const hideOnPhone = { display: { xs: "none", sm: "table-cell" } };

function TypeChip({ type }) {
  if (!type) {
    return (
      <Box component="span" sx={{ color: muted }}>
        N/A
      </Box>
    );
  }

  const style = TYPE_STYLES[String(type).toLowerCase()] || {
    label: type,
    bg: "#EEF1EA",
    fg: ink,
  };

  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1.25,
        py: 0.25,
        borderRadius: 999,
        fontFamily: fontSans,
        fontSize: "0.78rem",
        fontWeight: 600,
        lineHeight: 1.6,
        whiteSpace: "nowrap",
        backgroundColor: style.bg,
        color: style.fg,
      }}
    >
      {style.label}
    </Box>
  );
}

function formatRowAmount(raw) {
  if (raw === undefined || raw === null || raw === "") return "N/A";
  const n = Number(raw);
  return Number.isNaN(n) ? "N/A" : formatAmount(n);
}

export default function TableData({ fetchDataFunction }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [data, setData] = React.useState([]);
  const [selectedTransaction, setSelectedTransaction] = React.useState(null);

  // Fetch data when the component mounts or fetchDataFunction changes
  React.useEffect(() => {
    fetchDataFunction(setData);
  }, [fetchDataFunction]);

  // If the list shrinks (filter change, deletion), don't strand the user
  // on a page that no longer exists
  React.useEffect(() => {
    if (page > 0 && page * rowsPerPage >= data.length) setPage(0);
  }, [data.length, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const visibleRows =
    rowsPerPage > 0
      ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : data;

  const openTransaction = (transaction) => setSelectedTransaction(transaction);
  const closeTransaction = () => setSelectedTransaction(null);

  const handleRowKeyDown = (event, row) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openTransaction(row);
    }
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: paperCard,
          border: `1px solid ${line}`,
          borderRadius: "12px",
          boxShadow: "0 1px 2px rgba(28, 43, 41, 0.04)",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table aria-label="Transactions">
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx}>Transaction</TableCell>
                <TableCell sx={{ ...headCellSx, ...hideOnPhone }}>Date</TableCell>
                <TableCell align="right" sx={headCellSx}>
                  Amount
                </TableCell>
                <TableCell sx={{ ...headCellSx, ...hideOnPhone }}>Type</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleRows.map((row, index) => {
                const dateText = row.createdAt
                  ? formatTime(row.createdAt)
                  : "N/A";

                return (
                  <TableRow
                    key={row.id ?? `${page}-${index}`}
                    hover
                    tabIndex={0}
                    onClick={() => openTransaction(row)}
                    onKeyDown={(event) => handleRowKeyDown(event, row)}
                    aria-haspopup="dialog"
                    sx={{
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "rgba(14, 124, 134, 0.06)" },
                      "&:focus-visible": {
                        outline: `2px solid ${tealDeep}`,
                        outlineOffset: -2,
                      },
                    }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ ...cellSx, fontWeight: 500 }}
                    >
                      {row.title}

                      {/* phones: date and type sit under the title */}
                      <Box
                        sx={{
                          display: { xs: "flex", sm: "none" },
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 1,
                          mt: 0.75,
                          fontSize: "0.8rem",
                          fontWeight: 400,
                          color: muted,
                        }}
                      >
                        <span>{dateText}</span>
                        <TypeChip type={row.type} />
                      </Box>
                    </TableCell>

                    <TableCell
                      sx={{
                        ...cellSx,
                        ...hideOnPhone,
                        color: muted,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {dateText}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        ...cellSx,
                        fontFamily: fontMono,
                        fontWeight: 500,
                        fontVariantNumeric: "tabular-nums",
                        whiteSpace: "nowrap",
                        verticalAlign: "top",
                      }}
                    >
                      {formatRowAmount(row.amount)}
                    </TableCell>

                    <TableCell sx={{ ...cellSx, ...hideOnPhone }}>
                      <TypeChip type={row.type} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Outside the <Table>: no colSpan footer hack, and it can wrap on phones */}
        <TablePagination
          component="div"
          rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions}
          sx={{
            borderTop: `1px solid ${line}`,
            color: muted,
            fontFamily: fontSans,
            "& .MuiTablePagination-toolbar": {
              px: { xs: 1.5, sm: 2 },
              minHeight: 52,
              justifyContent: { xs: "space-between", sm: "flex-end" },
            },
            "& .MuiTablePagination-spacer": {
              display: { xs: "none", sm: "block" },
            },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              { fontFamily: fontSans, fontSize: "0.85rem", margin: 0 },
            // "Rows per page" is too wide for phones; the default is fine there
            "& .MuiTablePagination-selectLabel": {
              display: { xs: "none", sm: "block" },
            },
            "& .MuiTablePagination-input": {
              display: { xs: "none", sm: "inline-flex" },
              fontFamily: fontSans,
              fontSize: "0.85rem",
            },
          }}
        />
      </Box>

      {selectedTransaction && (
        <TransactionForm
          open
          handleClose={closeTransaction}
          transaction={selectedTransaction}
        />
      )}
    </>
  );
}
