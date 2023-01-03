/*
 *    Authentication module through Google Firebase.
 *    Will be shown to the user if userdata is not present upon visiting.
 */
import { signInWithGoogle } from './Firebase';

function Login() {
    return (
        <div className="login">
            <h2>Bunyips Chatapp</h2>
            <button onClick={signInWithGoogle}>
                Sign in with Google
            </button>
        </div>
    );
}

export default Login;