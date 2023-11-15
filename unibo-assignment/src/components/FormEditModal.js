import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import ReactQuill from "react-quill";
import DatePicker from "react-datepicker";
import "react-quill/dist/quill.snow.css";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { saveAs } from "file-saver";

const FormEditModal = ({ show, handleClose, fileName, updateFileList }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [dateToday, setDateToday] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://lagueslo.com/uniboAssignment/json/${fileName}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fileData = await response.json();
        setTitle(fileData.title);
        setContent(fileData.content);
        setAuthor(fileData.author);
        setDateToday(new Date(fileData.dateToday));
      } catch (error) {
        console.error("Error fetching file data:", error);
      }
    };

    if (fileName) {
      fetchData();
    }
  }, [fileName]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `https://lagueslo.com:3001/update/${fileName}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
            author,
            dateToday: dateToday.toISOString(),
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updateResponse = await response.json();
      console.log("Updated successfully:", updateResponse);
      toast.success("JSON file updated successfully!"); // Show success toast
      updateFileList(); // A function to update the list of files after an edit
      handleClose(); // Close the modal
    } catch (error) {
      toast.error("Error updating file."); // Show error toast
      console.error("Error updating file data:", error);
    }
  };

  const handleDownload = () => {
    // Construct JSON object from state
    const jsonToDownload = {
      title: title,
      content: content,
      author: author,
      dateToday: dateToday.toISOString(),
    };

    // Create a Blob from the JSON content
    const blob = new Blob([JSON.stringify(jsonToDownload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    // Use file-saver to save the file on the client's machine
    saveAs(blob, `${title.replace(/ /g, "_")}.json`);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit JSON File</Modal.Title>
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
        <Button variant="success" onClick={handleDownload}>
          Download
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FormEditModal;
