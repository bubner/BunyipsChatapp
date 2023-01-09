/**
 *    Module to handle uploading files to Firebase storage and having a corresponding popup window to do so.
 *    @author Lucas Bubner, 2023
 */

import { useState } from "react";
import { storage, db, auth } from "./Firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Popup from "reactjs-popup";
import "./FileUploads.css";

function FileUploads() {
    const [selectedFile, setSelectedFile] = useState();
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [isFileUploading, setIsFileUploading] = useState(false);
    const [isFileUploaded, setIsFileUploaded] = useState(false);

    const changeHandler = (event) => {
        setSelectedFile(event.target.files[0]);
        setIsFilePicked(true);
    };

    const resetElement = () => {
        setIsFileUploading(false);
        setSelectedFile(null);
        setIsFilePicked(false);
        setIsFileUploaded(false);
    };

    async function uploadFileDoc(url, type) {
        await addDoc(collection(db, "messages"), {
            isMsg: false,
            uid: auth.currentUser.uid,
            displayName: auth.currentUser.displayName,
            text: type + ":" + url,
            photoURL: auth.currentUser.photoURL,
            createdAt: serverTimestamp(),
        });
    }

    const handleSubmission = () => {
        if (!isFilePicked) return;
        setIsFileUploading(true);

        const storageRef = ref(storage, `images/${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setProgressPercent(progress);
            },
            (error) => {
                alert(error);
            },
            () => {
                // Handle uploading the file URL into a message doc
                getDownloadURL(ref(storage, 'images/' + selectedFile.name))
                    .then((url) => {
                        uploadFileDoc(url, selectedFile.type);
                    })
                    .catch((error) => {
                        alert(error);
                    });

                resetElement();
                setIsFileUploaded(true);
            }
        );
    };

    return (
        <Popup
            trigger={<span className="spanbutton">Upload File</span>}
            onClose={resetElement}
        >
            {(close) => (
                <div className="uploadWindow">
                    <div className="innerUploadWindow">
                        <span className="close" onClick={close}>
                            &times;
                        </span>
                        <h3>File Upload Menu</h3>
                        {isFileUploaded ? (
                            <div>File uploaded.</div>
                        ) : (
                            <input
                                type="file"
                                name="file"
                                onChange={changeHandler}
                            />
                        )}
                        {isFilePicked &&
                            selectedFile != null &&
                            !isFileUploaded && (
                                <div>
                                    <p>
                                        <i>File name:</i> {selectedFile.name}
                                    </p>
                                    <p>
                                        <i>Filetype:</i> {selectedFile.type}
                                    </p>
                                    <p>
                                        <i>Size in bytes:</i>{" "}
                                        {selectedFile.size}
                                    </p>
                                    <p>
                                        <b>Upload file?</b>
                                    </p>
                                    <div>
                                        <button onClick={handleSubmission}>
                                            Upload
                                        </button>
                                    </div>
                                </div>
                            )}
                        <br />
                        {isFileUploading && (
                            <div className="barload">
                                <div className="outerload">
                                    <div
                                        className="innerload"
                                        style={{ width: `${progressPercent}%` }}
                                    >
                                        Uploading... {progressPercent}%
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Popup>
    );
}

export default FileUploads;
