import * as React from "react";
import Skeleton from "@mui/material/Skeleton";
import { Grid } from "@mui/material";

export default function SkeletonDashboard() {
  return (
    <Grid
      container
      spacing={{ xs: 3, md: 3 }}
      columns={{ xs: 2, sm: 8, md: 12 }}
    >
      <Grid item xs={4}>
        <Skeleton variant="circular" animation="wave" width={40} height={40} />
      </Grid>
      <Grid item xs={8}>
        <Skeleton
          variant="rectangular"
          animation="wave"
          width={250}
          height={10}
        />
        <Skeleton
          variant="rectangular"
          animation="wave"
          width={250}
          height={10}
        />
      </Grid>
    </Grid>
  );
}
