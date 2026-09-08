import * as React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
// import FormLabel from '@mui/material/FormLabel';

export default function RadioComponent(props) {
  return (
    <FormControl>
      {/* <FormLabel id="demo-row-radio-buttons-group-label">Gender</FormLabel> */}
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name={props.name}      
        onChange={props.handleChange}
      >
        <FormControlLabel value="Expense" control={<Radio />} label="Expenses" />
        <FormControlLabel value="Income" control={<Radio />} label="Income" />    
        <FormControlLabel value="Extra" control={<Radio />} label="Extra" /> 
        <FormControlLabel value="whatIsNotMine" control={<Radio />} label="what Is Not Mine" /> 
       
      </RadioGroup>
    </FormControl>
  );
}
