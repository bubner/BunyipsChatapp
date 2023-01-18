/**
 *    Module for modification and control of the Read/Write gatekeeper
 *    @author Lucas Bubner, 2023
 */
import { useState, useEffect } from "react";
import { auth, db, storage } from "./Firebase";
import { ref, deleteObject, listAll } from "firebase/storage";
import { collection, onSnapshot, deleteDoc, doc, setDoc } from "firebase/firestore";
import Popup from "reactjs-popup";
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
        if (email === auth.currentUser.email) {
            alert("You cannot remove your own read permission as an administrator.");
            return;
        }

        if (!window.confirm("Remove read permission from " + email + "?")) return;

        await deleteDoc(doc(db, "read", email))
            .catch((error) => alert(error))
            .then(() => alert("Operation completed."));
    }

    // Delete the write permissions from an email address
    async function removeWrite(email) {
        if (!window.confirm("Remove write permission from " + email + "?")) return;
        await deleteDoc(doc(db, "write", email))
            .catch((error) => alert(error))
            .then(() => alert("Operation completed."));
    }

    // Add read permissions to an email address by making a new doc with the email's name
    // No data is placed inside this doc, but is used for security purposes
    async function addRead() {
        const email = prompt("Enter an email address to grant application access to.");
        await setDoc(doc(db, "read", email), {})
            .catch((error) => alert(error))
            .then(() => alert("Operation completed."));
    }

    // Add write permissions to an email address by making a new doc with the email's name
    async function addWrite() {
        const email = prompt("Enter an email address to grant message send access to.");
        await setDoc(doc(db, "write", email), {})
            .catch((error) => alert(error))
            .then(() => alert("Operation completed."));
    }

    // Clear all database messages and media content
    async function clearDatabase() {
        if (
            !window.confirm(
                "WARNING: You are about to delete all database messages. Are you sure you want to continue?"
            )
        )
            return;

        const nums = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
        if (
            window.prompt(`Please enter these four numbers in order to complete the database transaction: ${nums}`) !==
            nums.toString()
        ) {
            alert("Operation cancelled.");
            return;
        }

        // Delete all Firestore messages
        onSnapshot(collection(db, "messages"), (snapshot) => {
            snapshot.forEach((message) => {
                deleteDoc(doc(db, "messages", message.id)).catch((err) => console.error(err));
            });
        });

        // Delete all media uploaded
        await listAll(ref(storage, "files")).then((listResults) => {
            const promises = listResults.items.map((item) => {
                return deleteObject(item);
            });
            Promise.all(promises);
        });

        alert("Operation completed. A reload is required.");
        window.location.reload();
    }

    const [readDocs, setReadDocs] = useState([]);
    const [writeDocs, setWriteDocs] = useState([]);

    // There was a memory leak here that leaked hundreds of megabytes per second with these two listeners.
    // Thanks ChatGPT for fixing it...
    useEffect(() => {
        const readListener = onSnapshot(collection(db, "read"), (querySnapshot) => {
            const readArray = [];
            querySnapshot.forEach((doc) => {
                readArray.push(doc.id);
            });
            setReadDocs(readArray);
        });

        const writeListener = onSnapshot(collection(db, "write"), (querySnapshot) => {
            const writeArray = [];
            querySnapshot.forEach((doc) => {
                writeArray.push(doc.id);
            });
            setWriteDocs(writeArray);
        });

        return () => {
            readListener();
            writeListener();
        };
    }, []);

    return (
        <Popup
            trigger={<button className="bbqitem">1500 Megabyte App-Managing Heavy Duty Super-Admin SuperPanel</button>}
            nested>
            {(close) => (
                <>
                    <div className="oadmin" />
                    <div className="admin">
                        {isAdminAuthorised ? (
                            <>
                                <span className="close" onClick={close}>
                                    &times;
                                </span>
                                <div className="authorised">
                                    <div className="title">
                                        <h4>Application Permissions Control Panel</h4>
                                        <p className="portalreference">
                                            "Prolonged exposure to this module is not part of the test."
                                        </p>
                                        <br />
                                    </div>
                                    <div className="read">
                                        <p>READ</p>
                                        <ul>
                                            {readDocs.map((doc) => {
                                                return (
                                                    <li>
                                                        <button onClick={() => removeRead(doc)} key={doc.id}>
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
                                                        <button onClick={() => removeWrite(doc)} key={doc.id}>
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
                                    <span className="cleardb" onClick={() => clearDatabase()}>
                                        CLEAR DATABASES
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="close override" onClick={close}>
                                    &times;
                                </span>
                                <p>
                                    Insufficient permissions to access the admin module. <br /> Please contact
                                    lbubner21@mbhs.sa.edu.au for further assistance.
                                </p>
                            </>
                        )}
                    </div>
                </>
            )}
        </Popup>
    );
}

export default Admin;
