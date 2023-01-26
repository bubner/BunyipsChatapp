/**
 *    Template module for message and file rendering.
 *    Generates a div with message or file content for each message in Firestore.
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import { useState } from "react";
import { auth } from "./Firebase";
import Msgman from "./Msgman";
import "./App.css";
import "./Message.css";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import Filter from "bad-words";

const getFileFormat = (fileURL) => {
    return fileURL.slice(0, fileURL.indexOf(":"));
};

export const getFileURL = (fileURL) => {
    return fileURL.substr(fileURL.indexOf(":") + 1);
};

function Message({ message }) {
    const [isHovering, setIsHovering] = useState(false);
    const handleMouseOver = () => setIsHovering(true);
    const handleMouseOut = () => setIsHovering(false);
    
    const filter = new Filter({ placeHolder: '♥' });
    let timestamp;
    try {
        // Try to recieve a timestamp from the server
        timestamp = new Date(message.createdAt);
    } catch (e) {
        // In cases where the user is the message sender, we might not be able to get the server timestamp
        // and it will throw an error. In this case, we can just use the local user time as it won't matter too much.
        timestamp = new Date(Date.now());
    }

    function clean(message) {
        try {
            message = filter.clean(message);
        } catch (e) {
            // If users enter text that cannot be cleaned, such as raw markdown, then we will change what is rendered.
            // If we don't change it, the webapp will crash and burn in a fire greater than a thousand suns.
            // This is the one instance where Filter throwing an error is actually good, as it fixes multiple issues
            message = "Look at me! I'm a foolish idiot who tried using Markdown without any other characters!";
        }
        return message;
    }

    return (
        // Determine whether the message was sent or recieved by checking the author and current user
        <div
            className={`message ${auth.currentUser.uid === message.uid ? "sent" : "received"}`}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}>
            {/* Generate profile picture based on the photoURL attached with the message */}
            <img
                className="pfp"
                src={message.photoURL}
                alt={`Profile of ${message.displayName}`}
                referrerPolicy="no-referrer"
            />
            <div className="namedate">
                <p className="name">
                    <b>{message.displayName}</b>
                </p>

                {/* Display the proper formatted date and time metadata with each message */}
                <p className="date">{timestamp.toLocaleString("en-AU", { hour12: true })}</p>
            </div>

            {/* If the message is declared as retracted, do not display the message content whatsoever. */}
            {!message.isRetracted ? (
                message.isMsg ? (
                    // If it is a normal message, pass it through ReactMarkdown which will auto hyperlink any links, and add markdown
                    <ReactMarkdown className="text" remarkPlugins={[gfm]} linkTarget="_blank">
                        {clean(message.text)}
                    </ReactMarkdown>
                ) : (
                    // Otherwise, it must be a file and we can display the downloadURL depending on it's type
                    // The type for the URL is prepended to the downloadURL with a colon
                    <div className="file">
                        {/* Use file format to determine if we can outright display the downloadURL in an img, video, etc. tag */}
                        {getFileFormat(message.text).startsWith("image") ? (
                            // If we can display the image through an img tag, define a height maximum and render it
                            <img
                                onClick={() => window.open(getFileURL(message.text), "_blank")}
                                src={getFileURL(message.text)}
                                alt={`Upload by ${message.displayName}`}
                                className="fileimage"
                            />
                        ) : getFileFormat(message.text).startsWith("video") ? (
                            // Swapped to using a video tag instead of an iframe, it seems to work now...
                            <video
                                controls
                                src={getFileURL(message.text)}
                                alt={`Video upload by ${message.displayName}`}
                                autostart="false"
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
                            // prettier-ignore
                            <a target="_blank" rel="noreferrer" href={getFileURL(message.text)}>
                                <b>
                                    View {getFileFormat(message.text) || "unknown"} file uploaded by {message.displayName}
                                </b>
                            </a>
                        )}
                    </div>
                )
            ) : (
                <p className="text">
                    <i>&lt;message deleted&gt;</i>
                </p>
            )}
            <Msgman id={message.id} isActive={isHovering} />
        </div>
    );
}

export default Message;
