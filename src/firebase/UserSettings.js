import { db } from "./Firebase";
import { ref as dbRef, set, get, remove, update, push, serverTimestamp } from "firebase/database";

/**
 * Create a new setting with a reference to the logged-in user's ID.
 */
export const createSetting = async (userId, data) => {

    if (!userId) {
        console.error("User ID is null or undefined");
        return;
      }
      
  const { name, value } = data;
  try {
    const planRef = dbRef(db, `Settings/${userId}`);
    const newSettingRef = push(planRef); // Automatically generates a unique ID
    await set(newSettingRef, {
      name,
      value,
      createdAt: serverTimestamp(), // Store server timestamp directly
      id: newSettingRef.key, // Use the auto-generated key from push
      userId,
    });

    console.log("Setting changed or added created successfully!");
  } catch (error) {
    console.error("Error creating Setting:", error.message);
  }
};

/**
 * Read all settings created by the logged-in user.
 */
export const readSetting = async (userId) => {
  try {
    const settingsRef = dbRef(db, `Settings/${userId}`);
    const snapshot = await get(settingsRef);

    if (snapshot.exists()) {
      return snapshot.val(); // Return the raw data
    } else {
      console.error("No Setting found for this user.");
      return {}; // Return an empty object if no data
    }
  } catch (error) {
    console.error("Error fetching plans:", error.message);
    return {}; // Return an empty object in case of error
  }
};

/**
 * Update a setting by ID for the logged-in user.
 */
export const editSetting = async (userId, id, updatedData) => {
  const { name, value } = updatedData;
  try {
    const settingRef = dbRef(db, `Settings/${userId}/${id}`);
    await update(settingRef, {
      name,
      value,
      updatedAt: serverTimestamp(), //Store server timestamp directly
    });

    console.log("Plan updated successfully!");
  } catch (error) {
    console.error("Error updating plan:", error.message);
  }
};

/**
 * Delete a setting by ID for the logged-in user.
 */
export const deleteSetting = async (userId, id) => {
  try {
    const settingRef = dbRef(db, `Settings/${userId}/${id}`);
    await remove(settingRef);
    console.log("Setting deleted successfully!");
  } catch (error) {
    console.error("Error deleting setting:", error.message);
  }
};
