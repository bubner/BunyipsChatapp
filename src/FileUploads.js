/*
 *    Module to handle uploading files to Firebase storage through a button element
 */
import { useState } from 'react';
import { storage } from './Firebase';
import { ref, uploadBytesResumable } from 'firebase/storage';
import './FileUploads.css';

function FileUploads() {
    const [selectedFile, setSelectedFile] = useState();
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [isFileUploading, setIsFileUploading] = useState(false);

    const changeHandler = (event) => {
        setSelectedFile(event.target.files[0]);
        setIsFilePicked(true);
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
                setIsFileUploading(false);
                setSelectedFile(null);
                setIsFilePicked(false);
            });
    };


    return (
        <div>
            <input type="file" name="file" onChange={changeHandler} />
            {
                (isFilePicked && selectedFile != null) && (
                    <div>
                        <p>Filename: {selectedFile.name}</p>
                        <p>Filetype: {selectedFile.type}</p>
                        <p>Size in bytes: {selectedFile.size}</p>
                    </div>
                )
            }
            <div>
                <button onClick={handleSubmission}>Upload</button>
            </div>
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
    )
}

export default FileUploads;