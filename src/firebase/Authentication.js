import {
  // createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  // signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { initializeApp } from "firebase/app";
import { app } from "./Firebase";
import { ADMIN_KEY } from "./CONSTANTS";

const Auth = getAuth();

export const isAuthenticated = (setIsloggedState, userId) => {
  onAuthStateChanged(Auth, (user) => {
    if (user) {
      setIsloggedState(true);
    } else {
      setIsloggedState(false);
    }
  });
};

export const isAuthenticatedDetails = (setIsloggedState, setUserId) => {
  onAuthStateChanged(Auth, (user) => {
    if (user) {
      // User is authenticated, so set the logged state to true and set the userId
      setIsloggedState(true);
      setUserId(user.uid); // Pass the user's UID to the setUserId function
    } else {
      // User is not authenticated, set the logged state to false and clear userId
      setIsloggedState(false);
      setUserId(null); // Reset userId when the user logs out
    }
  });
};

export const getLoggedUser = (setIsloggedState) => {
  onAuthStateChanged(Auth, (user) => {
    if (user) {
      setIsloggedState(user);
    } else {
      console.log("No user logged in")
    }
  });
}


export const LogoutUser = () => {
  signOut(Auth)
    .then(() => {
        console.log("// Sign-out successful.");
    })
    .catch((error) => {     
      console.log(error);
    });
};

export const checkUser = () => {
  let currentUser = Auth.currentUser;
  return currentUser;
};

export const checkIfAdmin = (userUID) => {
  return userUID === ADMIN_KEY;
};