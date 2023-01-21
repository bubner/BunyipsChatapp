/**
 *    Chat module to handle message rendering and management
 *    Will be shown to the user once login is verified.
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import { db, auth, isReadAuthorised } from "./Firebase";
import { useEffect, useRef, useState } from "react";
import { ref, onChildAdded } from "firebase/database";
import Message from "./Message";
import Navbar from "./Navbar";
import MessageBar from "./MessageBar";

function Chat() {
    const [messages, setMessageData] = useState([]);

    // Authenticate that the email is able to read messages
    useEffect(() => {
        // Block unauthorised users from accessing the application.
        // Note that Firestore will also reject database requests in the event this safeguard is exploited.
        if (!isReadAuthorised()) {
            alert(`Access denied to ${auth.currentUser.email}. You do not have sufficient permissions to view this chat. Please email lbubner21@mbhs.sa.edu.au to continue.`);
            auth.signOut();
        }
    }, []);

    // Monitor Firebase with the onChildAdded hook and update the new message hook in the following conditions:
    // a) The message has just been added to Firestore
    // b) The viewport is not currently visible and the user is in another tab
    // c) The message that was added to Firestore has a timestamp that is greater than the last seen timestamp for the user
    // Regardless, the new message data will be passed through to the messages state, and we are able to render them from there.
    const lastSeenTimestampRef = useRef(Date.now());
    const [newMessage, setNewMessage] = useState(false);
    useEffect(() => {
        const unsubscribe = onChildAdded(ref(db, 'messages/'), (snapshot) => {
            setMessageData(prev => [...prev, snapshot.val()]);
            if (snapshot.val().createdAt > lastSeenTimestampRef.current) {
                setNewMessage(true);
            }
        });
        return () => unsubscribe();
    }, []);

    // Set custom properties on a dummy object allow messages to appear fluidly
    const dummy = useRef();
    useEffect(() => dummy.current.scrollIntoView({ behavior: "auto" }), [messages]);

    // Set the state of the hidden variable depending on whether the user is on the chatapp or not.
    // We don't want to notify that there's a new message if they're already on the chatapp.
    const [hidden, setHidden] = useState(false);
    useEffect(() => {
        document.addEventListener("visibilitychange", () => {
            setHidden(document.hidden);
        });
        return () => {
            document.removeEventListener("visibilitychange", () => {
                setHidden(document.hidden);
            });
        };
    }, []);

    // Clear the hidden state and reset the timestamp to the latest message every time a new message
    // is received. This is done to know if the user has looked at the latest message or not.
    useEffect(() => {
        if (!hidden && messages && messages.length > 0) {
            lastSeenTimestampRef.current = (messages[messages.length - 1].createdAt);
            setNewMessage(false);
        }
    }, [hidden, messages]);

    // Change the title and favicon in the event that both:
    // a) A confirmed new message that conforms to the new message hook criteria exists
    // b) The user is not currently on the page and cannot see the current messages
    useEffect(() => {
        if (newMessage && hidden) {
            document.title = "NEW MESSAGE!";
            document.querySelector("link[rel='icon']").href = "alert.ico";
        } else {
            document.title = "Bunyips Chatapp";
            document.querySelector("link[rel='icon']").href = "favicon.ico";
        }
    }, [newMessage, hidden]);
    
    return (
        <>
            {/* Navbar element with profile information */}
            <Navbar />
            <div className="messages">
                {/* Allow space for Navbar to fit */}
                <br /> <br /> <br /> <br /> <br />
                {/* Display all messages currently in Firestore */}
                {messages && messages.map((msg) => <Message message={msg} key={msg.id} />)}
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
