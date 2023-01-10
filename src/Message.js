/**
 *    Template module for message and file rendering.
 *    Generates a div with message or file content for each message in Firestore.
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import { auth } from "./Firebase";
import Linkify from "react-linkify";
import "./App.css";
import "./Message.css";

const addZero = (value) => {
    return value < 10 ? "0" + value : value;
};

const getFileFormat = (fileURL) => {
    return fileURL.slice(0, fileURL.indexOf(":"));
};

const getFileURL = (fileURL) => {
    return fileURL.substr(fileURL.indexOf(":") + 1);
};

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
        <div
            className={`message ${
                auth.currentUser.uid === message.uid ? "sent" : "received"
            }`}
        >
            {/* Generate profile picture based on the photoURL attached with the message */}
            <img
                className="pfp"
                src={message.photoURL}
                alt={`Profile of ${message.displayName}`}
                referrerPolicy="no-referrer"
            />

            <p className="name">{message.displayName}</p>

            {/* Display the proper formatted date and time metadata with each message */}
            <p className="date">
                {addZero(timestamp.getDate()) +
                    "/" +
                    addZero(timestamp.getMonth() + 1) +
                    "/" +
                    timestamp.getFullYear() +
                    " at " +
                    addZero(timestamp.getHours()) +
                    ":" +
                    addZero(timestamp.getMinutes())}
            </p>

            {message.isMsg ? (
                // If it is a normal message, pass it through Linkify which will auto hyperlink any links
                <Linkify
                    componentDecorator={(decoratedHref, decoratedText, key) => (
                        <a target="blank" href={decoratedHref} key={key}>
                            {decoratedText}
                        </a>
                    )}
                >
                    <p className="text">{message.text}</p>
                </Linkify>
            ) : (
                // Otherwise, it must be a file and we can display the downloadURL depending on it's type
                // The type for the URL is prepended to the downloadURL with a colon
                <div className="file">
                    {/* Use file format to determine if we can outright display the downloadURL in an img, video, etc. tag */}
                    {getFileFormat(message.text).startsWith("image") ? (
                        // If we can display the image through an img tag, define a height maximum and render it
                        <img
                            src={getFileURL(message.text)}
                            alt={`Upload by ${message.displayName}`}
                            className="fileimage"
                        />
                    ) : getFileFormat(message.text).startsWith("video") ? (
                        // Video tags don't seem to work that well, so we're using iframes instead to display video.
                        <iframe
                            src={getFileURL(message.text)}
                            title={`Video upload by ${message.displayName}`}
                            className="filevideo"
                        />
                    ) : getFileFormat(message.text).startsWith("audio") ? (
                        // Display an audio file as an audio element if we can.
                        <audio
                            controls
                            src={getFileURL(message.text)}
                            autoplay="0"
                            title={`Audio upload by ${message.displayName}`}
                            type={getFileFormat(message.text)}
                            className="fileaudio"
                        />
                    ) : (
                        // Fallback view file attachment to each file upload incase of an unknown file type
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href={getFileURL(message.text)}
                        >
                            <b>View file uploaded by {message.displayName}</b>
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

export default Message;
