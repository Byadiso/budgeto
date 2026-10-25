import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import { useTheme } from "@mui/material/styles";

const ink = "#1C2B29";
const tealDeep = "#0B646C";

const buttonSx = {
  color: ink,
  "&.Mui-disabled": { color: "rgba(28, 43, 41, 0.3)" },
  "&.Mui-focusVisible": { outline: `2px solid ${tealDeep}` },
};

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;
  const isRtl = theme.direction === "rtl";

  // rowsPerPage is -1 for "All", which means a single page
  const lastPage =
    rowsPerPage > 0 ? Math.max(0, Math.ceil(count / rowsPerPage) - 1) : 0;
  const atFirst = page <= 0;
  const atLast = page >= lastPage;

  return (
    <Box sx={{ flexShrink: 0, ml: { xs: 0, sm: 2.5 }, display: "flex" }}>
      {/* first / last are skipped on phones; previous / next are enough */}
      <IconButton
        onClick={(event) => onPageChange(event, 0)}
        disabled={atFirst}
        aria-label="First page"
        sx={{ ...buttonSx, display: { xs: "none", sm: "inline-flex" } }}
      >
        {isRtl ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={(event) => onPageChange(event, page - 1)}
        disabled={atFirst}
        aria-label="Previous page"
        sx={buttonSx}
      >
        {isRtl ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={(event) => onPageChange(event, page + 1)}
        disabled={atLast}
        aria-label="Next page"
        sx={buttonSx}
      >
        {isRtl ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={(event) => onPageChange(event, lastPage)}
        disabled={atLast}
        aria-label="Last page"
        sx={{ ...buttonSx, display: { xs: "none", sm: "inline-flex" } }}
      >
        {isRtl ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

export default TablePaginationActions;
