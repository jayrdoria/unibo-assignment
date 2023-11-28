import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/FormList.css";
import fileAsset from "../assets/file_asset.jpg";
import folderAsset from "../assets/folder-icon.png";
import FormEditModal from "./FormEditModal";
import { Modal, Button } from "react-bootstrap"; // Import Bootstrap Button
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import FormCreateModal from "./FormCreateModal"; // Adjust the path as needed

function FormList() {
  const [jsonFiles, setJsonFiles] = useState([]);
  // Add state to manage the visibility and the currently editing file
  const [editingFile, setEditingFile] = useState(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);

  const navigate = useNavigate();

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // Call the function to upload the file to the server
    uploadFileToServer(formData);
  };

  const uploadFileToServer = async (formData) => {
    try {
      const response = await fetch("https://lagueslo.com:3001/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        // Show success toast
        toast.success("File uploaded successfully!");
        // If successful, refresh the file list
        await fetchJsonFiles();
      } else {
        console.error("Upload failed");
        toast.error("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) {
      toast.error("Please enter a folder name.");
      return;
    }
    try {
      const response = await fetch(`https://lagueslo.com:3001/create-folder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folderName: newFolderName }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await response.json();
      toast.success("Folder created successfully!");
      setShowCreateFolderModal(false);
      setNewFolderName("");
      fetchJsonFiles(); // Refresh the file list
    } catch (error) {
      toast.error("Error creating folder.");
      console.error("Error creating folder:", error);
    }
  };

  const handleFolderClick = (folderName) => {
    // Navigate to the folder component
    navigate(`/folder/${folderName}`);
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-3">JSON File Explorer</h1>
      <div className="text-center mb-3">
        <Button onClick={() => setShowCreateFileModal(true)} className="me-2">
          Create File
        </Button>
        <Button onClick={() => setShowCreateFolderModal(true)} className="me-2">
          Create Folder
        </Button>
        <input
          type="file"
          id="fileUpload"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
        <Button onClick={() => document.getElementById("fileUpload").click()}>
          <i className="fa fa-plus"></i> Upload a File
        </Button>
      </div>

      <div className="row">
        {jsonFiles.map((item) => (
          <div
            className="file-explorer col-lg-2 col-md-3 col-sm-4 col-6 mb-4"
            key={item.name}
            onClick={() =>
              item.isDirectory
                ? handleFolderClick(item.name)
                : handleRowClick(item.name)
            }
          >
            {item.isDirectory ? (
              // UI for folders
              <div className="folder-container text-center">
                <img
                  src={folderAsset}
                  alt="Folder Icon"
                  className="img-fluid"
                />
                <h5>{item.name}</h5>
              </div>
            ) : (
              // UI for JSON files
              <div className="file-container text-center">
                <img src={fileAsset} alt="File Asset" className="img-fluid" />
                <h5>{item.name}</h5>
                <p>Author: {item.author}</p>
                <p>
                  Last Modified:
                  <br />
                  {new Date(item.lastModified).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {jsonFiles.length === 0 && <p>No files found.</p>}
      {/* Conditionally render the FormEditModal */}
      {showCreateFileModal && (
        <FormCreateModal
          show={showCreateFileModal}
          handleClose={() => setShowCreateFileModal(false)}
          updateFileList={fetchJsonFiles}
        />
      )}

      {editingFile && (
        <FormEditModal
          show={!!editingFile}
          handleClose={handleClose}
          fileName={editingFile}
          updateFileList={updateFileList}
        />
      )}
      {showCreateFolderModal && (
        <Modal
          show={showCreateFolderModal}
          onHide={() => setShowCreateFolderModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Create New Folder</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              type="text"
              className="form-control"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowCreateFolderModal(false)}
            >
              Close
            </Button>
            <Button variant="primary" onClick={handleCreateFolder}>
              Create Folder
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default FormList;
