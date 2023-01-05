/*
 *    Chat module to handle message rendering and management
 *    Will be shown to the user once login is verified.
 */
import { auth, db } from './Firebase';
import { useEffect, useRef, useState } from 'react';
import { useCollectionData } from "react-firebase-hooks/firestore";
import { serverTimestamp } from 'firebase/firestore';
import { collection, query, orderBy, limitToLast, addDoc } from "firebase/firestore";
import Message from './Message';
import FileUploads from './FileUploads';

function Chat() {
    // Query Firestore for the last 100 messages
    const msgRef = collection(db, 'messages');
    const messageQuery = query(msgRef, orderBy('createdAt', 'asc'), limitToLast(3));

    // Set stock parameters for message creation and clear input
    const [formVal, setFormVal] = useState("");
    const dummy = useRef();

    // Set custom properties to allow messages to appear fluidly
    const [messages] = useCollectionData(messageQuery, { idField: "id" });
    useEffect(() => dummy.current.scrollIntoView({ behavaior: "smooth" }), [
        messages,
    ]);

    // Function to add a message to Firestore
    async function sendMsg(e) {
        e.preventDefault();
        // Add to Firestore with UID, content, and user info
        await addDoc(msgRef, {
            uid: auth.currentUser.uid,
            displayName: auth.currentUser.displayName,
            text: formVal,
            photoURL: auth.currentUser.photoURL,
            createdAt: serverTimestamp(),
        });
        setFormVal("");
        // Using a dummy element for fluid interface
        dummy.current.scrollIntoView({ behavaior: "smooth" });
    }

    return (
        <>
        <p>Logged in as {auth.currentUser.displayName}</p>
        <img src={auth.currentUser.photoURL} alt="Profile"></img>
        <br></br>
        <button onClick={async () => await auth.signOut()}>Sign out</button>
        <p>Messages:</p>
        <FileUploads />
        <div className="messages">
            {/* Display all messages currently in Firestore */}
            {messages && messages.map((msg) => <Message message={msg} key={msg.id} />)}

            {/* Dummy element for fluid interface */}
            <div id="dummy" ref={dummy}></div>

            <form onSubmit={(e) => sendMsg(e)}>
                {/* Standard user input box for text */}
                <input
                    type="text"
                    onChange={(e) => setFormVal(e.target.value)}
                    value={formVal}
                />

                {/* Submit button for messages, also prevents sending if there is no form value */}
                <button type="submit" disabled={formVal ? false : true}>
                    {/* TODO: Add a send asset here instead of just text */}
                    Send
                </button>
            </form>
        </div>
        </>
    );
}

export default Chat;