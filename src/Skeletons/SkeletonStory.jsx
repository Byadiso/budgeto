import * as React from "react";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { Card } from "@mui/material";

export default function SkeletonStory() {
  return (
    <Card
      sx={{
        maxWidth: 850,
        margin: "20px",
        marginBottom: "10px",
        padding: "65px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack spacing={1}>
        <Skeleton
          variant="rectangular"
          animation="wave"
          width={50}
          height={10}
        />
        <Skeleton
          variant="rectangular"
          animation="wave"
          width={110}
          height={10}
        />
        <Skeleton
          variant="rectangular"
          animation="wave"
          width={410}
          height={200}
        />
        <Skeleton
          variant="rectangular"
          animation="wave"
          width={110}
          height={10}
        />
        <Skeleton
          variant="rectangular"
          animation="wave"
          width={50}
          height={10}
        />       
      </Stack>
    </Card>
  );
}
