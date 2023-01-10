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
        <center>
            <div className="login center">
                <h2>Bunyips Chatapp</h2>
                <button onClick={signInWithGoogle} className="googlebtn">
                    Sign in with Google
                </button>
            </div>
        </center>
    );
}

export default Login;
