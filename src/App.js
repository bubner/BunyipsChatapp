/**
 *    Primary application configuration to manage all operations of the application.
 *    Manages Firebase integrations, and provides operation to the app.
 *    @author Lucas Bubner, 2023
 */

import "./App.css";

// Firebase imports and configuration
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, useAuthStateChanged } from "./Firebase";

// Import application login and chatroom modules
import Chat from "./Chat";
import Login from "./Login";

function App() {
    const [user] = useAuthState(auth);
    // Make sure we have the user's uid as a datapoint in the users node
    useAuthStateChanged();

    // April Fool's joke alert upon application load
    useEffect(() => {
        const time = new Date(Date.now());
        if (time.getMonth() + 1 === 4 && time.getDate() === 1 && user) {
            alert(
                "WARNING: This chatapp has been noted by authorities as being in use by major War Criminals, proceed with extreme caution and report any suspicious actvity to // TODO: Contact Info"
            );
        }
    }, [user]);

    return <div className="App">{user ? <Chat /> : <Login />}</div>;
}

export default App;
