/*
 *    Module to handle uploading files to Firebase storage through a button element
 */
import { useState } from 'react';
import { storage } from './Firebase';
import { ref, uploadBytesResumable } from 'firebase/storage';
import Popup from 'reactjs-popup';
import './FileUploads.css';

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

    const handleSubmission = () => {
        if (!isFilePicked) return;
        setIsFileUploading(true);

        const storageRef = ref(storage, `${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        uploadTask.on("state_changed",
            (snapshot) => {
                const progress =
                    Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgressPercent(progress);
            },
            (error) => {
                alert(error);
            },
            () => {
                resetElement();
                setIsFileUploaded(true);
            });
    };


    return (
        <Popup trigger={<button>Upload File</button>} onClose={resetElement}>
            {close => (
                <div className="uploadWindow">
                    <div className='innerUploadWindow'>
                        <span className="close" onClick={close}>&times;</span>
                        <h3>File Upload Menu</h3>
                        {
                            isFileUploaded ? (
                                <div>
                                    File uploaded.
                                </div>
                            ) : (
                                <input type="file" name="file" onChange={changeHandler} />
                            )
                        }
                        {
                            (isFilePicked && selectedFile != null && !isFileUploaded) && (
                                <div>
                                    <p><i>File name:</i> {selectedFile.name}</p>
                                    <p><i>Filetype:</i> {selectedFile.type}</p>
                                    <p><i>Size in bytes:</i> {selectedFile.size}</p>
                                    <p><b>Upload file?</b></p>
                                    <div>
                                        <button onClick={handleSubmission}>Upload</button>
                                    </div>
                                </div>
                            )
                        }
                        <br />
                        {
                            isFileUploading && (
                                <div className='barload'>
                                    <div className='outerload'>
                                        <div className='innerload' style={{ width: `${progressPercent}%` }}>Uploading... {progressPercent}%</div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
            )}
        </Popup>
    )
}

export default FileUploads;