import { db } from "./Firebase";
import { ref as dbRef, set, get, remove, update, push, serverTimestamp } from "firebase/database";

/**
 * Create a new plan with a reference to the logged-in user's ID.
 */
export const createPlan = async (userId, data) => {

    if (!userId) {
        console.error("User ID is null or undefined");
        return;
      }
      
  const { name, amount, category } = data;
  try {
    const planRef = dbRef(db, `Plans/${userId}`);
    const newPlanRef = push(planRef); // Automatically generates a unique ID
    await set(newPlanRef, {
      name,
      amount,
      category,
      createdAt: serverTimestamp(), // Store server timestamp directly
      id: newPlanRef.key, // Use the auto-generated key from push
      userId,
    });

    console.log("Plan created successfully!");
  } catch (error) {
    console.error("Error creating plan:", error.message);
  }
};

/**
 * Read all plans created by the logged-in user.
 */
export const readPlans = async (userId) => {
  try {
    const plansRef = dbRef(db, `Plans/${userId}`);
    const snapshot = await get(plansRef);

    if (snapshot.exists()) {
      return snapshot.val(); // Return the raw data
    } else {
      console.error("No plans found for this user.");
      return {}; // Return an empty object if no data
    }
  } catch (error) {
    console.error("Error fetching plans:", error.message);
    return {}; // Return an empty object in case of error
  }
};

/**
 * Update a plan by ID for the logged-in user.
 */
export const editPlan = async (userId, id, updatedData) => {
  const { name, amount, category } = updatedData;
  try {
    const planRef = dbRef(db, `Plans/${userId}/${id}`);
    await update(planRef, {
      name,
      amount,
      category,
      updatedAt: serverTimestamp(), // Store server timestamp directly
    });

    console.log("Plan updated successfully!");
  } catch (error) {
    console.error("Error updating plan:", error.message);
  }
};

/**
 * Delete a plan by ID for the logged-in user.
 */
export const deletePlan = async (userId, id) => {
  try {
    const planRef = dbRef(db, `Plans/${userId}/${id}`);
    await remove(planRef);
    console.log("Plan deleted successfully!");
  } catch (error) {
    console.error("Error deleting plan:", error.message);
  }
};
