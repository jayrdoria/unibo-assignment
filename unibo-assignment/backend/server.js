const express = require("express");
const mysql = require("mysql2");
const fileUpload = require("express-fileupload");
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

// Default options for express-fileupload
app.use(fileUpload());

app.post("/upload", (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send("No file uploaded.");
  }

  const folderName = req.body.folderName;
  const baseUploadDir =
    "/home/admin/web/lagueslo.com/public_html/uniboAssignment/json";
  const baseUrl = "https://lagueslo.com/uniboAssignment/json";

  let uploadDir = baseUploadDir;
  let fileUrlBase = baseUrl;

  // Only modify the path and URL if folderName is provided and the folder exists
  if (folderName && fs.existsSync(path.join(baseUploadDir, folderName))) {
    uploadDir = path.join(baseUploadDir, folderName);
    fileUrlBase = `https://lagueslo.com/uniboAssignment/folder/${folderName}`;
  }

  const uploadedFile = req.files.file;
  const filePath = path.join(uploadDir, uploadedFile.name);

  uploadedFile.mv(filePath, (err) => {
    if (err) {
      console.error("Error saving the file", err);
      return res.status(500).send("Error uploading file");
    }

    const fileUrl = `${fileUrlBase}/${uploadedFile.name}`;

    // Extract the title and date from the file content
    const fileContent = JSON.parse(fs.readFileSync(filePath));
    const title = fileContent.title || uploadedFile.name.replace(".json", "");
    const date = fileContent.dateToday;

    const sql =
      "INSERT INTO uniboForm (json_url, title, date) VALUES (?, ?, ?)";
    connection.execute(sql, [fileUrl, title, date], (err, results) => {
      if (err) {
        console.error("Error inserting data into the database", err);
        return res.status(500).send("Error inserting data into the database");
      }
      res.json({
        success: true,
        url: fileUrl,
        message: "File uploaded successfully",
      });
    });
  });
});

// Get the list of JSON files and folders
app.get("/list-json", async (req, res) => {
  const folderName = req.query.folder;
  const uploadPath = folderName
    ? `/home/admin/web/lagueslo.com/public_html/uniboAssignment/json/${folderName}`
    : "/home/admin/web/lagueslo.com/public_html/uniboAssignment/json";

  fs.readdir(uploadPath, (err, items) => {
    if (err) {
      console.error("Error reading the directory", err);
      return res.status(500).send("Error reading the directory");
    }

    const allItems = items.map((item) => {
      const itemPath = path.join(uploadPath, item);
      const isDirectory = fs.statSync(itemPath).isDirectory();

      if (isDirectory) {
        // Handle directories (folders)
        return {
          name: item,
          isDirectory: true,
          lastModified: fs.statSync(itemPath).mtime,
        };
      } else if (path.extname(item).toLowerCase() === ".json") {
        // Handle JSON files
        const fileStats = fs.statSync(itemPath);
        const fileContent = JSON.parse(fs.readFileSync(itemPath));
        const author = fileContent.author; // Assuming 'author' is a key in your JSON structure

        return {
          name: item,
          isDirectory: false,
          author: author,
          url: `https://lagueslo.com/uniboAssignment/json/${item}`,
          lastModified: fileStats.mtime,
        };
      }
    });

    // Filter out undefined items (in case there are files that are not JSON)
    const filteredItems = allItems.filter((item) => item !== undefined);

    res.json(filteredItems);
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

app.delete("/delete/:fileName", async (req, res) => {
  const { fileName } = req.params;
  const filePath = `/home/admin/web/lagueslo.com/public_html/uniboAssignment/json/${fileName}`;

  try {
    // Delete file from filesystem
    fs.unlinkSync(filePath);

    // Delete record from database
    const sql = "DELETE FROM uniboForm WHERE json_url = ?";
    await connection.execute(sql, [
      `https://lagueslo.com/uniboAssignment/json/${fileName}`,
    ]);

    res.json({ message: "File and database record deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).send("Error deleting file");
  }
});

app.post("/create-folder", async (req, res) => {
  const { folderName } = req.body;
  const folderPath = `/home/admin/web/lagueslo.com/public_html/uniboAssignment/json/${folderName}`;

  if (!folderName) {
    return res.status(400).send("Folder name is required");
  }

  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      res.status(200).send({ message: "Folder created successfully" });
    } else {
      res.status(409).send({ message: "Folder already exists" });
    }
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).send("Error creating folder");
  }
});

// Serve uploaded files statically
app.use(
  "/uniboAssignment/json",
  express.static(
    "/home/admin/web/lagueslo.com/public_html/uniboAssignment/json"
  )
);
