import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

const bull = (
  <Box
    component="span"
    sx={{ display: "inline-block", mx: "1px", transform: "scale(0.8)" }}
  >
    •
  </Box>
);

const card = (
  <React.Fragment>
    <CardContent>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        Total On Account
      </Typography>
      <Typography variant="h5" component="div">
        1000PLN
      </Typography>
    </CardContent>
  </React.Fragment>
);

export default function CardBugdeto(props) {
  return (
    <Box sx={{ minWidth: 275 }}>
      <Card variant="outlined">
      <React.Fragment>
    <CardContent>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        Total On {props.type}
      </Typography>
      <Typography variant="h5" component="div" sx={{ color: props.dataExpense < 0 ? "#FF0000" : "#228B22"}}>
        {props.dataExpense} PLN
      </Typography>
    </CardContent>
  </React.Fragment>
      </Card>
    </Box>
  );
}
