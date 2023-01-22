/**
 *    Firebase configuration module for access to authentication and message storage.
 *    Contains utility methods for accessing user data and authorising internal application functions.
 *    @author Lucas Bubner, 2023
 */

// https://firebase.google.com/docs/web/setup#available-libraries
import { useEffect } from "react";
import { initializeApp, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, push, child, onValue, get, update, remove } from "firebase/database";
import { getStorage, ref as sref, deleteObject, listAll } from "firebase/storage";
import { getFileURL } from "./Message";
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

    // Stop requests that have too many characters (> 4000)
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

export async function updateMsg(id, content) {
    await update(ref(db, "messages/" + id), content);
}

export async function deleteMsg(id) {
    // Get the message reference from Firebase
    getData("messages", id).then(async (data) => {
        if (!data.isMsg) {
            // Check if the document contains a file, if so, we'll have to delete from Firebase storage too
            const fileRef = sref(storage, getFileURL(data.text));
            await deleteObject(fileRef).catch((err) => alert(err));
        }
        // Now we can safely delete the message as we've deleted any other objects related to it
        await remove(ref(db, "messages/" + id));
    });
}

export async function getData(endpoint, id) {
    let datavalue = null;
    await get(child(ref(db), `${endpoint}/${id}`)).then((snapshot) => {
        if (snapshot.exists()) datavalue = snapshot.val();
    });
    return datavalue;
}

export async function removeRead(uid) {
    getData("users", uid).then(async (data) => {
        if (uid === auth.currentUser.uid) {
            alert("You cannot remove your own read permission as an administrator.");
            return;
        }
        if (!window.confirm("Remove read permission from " + data.email + "?")) return;
        await update(ref(db, "users/" + uid), {
            read: false,
        });
    });
}

export async function removeWrite(uid) {
    getData("users", uid).then(async (data) => {
        if (!window.confirm("Remove write permission from " + data.email + "?")) return;
        await update(ref(db, "users/" + uid), {
            write: false,
        });
    });
}

export async function addRead(uid) {}

export async function addWrite(uid) {}

export async function clearDatabases() {
    // User confirmations
    if (!window.confirm("WARNING: You are about to delete all database messages. Are you sure you want to continue?"))
        return;

    const nums = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
    // prettier-ignore
    if (window.prompt(`Please enter these four numbers in order to complete the database transaction: ${nums}`) !==nums.toString()) {
        alert("Operation cancelled.");
        return;
    }

    // Delete all Firebase Storage files
    await listAll(sref(storage, "files")).then((listResults) => {
        const promises = listResults.items.map((item) => {
            return deleteObject(item);
        });
        Promise.all(promises);
    });

    // Delete all Firebase Realtime Database messages
    await remove(ref(db, "messages")).then(() => {
        alert("Operation completed. A reload is required.");
        window.location.reload();
    });
}

export { auth, db, storage };
