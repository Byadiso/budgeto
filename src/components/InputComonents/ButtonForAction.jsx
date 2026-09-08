import * as React from 'react';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
// import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

export default function ButtonForAction(props) {
  return (
    <Box sx={{ '& > :not(style)': { m: 1 } }}>     
      <Fab variant="extended" size="medium" color={props.isActive ? "primary":"none"} onClick={props.handleOnClick}>
        <LibraryBooksIcon sx={{ mr: 1 }} />
        {props.type}
      </Fab>     
    </Box>
  );
}