const express = require("express");
const multer  = require("multer");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");
const { parseScheduleFile } = require("./parse");

const PORT    = process.env.PARSER_PORT || 3001;
const UPLOADS = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true });

const app     = express();
const upload  = multer({ dest: UPLOADS });

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// POST /parse — accepts a single file field named "file"
app.post("/parse", upload.single("file"), async (req, res) => {
  const tmpPath = req.file?.path;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const originalName = req.file.originalname;
    const ext = path.extname(originalName).toLowerCase().slice(1);

    const supported = ["mpp", "mpt", "xml", "xer", "pp", "mpd", "planner", "pmxml", "sdef", "json", "ganttproject", "conceptdraw"];
    if (!supported.includes(ext)) {
      return res.status(415).json({ error: `Unsupported format: .${ext}. Supported: ${supported.join(", ")}` });
    }

    // Give the tmp file the right extension so MPXJ detects format correctly
    const namedPath = tmpPath + "." + ext;
    fs.renameSync(tmpPath, namedPath);

    const { tasks, metadata } = await parseScheduleFile(namedPath);
    fs.unlink(namedPath, () => {});

    res.json({ tasks, metadata, fileName: originalName });

  } catch (err) {
    if (tmpPath) fs.unlink(tmpPath, () => {});
    console.error("[parse error]", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Schedule parser service running on http://localhost:${PORT}`);
  console.log(`  POST /parse  — upload schedule file, receive JSON`);
});
