import {  db, storage } from "./Firebase";

import {
  ref as dbRef,
  set,
  serverTimestamp,
  remove,
  get,
  update,
} from "firebase/database";


export const createTransaction = async (data) => {
  let { title, amount, type } = data;
  try {
    // Generate a unique random ID (consider using a more robust method like UUID)
    const id = Math.floor(Math.random() * 1000000); // 6-digit random number
    // Construct the database path
    const transactionRef = dbRef(db, "Transactions/" + id);

    // Check if the path exists in the database
    const snapshot = await get(transactionRef);
    if (!snapshot.exists()) {
      // If the path doesn't exist, create it
      await set(transactionRef, {
        title,
        amount,
        type,
        createdAt: serverTimestamp(),
        id,
      });
      console.log("Transaction added successfully!");
    } else {
      console.error("Transaction path already exists!");
    }
  } catch (error) {
    console.error("Error saving transaction data:", error.message);
  }
};

export const deleteTransaction = async (id) => {
  try {
    //remove transaction if I am the admin user
    await remove(dbRef(db, "Transactions/" + id), function (error) {
      if (error) {
        console.log("delete error" + error);
      }else{
        console.log("Transaction deleted successfully")
      }
    });
  } catch (error) {
    console.error("Error deleting Transaction :", error.message);
  }
};

export const editTransaction = async (data, id) => {
  let { title, amount } = data;
  try {
    // Upload image to Firebase Storage
    if (title === undefined) {
      const blogRef = dbRef(db, "Transactions/" + id);
      await update(blogRef, {
        title,
        amount,
        createdAt: serverTimestamp(),       
        id: id,
      });
    } else {   
       // Save blog data to Firebase Realtime Database
      const blogRef = dbRef(db, "Transactions/" + id);
      await update(blogRef, {
        title,
        amount,
        createdAt: serverTimestamp(),      
        id: id,
      });
    }
  } catch (error) {
    console.error("Error saving blog data:", error.message);
  }
};
