import { auth } from './Firebase';

function Message({ message }) {
    return (
        // Determine whether the message was sent or recieved by checking the author and current user
        <div className={`message ${ auth.currentUser.uid === message.uid ? 'sent' : 'received' }`}>
            {/* Generate profile picture based on the photoURL attached with the message */}
            <img src={message.photoURL} alt={`Profile of ${message.displayName}`}></img>
            <p>{message.text}</p>
        </div>
    );
}

export default Message;