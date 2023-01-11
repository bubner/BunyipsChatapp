/**
 *    Navbar element to be shown at the top of the page, containing account and other information
 *    @author Lachlan Paul, 2023
 */
import "./Navbar.css";
import "./Firebase.js";
import "./Message.js";
import { auth } from "./Firebase";
// import {message} from "./Message";

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
                Signed in as {auth.currentUser.displayName}
            </p>
            <button
                className="sobtn"
                onClick={async () => await auth.signOut()}
            >
                Sign out
            </button>
            <button className="joke" onClick={async () => alert("lol no")}>
                Enable Light Mode
            </button>
        </div>
    );
}

export default Navbar;
