import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { IconButton } from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import { listBlog } from "../firebase/getBlogs";
import { deleteBlog } from "../firebase/createBlog";

export default function DeleteModal(props) {
  const [blogs, setBlogList] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [blogToDelete, setBlogToDelete] = useState();
  const [isDeleted, setIsDeleted] = useState(false);

  const handleOpen = () => {
    getblog();
    setOpen(true);
  };
  const getblog = () => {
    const blog = blogs.filter((blog) => blog.id === props.id);
    setBlogToDelete(blog);
  };

  const handleClose = () => {
    setOpen(false);
    setIsDeleted(false);
  };

  const handleDelete = () => {
    setIsDeleted(true);
    deleteBlog(props.id);
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    border: "1px solid grey",
    padding: "10px",
    margin: "10px",
    boxShadow: 24,
    p: 4,
  };
  useEffect(() => {
    listBlog(setBlogList);
  }, []);

  return (
    <div>
      <IconButton onClick={handleOpen}>
        <DeleteIcon style={{ color: "pink" }} />
      </IconButton>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" sx={{ mt: 2 }}>
            {!isDeleted ? "Are you sure you want to delete this blog?" : null}
          </Typography>
          <Typography id="modal-modal-title" sx={{ mt: 2 }}>
            {!isDeleted
              ? blogToDelete && blogToDelete[0].title
              : "Your blog has been deleted successfully!"}
          </Typography>

          {!isDeleted ? (
            <Button
              variant="contained"
              style={{ backgroundColor: "pink", margin: "20px" }}
              onClick={handleDelete}
            >
              Yes
            </Button>
          ) : null}
          <Button
            variant="contained"
            style={{ margin: isDeleted ? "20px" : "0" }}
            onClick={handleClose}
          >
            Return
          </Button>
        </Box>
      </Modal>
    </div>
  );
}
