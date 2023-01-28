/**
 *    Module for modification and control of the Read/Write gatekeeper
 *    @author Lucas Bubner, 2023
 */

import { useState, useEffect, useRef } from "react";
import { auth, db, clearDatabases, toDots, toCommas, updateUser, UserData } from "./Firebase";
import { ref, onValue, set } from "firebase/database";
import Popup from "reactjs-popup";
import { PopupActions } from "../node_modules/reactjs-popup/dist/types";
import "./Admin.css";
import "./CommonPopup.css";

function Admin() {
    const [userData, setUserData] = useState<{ [email: string]: UserData }>({});

    // Ensure that a user's UID using this module is on the admin collection
    // The admin attribute can only be altered by the Firebase owner.
    const [isAdmin, setIsAdmin] = useState(false);

    // Get data for all users that we can access
    useEffect(() => {
        const unsubscribe = onValue(ref(db, "users/"), (snapshot) => {
            setUserData(snapshot.val());
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (Object.keys(userData).length > 0) setIsAdmin(userData[toCommas(auth.currentUser?.email!)].admin);
    }, [userData]);

    // Add a user to the list of total users
    async function addUser() {
        const email = prompt("Enter the email address of the user you want to add.");
        if (!email) return;

        // Ensure we don't override any existing users
        if (userData[auth.currentUser?.email!]) {
            alert("This user already exists on the userlist!");
            return;
        }

        // Add proper user permissions if required
        // We do not have to explicitly set photoURL, displayName, or UID as that will be handled by Firebase.js
        let data;
        if (window.confirm("Grant " + email + " permissions to read and write?")) {
            data = {
                read: true,
                write: true,
                admin: false,
            };
        } else {
            data = {
                read: false,
                write: false,
                admin: false,
            };
        }

        // Commit to the database
        await set(ref(db, `users/${toCommas(email)}`), data)
            .then(() => {
                alert("Operation completed.");
            })
            .catch((err) => alert(err));
    }

    // Manage the permissions of a selected user using prompts
    // I would do a popup that has checkboxes and it would commit the results after, but I decided that I don't care
    // prettier-ignore
    function editUser(email: string) {
        // email variable is comma seperated, when displaying to user ensure to pass through toDots()
        if (!window.confirm(
                "You are viewing the permissions of: " + toDots(email) +
                    "\n\nTheir current permissions are:" +
                    "\nRead: " + (auth.currentUser?.email !== toDots(email) ? userData[email].read.toString().toUpperCase() : (userData[email].read.toString().toUpperCase() + " (CANNOT CHANGE)")) +
                    "\nWrite: " + userData[email].write.toString().toUpperCase() +
                    "\n\nIf you wish to edit these permissions, press OK, otherwise press Cancel.")) {
            return;
        }

        let updatedata: {read?: boolean, write?: boolean} = {};
        if (auth.currentUser?.email !== toDots(email)) {
            if (window.confirm(`Current READ permission of user '${toDots(email)}' is set to: ${userData[email].read.toString().toUpperCase()}\n\n${userData[email].read ? "REMOVE" : "GRANT"} read permission?`)) {
                updatedata.read = !userData[email].read;
            }
        }

        if (window.confirm(`Current WRITE permission of user '${toDots(email)}' is set to: ${userData[email].write.toString().toUpperCase()}\n\n${userData[email].write ? "REMOVE" : "GRANT"} write permission?`)) {
            updatedata.write = !userData[email].write;
        }

        // Update permissions now
        if (Object.keys(updatedata).length > 0) {
            updateUser(email, updatedata).then(() => {
                alert("Operation completed.");
            });
        } else {
            alert("No permissions were updated.");
        }
    }

    const tref = useRef<PopupActions>(null);
    const tclose = () => tref.current?.close();

    return (
        <Popup
            ref={tref}
            trigger={<button className="bbqitem">1500 Megabyte App-Managing Heavy Duty Super-Admin Super Panel</button>}
            nested>
            <>
                <div className="outer" />
                <div className="inner">
                    {isAdmin ? (
                        <div className="authorised">
                            <span className="close" onClick={tclose}>
                                &times;
                            </span>
                            <div className="title">
                                <h4>Application Permissions Control Panel</h4>
                                <p className="portalreference">
                                    "Prolonged exposure to this module is not part of the test."
                                </p>
                            </div>
                            <div className="users">
                                <ul>
                                    {Object.entries(userData).map(([email, user]) => {
                                        return (
                                            // If we can't get a key from their uid, we can settle for their email instead.
                                            // This prevents React from complaining about invalid key props
                                            <li key={user.uid !== null ? user.uid : email}>
                                                <button onClick={() => editUser(email)}>{toDots(email)}</button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            <br />
                            <button onClick={() => addUser()} className="new">
                                Add a new user
                            </button>
                            <span className="cleardb" onClick={() => clearDatabases()}>
                                CLEAR DATABASES
                            </span>
                        </div>
                    ) : (
                        <>
                            <span className="close override" onClick={tclose}>
                                &times;
                            </span>
                            <p>
                                Insufficient permissions to access the admin module. <br /> Please contact
                                lbubner21@mbhs.sa.edu.au for further assistance.
                            </p>
                        </>
                    )}
                </div>
            </>
        </Popup>
    );
}

export default Admin;
