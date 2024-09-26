import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { spawn } from "child_process";
import { H3Event } from "h3"; // Import H3Event for proper typing in Nuxt 3

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

export default defineEventHandler(async (event) => {
  // Use a wrapper function to handle multer with Promises
  const form = await new Promise((resolve, reject) => {
    const req = event.node.req;
    const res = event.node.res;

    upload.single("image")(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(req.file); // Retrieve the file from req.file (correct way to handle it with multer)
    });
  });

  if (!form) {
    throw new Error("File upload failed");
  }

  const filePath = form.path;
  const fileExtension = path.extname(filePath) || ".jpg"; // Default to ".jpg" if no extension
  const resultDir = path.join("tmp", "generated");

  // Ensure the generated directory exists
  await fs.mkdir(resultDir, { recursive: true });

  const resultPath = path.join(
    resultDir,
    `${path.basename(filePath, fileExtension)}${fileExtension}`
  );

  console.log(filePath, resultPath, fileExtension);

  // Spawn the Python process for DeOldify script
  const colorize = spawn("conda", [
    "run",
    "-n",
    "deold",
    "python",
    "./server/python/colorize.py",
    filePath,
    resultDir,
  ]);

  await new Promise((resolve, reject) => {
    colorize.on("close", (code) => {
      if (code === 0) resolve(true);
      else
        reject(
          new Error("Image colorization failed with code: " + code)
        );
    });

    colorize.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    colorize.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });
  });

  // Read the result image and return as base64
  const resultImage = await fs.readFile(resultPath);

  return {
    result: resultImage.toString("base64"),
  };
});
