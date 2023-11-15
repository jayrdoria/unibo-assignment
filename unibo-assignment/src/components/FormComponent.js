import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FormComponent = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [dateToday, setDateToday] = useState(new Date());

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    const blob = new Blob(
      [JSON.stringify({ title, content, author, dateToday }, null, 2)],
      { type: "application/json" }
    );
    formData.append("file", blob, `${title}.json`);

    try {
      const response = await fetch("https://lagueslo.com:3001/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      toast.success("JSON file created successfully!"); // Show success toast
      //window.open(data.url, "_blank"); // Open the URL in a new tab
    } catch (error) {
      toast.error("Error creating file."); // Show error toast
      console.error("Error uploading file:", error);
    }

    // Reset form data
    setTitle("");
    setContent("");
    setAuthor("");
    setDateToday(new Date());
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Create JSON File</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 row">
          <label htmlFor="titleInput" className="col-sm-2 col-form-label">
            Title:
          </label>
          <div className="col-sm-10">
            <input
              type="text"
              className="form-control"
              id="titleInput"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-3 row">
          <label htmlFor="contentInput" className="col-sm-2 col-form-label">
            Content:
          </label>
          <div className="col-sm-10">
            <ReactQuill value={content} onChange={setContent} />
          </div>
        </div>

        <div className="mb-3 row">
          <label htmlFor="authorInput" className="col-sm-2 col-form-label">
            Author:
          </label>
          <div className="col-sm-10">
            <input
              type="text"
              className="form-control"
              id="authorInput"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-3 row">
          <label htmlFor="dateInput" className="col-sm-2 col-form-label">
            Date Today:
          </label>
          <div className="col-sm-10">
            <DatePicker
              className="form-control"
              selected={dateToday}
              onChange={(date) => setDateToday(date)}
              showYearDropdown
              scrollableYearDropdown
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default FormComponent;
