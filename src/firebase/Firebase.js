import { initializeApp } from "firebase/app";
import 'firebase/auth';
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import 'firebase/firestore';
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyDwrBTO77z2Z-O2HfBZ6yxO5NJG2gUo4dg",
  authDomain: "bugdeto.firebaseapp.com",
  databaseURL: "https://bugdeto-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bugdeto",
  storageBucket: "bugdeto.appspot.com",
  messagingSenderId: "1013395788593",
  appId: "1:1013395788593:web:5d7d10a30ebc5364dbd610",
  measurementId: "G-LD959Z9TBW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getDatabase(app);


export  {app, auth,storage, db};




 