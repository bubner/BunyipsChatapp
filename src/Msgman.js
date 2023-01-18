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
import { db, auth, storage } from "./Firebase";
import { ref, deleteObject } from "firebase/storage";
import { getFileURL } from "./Message";
import Popup from "reactjs-popup";

function Msgman({ id }) {
    // Delete a message from Firestore based on the message id.
    // The message ID is stored as the same as the document ID.
    async function deleteMsg() {
        if (!window.confirm("Delete message: " + id + "?")) return;
        const document = await getDoc(doc(db, "messages", id));
        if (!document.data().isMsg) {
            // Check if the document contains a file, if so, we'll have to delete from Firebase storage too
            const fileRef = ref(storage, getFileURL(document.data().text));
            await deleteObject(fileRef).catch((err) => alert(err));
        }
        deleteDoc(doc(db, "messages", id)).catch((err) => alert(err));
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
        const doctarget = doc(db, "messages", id);
        if (doctarget.uid === auth.currentUser.uid) {
            setIsAuthorised(true);
        } else {
            setIsAuthorised(false);
        }
    }, [id]);

    // Function to show the metadata of a certain message
    async function viewData() {
        const message = await getDoc(doc(db, "messages", id));
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
                            View message metadata
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
