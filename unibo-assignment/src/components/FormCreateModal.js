import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import ReactQuill from "react-quill";
import DatePicker from "react-datepicker";
import "react-quill/dist/quill.snow.css";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

const FormCreateModal = ({ show, handleClose, updateFileList, folderName }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [dateToday, setDateToday] = useState(new Date());

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Construct the data to be sent
    const formData = new FormData();
    const fileData = {
      title,
      content,
      author,
      dateToday: dateToday.toISOString(),
    };
    const blob = new Blob([JSON.stringify(fileData, null, 2)], {
      type: "application/json",
    });
    formData.append("file", blob, `${title}.json`);
    formData.append("folderName", folderName); // Send folderName as a separate field

    console.log("Folder Path (Client):", folderName);

    try {
      const response = await fetch("https://lagueslo.com:3001/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await response.json();
      toast.success("JSON file created successfully!");
      updateFileList(); // Refresh the file list
      handleClose(); // Close the modal
    } catch (error) {
      //toast.error("Error creating file.");
      //console.error("Error uploading file:", error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Create JSON File</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="titleInput" className="form-label">
              Title:
            </label>
            <input
              type="text"
              className="form-control"
              id="titleInput"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="contentInput" className="form-label">
              Content:
            </label>
            <ReactQuill value={content} onChange={setContent} />
          </div>

          <div className="mb-3">
            <label htmlFor="authorInput" className="form-label">
              Author:
            </label>
            <input
              type="text"
              className="form-control"
              id="authorInput"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="dateInput" className="form-label">
              Date Today:
            </label>
            <DatePicker
              className="form-control"
              selected={dateToday}
              onChange={(date) => setDateToday(date)}
              dateFormat="MMMM d, yyyy"
              showYearDropdown
              scrollableYearDropdown
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" type="submit" onClick={handleSubmit}>
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FormCreateModal;
