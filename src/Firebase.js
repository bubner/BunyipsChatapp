/**
 *    Firebase configuration module for access to authentication and message storage.
 *    Contains utility methods for accessing user data and authorising internal application functions.
 *    @author Lucas Bubner, 2023
 */

// https://firebase.google.com/docs/web/setup#available-libraries
import { useEffect } from "react";
import { initializeApp, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, push, child, onValue, get, update, remove, serverTimestamp, onDisconnect } from "firebase/database";
import { getStorage, ref as sref, deleteObject, listAll } from "firebase/storage";
import { getFileURL } from "./Message";

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

// Internal function to handle database errors when retrieving or sending standard information
function errorHandler(err) {
    // Error handler incase Black Mesa decides to do another experiment
    console.error(err);

    // Reload the page and tell the user something went wrong
    if (err.code === 'PERMISSION_DENIED') {
        alert("An error occurred while performing this action as one of your permission nodes is currently out of sync with the application. A page reload is required.");
    } else {
        alert("Sorry! An error occurred attempting to perform the operation you were requesting. If this persists, please contact lbubner21@mbhs.sa.edu.au with this information:\n\n" + err);
    }

    // Reload the page in 5 seconds and try again
    setTimeout(() => window.location.reload(), 5000);
}

// Monitor a user's presence in the database's online users section
export async function startMonitoring(email) {
    const onlineStatus = ref(db, `users/${toCommas(email)}/online`);
    // Set user presence as online when the user is here
    await set(onlineStatus, true);
    // Leave callback functions for Firebase to handle when the user disconnects
    onDisconnect(onlineStatus).set(false);
    onDisconnect(ref(db, `users/${toCommas(email)}/online/lastseen`)).set(serverTimestamp());
}

// Handle signing out while also properly updating user presence
export async function signOut() {
    const onlineStatus = ref(db, `users/${toCommas(auth.currentUser.email)}/online`);
    // Manually update user presence to be offline
    await set(onlineStatus, false);

    // Update last seen timestamp
    await set(ref(db, `users/${toCommas(auth.currentUser.email)}/online/lastseen`), serverTimestamp());
    await auth.signOut();

    // Refresh the page to clear the event listeners
    window.location.reload();
}

// Provide Google sign in functionality and automatically registers a user into the auth instance
export function signInWithGoogle() {
    signInWithPopup(auth, new GoogleAuthProvider()).catch((error) => {
        alert("Google Auth Error: " + error.code + " : " + error.message);
    });
}

// Change dots to commas, db names that are supported
export function toCommas(str) {
    return str.replace(/\./g, ",");
}

// Change commas back to dots, for proper reading
export function toDots(str) {
    return str.replace(/,/g, ".");
}

// Check if a user has logged in before and give them base permissions if they haven't
export function useAuthStateChanged() {
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Check if the user already exists in the "users" node
                onValue(ref(db, `users/${toCommas(user.email)}`), (snapshot) => {
                    // If there are no snapshots for the user, create a new one with no permissions.
                    if (!snapshot.exists()) {
                        set(ref(db, `users/${toCommas(user.email)}`), {
                            uid: user.uid,
                            read: false,
                            write: false,
                            admin: false,
                        });
                        // Reload the window as the data collection methods may have already fired
                        window.location.reload();
                    } else if (snapshot.child("uid").val() === "nil") {
                        // Otherwise, if they do exist but were manually added, simply update their uid to not be null
                        set(ref(db, `users/${toCommas(user.email)}/uid`), user.uid);
                    }
                    // If they do exist and do have a uid, do nothing.
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
    const msgID = push(child(ref(db), "messages")).key;
    await set(ref(db, "messages/" + msgID), {
        isMsg: true,
        isRetracted: false,
        id: msgID,
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        text: formVal,
        photoURL: auth.currentUser.photoURL,
        createdAt: serverTimestamp(),
    }).catch((error) => errorHandler(error));
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
        createdAt: serverTimestamp(),
    }).catch((error) => errorHandler(error));
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
            await deleteObject(fileRef).catch((err) => errorHandler(err));
        }
        // Now we can safely delete the message as we've deleted any other objects related to it
        await remove(ref(db, "messages/" + id));
    });
}

export async function getData(endpoint, id) {
    let datavalue = null;
    await get(child(ref(db), `${endpoint}/${id}`))
        .then((snapshot) => {
            if (snapshot.exists()) datavalue = snapshot.val();
        })
        .catch((err) => errorHandler(err));
    return datavalue;
}

export async function updateUser(email, changes) {
    await update(ref(db, "users/" + email), changes);
}

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
