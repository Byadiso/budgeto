import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { IconButton, TextField  } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { listBlog } from "../firebase/getBlogs";

export default function EditForm(props) {
  const [blogs, setBlogList] =useState([])
  const [open, setOpen] = React.useState(false); 
  const [blogToEdit, setBlogToEdit] = useState()
  
  
  console.log(blogToEdit && blogToEdit[0].title)
  const handleOpen = () => {
    getblog()
    setOpen(true)
  };
  const getblog = ()=>{ 
    const blog = blogs.filter((blog) => blog.id ===props.id);
    setBlogToEdit(blog)    
  }

  const handleClose = () => setOpen(false);

  
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
      <IconButton>
        <EditNoteIcon onClick={handleOpen} />
      </IconButton>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" sx={{ mt: 2 }}>
            Your blog post
          </Typography>         

          <TextField
            id="outlined-multiline-flexible"
            
            fullWidth
            margin="10px"
            padding="10px"
            multiline
            value={blogToEdit && blogToEdit[0].title}
            maxRows={1}
            name="title"
          />
          <TextField
            id="outlined-multiline-flexible"            
            fullWidth
            multiline
            value={blogToEdit && blogToEdit[0].body}
            maxRows={4}
            name="body"
          />
          <Button variant="contained">Update</Button>
        </Box>
      </Modal>
    </div>
  );
}
