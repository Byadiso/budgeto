import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function InputFileUpload(props) {
  return (
    <Button
      component="label"
      role={undefined}
      variant="contained"
      name="file"
      tabIndex={-1}
      startIcon={<CloudUploadIcon />}
      style={{ marginTop:"10px", backgroundColor:"#4A4D4E"}}
      onChange={props.handleChange}
      
    >
      Upload file
      <VisuallyHiddenInput type="file" />
    </Button>
  );
}
