/**
 *    Module to handle uploading files to Firebase storage and having a corresponding popup window to do so.
 *    @author Lucas Bubner, 2023
 */

import { useState } from "react";
import { storage } from "./Firebase";
import { uploadFileDoc } from "./Firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Popup from "reactjs-popup";
import "./FileUploads.css";

function FileUploads() {
    const [selectedFile, setSelectedFile] = useState();
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [isFileUploading, setIsFileUploading] = useState(false);
    const [isFileUploaded, setIsFileUploaded] = useState(false);

    // Return 8 characters that are legal for making file names unique
    const generateChars = () =>
        [...Array(8)]
            .map(() => Math.random().toString(36).substring(2, 3))
            .join("");

    function generateUniqueFileName(filename) {
        // <original filename> + _ + <random 8 chars> + <file extension>
        return (
            filename.substr(0, filename.lastIndexOf(".")) +
            "_" +
            generateChars() +
            filename.slice(filename.lastIndexOf(".") - 1)
        );
    }

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

    const handleSubmission = () => {
        if (!isFilePicked) return;
        setIsFileUploading(true);

        const fileName = generateUniqueFileName(selectedFile.name);
        const storageRef = ref(storage, `files/${fileName}`);
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
                getDownloadURL(ref(storage, "files/" + fileName))
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
            trigger={<span className="popupbutton" />}
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
