/**
 *    Module for modification and control of the Read/Write gatekeeper
 *    @author Lucas Bubner, 2023
 */
import { useState, useEffect } from "react";
import { auth, db } from "./Firebase";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import "./Admin.css";

function Admin() {
    const [isAdminAuthorised, setisAdminAuthorised] = useState();

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
        }
    
    }, []);

    async function removeRead(email) {
        if (!window.confirm("Remove read permission from " + email + "?"))
            return;
        await deleteDoc(doc(db, "read", email))
            .catch((error) => alert(error))
            .then(() => alert("Operation completed."));
    }

    async function removeWrite(email) {
        if (!window.confirm("Remove write permission from " + email + "?"))
            return;
        await deleteDoc(doc(db, "write", email))
            .catch((error) => alert(error))
            .then(() => alert("Operation completed."));
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
        <div className="admin">
            {isAdminAuthorised ? (
                <div className="authorised">
                    <div className="read">
                        <p>READ</p>
                        <ul>
                            {readDocs.map((doc, index) => {
                                return (
                                    <li>
                                        <button
                                            onClick={() => removeRead(doc)}
                                            key={index}>
                                            {doc}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                        <button className="new">Add a new user</button>
                    </div>
                    <div className="write">
                        <p>WRITE</p>
                        <ul>
                            {writeDocs.map((doc, index) => {
                                return (
                                    <li>
                                        <button
                                            onClick={() => removeWrite(doc)}
                                            key={index}>
                                            {doc}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                        <button className="new">Add a new writer</button>
                    </div>
                </div>
            ) : (
                <p>Unauthorised usage of the admin module.</p>
            )}
        </div>
    );
}

export default Admin;
