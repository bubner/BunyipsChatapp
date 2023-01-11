/**
 *    Module for modification and control of the Read/Write gatekeeper
 *    @author Lucas Bubner, 2023
 */
import { useState, useEffect } from "react";
import { auth, db } from "./Firebase";
import {
    collection,
    onSnapshot,
    deleteDoc,
    doc,
    setDoc,
} from "firebase/firestore";
import "./Admin.css";

function Admin() {
    const [isAdminAuthorised, setisAdminAuthorised] = useState();

    // Ensure that a user's email using this module is on the admin collection
    // The admin collection can only be altered by the Firebase owner.
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "admin"), (doc) => {
            let isAuthorised = false;
            doc.forEach((doc) => {
                if (auth.currentUser.email === doc.id) {
                    isAuthorised = true;
                }
            });
            if (isAuthorised) {
                setisAdminAuthorised(true);
            } else {
                setisAdminAuthorised(false);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // Delete the read permissions from an email address
    async function removeRead(email) {
        if (!window.confirm("Remove read permission from " + email + "?"))
            return;
        await deleteDoc(doc(db, "read", email))
            .catch((error) => alert(error))
            .then(() => alert("Operation completed."));
    }

    // Delete the write permissions from an email address
    async function removeWrite(email) {
        if (!window.confirm("Remove write permission from " + email + "?"))
            return;
        await deleteDoc(doc(db, "write", email))
            .catch((error) => alert(error))
            .then(() => alert("Operation completed."));
    }

    // Add read permissions to an email address by making a new doc with the email's name
    // No data is placed inside this doc, but is used for security purposes
    async function addRead() {
        const email = prompt(
            "Enter an email address to grant application access to."
        );
        await setDoc(doc(db, "read", email), {})
            .catch((error) => alert(error))
            .then(() => alert("Operation completed."));
    }

    // Add write permissions to an email address by making a new doc with the email's name
    async function addWrite() {
        const email = prompt(
            "Enter an email address to grant message send access to."
        );
        await setDoc(doc(db, "write", email), {})
            .catch((error) => alert(error))
            .then(() => alert("Operation completed."));
    }

    const [readDocs, setReadDocs] = useState([]);
    const [writeDocs, setWriteDocs] = useState([]);

    // There was a memory leak here that leaked hundreds of megabytes per second with these two listeners.
    // Thanks ChatGPT for fixing it...
    useEffect(() => {
        const readListener = onSnapshot(
            collection(db, "read"),
            (querySnapshot) => {
                const readArray = [];
                querySnapshot.forEach((doc) => {
                    readArray.push(doc.id);
                });
                setReadDocs(readArray);
            }
        );

        const writeListener = onSnapshot(
            collection(db, "write"),
            (querySnapshot) => {
                const writeArray = [];
                querySnapshot.forEach((doc) => {
                    writeArray.push(doc.id);
                });
                setWriteDocs(writeArray);
            }
        );

        return () => {
            readListener();
            writeListener();
        };
    }, []);

    return (
        <div className="admin">
            {isAdminAuthorised ? (
                <div className="authorised">
                    <div className="read">
                        <p>READ</p>
                        <ul>
                            {readDocs.map((doc) => {
                                return (
                                    <li>
                                        <button
                                            onClick={() => removeRead(doc)}
                                            key={doc.id}>
                                            {doc}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                        <button onClick={() => addRead()} className="new">
                            Add a new user
                        </button>
                    </div>
                    <div className="write">
                        <p>WRITE</p>
                        <ul>
                            {writeDocs.map((doc) => {
                                return (
                                    <li>
                                        <button
                                            onClick={() => removeWrite(doc)}
                                            key={doc.id}>
                                            {doc}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                        <button onClick={() => addWrite()} className="new">
                            Add a new writer
                        </button>
                    </div>
                </div>
            ) : (
                <p>Unauthorised usage of the admin module.</p>
            )}
        </div>
    );
}

export default Admin;
