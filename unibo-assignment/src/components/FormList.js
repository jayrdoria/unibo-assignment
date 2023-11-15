import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/FormList.css";
import fileAsset from "../assets/file_asset.jpg";
import FormEditModal from "./FormEditModal";

function FormList() {
  const [jsonFiles, setJsonFiles] = useState([]);
  // Add state to manage the visibility and the currently editing file
  const [editingFile, setEditingFile] = useState(null);

  useEffect(() => {
    fetchJsonFiles();
  }, []);

  const fetchJsonFiles = async () => {
    try {
      const response = await fetch("https://lagueslo.com:3001/list-json");
      let data = await response.json();
      data = data.sort(
        (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
      );
      setJsonFiles(data);
    } catch (error) {
      console.error("Error fetching JSON files:", error);
    }
  };

  const handleRowClick = (fileName) => {
    setEditingFile(fileName);
  };

  const handleClose = () => {
    setEditingFile(null);
  };

  // The function to update the list of files
  const updateFileList = async () => {
    await fetchJsonFiles();
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">JSON File Explorer</h1>
      <div className="row">
        {jsonFiles.map((file) => (
          <div
            className="file-explorer col-lg-2 col-md-3 col-sm-4 col-6 mb-4" // Changed for better responsiveness
            key={file.name}
            onClick={() => handleRowClick(file.name)}
          >
            <div className="file-container text-center">
              <img src={fileAsset} alt="File Asset" className="img-fluid" />
              <h5>{file.name}</h5>
              <p>Author: {file.author}</p>
              <p>
                Last Modified:
                <br />
                {new Date(file.lastModified).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      {jsonFiles.length === 0 && <p>No files found.</p>}
      {/* Conditionally render the FormEditModal */}
      {editingFile && (
        <FormEditModal
          show={!!editingFile}
          handleClose={handleClose}
          fileName={editingFile}
          updateFileList={updateFileList}
        />
      )}
    </div>
  );
}

export default FormList;
