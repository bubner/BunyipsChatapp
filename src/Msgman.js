/**
 *    Moderative module to allow users to modify current messages in Firestore, depending on their permission nodes.
 *    @author Lucas Bubner, 2023
 */
import "./Msgman.css";
import { useState, useEffect } from "react";
import { auth, deleteMsg, updateMsg, getData, toCommas } from "./Firebase";
import { getFileURL } from "./Message";
import Popup from "reactjs-popup";

function Msgman({ id, isActive }) {
    const [shouldDisplay, setShouldDisplay] = useState(false);

    // Get message data to use throughout the module
    const [message, setMessageData] = useState(null);
    useEffect(() => {
        getData("messages", id).then((data) => setMessageData(data)).catch((err) => console.error(err));
    }, [isActive, id]);

    // Don't display retraction option if already retracted
    const [isRetracted, setIsRetracted] = useState(false);
    useEffect(() => {
        if (message) setIsRetracted(message.isRetracted);
    }, [message]);

    // Delete a message from Firebase based on the message id.
    // This message deletion is irreversible, and is designed for actual deletion.
    // Only administrator users can delete messages, as opposed to retracting them.
    async function deleteMessage() {
        if (!window.confirm("Delete message: " + id + "?")) return;
        await deleteMsg(id);
    }

    // Marks a message as deleted, and updates the message to show <deleted> as the text.
    // The original content is still available to an administator and in the messages collection.
    async function retractMsg() {
        if (!window.confirm("Retract message: " + id + "?")) return;
        await updateMsg(id, {
            isRetracted: true,
        });
        setIsRetracted(true);
    }

    // Checking if the user is an administrator
    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
        getData("users", toCommas(auth.currentUser.email)).then((userData) => setIsAdmin(userData.admin));
    }, []);

    // Determine whether a user should have moderation over their own message
    const [isAuthorised, setIsAuthorised] = useState(false);
    useEffect(() => {
        if (message) setIsAuthorised(message.uid === auth.currentUser.uid);
    }, [message]);

    // Function to show the metadata of a certain message
    function viewData() {
        // prettier-ignore
        alert(`Message author: ${message.displayName}\nAuthor email: ${message.email}\nAuthor UID: ${message.uid}\nMessage ID: ${message.id}\nMessage creation time: ${message.createdAt}\nMessage type: ${message.isMsg ? "text" : "file"}\nMessage retracted? ${message.isRetracted ? "yes" : "no"}\n\nMessage content:\n${message.text}`);
    }

    // Function to copy the text field of the message into the clipboard. If it is a file, copy the URL.
    async function copyMsg() {
        if (message.isRetracted && !isAdmin) {
            alert("Can't copy a deleted message!");
            return;
        }

        let copyData = message.text;
        // prettier-ignore
        if (!message.isMsg)
            copyData = getFileURL(message.text);

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
        if (isActive) setShouldDisplay(true);
    }, [isActive]);

    return (
        <Popup
            trigger={<button className="msgman" style={{ display: shouldDisplay && isActive ? "block" : "none" }} />}>
            {(close) => (
                <>
                    <div
                        className="manouter"
                        onClick={() => {
                            close();
                            setShouldDisplay(false);
                        }}
                    />
                    <div className="maninner">
                        <p>
                            <i>Managing message: {id}</i>
                        </p>
                        <hr />
                        {isAdmin && (
                            <>
                                <button onClick={() => viewData()}>View message metadata</button>
                                <hr />
                                <button onClick={() => deleteMessage()}>Delete message</button>
                                <hr />
                            </>
                        )}
                        {(isAdmin || isAuthorised) && !isRetracted && (
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
