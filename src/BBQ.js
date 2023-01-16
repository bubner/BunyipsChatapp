/**
 *    Hamburger menu part of the Navbar containing various options.
 *    @author Lachlan Paul, 2023
 */

import Popup from "reactjs-popup";
import Admin from "./Admin";
import "./BBQ.css";

function BBQ() {
    return (
        <Popup trigger={<svg className="bbqbtn" />} nested>
            {(close) => (
                <>
                    <div className="outwin" onClick={close} />
                    <div className="inwin">
                        <div className="buttonarea">
                            <Admin />
                        </div>
                        <hr />
                    </div>
                </>
            )}
        </Popup>
    );
}

export default BBQ;

/* 
    "I could go for a BBQ bacon burger,
    and a large order of fries,
    and an orange soda with no ice, and a piece of hot apple pie."

    Man, I miss Burger Tank!
 */
