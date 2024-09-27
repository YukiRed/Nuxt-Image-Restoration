import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { spawn } from "child_process";
import { H3Event } from "h3"; // Import H3Event for proper typing in Nuxt 3
import cron from "node-cron"; // Import node-cron for scheduling tasks

// Set up multer for file upload handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "tmp/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Get the file extension
    cb(null, `${Date.now()}${ext}`); // Save with timestamp and original extension
  },
});
const upload = multer({ storage });

// Helper function to delete files and directories recursively
async function deleteFilesRecursively(directory) {
  const files = await fs.readdir(directory, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(directory, file.name);

    if (file.isDirectory()) {
      // Recursively delete contents of the directory
      await deleteFilesRecursively(filePath);
    } else {
      // Delete the file
      await fs.unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
  }
}

// Schedule a cron job to delete files and directories from the tmp/ directory after midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Starting scheduled cleanup of tmp/ directory...");

  const tmpDir = path.join("tmp");

  try {
    const files = await fs.readdir(tmpDir);
    if (files.length > 0) {
      // Delete all files and directories inside tmp/
      await deleteFilesRecursively(tmpDir);
      console.log("Cleanup of tmp/ directory completed.");
    } else {
      console.log(
        "No files or directories to delete in tmp/ directory."
      );
    }
  } catch (error) {
    console.error("Error during tmp/ directory cleanup:", error);
  }
});

export default defineEventHandler(async (event) => {
  console.log("Incoming request for file upload...");

  // Use a wrapper function to handle multer with Promises
  const form = await new Promise((resolve, reject) => {
    const req = event.node.req;
    const res = event.node.res;

    upload.single("image")(req, res, (err) => {
      if (err) {
        console.error("Error during file upload:", err);
        return reject(err);
      }
      console.log(
        "File uploaded successfully:",
        req.file.originalname
      );
      resolve(req.file); // Retrieve the file from req.file (correct way to handle it with multer)
    });
  });

  if (!form) {
    throw new Error("File upload failed.");
  }

  const filePath = form.path;
  const fileExtension = path.extname(filePath) || ".jpg"; // Default to ".jpg" if no extension
  const resultDir = path.join("tmp", "generated");

  console.log("File path:", filePath);
  console.log("File extension:", fileExtension);
  console.log("Ensuring the generated directory exists:", resultDir);

  // Ensure the generated directory exists
  await fs.mkdir(resultDir, { recursive: true });

  const resultPath = path.join(
    resultDir,
    `${path.basename(filePath, fileExtension)}${fileExtension}`
  );

  console.log("Result path for the colorized image:", resultPath);

  // Spawn the Python process for DeOldify script
  console.log("Spawning Python process to run DeOldify...");
  const colorize = spawn("python", [
    "./server/python/colorize.py",
    filePath,
    resultDir,
  ]);

  await new Promise((resolve, reject) => {
    colorize.on("close", (code) => {
      if (code === 0) {
        console.log("Python process completed successfully.");
        resolve(true);
      } else {
        console.error("Python process failed with code:", code);
        reject(
          new Error("Image colorization failed with code: " + code)
        );
      }
    });

    colorize.stdout.on("data", (data) => {
      console.log(`Python stdout: ${data}`);
    });

    colorize.stderr.on("data", (data) => {
      console.error(`Python stderr: ${data}`);
    });
  });

  // Read the result image and return as base64
  console.log("Reading the generated colorized image...");
  const resultImage = await fs.readFile(resultPath);
  console.log(
    "Image colorization completed. Returning the result as base64."
  );

  return {
    result: resultImage.toString("base64"),
  };
});
