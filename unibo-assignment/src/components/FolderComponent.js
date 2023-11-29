import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import fileAsset from "../assets/file_asset.jpg";
import FormCreateModal from "./FormCreateModal"; // Adjust the path as needed
import FormEditModal from "./FormEditModal"; // Adjust the path as needed

function FolderComponent() {
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  const [jsonFiles, setJsonFiles] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  let { folderName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (folderName) {
      fetchJsonFilesInFolder(folderName);
    }
  }, [folderName]);

  const fetchJsonFilesInFolder = async (folderName) => {
    try {
      const response = await fetch(
        `https://lagueslo.com:3001/list-json?folder=${folderName}`
      );
      let data = await response.json();
      data = data.sort(
        (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
      );
      setJsonFiles(data);
    } catch (error) {
      console.error("Error fetching JSON files:", error);
    }
  };

  const handleFileClick = (fileName) => {
    setSelectedFile(fileName);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedFile(null);
  };

  const updateFileList = async () => {
    await fetchJsonFilesInFolder(folderName);
  };

  const handleBackClick = () => {
    navigate(-1); // This will take the user back to the previous page
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-3">Folder: {folderName}</h1>
      <div className="text-center mb-3">
        <Button onClick={() => setShowCreateFileModal(true)} className="me-2">
          Create File
        </Button>
        <Button onClick={handleBackClick} className="btn btn-secondary">
          Back
        </Button>
      </div>

      {/* Display the contents of the folder */}
      <div className="row">
        {jsonFiles.map((item) => (
          <div
            className="file-explorer col-lg-2 col-md-3 col-sm-4 col-6 mb-4"
            key={item.name}
            onClick={() => handleFileClick(item.name)}
          >
            <div className="file-container text-center">
              {/* Placeholder for file icon, replace with actual image if available */}
              <img src={fileAsset} alt="File Asset" className="img-fluid" />
              <h5>{item.name}</h5>
              <p>Author: {item.author}</p>
              <p>
                Last Modified:
                <br />
                {new Date(item.lastModified).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {jsonFiles.length === 0 && <p>No files found in this folder.</p>}

      {showCreateFileModal && (
        <FormCreateModal
          show={showCreateFileModal}
          handleClose={() => setShowCreateFileModal(false)}
          folderName={folderName} // pass the folder name here
          updateFileList={updateFileList} // Pass the updated function
        />
      )}

      {showEditModal && (
        <FormEditModal
          show={showEditModal}
          handleClose={handleCloseModal}
          fileName={selectedFile}
          updateFileList={updateFileList}
          folderName={folderName} // pass the folder name here
        />
      )}
    </div>
  );
}

export default FolderComponent;
