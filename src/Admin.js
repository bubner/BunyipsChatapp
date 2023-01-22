/**
 *    Module for modification and control of the Read/Write gatekeeper
 *    @author Lucas Bubner, 2023
 */
import { useState, useEffect } from "react";
import { auth, db, getData, removeWrite, addWrite, removeRead, addRead, clearDatabases } from "./Firebase";
import { ref, onValue } from "firebase/database";
import Popup from "reactjs-popup";
import "./Admin.css";

function Admin() {
    const [userData, setUserData] = useState([]);

    // Ensure that a user's UID using this module is on the admin collection
    // The admin attribute can only be altered by the Firebase owner.
    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
        getData("users", auth.currentUser.uid).then((userData) => setIsAdmin(userData.admin));
    }, []);

    // Get data for all users that we can access
    useEffect(() => {
        const unsubscribe = onValue(ref(db, "users/"), (snapshot) => {
            setUserData(Object.entries(snapshot.val()));
        });
        return () => unsubscribe();
    }, []);

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
                                                <li>
                                                    <button onClick={() => alert("button")} key={user[0]}>
                                                        {user[1].email}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                                <br />
                                <button onClick={() => addRead()} className="new">
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
