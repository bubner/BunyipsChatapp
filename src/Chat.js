/**
 *    Chat module to handle message rendering and management
 *    Will be shown to the user once login is verified.
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import { db } from "./Firebase";
import { useEffect, useRef } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { collection, query, orderBy, limitToLast } from "firebase/firestore";
import Message from "./Message";
import Navbar from "./Navbar";
import MessageBar from "./MessageBar";

function Chat() {
    // Query Firestore for the last 100 messages
    const msgRef = collection(db, "messages");
    const messageQuery = query(
        msgRef,
        orderBy("createdAt", "asc"),
        limitToLast(100)
    );
    const [messages] = useCollectionData(messageQuery, { idField: "id" });

    // Set custom properties on a dummy object allow messages to appear fluidly
    const dummy = useRef();
    useEffect(
        () => dummy.current.scrollIntoView({ behavior: "smooth" }),
        [messages]
    );

    return (
        <>
            {/* Navbar element with profile information */}
            <Navbar />
            <div className="messages">
                {/* Display all messages currently in Firestore */}
                {messages &&
                    messages.map((msg) => (
                        <Message message={msg} key={msg.id} />
                    ))}
                {/* Dummy element for fluid interface */}
                <div id="dummy" ref={dummy}></div>
                <br /> <br /> <br />
                {/* Message bar with end-user options to add files and message */}
                <MessageBar />
            </div>
        </>
    );
}

export default Chat;
