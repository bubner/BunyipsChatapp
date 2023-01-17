/**
 *    Navbar element to be shown at the top of the page, containing account and other information
 *    @author Lachlan Paul, 2023
 */
import "./Navbar.css";
import "./Firebase.js";
import "./Message.js";
import { auth } from "./Firebase";
import { useState, useEffect } from "react";
import BBQ from "./BBQ";

function Navbar() {
    const [currentTime, setCurrentTime] = useState();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(
                new Date().toLocaleTimeString("en-AU", { hour12: true })
            );
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <>
            <div className="navbar">
                <img
                    className="navbar-brand"
                    src={auth.currentUser.photoURL}
                    referrerPolicy="no-referrer"
                    alt={`Profile of ${auth.currentUser.displayName}`}
                />
                <p className="navbar-name">{auth.currentUser.displayName}</p>
                <svg
                    className="sobtn"
                    onClick={async () => await auth.signOut()}
                />

                <BBQ />
            </div>
            <h4 className="productname">Bunyips Chatapp</h4>
            <p className="currenttime"><i style={{fontSize: '12px'}}>Lucas Bubner, Lachlan Paul, 2023</i><br />{currentTime}</p>
        </>
    );
}

export default Navbar;
