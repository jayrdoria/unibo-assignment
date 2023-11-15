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

app.use(express.json());

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

// Get the list of JSON files
app.get("/list-json", async (req, res) => {
  const uploadPath =
    "/home/admin/web/lagueslo.com/public_html/uniboAssignment/json";

  fs.readdir(uploadPath, (err, files) => {
    if (err) {
      console.error("Error reading the directory", err);
      return res.status(500).send("Error reading the directory");
    }

    const jsonFiles = files
      .filter((file) => path.extname(file).toLowerCase() === ".json")
      .map((file) => {
        const filePath = path.join(uploadPath, file);
        const fileStats = fs.statSync(filePath);

        // Read the JSON file to extract the author information
        const fileContent = JSON.parse(fs.readFileSync(filePath));
        const author = fileContent.author; // Assuming 'author' is a key in your JSON structure

        return {
          name: file,
          author: author, // Include the author information
          url: `https://lagueslo.com/uniboAssignment/json/${file}`,
          lastModified: fileStats.mtime,
        };
      });

    res.json(jsonFiles);
  });
});

// Update the file content, rename it, and update the database entry
app.put("/update/:fileName", (req, res) => {
  const { fileName } = req.params;
  const { title, content, author, dateToday } = req.body;
  const oldFileNameWithExtension = fileName; // fileName includes .json
  const oldFilePath = `/home/admin/web/lagueslo.com/public_html/uniboAssignment/json/${oldFileNameWithExtension}`;

  // Generate a sanitized new file name based on the updated title
  const newFileNameWithoutExtension = title.replace(/[^a-zA-Z0-9]/g, "_");
  const newFileName = `${newFileNameWithoutExtension}.json`;
  const newFilePath = `/home/admin/web/lagueslo.com/public_html/uniboAssignment/json/${newFileName}`;

  fs.readFile(oldFilePath, "utf8", (readErr, data) => {
    if (readErr) {
      console.error("Error reading the file:", readErr);
      return res.status(500).send(`Error reading the file: ${readErr.message}`);
    }

    try {
      let fileData = JSON.parse(data);
      fileData.title = title;
      fileData.content = content;
      fileData.author = author;
      fileData.dateToday = dateToday;

      fs.writeFile(
        oldFilePath,
        JSON.stringify(fileData, null, 2),
        "utf8",
        (writeErr) => {
          if (writeErr) {
            console.error("Error writing to the file", writeErr);
            return res
              .status(500)
              .send(`Error writing to the file: ${writeErr.message}`);
          }

          // Rename the file to match the updated title
          fs.rename(oldFilePath, newFilePath, (renameErr) => {
            if (renameErr) {
              console.error("Error renaming the file", renameErr);
              return res
                .status(500)
                .send(`Error renaming the file: ${renameErr.message}`);
            }

            // Once the file is renamed, update the database entry
            const json_url = `https://lagueslo.com/uniboAssignment/json/${newFileName}`;
            const updateSql = `
            UPDATE uniboForm 
            SET json_url = ?, title = ?, date = ?
            WHERE json_url = ?`;
            connection.execute(
              updateSql,
              [
                json_url,
                title,
                new Date(dateToday).toISOString(),
                `https://lagueslo.com/uniboAssignment/json/${oldFileNameWithExtension}`,
              ],
              (dbErr, results) => {
                if (dbErr) {
                  console.error("Error updating the database", dbErr);
                  return res
                    .status(500)
                    .send(`Error updating the database: ${dbErr.message}`);
                }
                if (results.affectedRows === 0) {
                  return res
                    .status(404)
                    .send("No matching record found to update.");
                }
                res.json({
                  message:
                    "File content updated, file renamed, and database entry updated successfully",
                  newFileName: newFileNameWithoutExtension, // Send back the file name without extension for consistency
                });
              }
            );
          });
        }
      );
    } catch (parseErr) {
      console.error("Error parsing JSON data:", parseErr);
      return res
        .status(500)
        .send(`Error parsing JSON data: ${parseErr.message}`);
    }
  });
});

// Serve uploaded files statically
app.use(
  "/uniboAssignment/json",
  express.static(
    "/home/admin/web/lagueslo.com/public_html/uniboAssignment/json"
  )
);
