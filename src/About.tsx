/**
 *    About application section, including build framework, developer, and copyright information.
 *    @author Lucas Bubner, 2023
 */

import { useRef } from "react";
import Popup from "reactjs-popup";
import { PopupActions } from "../node_modules/reactjs-popup/dist/types";
import "./CommonPopup.css";

function About() {
    const tref = useRef<PopupActions>(null);
    const tclose = () => tref.current?.close();
    return (
        <Popup ref={tref} trigger={<button className="bbqitem">About Application</button>} nested>
            <>
                <div className="outer" onClick={tclose} />
                <div className="inner">
                    
                </div>
            </>
        </Popup>
    );
}

export default About;