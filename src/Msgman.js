/**
 *    Moderative module to allow users to modify current messages in Firestore, depending on their permission nodes.
 *    @author Lucas Bubner, 2023
 */
import "./Msgman.css";
import { useState, useEffect } from "react";
import {
    onSnapshot,
    collection,
    deleteDoc,
    doc,
    getDoc,
} from "firebase/firestore";
import { db, auth } from "./Firebase";
import Popup from "reactjs-popup";

function Msgman({ id }) {
    // Delete a message from Firestore based on the message id.
    // The message ID is stored as the same as the document ID.
    function deleteMsg() {
        if (!window.confirm("Delete message: " + id + "?")) return;
        onSnapshot(collection(db, "messages"), (snapshot) => {
            snapshot.forEach((message) => {
                if (message.id === id) {
                    deleteDoc(doc(db, "messages", message.id)).catch((err) =>
                        alert(err)
                    );
                }
            });
        });
    }

    // Using same admin authorisation from Admin.js
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
        };
    }, []);

    // Determine whether a user should have moderation over their own message
    const [isAuthorised, setIsAuthorised] = useState(false);
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "messages"), (doc) => {
            let canModerate = false;
            doc.forEach((doc) => {
                if (auth.currentUser.uid === doc.data().uid && doc.id === id) {
                    canModerate = true;
                }
            });
            if (canModerate) {
                setIsAuthorised(true);
            } else {
                setIsAuthorised(false);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [id]);

    // Function to show the metadata of a certain message
    async function viewData() {
        const message = await getDoc(doc(collection(db, "messages"), id));
        const msgData = message.data();
        alert(
            `Message author: ${msgData.displayName}\nAuthor UID: ${msgData.uid}\nMessage ID: ${msgData.id.id}\nMessage creation time: ${msgData.createdAt.seconds}\nIs a text message? ${msgData.isMsg}\nMessage content: "${msgData.text}"`
        );
    }

    return (
        <Popup trigger={<button className="msgman" />}>
            {(close) => (
                <>
                    <div className="manouter" onClick={close} />
                    <div className="maninner">
                        <p>
                            <i>Managing message: {id}</i>
                        </p>
                        <hr />
                        <button onClick={() => viewData()}>
                            View metadata
                        </button>
                        <hr />
                        {(isAdminAuthorised || isAuthorised) && (
                            <>
                                <button onClick={() => deleteMsg()}>
                                    Delete
                                </button>
                                <hr />
                            </>
                        )}
                    </div>
                </>
            )}
        </Popup>
    );
}

export default Msgman;
