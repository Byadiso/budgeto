// import { getDatabase , onValue, serverTimestamp, set } from "firebase/database";
// import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

import { database, storage } from './Firebase';
import {app} from "./Firebase";


import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { ref as dbRef, set, serverTimestamp, getDatabase } from "firebase/database";


const db = getDatabase();



export const createBlog = async (image, body, title) => {
  try {
    // Upload image to Firebase Storage
    const imageName = image.name;
    const storageRef = ref(storage, "images/" + imageName);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("Error uploading image:", error.message);
      }
    );

    // Wait for the upload to complete and get the download URL
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    // Generate a unique random ID (consider using a more robust method like UUID)
    const id = Math.floor(Math.random() * 1000000); // 6-digit random number

    // Save blog data to Firebase Realtime Database
    await set(dbRef(db, "blogs/" + id), {
      title,
      body,
      createdAt: serverTimestamp(),
      Image: downloadURL,
      id,
    });

    console.log("Blog added successfully!");
  } catch (error) {
    console.error("Error saving blog data:", error.message);
  }
};
