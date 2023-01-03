/*
 *    Primary application configuration to manage all operations of the application.
 *    Manages Firebase integrations, and provides operation to the app.
 */

import './App.css';

// Firebase imports and configuration
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from './Firebase';

// Import application login and chatroom modules
import Chat from "./Chat";
import Login from "./Login";

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
        {user ? <Chat /> : <Login />}
    </div>
  );
}

export default App;
