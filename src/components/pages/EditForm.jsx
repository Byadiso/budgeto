import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { IconButton, TextField } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { listBlog } from "../firebase/getBlogs";
import InputFileUpload from "../InputComonents/FileUpload";
import { editBlog } from "../firebase/createBlog";

export default function EditForm(props) {
  const [blogs, setBlogList] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [blogToEdit, setBlogToEdit] = useState({});
  const [isUpdated, setIsUpdated] = useState(false);
  const [error, setError] = useState("");
  const [preview,setPreview] = useState('');

  const handleOpen = () => {
    getblog();
    setOpen(true);    
  };

  const getblog = () => {
    const blog = blogs.filter((blog) => blog.id === props.id);
    let blogNew = {
      title: blog[0].title,
      body: blog[0].body,
      Image: blog[0].Image,
    };
    setBlogToEdit(blogNew);
  };

  const handleClose = () => {
    setOpen(false);
    setIsUpdated(false);
    setPreview("")
  };

  const handleUpdate = () => {
    editBlog(blogToEdit, props.id);
    setIsUpdated(true);
  };

  const HandleChange = (e) => {
    if (error) {
      setError("");
    }
    if (e.target.name === "title") {
      setBlogToEdit({ ...blogToEdit, title: e.target.value });
    }
    if (e.target.name === "body") {
      setBlogToEdit({ ...blogToEdit, body: e.target.value });
    }
  };

  const handleFileChange = (e) => {
    setBlogToEdit({ ...blogToEdit, Image: e.target.files[0] });
    setPreview(URL.createObjectURL(e.target.files[0]) )
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
    boxShadow: 24,
    p: 4,
  };
  useEffect(() => {
    listBlog(setBlogList);
  }, []);

  return (
    <div>
      <IconButton onClick={handleOpen}>
        <EditNoteIcon />
      </IconButton>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" sx={{ mt: 2 }}>
            {isUpdated
              ? "Your blog post has been updated successfully!"
              : "Your blog post:"}
          </Typography>

          {!isUpdated && (
            <>
              <TextField
                id="outlined-multiline-flexible"
                fullWidth                
                multiline
                defaultValue={blogToEdit && blogToEdit.title}
                maxRows={1}
                onChange={(e) => HandleChange(e)}
                sx={{ marginTop: "10px",margin:"10px",padding:"10px" }}
                name="title"
              />
              <TextField
                id="outlined-multiline-flexible"
                fullWidth
                multiline
                defaultValue={blogToEdit && blogToEdit.body}
                maxRows={4}
                onChange={(e) => HandleChange(e)}
                sx={{ marginTop: "10px" }}
                name="body"
              />
            </>
          )}
          {!isUpdated && (
            <InputFileUpload handleChange={(e) => handleFileChange(e)} />
          )}
          {!isUpdated && preview && <img src={preview} alt="img" style={{width:"100px",height:"80px", marginTop:"10px", borderRadius:"10px"}}/>}
          {!isUpdated && (
            <Button
              variant="contained"
              onClick={handleUpdate}
              style={{ margin: "10px", marginLeft: "0px" }}
            >
              Update
            </Button>
          )}
          {isUpdated && (
            <Button
              variant="contained"
              onClick={handleClose}
              style={{ margin: "10px", marginLeft: "0px" }}
            >
              Return
            </Button>
          )}
        </Box>
      </Modal>
    </div>
  );
}
