import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import FormCreateModal from "./FormCreateModal"; // Adjust the path as needed

function FolderComponent() {
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  let { folderName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch and display the contents of the folder
    // ...
  }, [folderName]);

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

      {/* Here you can display the contents of the folder */}

      {showCreateFileModal && (
        <FormCreateModal
          show={showCreateFileModal}
          handleClose={() => setShowCreateFileModal(false)}
          folderName={folderName} // pass the folder name here
        />
      )}
    </div>
  );
}

export default FolderComponent;
