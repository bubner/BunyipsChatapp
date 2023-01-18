/**
 *    Firebase configuration module for access to authentication and message storage.
 *    @author Lucas Bubner, 2023
 */

// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { serverTimestamp, setDoc, collection, getFirestore, doc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import Filter from "bad-words";

let app;
let storage;

try {
    app = getApp();
} catch (error) {
    const firebaseConfig = {
        // Exposure of these Firebase API configurations are not a security risk,
        // and as such will not be put into a system environment variable.
        apiKey: "AIzaSyDtsmCd5dKHhW5nqS_tlZSgrbmADdheHtI",
        authDomain: "bunyips-chatapp.firebaseapp.com",
        projectId: "bunyips-chatapp",
        storageBucket: "bunyips-chatapp.appspot.com",
        messagingSenderId: "310936661036",
        appId: "1:310936661036:web:b654ba95b6414966c8f589",
        measurementId: "G-JN89PXFP9N",
    };
    app = initializeApp(firebaseConfig);
}
storage = getStorage(app);

// Initialise Firebase authentication and database
const auth = getAuth(app);
const db = getFirestore(app);

// Provide Google sign in functionality and automatically registers a user into the auth instance
export function signInWithGoogle() {
    signInWithPopup(auth, new GoogleAuthProvider()).catch((error) => {
        alert("Google Auth Error: " + error.code + " : " + error.message + " on email: " + error.customData.email);
    });
}

// Function to add a message to Firestore
export async function sendMsg(formVal) {
    // Prevent adding blank messages into Firestore
    if (!formVal) return;

    // Stop requests that have too many characters (>4000)
    if (formVal.length > 4000) {
        alert("Message exceeds the maximum length of 4000 characters. Please shorten your message.");
        return;
    }

    // Add to Firestore with UID, content, and user info
    const word = new Filter();
    const msgID = doc(collection(db, "messages"));
    await setDoc(msgID, {
        isMsg: true,
        isRetracted: false,
        id: msgID,
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName,
        text: word.clean(formVal),
        photoURL: auth.currentUser.photoURL,
        createdAt: serverTimestamp(),
    }).catch((error) => alert(error));
}

export async function uploadFileDoc(url, type) {
    const msgID = doc(collection(db, "messages"));
    await setDoc(msgID, {
        isMsg: false,
        isRetracted: false,
        id: msgID,
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName,
        text: type + ":" + url,
        photoURL: auth.currentUser.photoURL,
        createdAt: serverTimestamp(),
    }).catch((error) => alert(error));
}

export { auth, db, storage };
