const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3001;

const privateKey = fs.readFileSync(
  "/home/admin/conf/web/ssl.lagueslo.com.key",
  "utf8"
);
const certificate = fs.readFileSync(
  "/home/admin/conf/web/ssl.lagueslo.com.crt",
  "utf8"
);
const ca = fs.readFileSync("/home/admin/conf/web/ssl.lagueslo.com.ca", "utf8");
app.use(
  cors({
    origin: "https://lagueslo.com",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);
const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
  console.log(`HTTPS Server running on https://lagueslo.com:${port}`);
});

require("dotenv").config();

// Middleware to allow cross-origin requests
app.use(cors());

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const connection = mysql.createConnection(dbConfig);

// Configure multer storage to use the desired directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check if the directory exists, and create it if it doesn't
    const uploadPath =
      "/home/admin/web/lagueslo.com/public_html/uniboAssignment/json";
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
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

  // The URL should reflect the actual path where the file can be accessed
  const fileUrl = `https://lagueslo.com/uniboAssignment/json/${req.file.filename}`;

  // Extract the title and date from the file name or request body
  // Assuming the date is included in the file as a JSON object
  const title = req.file.originalname.replace(".json", ""); // Remove the .json extension to get the title
  const date = JSON.parse(fs.readFileSync(req.file.path)).dateToday;

  // Prepare SQL statement to insert form details into the database
  const sql = "INSERT INTO uniboForm (json_url, title, date) VALUES (?, ?, ?)";

  // Execute the SQL statement
  connection.execute(sql, [fileUrl, title, date], (err, results) => {
    if (err) {
      console.error("Error inserting data into the database", err);
      return res.status(500).send("Error inserting data into the database");
    }
    // If successful, send back the URL of the uploaded JSON file
    res.json({ url: fileUrl });
  });
});

// Serve uploaded files statically
app.use(
  "/uniboAssignment/json",
  express.static(
    "/home/admin/web/lagueslo.com/public_html/uniboAssignment/json"
  )
);
