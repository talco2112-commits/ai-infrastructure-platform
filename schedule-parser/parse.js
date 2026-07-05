const { spawn } = require("child_process");
const { readFile, unlink } = require("fs/promises");
const { existsSync } = require("fs");
const path = require("path");
const os = require("os");

const FAT_JAR = path.join(__dirname, "java", "target", "schedule-parser-1.0.0.jar");

function findJava() {
  const candidates = [
    path.join(process.env.JAVA_HOME || "", "bin", "java"),
  ];
  // Scan common Windows JDK install locations
  for (const base of [
    "C:\\Program Files\\Microsoft",
    "C:\\Program Files\\Eclipse Adoptium",
    "C:\\Program Files\\Java",
  ]) {
    if (existsSync(base)) {
      try {
        const entries = require("fs").readdirSync(base);
        for (const e of entries) {
          const candidate = path.join(base, e, "bin", "java.exe");
          if (existsSync(candidate)) candidates.push(candidate);
        }
      } catch {}
    }
  }
  for (const c of candidates) {
    if (!c) continue;
    if (existsSync(c)) return c;
  }
  // Last resort: rely on PATH (only works if the shell that launched
  // this process has java on it).
  return "java";
}

async function parseScheduleFile(filePath) {
  if (!existsSync(FAT_JAR)) {
    throw new Error(
      `Parser JAR not built yet. Run:\n  cd schedule-parser/java && mvn package\nJAR expected at: ${FAT_JAR}`
    );
  }

  const jsonOut = path.join(os.tmpdir(), `mpxj_${Date.now()}.json`);
  const java    = findJava();

  try {
    await runJava(java, [
      "-Djava.awt.headless=true",
      "-jar", FAT_JAR,
      filePath,
      jsonOut,
    ]);

    const raw = await readFile(jsonOut, "utf-8");
    return JSON.parse(raw);

  } finally {
    await unlink(jsonOut).catch(() => {});
  }
}

function runJava(java, args, timeoutMs = 90000) {
  return new Promise((resolve, reject) => {
    const child = spawn(java, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => { stdout += d.toString(); });
    child.stderr.on("data", (d) => { stderr += d.toString(); });

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("MPXJ conversion timed out after 90 seconds"));
    }, timeoutMs);

    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(stdout);
      else reject(new Error(`MPXJ exited ${code}: ${(stderr + stdout).trim()}`));
    });
    child.on("error", reject);
  });
}

module.exports = { parseScheduleFile };
