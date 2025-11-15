import express from "express";
import { analyzeFiles } from "../analysis/analyze.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("🟡 REQUEST PRIMIT pe /upload");
  
  if (!req.files || !req.files.file) {
    console.log("🔴 Niciun fișier primit");
    return res.status(400).json({ error: "No files uploaded." });
  }

  const files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
  console.log("📁 Fișiere pentru analiză:", files.length);

  try {
    console.log("🟡 Încep analiza...");
    const analysisResults = await analyzeFiles(files);
    console.log("✅ Analiza completă! Trimit răspuns...");
    res.json({ results: analysisResults });
  } catch (err) {
    console.error("🔴 Eroare în analiză:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;