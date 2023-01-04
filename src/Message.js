import { auth } from './Firebase';

function Message({ message }) {
    const timestamp = new Date(message.createdAt.seconds * 1000);
    return (
        // Determine whether the message was sent or recieved by checking the author and current user
        <div className={`message ${ auth.currentUser.uid === message.uid ? 'sent' : 'received' }`}>
            {/* Generate profile picture based on the photoURL attached with the message */}
            <img src={message.photoURL} alt={`Profile of ${message.displayName}`} referrerpolicy="no-referrer"/><img />
            <p>{message.displayName}</p>
            <p>{timestamp.getDate() + '/' + timestamp.getMonth() + '/' + timestamp.getFullYear() + ' at ' + timestamp.getHours() + ':' + timestamp.getMinutes() }</p>
            <p>{message.text}</p>
        </div>
    );
}

export default Message;