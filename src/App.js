import './App.css';

// Firebase imports and configuration
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from './Firebase';

function App() {
  const [user] = useAuthState(auth);
  return (
    <p>Project in TODO</p>
  );
}

export default App;
