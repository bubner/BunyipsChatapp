/**
 *    Message bar module to manage user input of messages and files
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import "./MessageBar.css";
import { useState } from "react";
import { collection } from "firebase/firestore";
import FileUploads from "./FileUploads";
import Scroll from "./Scroll";
import { sendMsg, db } from "./Firebase";

function MessageBar() {
    const [formVal, setFormVal] = useState("");
    return (
        <div className="messagebar">
            <form
                onSubmit={(e) => {
                    sendMsg(e, collection(db, "messages"), formVal);
                    setFormVal("");
                }}
            >
                {/* Standard user input box for text */}
                <div className="input-group">
                    <FileUploads />
                    <input
                        type="text"
                        onChange={(e) => setFormVal(e.target.value)}
                        value={formVal}
                    />
                    {/* Submit button for messages, also prevents sending if there is no form value */}
                    <button
                        type="submit"
                        disabled={formVal ? false : true}
                        className="sendbutton"
                    />
                </div>
            </form>
            <Scroll />
        </div>
    );
}

export default MessageBar;
