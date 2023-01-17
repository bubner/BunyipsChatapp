/**
 *    Module to handle uploading files to Firebase storage and having a corresponding popup window to do so.
 *    @author Lucas Bubner, 2023
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { storage } from "./Firebase";
import { uploadFileDoc } from "./Firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Popup from "reactjs-popup";
import "./FileUploads.css";

function FileUploads() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [isFileUploading, setIsFileUploading] = useState(false);
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [isClipboard, setIsClipboard] = useState(false);

    const uploadTaskRef = useRef();

    // Return 8 characters that are legal for making file names unique
    const generateChars = () =>
        [...Array(8)]
            .map(() => Math.random().toString(36).substring(2, 3))
            .join("");

    // Convert byte numbers to their corresponding format
    const formatBytes = (a, b = 2) => {
        const c = Math.max(0, b);
        const d = Math.floor(Math.log(a) / Math.log(1024));
        return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${
            ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
        }`;
    };

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

        // If the file is greater than 10 megabytes, restrict upload
        if (event.target.files[0].size > 10000000) {
            alert(
                `File size exceeds the limit of 10 MB. Your file is ${formatBytes(
                    event.target.files[0].size
                )}.`
            );
            setSelectedFile(null);
            return;
        }

        setIsFilePicked(true);
    };

    const resetElement = () => {
        try {
            uploadTaskRef.current.cancel();
        } catch (e) {
            // An exception is thrown when the upload menu is closed before a file is present.
            // However, the error causes the reset element functionality to not work properly, so
            // you will not stop me and I will eat all the cake.
            console.debug(e);
        }
        setIsFileUploading(false);
        setSelectedFile(null);
        setIsFilePicked(false);
        setIsFileUploaded(false);
        setIsClipboard(false);
    };

    const uploadFile = (name) => {
        const storageRef = ref(storage, `files/${name}`);
        uploadTaskRef.current = uploadBytesResumable(storageRef, selectedFile);
    };

    const handleSubmission = () => {
        if (!isFilePicked || !selectedFile) return;
        setIsFileUploading(true);

        // Generate a random string of characters to supplement the file name to avoid duplicates
        const fileName = generateUniqueFileName(selectedFile.name);

        // Upload the file to Firebase Storage
        uploadFile(fileName);

        uploadTaskRef.current.on(
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
                getDownloadURL(ref(storage, `files/${fileName}`))
                    .then((url) => {
                        uploadFileDoc(url, selectedFile.type);
                    })
                    .catch((error) => {
                        console.error(error);
                        alert(
                            "Something went wrong adding your file to the messages database. This error has been logged to the console."
                        );
                    });
                setIsFileUploaded(true);
            }
        );
    };

    const clipboardHandler = useCallback((e) => {
        // Only activate if the target was towards the chat box to avoid goofy interface issues
        const validInputZones = [
            "msginput",
            "pfp",
            "",
            "fileimage",
            "text",
            "date",
            "navbar-name",
            "navbar-brand",
        ];

        if (!validInputZones.includes(e.target.className)) return;

        // Intercept the paste event contents
        const clip = e.clipboardData.items;

        // Check if any of the clipboard items are files
        for (let i = 0; i < clip.length; i++) {
            if (clip[i].kind === "file") {
                setSelectedFile(clip[i].getAsFile());
                setIsClipboard(true);
                setIsFilePicked(true);
                break;
            }
        }
    }, []);

    useEffect(() => {
        if (isClipboard && selectedFile) {
            // Open popup window and supply file information after a paste operation
            popupRef.current.open();
        }
    }, [isClipboard, selectedFile, isFilePicked]);

    // Prevent attaching multiple listeners to the paste event
    useEffect(() => {
        const pasteListener = clipboardHandler;
        window.addEventListener("paste", pasteListener);

        return () => {
            window.removeEventListener("paste", pasteListener);
        };
    }, [clipboardHandler]);

    const popupRef = useRef();

    return (
        <Popup
            ref={popupRef}
            trigger={<span className="popupbutton" />}
            onClose={resetElement}>
            {(close) => (
                <div className="uploadWindow">
                    <div className="innerUploadWindow">
                        <span className="close" onClick={close}>
                            &times;
                        </span>
                        <h3 className="ftitle">File Upload Menu</h3>
                        {isFileUploaded ? (
                            <div>File uploaded.</div>
                        ) : !isClipboard ? (
                            // <div className="fileInputContainer">
                            <input
                                type="file"
                                name="file"
                                onChange={changeHandler}
                                className="fileInput"
                            />
                        ) : (
                            <div>
                                <i>File supplied by clipboard paste.</i>
                            </div>
                        )}
                        {isFilePicked &&
                            selectedFile != null &&
                            !isFileUploaded && (
                                <div>
                                    <br />
                                    <p>
                                        <i>File name:</i> {selectedFile.name}{" "}
                                        <br />
                                        <i>Filetype:</i>{" "}
                                        {selectedFile.type || "unknown"} <br />
                                        <i>Size in bytes:</i>{" "}
                                        {formatBytes(selectedFile.size)}
                                    </p>
                                    <p>
                                        <b>Upload file?</b>
                                    </p>
                                    <div>
                                        <button
                                            className="uploadButton"
                                            onClick={handleSubmission}>
                                            Upload
                                        </button>
                                    </div>
                                </div>
                            )}
                        <br />
                        {isFileUploading && !isFileUploaded && (
                            <div className="barload">
                                <div className="outerload">
                                    <div
                                        className="innerload"
                                        style={{
                                            width: `${progressPercent}%`,
                                        }}>
                                        <p>Uploading... {progressPercent}%</p>
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
