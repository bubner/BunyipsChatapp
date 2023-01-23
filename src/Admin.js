/**
 *    Module for modification and control of the Read/Write gatekeeper
 *    @author Lucas Bubner, 2023
 */
import { useState, useEffect } from "react";
import { auth, db, clearDatabases, toDots, toCommas, updateUser } from "./Firebase";
import { ref, onValue, set } from "firebase/database";
import Popup from "reactjs-popup";
import "./Admin.css";

function Admin() {
    const [userData, setUserData] = useState([]);

    // Ensure that a user's UID using this module is on the admin collection
    // The admin attribute can only be altered by the Firebase owner.
    const [isAdmin, setIsAdmin] = useState(false);

    // Get data for all users that we can access
    useEffect(() => {
        const unsubscribe = onValue(ref(db, "users/"), (snapshot) => {
            setUserData(Object.entries(snapshot.val()));
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        userData.forEach((user) => {
            if (user[1].uid === auth.currentUser.uid) setIsAdmin(user[1].admin);
        });
    }, [userData]);

    // Add a user to the list of total users
    async function addUser() {
        const email = prompt("Enter the email address of the user you want to add.");

        // Ensure we don't override any existing users
        userData.forEach((user) => {
            if (toDots(user[0]) === email) {
                alert("This user already exists on the userlist!");
                return;
            }
        });

        // Add proper user permissions if required
        // We have to actually put a value for the uid, otherwise it won't propagate in the database for us to read.
        // This could probably be fixed with something like checking if the uid field exists,
        // but the best solution is  often the simplest solution.
        let data;
        if (window.confirm("Grant " + email + " permissions to read and write?")) {
            data = {
                uid: "nil",
                read: true,
                write: true,
                admin: false,
            };
        } else {
            data = {
                uid: "nil",
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
    function editUser(userdata) {
        if (!window.confirm(
                "You are viewing the permissions of: " + toDots(userdata[0]) +
                    "\n\nTheir current permissions are:" +
                    "\nRead: " + (auth.currentUser.email !== toDots(userdata[0]) ? userdata[1].read.toString().toUpperCase() : (userdata[1].read.toString().toUpperCase() + " (CANNOT CHANGE)")) +
                    "\nWrite: " + userdata[1].write.toString().toUpperCase() +
                    "\n\nIf you wish to edit these permissions, press OK, otherwise press Cancel.")) {
            return;
        }

        let updatedata = {};
        if (auth.currentUser.email !== toDots(userdata[0])) {
            if (window.confirm(`Current READ permission of user '${toDots(userdata[0])}' is set to: ${userdata[1].read.toString().toUpperCase()}\n\n${userdata[1].read ? "REMOVE" : "GRANT"} read permission?`)) {
                updatedata.read = !userdata[1].read;
            }
        }

        if (window.confirm(`Current WRITE permission of user '${toDots(userdata[0])}' is set to: ${userdata[1].write.toString().toUpperCase()}\n\n${userdata[1].write ? "REMOVE" : "GRANT"} write permission?`)) {
            updatedata.write = !userdata[1].write;
        }

        // Update permissions now
        if (Object.keys(updatedata).length > 0) {
            updateUser(userdata[0], updatedata).then(() => {
                alert("Operation completed.");
            });
        } else {
            alert("No permissions were updated.");
        }
    }

    return (
        <Popup
            trigger={<button className="bbqitem">1500 Megabyte App-Managing Heavy Duty Super-Admin Super Panel</button>}
            nested>
            {(close) => (
                <>
                    <div className="oadmin" />
                    <div className="admin">
                        {isAdmin ? (
                            <div className="authorised">
                                <span className="close" onClick={close}>
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
                                        {userData.map((user) => {
                                            return (
                                                // If we can't get a key from their uid, we can settle for their email instead.
                                                // This prevents React from complaining about invalid key props
                                                <li key={user[1].uid !== "nil" ? user[1].uid : user[0]}>
                                                    <button onClick={() => editUser(user)}>{toDots(user[0])}</button>
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
                                <span className="close override" onClick={close}>
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
            )}
        </Popup>
    );
}

export default Admin;
