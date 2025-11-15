import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import uploadRouter from "./routes/upload.js";
import fs from "fs";
import path from "path";

const tmpDir = path.join(process.cwd(), "src/backend/tmp/");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const app = express();

app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: tmpDir }));

// Middleware de logging pentru a vedea request-urile
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use("/upload", uploadRouter);

app.listen(5000, () => console.log("Server running on port 5000"));