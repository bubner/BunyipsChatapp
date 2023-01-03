/*
 *    Chat module to handle message rendering and management
 *    Will be shown to the user once login is verified.
 */
import { auth } from './Firebase';

function Chat() {
    return (
        <>
        <p>Logged in as {auth.currentUser.displayName}</p>
        <img src={auth.currentUser.photoURL} alt="Profile"></img>
        <br></br>
        <button onClick={async () => await auth.signOut()}>Sign out</button>
        </>
    );
}

export default Chat;