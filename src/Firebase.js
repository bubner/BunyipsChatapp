/**
 *    Firebase configuration module for access to authentication and message storage.
 *    @author Lucas Bubner, 2023
 */

// https://firebase.google.com/docs/web/setup#available-libraries
import { useEffect } from "react";
import { initializeApp, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, push, child, onValue } from "firebase/database";
import { getStorage } from "firebase/storage";
import Filter from "bad-words";

let app;

try {
    app = getApp();
} catch (error) {
    const firebaseConfig = {
        // Exposure of these Firebase API configurations are not a security risk,
        // and as such will not be put into a system environment variable.
        apiKey: "AIzaSyDtsmCd5dKHhW5nqS_tlZSgrbmADdheHtI",
        authDomain: "bunyips-chatapp.firebaseapp.com",
        projectId: "bunyips-chatapp",
        databaseURL: "https://bunyips-chatapp-default-rtdb.asia-southeast1.firebasedatabase.app",
        storageBucket: "bunyips-chatapp.appspot.com",
        messagingSenderId: "310936661036",
        appId: "1:310936661036:web:b654ba95b6414966c8f589",
        measurementId: "G-JN89PXFP9N",
    };
    app = initializeApp(firebaseConfig);
}

// Initialise Firebase authentication and databases
const storage = getStorage(app);
const auth = getAuth(app);
const db = getDatabase(app);

// Provide Google sign in functionality and automatically registers a user into the auth instance
export function signInWithGoogle() {
    signInWithPopup(auth, new GoogleAuthProvider()).catch((error) => {
        alert("Google Auth Error: " + error.code + " : " + error.message + " on email: " + error.customData.email);
    });
}

// Check if a user has logged in before and give them base permissions if they haven't
export function useAuthStateChanged() {
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Check if the user already exists in the "users" node
                onValue(ref(db, `users/${user.uid}`), (snapshot) => {
                    // If the user already exists, do nothing
                    if (snapshot.exists()) {
                        return null;
                    }

                    // Otherwise, create new user data with all permissions restricted
                    const userData = {
                        email: user.email,
                        read: false,
                        write: false,
                        admin: false,
                    };

                    // Create a new user node with the user's UID as the key
                    return set(ref(db, `users/${user.uid}`), userData);
                });
            }
        });

        // Clean up function
        return () => unsubscribe();
    }, []);
}

// Function to check if a message is over the character limit
export function isMessageOverLimit(message) {
    return message.length > 4000;
}

// Function to add a message to Firebase
export async function uploadMsg(formVal) {
    // Prevent adding blank messages into Firebase
    if (!formVal) return;

    // Stop requests that have too many characters (>4000)
    if (isMessageOverLimit(formVal)) {
        alert("Message exceeds the maximum length of 4000 characters. Please shorten your message.");
        return;
    }

    // Add to Firebase with UID, content, and user info
    const word = new Filter();
    const msgID = push(child(ref(db), "messages")).key;
    await set(ref(db, "messages/" + msgID), {
        isMsg: true,
        isRetracted: false,
        id: msgID,
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        text: word.clean(formVal),
        photoURL: auth.currentUser.photoURL,
        createdAt: Date.now(),
    }).catch((error) => alert(error));
}

export async function uploadFileMsg(url, type) {
    const msgID = push(child(ref(db), "messages")).key;
    await set(ref(db, "messages/" + msgID), {
        isMsg: false,
        isRetracted: false,
        id: msgID,
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        text: type + ":" + url,
        photoURL: auth.currentUser.photoURL,
        createdAt: Date.now(),
    }).catch((error) => alert(error));
}

export async function isAdminAuthorised(user) {}

export async function isReadAuthorised(user) {}

export async function isWriteAuthorised(user) {}

export async function messageOwner(message) {}

export async function removeRead(user) {}

export async function removeWrite(user) {}

export async function addRead(user) {}

export async function addWrite(user) {}

export async function clearMsgs() {}

export { auth, db, storage };
