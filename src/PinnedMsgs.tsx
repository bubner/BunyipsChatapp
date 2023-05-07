/**
 *    Popup that shows all pinned messages.
 *    @author Lachlan Paul, 2023
 */

import { useRef } from "react";
import Popup from "reactjs-popup";
import { PopupActions } from "../node_modules/reactjs-popup/dist/types";
import "./CommonPopup.css";
import "./PinnedMsgs.css";

function PinnedMsgs() {
    const tref = useRef<PopupActions>(null);
    const tclose = () => tref.current?.close();
    return (
        <Popup ref={tref} trigger={<button className="bbqitem">Pinned Messages</button>} nested>
            <>
                <div className="outer" onClick={tclose} />
                <div className="inner">
                    <h4 className="heading text-center">Pinned Messages</h4>
                </div>
            </>
        </Popup>
    );
}

export default PinnedMsgs;
