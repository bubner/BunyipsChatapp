/**
 *    Chat module to handle message rendering and management
 *    Will be shown to the user once login is verified.
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import { db, auth } from "./Firebase";
import { useEffect, useRef } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import {
    collection,
    query,
    orderBy,
    limitToLast,
    onSnapshot,
} from "firebase/firestore";
import Message from "./Message";
import Navbar from "./Navbar";
import MessageBar from "./MessageBar";

function Chat() {
    // Authenticate that the email is able to read messages
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "read"), (doc) => {
            let readAccess = false;
            doc.forEach((doc) => {
                if (auth.currentUser.email === doc.id) {
                    readAccess = true;
                }
            });
            if (!readAccess) {
                alert(
                    "Access denied. You do not have sufficient permissions to view this chat. Please email lbubner21@mbhs.sa.edu.au to continue."
                );
                auth.signOut();
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // Query Firestore for the last 300 messages
    const msgRef = collection(db, "messages");
    const messageQuery = query(
        msgRef,
        orderBy("createdAt", "asc"),
        limitToLast(300)
    );
    const [messages] = useCollectionData(messageQuery, { idField: "id" });

    // Set custom properties on a dummy object allow messages to appear fluidly
    const dummy = useRef();
    useEffect(
        () => dummy.current.scrollIntoView({ behavior: "smooth" }),
        [messages]
    );
    const time = new Date(Date.now());
    if (time.getMonth() + 1 === 1 && time.getDate() === 17) {
        alert("WARNING: This chatapp has been noted by authorities as being in use by major War Criminals, proceed with extreme caution and report any suspicious actvity to // TODO: Contact Info");
    }
    return (
        <>
            {/* Navbar element with profile information */}
            <Navbar />
            <div className="messages">
                {/* Allow space for Navbar to fit */}
                <br /> <br /> <br /> <br /> <br />
                {/* Display all messages currently in Firestore */}
                {messages &&
                    messages.map((msg) => (
                        <Message message={msg} key={msg.id.id} />
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
