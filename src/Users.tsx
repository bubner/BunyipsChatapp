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
        startMonitoring(auth.currentUser?.email!);
    }, []);

    // Get all users from the database

    // Determine who is online, and append them to the list of people to show on the front screen

    // For those who are offline, determine their last login date for the users popup

    /*
        Elements TODO:
            > PFP display div, that will display the users that are online. If there are more than a set amount, display a few but have a +x of the extra people online
            > Popup div with extended information, including last seen date, and a list of the people who are here. Make it one list with all users on it, but those
            online should be at the top of the list.
            Do not show the current user on the pfp display div.
            Add a user button regardless of the state of other users next to the primary pfp to access user list.
    */

    return <></>;
}

export default Users;
