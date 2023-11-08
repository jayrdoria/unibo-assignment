import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams, useNavigate } from "react-router-dom";

const FormEdit = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [dateToday, setDateToday] = useState(new Date());
  const { fileName } = useParams(); // Retrieve fileName from URL
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://lagueslo.com/uniboAssignment/json/${fileName}`
        );

        if (!response.ok) {
          // If the HTTP status code is not in the 200-299 range
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Oops, we haven't got JSON!");
        }

        const data = await response.json();
        setTitle(data.title);
        setContent(data.content);
        setAuthor(data.author);
        setDateToday(new Date(data.dateToday));
      } catch (error) {
        console.error("Error fetching file data:", error);
      }
    };

    fetchData();
  }, [fileName]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Update button clicked"); // Check if the function is called
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

      const data = await response.json();
      console.log("Updated successfully:", data);
      navigate(`/formList`);
    } catch (error) {
      console.error("Error updating file data:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Edit JSON</h1>
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
          Update
        </button>
      </form>
    </div>
  );
};

export default FormEdit;
