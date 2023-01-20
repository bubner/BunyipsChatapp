/**
 *    Moderative module to allow users to modify current messages in Firestore, depending on their permission nodes.
 *    @author Lucas Bubner, 2023
 */
import "./Msgman.css";
import { useState, useEffect } from "react";
import { onSnapshot, collection, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth, storage } from "./Firebase";
import { ref, deleteObject } from "firebase/storage";
import { getFileURL } from "./Message";
import Popup from "reactjs-popup";

function Msgman({ id, isActive }) {
    const [shouldDisplay, setShouldDisplay] = useState(false);

    // Don't display retraction option if already retracted
    const [isRetracted, setIsRetracted] = useState(false);
    useEffect(() => {
        async function checkRetraction() {
            const document = await getDoc(doc(db, "messages", id));
            if (document.data().isRetracted) {
                setIsRetracted(true);
            }
        }
        checkRetraction();
    }, [id]);

    // Delete a message from Firestore based on the message id.
    // This message deletion is irreversible, and is designed for actual deletion.
    // Only administrator users can delete messages, as opposed to retracting them.
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

    // Marks a message as deleted, and updates the message to show <deleted> as the text.
    // The original content is still available to an administator and in the messages collection.
    async function retractMsg() {
        if (!window.confirm("Retract message: " + id + "?")) return;
        await updateDoc(doc(db, "messages", id), {
            isRetracted: true,
        });
        setIsRetracted(true);
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
            `Message author: ${msgData.displayName}\nAuthor UID: ${msgData.uid}\nMessage ID: ${msgData.id.id}\nMessage creation time: ${msgData.createdAt.seconds}\nIs a text message? ${msgData.isMsg}\nMessage retracted? ${msgData.isRetracted}\n\nMessage content:\n${msgData.text}`
        );
    }

    // Function to copy the text field of the message into the clipboard. If it is a file, copy the URL.
    async function copyMsg() {
        const message = await getDoc(doc(db, "messages", id));
        let copyData = message.data().text;
        if (!message.data().isMsg)
            copyData = getFileURL(message.data().text);
        navigator.clipboard.writeText(copyData).then(
            () => {
                alert("Copied message content to your clipboard.");
            },
            (e) => {
                alert("Something went wrong copying this message. The error has been logged to the console.");
                console.error(e);
            }
        );
    }

    useEffect(() => {
        if (isActive)
            setShouldDisplay(true);
    }, [isActive]);

    return (
        <Popup trigger={<button className="msgman" style={{ display: shouldDisplay && isActive ? "block" : "none" }}/>}>
            {(close) => (
                <>
                    <div className="manouter" onClick={() => {close(); setShouldDisplay(false)}} />
                    <div className="maninner">
                        <p>
                            <i>Managing message: {id}</i>
                        </p>
                        <hr />
                        {isAdminAuthorised && (
                            <>
                                <button onClick={() => viewData()}>View message metadata</button>
                                <hr />
                                <button onClick={() => deleteMsg()}>Delete message</button>
                                <hr />
                            </>
                        )}
                        {(isAdminAuthorised || isAuthorised) && !isRetracted && (
                            <>
                                <button onClick={() => retractMsg()}>Retract message</button>
                                <hr />
                            </>
                        )}
                        <button onClick={() => copyMsg()}>Copy message content</button>
                        <hr />
                    </div>
                </>
            )}
        </Popup>
    );
}

export default Msgman;
