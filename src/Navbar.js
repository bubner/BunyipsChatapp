/**
 *    Navbar element to be shown at the top of the page, containing account and other information
 *    @author Lachlan Paul, 2023
 */
import "./Navbar.css";
import "./Firebase.js";
import "./Message.js";
import { auth } from "./Firebase";
// import {message} from "./Message";
import BBQ from "./BBQ";

function Navbar() {
    return (
        <div className="navbar">
            <img
                className="navbar-brand"
                src={auth.currentUser.photoURL}
                referrerPolicy="no-referrer"
                alt={`Profile of ${auth.currentUser.displayName}`}
            />
            <p className="navbar-name">
                {auth.currentUser.displayName}
            </p>
            <svg className="sobtn" onClick={async () => await auth.signOut()} />
            {/* <button className="joke" onClick={() => alert("lol no")}>
                Enable Light Mode
            </button> */}
            <BBQ />
        </div>
    );
}

export default Navbar;
