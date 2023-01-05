import { useState } from 'react';
import { storage } from './Firebase';
import { ref, uploadBytesResumable } from 'firebase/storage';

function FileUploads() {
    const [selectedFile, setSelectedFile] = useState();
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    let isFileUploading = false;

    const changeHandler = (event) => {
        setSelectedFile(event.target.files[0]);
        setIsFilePicked(true);
    };

    const handleSubmission = () => {
        if (!isFilePicked) return;
        isFileUploading = true;

        const storageRef = ref(storage, `files/${selectedFile.name}`);
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
                isFileUploading = false;
            });
    };


    return (
        <div>
            <input type="file" name="file" onChange={changeHandler} />
            {
            isFilePicked ? (
                <div>
                    <p>Filename: {selectedFile.name}</p>
                    <p>Filetype: {selectedFile.type}</p>
                    <p>Size in bytes: {selectedFile.size}</p>
                </div>
            ) : (
                <p>Select a file.</p>
            )
            }
            <div>
                <button onClick={handleSubmission}>Submit</button>
            </div>
            {
                isFileUploading && (
                <div className='outerload'>
                    <div className='innerload' style={{ width: `${progressPercent}%` }}>{progressPercent}%</div>
                </div>
                )
            }
        </div>
    )
}

export default FileUploads;