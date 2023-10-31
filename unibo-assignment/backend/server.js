const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3001;

// Middleware to allow cross-origin requests
app.use(cors());

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
