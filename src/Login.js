/**
 *    Authentication module through Google Firebase.
 *    Will be shown to the user if userdata is not present upon visiting.
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import { signInWithGoogle } from "./Firebase";
import "./Login.css";

function Login() {
    return (
        <>
            <div className="bg-wrapper">
                <ul className="bg-bubbles">
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
            </div>
            <img
                className="clubimg"
                src="clubimgblur.png"
                alt="Murray Bridge Bunyips club"
            />
            <div className="login center">
                <div className="login-inner">
                    <h2>Bunyips Chatapp</h2>
                    <br />
                    <button onClick={signInWithGoogle} className="googlebtn">
                        Sign in with Google
                    </button>
                    <br /> <br />
                    <footer>
                        Lucas Bubner{" "}
                        <a href="https://github.com/holo-lb/">@holo-lb</a>,{" "}
                        <br /> Lachlan Paul{" "}
                        <a href="https://github.com/BanjoTheBot/">
                            @BanjoTheBot
                        </a>
                        , <br /> 2023
                    </footer>
                </div>
            </div>
        </>
    );
}

export default Login;
