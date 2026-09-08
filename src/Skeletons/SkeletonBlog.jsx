import * as React from "react";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

export default function SkeletonBlog() {
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "row" }}>
      <Stack spacing={1}>
        <Skeleton
          variant="rectangular"
          animation="wave"
          width={310}
          height={60}
        />
        <Skeleton
          variant="rectangular"
          animation="wave"
          width={210}
          height={10}
        />
        <Skeleton
          variant="rectangular"
          animation="wave"
          width={210}
          height={10}
        />
        <Skeleton
          variant="rectangular"
          animation="wave"
          width={60}
          height={10}
        />
      </Stack>
    </div>
  );
}
