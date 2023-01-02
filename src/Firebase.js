// Import the functions you need from the SDKs you need
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
let app;
let storage;

try {
    app = getApp();
} catch (error) {
    const firebaseConfig = {
        apiKey: "AIzaSyDtsmCd5dKHhW5nqS_tlZSgrbmADdheHtI",
        authDomain: "bunyips-chatapp.firebaseapp.com",
        projectId: "bunyips-chatapp",
        storageBucket: "bunyips-chatapp.appspot.com",
        messagingSenderId: "310936661036",
        appId: "1:310936661036:web:b654ba95b6414966c8f589",
        measurementId: "G-JN89PXFP9N"
    };
    app = initializeApp(firebaseConfig);
}
storage = getStorage(app);

// Initialize Firebase authentication and database
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, storage };