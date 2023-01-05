import { auth } from './Firebase';
import './App.css'
import './Message.css'

const addZero = (value) => {
    return value < 10 ? '0' + value : value;
}

function Message({ message }) {
    let timestamp;
    try {
        // Attempt to retrieve a timestamp from the server
        timestamp = new Date(message.createdAt.seconds * 1000);
    } catch (error) {
        // If it fails, this must mean the message is being sent, and we can use the current Unix time
        timestamp = new Date(Date.now());
    }

    return (
        // Determine whether the message was sent or recieved by checking the author and current user
        <div className={`message ${auth.currentUser.uid === message.uid ? 'sent' : 'received'}`}>
            {/* Generate profile picture based on the photoURL attached with the message */}
            <img src={message.photoURL} alt={`Profile of ${message.displayName}`} referrerPolicy="no-referrer" />

            <p>{message.displayName}</p>

            {/* Display the proper formatted date and time metadata with each message */}
            <p>{addZero(timestamp.getDate()) + '/' + (addZero(timestamp.getMonth() + 1)) + '/' + timestamp.getFullYear() + ' at ' + addZero(timestamp.getHours()) + ':' + addZero(timestamp.getMinutes())}</p>

            <p>{message.text}</p>
        </div>
    );
}

export default Message;