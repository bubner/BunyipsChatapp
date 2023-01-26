/**
 *    User presence manager for client information, and user count dialogues.
 *    @author Lucas Bubner, 2023
 */
import { useEffect } from "react"; 
import { auth, startMonitoring } from "./Firebase";
import "./Users.css";

function Users() {
    // When the module is first loaded, we need to start listening for their presence
    useEffect(() => {
        // Disconnects are handled automatically by Firebase, and all we need to do
        // is start the initial monitoring sequence.
        startMonitoring(auth.currentUser.email);
    }, []);

    return;
}

export default Users;