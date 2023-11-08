import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/FormList.css";

function FormList() {
  const [jsonFiles, setJsonFiles] = useState([]);
  const navigate = useNavigate(); // Create navigate instance

  useEffect(() => {
    const fetchJsonFiles = async () => {
      try {
        const response = await fetch("https://lagueslo.com:3001/list-json");
        const data = await response.json();
        setJsonFiles(data);
      } catch (error) {
        console.error("Error fetching JSON files:", error);
      }
    };

    fetchJsonFiles();
  }, []);

  // Function to handle row click
  const handleRowClick = (fileName) => {
    navigate(`/formEdit/${fileName}`);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">JSON File List</h1>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Last Modified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jsonFiles.map((file) => (
            // Make the row clickable
            <tr
              key={file.name}
              onClick={() => handleRowClick(file.name)}
              style={{ cursor: "pointer" }}
            >
              <td>{file.name}</td>
              <td>{new Date(file.lastModified).toLocaleString()}</td>
              <td>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm btn-margin-right"
                  onClick={(e) => e.stopPropagation()} // Prevent row click when button is clicked
                >
                  View File
                </a>
                <a
                  href={file.url}
                  download
                  className="btn btn-success btn-sm"
                  onClick={(e) => e.stopPropagation()} // Prevent row click when button is clicked
                >
                  Download File
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {jsonFiles.length === 0 && <p>No files found.</p>}
    </div>
  );
}

export default FormList;
