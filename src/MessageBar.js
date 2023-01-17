/**
 *    Message bar module to manage user input of messages and files
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import "./MessageBar.css";
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import FileUploads from "./FileUploads";
import Scroll from "./Scroll";
import { sendMsg, db, auth } from "./Firebase";

function MessageBar() {
    const [formVal, setFormVal] = useState("");
    const [writePerms, setWritePerms] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "write"), (doc) => {
            let allowWrite = false;
            doc.forEach((doc) => {
                if (auth.currentUser.email === doc.id) {
                    allowWrite = true;
                }
            });
            if (allowWrite) {
                setWritePerms(true);
            } else {
                setWritePerms(false);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div className="messagebar">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    sendMsg(formVal);
                    setFormVal("");
                }}>
                {/* Standard user input box for text */}
                <div className="input-group">
                    {writePerms ? (
                        <>
                            <FileUploads />
                            <input
                                type="text"
                                onChange={(e) => setFormVal(e.target.value)}
                                value={formVal}
                                className="msginput"
                            />
                            {/* Submit button for messages, also prevents sending if there is no form value */}
                            <button
                                type="submit"
                                disabled={formVal ? false : true}
                                className="sendbutton"
                            />
                        </>
                    ) : (
                        <div className="msginput nomsg">
                            <p>
                                You do not have permission to send any messages.
                                Please contact lbubner21@mbhs.sa.edu.au to
                                continue.
                            </p>
                        </div>
                    )}
                </div>
            </form>
            <Scroll />
        </div>
    );
}

export default MessageBar;
