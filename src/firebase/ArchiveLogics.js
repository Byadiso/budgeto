import { db } from "./Firebase";
import { ref as dbRef, set, get, remove, update, push, serverTimestamp } from "firebase/database";

/**
 * Archive the current month's plan with reference to the logged-in user's ID.
 */
export const archivePlan = async (userId, plan) => {
  if (!userId) {
    console.error("User ID is null or undefined");
    return;
  }

  const { month, amount } = plan;
 

  try {
    const archiveRef = dbRef(db, `Archives/${userId}`);
    const newArchiveRef = push(archiveRef); // Generate a unique archive ID
    await set(newArchiveRef, {
        month,
        amount, 
      archivedAt: serverTimestamp(),  // Archive timestamp      
      id: newArchiveRef.key,
      userId,
    });

    console.log("Plan archived successfully!");
  } catch (error) {
    console.error("Error archiving plan:", error.message);
  }
};

/**
 * Read all archived plans by the logged-in user.
 */
export const readArchivedPlans = async (userId) => {
  try {
    const archiveRef = dbRef(db, `Archives/${userId}`);
    const snapshot = await get(archiveRef);

    if (snapshot.exists()) {
      return snapshot.val(); // Return all archived plans
    } else {
      console.error("No archived plans found for this user.");
      return {}; 
    }
  } catch (error) {
    console.error("Error fetching archived plans:", error.message);
    return {}; 
  }
};

/**
 * Update an archived plan by ID for the logged-in user.
 */
export const editArchivedPlan = async (userId, id, updatedData) => {
  const { month, amount} = updatedData;
  try {
    const archiveRef = dbRef(db, `Archives/${userId}/${id}`);
    await update(archiveRef, {
        month,
        amount,      
         updatedAt: serverTimestamp(), 
    });

    console.log("Archived plan updated successfully!");
  } catch (error) {
    console.error("Error updating archived plan:", error.message);
  }
};

/**
 * Delete an archived plan by ID for the logged-in user.
 */
export const deleteArchivedPlan = async (userId, id) => {
  try {
    const archiveRef = dbRef(db, `Archives/${userId}/${id}`);
    await remove(archiveRef);
    console.log("Archived plan deleted successfully!");
  } catch (error) {
    console.error("Error deleting archived plan:", error.message);
  }
};
